"""ASGI request guards without sockets, external services or user data."""
import unittest

from security import BodySizeLimitMiddleware, BoundedRateLimiter, CloudRequestGuardMiddleware


async def request(app, *, body=b'', chunks=None, headers=None, path='/campaigns', method='POST', address='192.0.2.1'):
    messages = list(chunks if chunks is not None else [{'type': 'http.request', 'body': body}])
    sent = []
    async def receive():
        return messages.pop(0) if messages else {'type': 'http.disconnect'}
    async def send(message):
        sent.append(message)
    await app({'type': 'http', 'headers': headers or [], 'path': path, 'method': method,
               'client': (address, 54321)}, receive, send)
    return sent


class RequestGuardTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.received = []
        async def app(scope, receive, send):
            message = await receive()
            self.received.append(message.get('body', b''))
            await send({'type': 'http.response.start', 'status': 200, 'headers': []})
            await send({'type': 'http.response.body', 'body': b'ok'})
        self.app = app

    async def test_chunked_actual_bytes_are_limited_before_route_side_effect(self):
        guarded = BodySizeLimitMiddleware(self.app, max_bytes=10, json_bytes=6)
        chunks = [{'type': 'http.request', 'body': b'123456', 'more_body': True},
                  {'type': 'http.request', 'body': b'78901'}]
        result = await request(guarded, chunks=chunks, headers=[(b'content-length', b'1')])
        self.assertEqual(result[0]['status'], 413)
        self.assertEqual(self.received, [])
        self.assertIn((b'cache-control', b'no-store'), result[0]['headers'])

    async def test_accepted_chunked_and_unicode_bytes_replay_exactly(self):
        guarded = BodySizeLimitMiddleware(self.app, max_bytes=12, json_bytes=12)
        expected = 'हाय'.encode()
        result = await request(guarded, chunks=[{'type': 'http.request', 'body': expected[:2], 'more_body': True},
                                               {'type': 'http.request', 'body': expected[2:]}])
        self.assertEqual(result[0]['status'], 200)
        self.assertEqual(self.received, [expected])

    async def test_content_length_json_limit_and_invalid_size(self):
        guarded = BodySizeLimitMiddleware(self.app, max_bytes=10, json_bytes=6)
        result = await request(guarded, headers=[(b'content-type', b'application/json; charset=utf-8'), (b'content-length', b'7')])
        self.assertEqual(result[0]['status'], 413)
        for lengths in [[b'-1'], [b'bad'], [b'1', b'1']]:
            result = await request(guarded, headers=[(b'content-length', value) for value in lengths])
            self.assertEqual(result[0]['status'], 400)
        self.assertEqual(self.received, [])

    async def test_disconnect_does_not_run_route(self):
        guarded = BodySizeLimitMiddleware(self.app)
        self.assertEqual(await request(guarded, chunks=[{'type': 'http.disconnect'}]), [])
        self.assertEqual(self.received, [])

    async def test_cloud_category_limits_ip_isolation_and_health_exemption(self):
        guarded = CloudRequestGuardMiddleware(self.app)
        for _ in range(20):
            self.assertEqual((await request(guarded, path='/auth/login'))[0]['status'], 200)
        denied = await request(guarded, path='/auth/register')
        self.assertEqual(denied[0]['status'], 429)
        self.assertIn((b'retry-after', b'60'), denied[0]['headers'])
        self.assertEqual((await request(guarded, path='/auth/login', address='192.0.2.2'))[0]['status'], 200)
        self.assertEqual((await request(guarded, path='/campaigns'))[0]['status'], 200)
        for _ in range(12):
            self.assertEqual((await request(guarded, path='/uploads'))[0]['status'], 200)
        self.assertEqual((await request(guarded, path='/me/avatar'))[0]['status'], 429)
        for _ in range(25):
            self.assertEqual((await request(guarded, path='/health', method='GET'))[0]['status'], 200)

    async def test_forged_forwarded_header_does_not_bypass_limit(self):
        guarded = CloudRequestGuardMiddleware(self.app)
        for index in range(20):
            result = await request(guarded, path='/auth/login', headers=[(b'x-forwarded-for', f'198.51.100.{index}'.encode())])
            self.assertEqual(result[0]['status'], 200)
        self.assertEqual((await request(guarded, path='/auth/login', headers=[(b'x-forwarded-for', b'203.0.113.1')]))[0]['status'], 429)


class LimiterTests(unittest.TestCase):
    def test_expiry_and_policy_separation(self):
        now = [0.0]
        limiter = BoundedRateLimiter(clock=lambda: now[0])
        self.assertIsNone(limiter.check('same', limit=2))
        now[0] = 1
        self.assertIsNone(limiter.check('same', limit=2))
        self.assertEqual(limiter.check('same', limit=2), 59)
        self.assertIsNone(limiter.check('same', limit=1, window_seconds=10))
        now[0] = 60
        self.assertIsNone(limiter.check('same', limit=2))

    def test_key_capacity_uses_bounded_shared_overflow_without_eviction(self):
        limiter = BoundedRateLimiter(max_keys=1, clock=lambda: 0)
        self.assertIsNone(limiter.check('first', limit=1))
        self.assertIsNone(limiter.check('second', limit=1))
        self.assertEqual(limiter.check('third', limit=1), 60)
        self.assertEqual(limiter.check('first', limit=1), 60)
        self.assertEqual(len(limiter._windows), 1)
        self.assertEqual(len(limiter._overflow), 1)


if __name__ == '__main__':
    unittest.main()
