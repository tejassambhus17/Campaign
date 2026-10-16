"""Small bounded request guards for the single-process hackathon API."""
from __future__ import annotations

from collections import OrderedDict, deque
import json
import math
import threading
import time


class BoundedRateLimiter:
    """Sliding windows with bounded state; caller supplies trusted identity keys.

    Limits are per process, reset at restart, and are not a distributed firewall.
    A full key table shares an overflow bucket instead of evicting active limits.
    """

    def __init__(self, *, max_keys: int = 4096, clock=time.monotonic):
        if max_keys < 1:
            raise ValueError('Rate limiter capacity must be positive.')
        self._max_keys = max_keys
        self._clock = clock
        self._windows = OrderedDict()
        self._overflow = {}
        self._lock = threading.Lock()

    def check(self, key: str, *, limit: int, window_seconds: int = 60) -> int | None:
        """Count an attempt; return Retry-After seconds, or None when allowed."""
        if limit < 1 or window_seconds < 1:
            raise ValueError('Rate limits must be positive.')
        # Separate operation policies even when a caller reuses an identity key.
        policy_key = (key, limit, window_seconds)
        now = self._clock()
        with self._lock:
            while self._windows:
                first_key, (_, touched) = next(iter(self._windows.items()))
                if now - touched < first_key[2]:
                    break
                self._windows.popitem(last=False)
            if policy_key in self._windows:
                recent, _ = self._windows.pop(policy_key)
                self._windows[policy_key] = (recent, now)
            elif len(self._windows) < self._max_keys:
                recent = deque()
                self._windows[policy_key] = (recent, now)
            else:
                # The number of configured policies is small and caller-owned;
                # untrusted IP/user keys cannot allocate more map entries.
                overflow_key = (limit, window_seconds)
                recent = self._overflow.setdefault(overflow_key, deque())
            while recent and recent[0] <= now - window_seconds:
                recent.popleft()
            if len(recent) >= limit:
                return max(1, math.ceil(recent[0] + window_seconds - now))
            recent.append(now)
            return None


class BodySizeLimitMiddleware:
    """Reject oversized bodies before multipart/JSON parsing and route effects.

    Count actual streamed bytes, including requests without Content-Length.
    One bounded body buffer is replayed once to the application; the upload
    handler still validates the image's own stricter 8 MiB/25 MP restrictions.
    """

    def __init__(self, app, *, max_bytes: int = 9 * 1024 * 1024,
                 json_bytes: int = 6 * 1024 * 1024):
        if max_bytes < 1 or not 1 <= json_bytes <= max_bytes:
            raise ValueError('Invalid request body limits.')
        self.app = app
        self.max_bytes = max_bytes
        self.json_bytes = json_bytes

    @staticmethod
    async def _reject(send, status: int, message: str, extra_headers=()):
        body = json.dumps({'detail': message}).encode('utf-8')
        await send({'type': 'http.response.start', 'status': status,
                    'headers': [(b'content-type', b'application/json'),
                                (b'content-length', str(len(body)).encode('ascii')),
                                (b'cache-control', b'no-store'),
                                (b'x-content-type-options', b'nosniff'), *extra_headers]})
        await send({'type': 'http.response.body', 'body': body})

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        content_type = next((value for key, value in scope.get('headers', []) if key.lower() == b'content-type'), b'')
        limit = self.json_bytes if content_type.split(b';')[0].strip().lower() == b'application/json' else self.max_bytes
        lengths = [value for key, value in scope.get('headers', []) if key.lower() == b'content-length']
        try:
            if lengths and (len(lengths) != 1 or not lengths[0].isdigit()):
                raise ValueError()
            if lengths and int(lengths[0]) > limit:
                return await self._reject(send, 413, 'The request is too large. Choose a smaller image or reduce the content.')
        except ValueError:
            return await self._reject(send, 400, 'Invalid request size.')

        body = bytearray()
        while True:
            message = await receive()
            if message['type'] == 'http.disconnect':
                return
            if message['type'] != 'http.request':
                continue
            chunk = message.get('body', b'')
            if len(body) + len(chunk) > limit:
                return await self._reject(send, 413, 'The request is too large. Choose a smaller image or reduce the content.')
            body.extend(chunk)
            if not message.get('more_body', False):
                break
        delivered = False

        async def replay():
            nonlocal delivered
            if delivered:
                return await receive()
            delivered = True
            return {'type': 'http.request', 'body': bytes(body), 'more_body': False}

        await self.app(scope, replay, send)


class CloudRequestGuardMiddleware(BodySizeLimitMiddleware):
    """Install only in cloud mode, before application parsing/authentication.

    The ASGI client address must already be resolved by the configured trusted
    hosting proxy. This guard deliberately never trusts a request's XFF header.
    Limits are bounded per-process protection, not a distributed abuse service.
    """

    def __init__(self, app, *, limiter: BoundedRateLimiter | None = None,
                 max_bytes: int = 9 * 1024 * 1024,
                 json_bytes: int = 6 * 1024 * 1024):
        super().__init__(app, max_bytes=max_bytes, json_bytes=json_bytes)
        self.limiter = limiter or BoundedRateLimiter()

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'http':
            path = scope.get('path', '')
            method = scope.get('method', 'GET').upper()
            if path != '/health':
                if method == 'POST' and path in {'/auth/login', '/auth/register'}:
                    category, limit = 'auth', 20
                elif method == 'POST' and path in {'/uploads', '/me/avatar'}:
                    category, limit = 'uploads', 12
                elif method not in {'GET', 'HEAD', 'OPTIONS'}:
                    category, limit = 'mutations', 120
                else:
                    category, limit = 'reads', 300
                client = scope.get('client')
                address = str(client[0]) if client else 'unknown'
                retry = self.limiter.check(f'{category}:{address}', limit=limit)
                if retry:
                    return await self._reject(send, 429, 'Too many requests. Wait briefly and retry.',
                                              [(b'retry-after', str(retry).encode('ascii'))])
        return await super().__call__(scope, receive, send)
