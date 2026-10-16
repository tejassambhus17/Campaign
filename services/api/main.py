"""Campaign Amplification API: persisted prototype with explicit simulation boundaries."""
from __future__ import annotations

from collections import defaultdict, deque
from contextvars import ContextVar
from contextlib import asynccontextmanager
from datetime import timedelta
from decimal import Decimal
import hashlib
import hmac
import io
import json
import math
import os
from pathlib import Path
import re
import secrets
import sqlite3
import threading
from typing import Literal

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field, field_validator

from db import Database, digest, hash_password, identifier, verify_password
from domain import (CATEGORIES, CHANNELS, DEFAULT_PREFERENCES, EDITABLE_STATES, PUBLIC_STATES,
                    CampaignContent, cents, dollars, fee_for, estimated_reach, parse_stamp, stamp,
                    submission_errors, utcnow)
from seed import seed_demo, localize_seed_assets

Image.MAX_IMAGE_PIXELS = 25_000_000


class Login(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def clean_email(cls, value):
        value = value.strip().lower()
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', value):
            raise ValueError('Enter a valid email address.')
        return value


class Registration(Login):
    name: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=8, max_length=128)

    @field_validator('name')
    @classmethod
    def meaningful_name(cls, value):
        if not value.strip():
            raise ValueError('Name is required.')
        return value.strip()


class Submission(BaseModel):
    rulesAccepted: bool = False


class CampaignCreation(CampaignContent):
    clientDraftId: str | None = Field(default=None, min_length=8, max_length=128)


class Review(BaseModel):
    decision: Literal['approve', 'changes', 'reject']
    feedback: str = Field(default='', max_length=5000)


class Transition(BaseModel):
    target: str
    setupReady: bool = False
    partialFundingApproved: bool = False
    reason: str = Field(default='', max_length=2000)


class Contribution(BaseModel):
    campaignId: str = Field(min_length=1, max_length=100)
    amount: Decimal
    outcome: Literal['successful', 'pending', 'rejected', 'cancelled', 'failed'] = 'successful'
    idempotencyKey: str = Field(min_length=16, max_length=128)

    @field_validator('amount')
    @classmethod
    def exact_amount(cls, value):
        if cents(value, maximum=1_000_000) < 100:
            raise ValueError('The demo contribution minimum is $1.00.')
        return value


class CampaignUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    body: str = Field(min_length=1, max_length=5000)

    @field_validator('title', 'body')
    @classmethod
    def meaningful_text(cls, value):
        if not value.strip():
            raise ValueError('Update title and body must contain text.')
        return value.strip()

    @field_validator('title')
    @classmethod
    def single_line_title(cls, value):
        if '\n' in value or '\r' in value:
            raise ValueError('Use one line for the update title.')
        return value


class CampaignFeedback(BaseModel):
    visuals: Literal['No', 'Somewhat', 'Yes']
    persuasion: Literal['No', 'Somewhat', 'Yes']


def user_json(user):
    return {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': user['role']}


def create_app(db_path: str | Path | None = None, *, seed: bool = True) -> FastAPI:
    database = Database(db_path)
    fee_rate = Decimal(os.getenv('CAMPAIGN_DEMO_FEE_RATE', '0.05'))
    people_rate = float(os.getenv('CAMPAIGN_DEMO_PEOPLE_PER_AD_DOLLAR', '27'))
    if not fee_rate.is_finite() or not 0 <= fee_rate < 1 or not math.isfinite(people_rate) or people_rate <= 0:
        raise ValueError('Invalid demo estimation configuration.')
    database.seed_reviewer()
    if seed:
        seed_demo(database, fee_rate, people_rate)
        localize_seed_assets(database)

    app = FastAPI(title='Campaign Amplification Demo API', version='1.0.0',
                  description='Local persistent prototype. Payments and advertising are simulated; no real funds move.')
    app.state.database = database
    origins = os.getenv('CAMPAIGN_CORS_ORIGINS', 'http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006').split(',')
    app.add_middleware(CORSMiddleware, allow_origins=[item.strip() for item in origins],
                       allow_credentials=False, allow_methods=['GET', 'POST', 'PUT'],
                       allow_headers=['Authorization', 'Content-Type'])
    attempts = defaultdict(deque)
    attempts_lock = threading.Lock()
    url_base = ContextVar('campaign_url_base', default='')

    @app.middleware('http')
    async def request_asset_urls(request: Request, call_next):
        token = url_base.set(str(request.base_url).rstrip('/'))
        try:
            response = await call_next(request)
            response.headers['X-Content-Type-Options'] = 'nosniff'
            # Campaign responses vary between a public approved snapshot and an
            # owner's private draft. Never let an HTTP cache reuse either JSON
            # representation after sign-out, endpoint switching, or funding changes.
            if not request.url.path.startswith(('/media/', '/seed-media/')):
                response.headers['Cache-Control'] = 'no-store'
                vary = [value.strip() for value in response.headers.get('Vary', '').split(',') if value.strip()]
                if 'authorization' not in {value.lower() for value in vary}:
                    vary.append('Authorization')
                response.headers['Vary'] = ', '.join(vary)
            return response
        finally:
            url_base.reset(token)

    def asset_urls(content):
        def absolute(value):
            return url_base.get()+value if value and value.startswith(('/media/', '/seed-media/')) else value
        content['coverImage'] = absolute(content['coverImage'])
        content['adImages'] = [absolute(value) for value in content['adImages']]
        for section in content['sections']:
            if section.get('url'):
                section['url'] = absolute(section['url'])
        return content

    def canonical_assets(content):
        """Persist owned media independently of the hostname used by a particular client."""
        from urllib.parse import urlparse
        from db import ROOT
        def local_reference(value):
            path = urlparse(value).path
            if re.fullmatch(r'/media/img_[a-f0-9]{24}\.jpg', path) and (database.media / path.rsplit('/', 1)[-1]).is_file():
                return path
            if re.fullmatch(r'/seed-media/(forest|learning|ocean|community|arts|science)\.jpg', path) and (ROOT / 'assets' / 'seed' / path.rsplit('/', 1)[-1]).is_file():
                return path
            return value
        content['coverImage'] = local_reference(content['coverImage'])
        content['adImages'] = [local_reference(value) for value in content['adImages']]
        for section in content['sections']:
            if section.get('url'):
                section['url'] = local_reference(section['url'])
        return content

    def default_destination(category, campaign_id, key):
        if category == 'payments':
            result = {'type': 'payments'}
            if key and key.startswith(('payment:', 'refund:')):
                result['paymentId'] = key.split(':', 1)[1]
            return result
        if category == 'security' or not campaign_id:
            return {'type': 'profile'}
        if key and (key.startswith(('final-report:', 'progress-midpoint:', 'milestone:')) or
                    (key.startswith('transition:') and ':Completed:' in key)):
            return {'type': 'report'}
        if key and key.startswith(('submitted:', 'review:')):
            return {'type': 'creator'}
        return {'type': 'campaign'}

    def notify(connection, user_id, category, title, body, *, campaign_id=None, key=None, destination=None):
        user = connection.execute('SELECT preferences_json FROM users WHERE id=?', (user_id,)).fetchone()
        if not user:
            return
        preferences = json.loads(user['preferences_json'])
        if category != 'security' and not preferences['categories'].get(category, True):
            return
        destination = destination or default_destination(category, campaign_id, key)
        connection.execute('''INSERT OR IGNORE INTO notifications
            (id,user_id,campaign_id,category,title,body,created_at,dedup_key,destination_json) VALUES (?,?,?,?,?,?,?,?,?)''',
                           (identifier('ntf'), user_id, campaign_id, category, title, body, stamp(), key or identifier('dedup'), json.dumps(destination)))

    def recipients(connection, campaign):
        ids = {campaign['owner_id']}
        ids.update(row[0] for row in connection.execute('SELECT user_id FROM tracking WHERE campaign_id=? AND kind=?', (campaign['id'], 'follow')))
        ids.update(row[0] for row in connection.execute("SELECT user_id FROM payments WHERE campaign_id=? AND status='successful' AND user_id IS NOT NULL", (campaign['id'],)))
        return ids

    def campaign_notice(connection, campaign, title, body, key, *, destination_type='campaign'):
        for user_id in recipients(connection, campaign):
            notify(connection, user_id, 'campaigns', title, body, campaign_id=campaign['id'], key=key,
                   destination={'type': destination_type})

    def event(connection, campaign, actor_id, kind, target, detail):
        connection.execute('INSERT INTO campaign_events VALUES (?,?,?,?,?,?,?,?,?)',
                           (identifier('evt'), campaign['id'], actor_id, kind, campaign['status'],
                            target, campaign['version'], detail, stamp()))

    def auth_optional(authorization: str | None = Header(default=None)):
        if not authorization:
            return None
        if not authorization.startswith('Bearer '):
            raise HTTPException(401, 'Use a Bearer session token.')
        token = authorization[7:]
        with database.connect() as connection:
            user = connection.execute('''SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id
                WHERE sessions.token_hash=? AND sessions.expires_at>?''', (digest(token), stamp())).fetchone()
        if not user:
            raise HTTPException(401, 'Your session expired. Sign in again.')
        return dict(user)

    def auth(user=Depends(auth_optional)):
        if not user:
            raise HTTPException(401, 'Sign in to continue.')
        return user

    def reviewer(user=Depends(auth)):
        if user['role'] != 'reviewer':
            raise HTTPException(403, 'This action requires a reviewer account.')
        return user

    def totals(connection, campaign_id):
        result = connection.execute('''SELECT
            COALESCE(SUM(CASE WHEN kind='contribution' THEN gross_cents ELSE 0 END),0) raised,
            COALESCE(SUM(CASE WHEN kind='contribution' THEN fee_cents ELSE 0 END),0) fees,
            COALESCE(SUM(CASE WHEN kind='contribution' THEN ad_cents ELSE 0 END),0) allocated,
            COALESCE(SUM(CASE WHEN kind='refund' THEN -gross_cents ELSE 0 END),0) refunded,
            COALESCE(SUM(CASE WHEN kind='refund' THEN -fee_cents ELSE 0 END),0) refunded_fees,
            COALESCE(SUM(CASE WHEN kind='refund' THEN -ad_cents ELSE 0 END),0) refunded_advertising,
            COALESCE(SUM(ad_cents),0) available FROM ledger WHERE campaign_id=?''', (campaign_id,)).fetchone()
        return dict(result)

    def get_campaign(connection, campaign_id):
        row = connection.execute('SELECT * FROM campaigns WHERE id=?', (campaign_id,)).fetchone()
        if not row:
            raise HTTPException(404, 'Campaign not found.')
        return dict(row)

    def can_manage(campaign, user):
        return bool(user and (campaign['owner_id'] == user['id'] or user['role'] == 'reviewer'))

    def assert_owner(campaign, user):
        if campaign['owner_id'] != user['id']:
            raise HTTPException(403, 'You can only edit your own campaign.')

    def assert_visible(campaign, user):
        if not can_manage(campaign, user) and (campaign['status'] not in PUBLIC_STATES or not campaign['published_json']):
            raise HTTPException(404, 'Campaign not found.')

    def campaign_json(connection, campaign, user=None, *, force_public=False):
        managed = can_manage(campaign, user) and not force_public
        content = asset_urls(json.loads(campaign['data_json'] if managed else campaign['published_json'] or campaign['data_json']))
        money = totals(connection, campaign['id'])
        dates = connection.execute('''SELECT
            MAX(CASE WHEN event_type='submission' THEN created_at END) AS submitted_at,
            MIN(CASE WHEN event_type='transition' AND new_state='Available for Funding' THEN created_at END) AS published_at,
            MAX(CASE WHEN event_type='seed' THEN 1 ELSE 0 END) AS seeded
            FROM campaign_events WHERE campaign_id=?''', (campaign['id'],)).fetchone()
        published_at = dates['published_at']
        if not published_at and dates['seeded'] and campaign['published_json']:
            published_at = campaign['created_at']
        content.update({'id': campaign['id'], 'ownerId': campaign['owner_id'],
                        'status': campaign['revision_status'] if managed and campaign['revision_status'] else campaign['status'],
                        'campaignState': campaign['status'], 'createdAt': campaign['created_at'],
                        'submittedAt': dates['submitted_at'], 'publishedAt': published_at,
                        'setupReady': bool(campaign['setup_ready']),
                        'updatedAt': campaign['updated_at'], 'deadline': campaign['deadline'],
                        'raised': dollars(money['raised']), 'version': campaign['version'],
                        'estimatedReach': estimated_reach(cents(content['goal'], allow_zero=True)-fee_for(cents(content['goal'], allow_zero=True), fee_rate), people_rate),
                        'revisionPending': bool(campaign['revision_status']), 'simulated': True,
                        'report': report_json(connection, campaign)})
        if managed:
            content['clientDraftId'] = campaign.get('client_draft_id')
            content['feedback'] = campaign['feedback']
            content['history'] = [dict(row) for row in connection.execute('''SELECT event_type AS type,previous_state AS previousState,
                new_state AS newState,detail,created_at AS createdAt,version FROM campaign_events
                WHERE campaign_id=? ORDER BY created_at''', (campaign['id'],))]
            if campaign['published_json'] and campaign['revision_status']:
                content['publishedVersion'] = asset_urls(json.loads(campaign['published_json']))
        else:
            content['feedback'] = ''
        return content

    def report_json(connection, campaign):
        money = totals(connection, campaign['id'])
        contribution_count = connection.execute("SELECT COUNT(*) FROM payments WHERE campaign_id=? AND status='successful'", (campaign['id'],)).fetchone()[0]
        delivery = json.loads(campaign['report_json']) if campaign['report_json'] else None
        result = {'campaignId': campaign['id'], 'status': campaign['status'], 'simulated': True,
                  'raised': dollars(money['raised']), 'fees': dollars(money['fees']),
                  'allocated': dollars(money['allocated']), 'spent': 0,
                  'refunded': dollars(money['refunded']), 'estimatedReach': estimated_reach(money['allocated'], people_rate),
                  'measuredReach': None, 'simulatedReach': None, 'impressions': None, 'clicks': None,
                  'durationDays': json.loads(campaign['published_json'] or campaign['data_json'])['durationDays'],
                  'final': False, 'available': bool(delivery),
                  'contributionCount': contribution_count,
                  'backerActivity': f'{contribution_count} successful simulated contribution records. Backer identities are private; guest uniqueness is not measured.',
                  'provenance': 'Payment totals are simulated ledger entries. Delivery has not begun.',
                  'definitions': {'raised': 'Successful simulated contributions before fees and refunds.',
                                  'allocated': 'Successful contribution amount less the demo platform fee.',
                                  'spent': 'Simulated advertising spend; never verified live delivery.',
                                  'estimatedReach': 'Net advertising dollars multiplied by the configured demo estimate.',
                                  'simulatedReach': 'Modelled demonstration audience, not measured people.',
                                  'measuredReach': 'Unavailable: no live advertising provider is connected.',
                                  'impressions': 'Simulated ad displays, which may include repeat displays.',
                                  'clicks': 'Simulated clicks, not verified user visits.'}}
        if delivery:
            result.update(delivery)
            result['refunded'] = dollars(money['refunded'])
        # Original allocation and its unspent portion are historical figures.
        # Completed refunds are already removed from the remaining budget; they
        # must never appear to be another spendable pot alongside unspent funds.
        spent = cents(result['spent'], allow_zero=True, maximum=10**15)
        remaining = max(money['available'] - spent, 0)
        pending = 0
        if campaign['status'] == 'Refund Pending':
            pending = remaining if delivery else max(money['raised'] - money['refunded'], 0)
            refund_state, refund_status = 'pending', 'Simulated refund pending'
        elif money['refunded']:
            refund_state, refund_status = 'completed', 'Simulated refund complete'
        elif campaign['status'] in {'Cancelled', 'Failed'} and money['raised']:
            refund_state, refund_status = 'review_required', 'Refund review required'
        elif result['final']:
            refund_state, refund_status = 'not_due', 'No refund due'
        else:
            refund_state, refund_status = 'not_started', 'Calculated on completion or cancellation'
        result.update({'refundedFees': dollars(money['refunded_fees']),
                       'refundedAdvertising': dollars(money['refunded_advertising']),
                       'retainedFees': dollars(money['fees'] - money['refunded_fees']),
                       'remainingAdvertisingBudget': dollars(remaining),
                       'unspentBeforeRefund': dollars(max(money['allocated'] - spent, 0)),
                       'refundPendingAmount': dollars(pending),
                       'refundState': refund_state, 'refundStatus': refund_status})
        result['definitions'].update({
            'fees': 'Original included platform fees, before any fee refunds.',
            'retainedFees': 'Original platform fees less completed fee refunds.',
            'unspentBeforeRefund': 'Original advertising allocation less recorded spend; includes any portion already refunded.',
            'refunded': 'Completed simulated refunds, including any refunded platform fees. Not an additional available budget.',
            'refundedAdvertising': 'The advertising portion of completed simulated refunds.',
            'refundedFees': 'The platform-fee portion of completed simulated refunds.',
            'remainingAdvertisingBudget': 'Original advertising allocation less spend and completed advertising refunds.',
            'refundPendingAmount': 'Awaiting simulated refund processing; not included in completed refunds. Before promotion this includes the fee.'})
        return result

    def session(connection, user):
        token = secrets.token_urlsafe(40)
        connection.execute('INSERT INTO sessions VALUES (?,?,?)', (digest(token), user['id'], stamp(utcnow()+timedelta(days=7))))
        return {'token': token, 'user': user_json(user)}

    def auth_limit(request):
        address = request.client.host if request.client else 'local'
        now = utcnow().timestamp()
        with attempts_lock:
            recent = attempts[address]
            while recent and recent[0] < now-60:
                recent.popleft()
            if len(recent) >= 20:
                raise HTTPException(429, 'Too many sign-in attempts. Try again in a minute.')
            recent.append(now)

    def reconcile(connection):
        for row in connection.execute("SELECT * FROM campaigns WHERE status='Available for Funding' AND deadline IS NOT NULL").fetchall():
            campaign = dict(row)
            remaining = parse_stamp(campaign['deadline'])-utcnow()
            if remaining.total_seconds() <= 0:
                connection.execute("UPDATE campaigns SET status='Funding Period Ends',updated_at=? WHERE id=?", (stamp(), campaign['id']))
                event(connection, campaign, None, 'deadline', 'Funding Period Ends', 'The disclosed funding period ended; advertising has not launched.')
                campaign_notice(connection, campaign, 'Funding period ended', 'The reviewer will assess the approved budget before distribution.', f"deadline-ended:{campaign['id']}:{campaign['deadline']}")
            elif remaining <= timedelta(days=3):
                campaign_notice(connection, campaign, 'Funding deadline approaching', 'This campaign has three days or less left in its funding period.', f"deadline-soon:{campaign['id']}:{campaign['deadline']}")

    @app.get('/health')
    def health():
        return {'status': 'ok', 'service': 'campaign-amplification', 'simulatedPayments': True}

    @app.get('/config')
    def config():
        return {'currency': 'USD', 'feeRate': float(fee_rate), 'transactionFeeRate': 0,
                'peoplePerAdDollar': people_rate, 'categories': CATEGORIES, 'channels': CHANNELS,
                'simulation': True, 'guestContributions': True, 'minContribution': 1,
                'maxContribution': 10000, 'maxGoal': 100000, 'minDurationDays': 1, 'maxDurationDays': 90,
                'supportedMedia': ['image/jpeg', 'image/png', 'image/webp'], 'maxUploadBytes': 8*1024*1024,
                'videoSupported': False, 'liveAI': False, 'liveVoice': False,
                'policies': {
                    'label': 'Configurable prototype demo policy; not an organizer rule or financial offer.',
                    'purpose': 'Contributions fund message distribution, not direct donations to a cause or transfers to creators.',
                    'fees': f'{float(fee_rate)*100:g}% platform fee is deducted from the contribution; no added transaction fee. Total payment equals contribution.',
                    'allocation': 'The remaining contribution forms the advertising budget, split by the approved channel percentages.',
                    'refunds': 'In this simulation, cancellation before promotion refunds the full contribution. After promotion, only unspent net advertising funds are refunded proportionally; the platform fee is retained.',
                    'unspent': 'Unspent net advertising funds are proportionally refunded in the completion simulation. No real money moves.',
                    'partialFunding': 'After the deadline, a reviewer may explicitly approve distribution using the available positive budget. Otherwise cancel and simulate refunds.',
                    'reach': f'Estimated audience = net advertising dollars × {people_rate:g}. Actual reach depends on inventory, pricing, targeting, delivery and performance; this is not a guarantee.',
                    'privacy': 'Backer identities and receipts are private by default. Public sources are creator-supplied context, not independent verification.',
                    'delivery': 'All checkout outcomes and advertising reports are explicitly simulated. No live provider is connected.'}}

    @app.post('/auth/register', status_code=201)
    def register(payload: Registration, request: Request):
        auth_limit(request)
        with database.transaction() as connection:
            user = {'id': identifier('usr'), 'name': payload.name, 'email': payload.email, 'role': 'member'}
            try:
                connection.execute('INSERT INTO users VALUES (?,?,?,?,?,?,?)', (user['id'], user['name'], user['email'],
                                   hash_password(payload.password), 'member', json.dumps(DEFAULT_PREFERENCES), stamp()))
            except sqlite3.IntegrityError:
                raise HTTPException(409, 'An account already exists for this email.')
            notify(connection, user['id'], 'security', 'Account created', 'Your account was created. Sessions expire after seven days.')
            return session(connection, user)

    @app.post('/auth/login')
    def login(payload: Login, request: Request):
        auth_limit(request)
        with database.transaction() as connection:
            user = connection.execute('SELECT * FROM users WHERE email=?', (payload.email,)).fetchone()
            if not user or not verify_password(payload.password, user['password_hash']):
                raise HTTPException(401, 'Email or password is incorrect.')
            notify(connection, user['id'], 'security', 'New sign-in', 'A new session signed in to your account.')
            return session(connection, user)

    @app.post('/auth/logout')
    def logout(user=Depends(auth), authorization: str = Header()):
        with database.transaction() as connection:
            connection.execute('DELETE FROM sessions WHERE token_hash=?', (digest(authorization[7:]),))
        return {'ok': True}

    @app.get('/campaigns')
    def campaigns(q: str = '', category: str = '', sort: str = 'featured', status: str = '', featured: bool = False):
        with database.transaction() as connection:
            reconcile(connection)
            rows = connection.execute('SELECT * FROM campaigns WHERE published_json IS NOT NULL ORDER BY created_at DESC').fetchall()
            result = [campaign_json(connection, dict(row), force_public=True) for row in rows if row['status'] in PUBLIC_STATES]
        query = q.strip().casefold()
        result = [item for item in result if
                  (not query or query in ' '.join([item['title'], item['summary'], item['creatorName'], item['category']]).casefold())
                  and (not category or item['category'] == category) and (not status or item['status'] == status)
                  and (not featured or item['featured'])]
        if sort == 'newest':
            result.sort(key=lambda item: item['createdAt'], reverse=True)
        elif sort == 'funded':
            result.sort(key=lambda item: item['raised']/item['goal'] if item['goal'] else 0, reverse=True)
        elif sort == 'ending':
            result.sort(key=lambda item: item['deadline'] or '9999')
        else:
            result.sort(key=lambda item: item['featured'], reverse=True)
        return result

    @app.get('/campaigns/{campaign_id}')
    def campaign_detail(campaign_id: str, user=Depends(auth_optional)):
        with database.transaction() as connection:
            reconcile(connection)
            campaign = get_campaign(connection, campaign_id)
            assert_visible(campaign, user)
            return campaign_json(connection, campaign, user)

    @app.post('/campaigns', status_code=201)
    def create_campaign(content: CampaignCreation, user=Depends(auth)):
        with database.transaction() as connection:
            if content.clientDraftId:
                existing = connection.execute('SELECT * FROM campaigns WHERE owner_id=? AND client_draft_id=?', (user['id'], content.clientDraftId)).fetchone()
                if existing:
                    return campaign_json(connection, dict(existing), user)
            campaign_id, created = identifier('cmp'), stamp()
            data = canonical_assets(content.model_dump(exclude={'clientDraftId'}))
            data['featured'] = False
            connection.execute('''INSERT INTO campaigns (id,owner_id,data_json,status,created_at,updated_at,client_draft_id)
                VALUES (?,?,?,'Draft',?,?,?)''', (campaign_id, user['id'], json.dumps(data), created, created, content.clientDraftId))
            return campaign_json(connection, get_campaign(connection, campaign_id), user)

    @app.put('/campaigns/{campaign_id}')
    def save_campaign(campaign_id: str, payload: dict, user=Depends(auth)):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_owner(campaign, user)
            if campaign['status'] not in EDITABLE_STATES or campaign['revision_status'] == 'Submitted for Review':
                raise HTTPException(409, 'This campaign is locked while under review or after completion.')
            if 'version' in payload and payload['version'] != campaign['version']:
                raise HTTPException(409, 'A newer draft was saved. Reload before editing to preserve those changes.')
            from pydantic import ValidationError
            try:
                data = canonical_assets(CampaignContent.model_validate({**json.loads(campaign['data_json']), **payload}).model_dump())
            except ValidationError as error:
                raise HTTPException(422, json.loads(error.json(include_context=False)))
            data['featured'] = json.loads(campaign['data_json'])['featured']
            if campaign['published_json']:
                published = json.loads(campaign['published_json'])
                if data['goal'] != published['goal'] or data['durationDays'] != published['durationDays']:
                    raise HTTPException(409, 'Funding goal and duration are locked after publication to protect backer expectations.')
                revision = 'Changes Requested' if campaign['revision_status'] == 'Changes Requested' else 'Draft'
            else:
                revision = None
                if campaign['status'] == 'Approved':
                    connection.execute("UPDATE campaigns SET status='Draft',approved_version=NULL WHERE id=?", (campaign_id,))
            connection.execute('UPDATE campaigns SET data_json=?,revision_status=?,version=version+1,updated_at=? WHERE id=?',
                               (json.dumps(data), revision, stamp(), campaign_id))
            return campaign_json(connection, get_campaign(connection, campaign_id), user)

    @app.post('/campaigns/{campaign_id}/revision')
    def begin_revision(campaign_id: str, user=Depends(auth)):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_owner(campaign, user)
            if not campaign['published_json'] or campaign['status'] not in EDITABLE_STATES:
                raise HTTPException(409, 'A revision is available only for an active published campaign.')
            if campaign['revision_status'] == 'Submitted for Review':
                raise HTTPException(409, 'This revision is already under review.')
            if not campaign['revision_status'] or campaign['revision_status'] == 'Rejected':
                connection.execute("UPDATE campaigns SET data_json=published_json,revision_status='Draft',updated_at=? WHERE id=?", (stamp(), campaign_id))
                event(connection, campaign, user['id'], 'revision', 'Draft', 'A private editable revision was started. The approved public version is preserved.')
            return campaign_json(connection, get_campaign(connection, campaign_id), user)

    @app.post('/campaigns/{campaign_id}/submit')
    def submit_campaign(campaign_id: str, payload: Submission, user=Depends(auth)):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_owner(campaign, user)
            current = campaign['revision_status'] or campaign['status']
            if current == 'Submitted for Review':
                return campaign_json(connection, campaign, user)
            if current not in {'Draft', 'Changes Requested'}:
                raise HTTPException(409, 'Only a draft or requested revision can be submitted.')
            errors = submission_errors(json.loads(campaign['data_json']))
            if not payload.rulesAccepted:
                errors['rulesAccepted'] = 'Confirm the campaign rules and demo funding policies.'
            if errors:
                raise HTTPException(422, errors)
            if campaign['published_json']:
                connection.execute("UPDATE campaigns SET revision_status='Submitted for Review',updated_at=? WHERE id=?", (stamp(), campaign_id))
            else:
                connection.execute("UPDATE campaigns SET status='Submitted for Review',updated_at=? WHERE id=?", (stamp(), campaign_id))
            event(connection, campaign, user['id'], 'submission', 'Submitted for Review', 'Creator confirmed rules and submitted this version for review.')
            notify(connection, user['id'], 'campaigns', 'Submission received', 'Your campaign is waiting for review. It is not available for funding yet.', campaign_id=campaign_id,
                   key=f"submitted:{campaign_id}:{campaign['version']}", destination={'type': 'creator'})
            return campaign_json(connection, get_campaign(connection, campaign_id), user)

    @app.get('/review-queue')
    def review_queue(user=Depends(reviewer)):
        with database.transaction() as connection:
            reconcile(connection)
            # Includes approved/public campaigns so the same restricted view can control the separate delivery stages.
            rows = connection.execute("SELECT * FROM campaigns WHERE status NOT IN ('Draft','Rejected') OR revision_status IS NOT NULL ORDER BY updated_at DESC").fetchall()
            return [campaign_json(connection, dict(row), user) for row in rows]

    @app.post('/campaigns/{campaign_id}/review')
    def review_campaign(campaign_id: str, payload: Review, user=Depends(reviewer)):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            if (campaign['revision_status'] or campaign['status']) != 'Submitted for Review':
                raise HTTPException(409, 'Only the submitted version can be reviewed.')
            if payload.decision != 'approve' and not payload.feedback.strip():
                raise HTTPException(422, 'Explain the corrections or rejection so the creator can respond.')
            target = {'approve': 'Approved', 'changes': 'Changes Requested', 'reject': 'Rejected'}[payload.decision]
            revision = bool(campaign['published_json'])
            if revision:
                if payload.decision == 'approve':
                    connection.execute('''UPDATE campaigns SET published_json=data_json,approved_version=version,
                        revision_status=NULL,feedback=?,setup_ready=0,updated_at=? WHERE id=?''', (payload.feedback, stamp(), campaign_id))
                else:
                    connection.execute('UPDATE campaigns SET revision_status=?,feedback=?,updated_at=? WHERE id=?',
                                       ('Changes Requested' if payload.decision == 'changes' else 'Rejected', payload.feedback, stamp(), campaign_id))
            else:
                connection.execute('UPDATE campaigns SET status=?,approved_version=?,feedback=?,updated_at=? WHERE id=?',
                                   (target, campaign['version'] if payload.decision == 'approve' else None, payload.feedback, stamp(), campaign_id))
            event(connection, campaign, user['id'], 'review', target, payload.feedback or 'Approved this exact campaign version.')
            notify(connection, campaign['owner_id'], 'campaigns', f'Campaign {target.lower()}', payload.feedback or 'Review passed. Publication and distribution remain separate steps.',
                   campaign_id=campaign_id, key=f"review:{campaign_id}:{campaign['version']}:{target}", destination={'type': 'creator'})
            if revision and payload.decision == 'approve':
                campaign_notice(connection, campaign, 'Reviewed campaign update', 'A material campaign revision was approved. Read the updated story and sources.', f"revision-approved:{campaign_id}:{campaign['version']}")
            return campaign_json(connection, get_campaign(connection, campaign_id), user)

    def refund(connection, campaign, *, full):
        payments = [dict(row) for row in connection.execute("SELECT * FROM payments WHERE campaign_id=? AND status='successful'", (campaign['id'],))]
        report = json.loads(campaign['report_json']) if campaign['report_json'] else None
        unspent = cents(report.get('unspent', 0), allow_zero=True, maximum=10**15) if report else 0
        total_net = sum(payment['ad_cents'] for payment in payments)
        # Largest-remainder apportionment keeps every refund within its proportional
        # share; assigning the entire rounding remainder to the final backer can over-refund them.
        shares = {}
        if not full and total_net:
            unspent = min(unspent, total_net)
            shares = {payment['id']: unspent*payment['ad_cents']//total_net for payment in payments}
            remainder = unspent-sum(shares.values())
            ranked = sorted(payments, key=lambda payment: (unspent*payment['ad_cents']) % total_net, reverse=True)
            for payment in ranked[:remainder]:
                shares[payment['id']] += 1
        for index, payment in enumerate(payments):
            amount = payment['amount_cents'] if full else shares.get(payment['id'], 0)
            if amount <= 0:
                continue
            fee = payment['fee_cents'] if full else 0
            existing = connection.execute("SELECT 1 FROM ledger WHERE payment_id=? AND kind='refund'", (payment['id'],)).fetchone()
            if existing:
                continue
            connection.execute('INSERT INTO ledger VALUES (?,?,?,?,?,?,?,?)', (identifier('led'), payment['id'], campaign['id'], 'refund', -amount, -fee, -(amount-fee), stamp()))
            connection.execute('UPDATE payments SET refunded_cents=? WHERE id=?', (amount, payment['id']))
            if payment['user_id']:
                notify(connection, payment['user_id'], 'payments', 'Simulated refund completed',
                       f'${amount/100:.2f} was refunded in the demo ledger. No real funds moved.', campaign_id=campaign['id'], key=f"refund:{payment['id']}",
                       destination={'type': 'payments', 'paymentId': payment['id']})

    @app.post('/campaigns/{campaign_id}/transition')
    def transition_campaign(campaign_id: str, payload: Transition, user=Depends(reviewer)):
        with database.transaction() as connection:
            reconcile(connection)
            campaign = get_campaign(connection, campaign_id)
            source, target = campaign['status'], payload.target
            if target == source:
                if target == 'Promoting' and payload.setupReady:
                    if campaign['revision_status'] or campaign['approved_version'] != campaign['version']:
                        raise HTTPException(409, 'The exact current revision must be approved before reconfirming advertising setup.')
                    connection.execute('UPDATE campaigns SET setup_ready=1,updated_at=? WHERE id=?', (stamp(), campaign_id))
                    event(connection, campaign, user['id'], 'setup', target, 'Reviewer reconfirmed advertising setup for the approved campaign revision.')
                    return campaign_json(connection, get_campaign(connection, campaign_id), user)
                return campaign_json(connection, campaign, user)
            content = json.loads(campaign['published_json'] or campaign['data_json'])
            money = totals(connection, campaign_id)
            allowed = {
                'Approved': {'Available for Funding', 'Cancelled'},
                'Available for Funding': {'Funding Goal Reached', 'Funding Period Ends', 'Cancelled', 'Failed'},
                'Funding Goal Reached': {'Distribution Preparation', 'Cancelled', 'Failed'},
                'Funding Period Ends': {'Distribution Preparation', 'Cancelled', 'Failed'},
                'Distribution Preparation': {'Promoting', 'Cancelled', 'Failed'},
                'Promoting': {'Completed', 'Failed'},
                'Cancelled': {'Refund Pending'}, 'Failed': {'Refund Pending'},
                'Refund Pending': {'Cancelled'},
            }
            if target not in allowed.get(source, set()):
                raise HTTPException(409, f'Cannot move from {source} to {target}.')
            if target == 'Available for Funding':
                if not campaign['approved_version'] or campaign['approved_version'] != campaign['version'] or campaign['revision_status']:
                    raise HTTPException(409, 'The exact current version must be approved before publication.')
                connection.execute('UPDATE campaigns SET published_json=data_json,deadline=? WHERE id=?',
                                   (stamp(utcnow()+timedelta(days=content['durationDays'])), campaign_id))
            if target == 'Funding Goal Reached' and money['raised'] < cents(content['goal']):
                raise HTTPException(409, 'The funding ledger has not reached the goal.')
            if target == 'Funding Period Ends' and (not campaign['deadline'] or parse_stamp(campaign['deadline']) > utcnow()):
                raise HTTPException(409, 'The funding period has not ended.')
            if target in {'Distribution Preparation', 'Promoting'}:
                if not campaign['approved_version'] or campaign['revision_status']:
                    raise HTTPException(409, 'Resolve and approve pending material changes before distribution.')
                if money['available'] <= 0 or money['raised'] <= 0:
                    raise HTTPException(409, 'Successful payments and a positive advertising budget are required.')
                if source == 'Funding Period Ends' and money['raised'] < cents(content['goal']) and not payload.partialFundingApproved:
                    raise HTTPException(409, 'A reviewer must explicitly approve the partial budget after the deadline.')
            if target == 'Promoting':
                if not payload.setupReady:
                    raise HTTPException(409, 'Confirm the advertising setup is ready before starting simulated promotion.')
                net = money['available']
                report = {'simulated': True, 'provenance': 'Controlled advertising simulation. No live advertising was purchased.',
                          'allocated': dollars(money['allocated']), 'spent': 0, 'simulatedReach': 0,
                          'measuredReach': None, 'impressions': 0, 'clicks': 0, 'unspent': dollars(net),
                          'durationDays': content['durationDays'], 'final': False, 'startedAt': stamp(),
                          'refundStatus': 'Calculated on completion', 'completedAt': None}
                connection.execute('UPDATE campaigns SET report_json=?,setup_ready=1 WHERE id=?', (json.dumps(report), campaign_id))
            if target == 'Completed':
                if campaign['revision_status']:
                    raise HTTPException(409, 'Resolve and approve pending material changes before completing distribution.')
                if not campaign['report_json'] or not campaign['setup_ready']:
                    raise HTTPException(409, 'A prepared simulation report and distribution setup are required.')
                report = json.loads(campaign['report_json'])
                net = money['allocated']
                spent = net * 95 // 100
                report.update({'spent': dollars(spent), 'simulatedReach': int(spent/100*people_rate*0.9),
                               'impressions': int(spent/100*people_rate*1.35), 'clicks': int(spent/100*0.8),
                               'unspent': dollars(net-spent), 'final': True, 'completedAt': stamp(),
                               'refundStatus': 'Simulated unspent refund complete'})
                connection.execute('UPDATE campaigns SET report_json=? WHERE id=?', (json.dumps(report), campaign_id))
                campaign['report_json'] = json.dumps(report)
                refund(connection, campaign, full=False)
            if target in {'Cancelled', 'Failed'} and source != 'Refund Pending' and not payload.reason.strip():
                raise HTTPException(422, 'Provide a reason for cancellation or failure.')
            if target == 'Cancelled' and source == 'Refund Pending':
                promoted = bool(campaign['report_json'])
                refund(connection, campaign, full=not promoted)
            if target == 'Refund Pending':
                delivery = json.loads(campaign['report_json']) if campaign['report_json'] else None
                refundable = (max(money['available'] - cents(delivery.get('spent', 0), allow_zero=True, maximum=10**15), 0)
                              if delivery else max(money['raised'] - money['refunded'], 0))
                if refundable <= 0:
                    raise HTTPException(409, 'There are no remaining refundable funds. Completed refunds are already recorded.')
            connection.execute('UPDATE campaigns SET status=?,updated_at=? WHERE id=?', (target, stamp(), campaign_id))
            event(connection, campaign, user['id'], 'transition', target, payload.reason or 'Reviewer explicitly authorized this demo lifecycle step.')
            messages = {
                'Available for Funding': ('Available for backing', 'The reviewed campaign can now receive simulated contributions.'),
                'Distribution Preparation': ('Distribution preparation', 'Funding is separate from advertising. The platform is preparing the approved campaign.'),
                'Promoting': ('Campaign promotion began', 'Simulated distribution has started; no live ads were purchased.'),
                'Completed': ('Campaign completed · final report available', 'Simulated distribution is complete. Open the final report for recorded spend, unspent funds and refunds.'),
            }
            title, body = messages.get(target, (f'Campaign: {target}', payload.reason or 'The campaign lifecycle was updated.'))
            campaign_notice(connection, campaign, title, body, f'transition:{campaign_id}:{target}:{campaign["version"]}',
                            destination_type='report' if target == 'Completed' else 'campaign')
            return campaign_json(connection, get_campaign(connection, campaign_id), user)

    def payment_json(payment, *, include_receipt=True):
        result = {'id': payment['id'], 'campaignId': payment['campaign_id'], 'title': payment['title'],
                  'status': payment['status'], 'amount': dollars(payment['amount_cents']),
                  'fee': dollars(payment['fee_cents']), 'total': dollars(payment['amount_cents']),
                  'adBudget': dollars(payment['ad_cents']), 'reach': payment['estimated_reach'],
                  'currency': 'USD', 'simulated': True, 'createdAt': payment['created_at'],
                  'refunded': dollars(payment['refunded_cents']), 'receipt': None}
        if payment['status'] == 'successful' and include_receipt:
            token = database.receipt_token(payment['id'])
            result['receipt'] = {'id': payment['id'], 'token': token, 'url': f'/receipts/{payment["id"]}?token={token}'}
        return result

    @app.post('/contributions')
    def contribute(payload: Contribution, user=Depends(auth_optional)):
        amount = cents(payload.amount, maximum=1_000_000)
        scope = f'user:{user["id"]}' if user else 'guest'
        key = digest(payload.idempotencyKey)
        request_hash = digest(json.dumps([payload.campaignId, amount, payload.outcome]))
        with database.transaction() as connection:
            # Replay is checked before campaign eligibility: a lost success response remains recoverable after goal reached.
            previous = connection.execute('SELECT * FROM payments WHERE actor_scope=? AND idempotency_hash=?', (scope, key)).fetchone()
            if previous:
                if not hmac.compare_digest(previous['request_hash'], request_hash):
                    raise HTTPException(409, 'This checkout key was already used with different details.')
                return payment_json(previous)
            reconcile(connection)
            campaign = get_campaign(connection, payload.campaignId)
            if campaign['status'] != 'Available for Funding' or not campaign['published_json']:
                raise HTTPException(409, 'This campaign is not currently accepting contributions.')
            content = json.loads(campaign['published_json'])
            fee = fee_for(amount, fee_rate)
            net = amount-fee
            payment_id = identifier('pay')
            old = totals(connection, campaign['id'])['raised']
            connection.execute('''INSERT INTO payments
                (id,campaign_id,user_id,actor_scope,idempotency_hash,request_hash,status,amount_cents,fee_cents,ad_cents,estimated_reach,title,created_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                               (payment_id, campaign['id'], user['id'] if user else None, scope, key, request_hash,
                                payload.outcome, amount, fee, net, estimated_reach(net, people_rate), content['title'], stamp()))
            if payload.outcome == 'successful':
                connection.execute('INSERT INTO ledger VALUES (?,?,?,?,?,?,?,?)',
                                   (identifier('led'), payment_id, campaign['id'], 'contribution', amount, fee, net, stamp()))
                new = old+amount
                goal = cents(content['goal'])
                crossed = [percent for percent in (25, 50, 75, 100) if old*100 < goal*percent <= new*100]
                if crossed:
                    percent = max(crossed)
                    campaign_notice(connection, campaign, f'{percent}% funding milestone',
                                    'Successful simulated contributions reached this milestone. Advertising has not launched.', f'milestone:{campaign["id"]}:{percent}', destination_type='report')
                if new >= goal:
                    connection.execute("UPDATE campaigns SET status='Funding Goal Reached',updated_at=? WHERE id=?", (stamp(), campaign['id']))
                    event(connection, campaign, None, 'funding', 'Funding Goal Reached', 'Successful simulated payments reached the goal. Distribution requires a separate reviewer action.')
            if user:
                notify(connection, user['id'], 'payments', f'Simulated contribution {payload.outcome}',
                       f'Your ${amount/100:.2f} checkout is {payload.outcome}. Only successful payments count toward funding.',
                       campaign_id=campaign['id'], key=f'payment:{payment_id}', destination={'type': 'payments', 'paymentId': payment_id})
            payment = connection.execute('SELECT * FROM payments WHERE id=?', (payment_id,)).fetchone()
            return payment_json(payment)

    @app.get('/receipts/{payment_id}')
    def receipt(payment_id: str, token: str = '', user=Depends(auth_optional)):
        with database.connect() as connection:
            payment = connection.execute('SELECT * FROM payments WHERE id=?', (payment_id,)).fetchone()
            if not payment or payment['status'] != 'successful':
                raise HTTPException(404, 'Receipt not found.')
            owned = user and payment['user_id'] == user['id']
            # compare_digest only accepts ASCII strings; malformed Unicode or
            # oversized capabilities must be denied rather than raising a 500.
            capability = bool(re.fullmatch(r'[a-f0-9]{64}', token)) and hmac.compare_digest(token, database.receipt_token(payment_id))
            if not owned and not capability:
                raise HTTPException(403, 'A receipt is private. Sign in as its backer or use its private receipt link.')
            return {**payment_json(payment), 'note': 'Simulated transaction receipt. No real funds moved; this is not a tax donation receipt.'}

    @app.get('/me')
    def me(user=Depends(auth)):
        with database.transaction() as connection:
            reconcile(connection)
            campaigns = [campaign_json(connection, dict(row), user) for row in connection.execute('SELECT * FROM campaigns WHERE owner_id=? ORDER BY updated_at DESC', (user['id'],))]
            payments = [payment_json(row) for row in connection.execute('SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC', (user['id'],))]
            saved = [row[0] for row in connection.execute("SELECT campaign_id FROM tracking WHERE user_id=? AND kind='save'", (user['id'],))]
            followed = [row[0] for row in connection.execute("SELECT campaign_id FROM tracking WHERE user_id=? AND kind='follow'", (user['id'],))]
            return {'user': user_json(user), 'campaigns': campaigns, 'payments': payments, 'saved': saved,
                    'followed': followed, 'preferences': json.loads(user['preferences_json'])}

    @app.put('/me/preferences')
    def preferences(payload: dict, user=Depends(auth)):
        categories = payload.get('categories', {})
        delivery = payload.get('delivery', {})
        if not isinstance(categories, dict) or any(key not in DEFAULT_PREFERENCES['categories'] or not isinstance(value, bool) for key, value in categories.items()):
            raise HTTPException(422, 'Use supported notification categories and true/false values.')
        if not isinstance(delivery, dict) or any(key not in {'inApp', 'push', 'email'} or not isinstance(value, bool) for key, value in delivery.items()):
            raise HTTPException(422, 'Use supported delivery preferences and true/false values.')
        if delivery.get('push') or delivery.get('email'):
            raise HTTPException(422, 'Push and email are not connected in this prototype. In-app notifications are supported.')
        with database.transaction() as connection:
            # Read the latest preferences after acquiring the write transaction.
            # An auth snapshot may predate another simultaneous partial update.
            stored = connection.execute('SELECT preferences_json FROM users WHERE id=?', (user['id'],)).fetchone()
            current = json.loads(stored['preferences_json'])
            current['categories'].update(categories)
            current['categories']['security'] = True
            current['delivery'] = {'inApp': True, 'push': False, 'email': False}
            connection.execute('UPDATE users SET preferences_json=? WHERE id=?', (json.dumps(current), user['id']))
        return current

    @app.put('/me')
    def edit_profile(payload: dict, user=Depends(auth)):
        name = payload.get('name')
        if not isinstance(name, str) or not name.strip() or len(name) > 150:
            raise HTTPException(422, 'Enter a name of 1 to 150 characters.')
        with database.transaction() as connection:
            connection.execute('UPDATE users SET name=? WHERE id=?', (name.strip(), user['id']))
            notify(connection, user['id'], 'security', 'Profile updated', 'Your display name changed.')
        return {**user_json(user), 'name': name.strip()}

    @app.get('/activity')
    def activity(user=Depends(auth)):
        with database.transaction() as connection:
            reconcile(connection)
            campaigns = {}
            notifications = []
            for row in connection.execute('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC,rowid DESC LIMIT 300', (user['id'],)):
                campaign_id = row['campaign_id']
                if campaign_id and campaign_id not in campaigns:
                    found = connection.execute('SELECT * FROM campaigns WHERE id=?', (campaign_id,)).fetchone()
                    campaigns[campaign_id] = dict(found) if found else None
                campaign = campaigns.get(campaign_id)
                visible = bool(campaign and (can_manage(campaign, user) or
                               (campaign['status'] in PUBLIC_STATES and campaign['published_json'])))
                campaign_title = None
                if visible:
                    # A follower/backer sees the approved public identity even if
                    # the creator has a private, differently titled revision.
                    own_campaign = campaign['owner_id'] == user['id']
                    content_json = campaign['data_json'] if own_campaign else campaign['published_json'] or campaign['data_json']
                    campaign_title = json.loads(content_json)['title'].strip() or 'Untitled campaign'
                try:
                    destination = json.loads(row['destination_json']) if row['destination_json'] else None
                except (json.JSONDecodeError, TypeError):
                    destination = None
                if not isinstance(destination, dict) or not isinstance(destination.get('type'), str) or destination['type'] not in {'campaign', 'creator', 'payments', 'report', 'profile'}:
                    destination = default_destination(row['category'], campaign_id, row['dedup_key'])
                kind = destination['type']
                resolved = {'type': kind}
                if kind == 'creator':
                    editable = bool(visible and campaign['owner_id'] == user['id'] and
                                    (campaign['revision_status'] or campaign['status']) in {'Draft', 'Changes Requested'})
                    resolved = {'type': 'creator' if editable else 'campaign' if visible else 'profile'}
                elif kind in {'campaign', 'report'} and not visible:
                    resolved = {'type': 'profile'}
                if resolved['type'] in {'campaign', 'creator', 'report', 'payments'} and visible:
                    resolved['campaignId'] = campaign_id
                payment_id = destination.get('paymentId')
                if resolved['type'] == 'payments' and isinstance(payment_id, str):
                    owned_payment = connection.execute('SELECT 1 FROM payments WHERE id=? AND user_id=?', (payment_id, user['id'])).fetchone()
                    if owned_payment:
                        resolved['paymentId'] = payment_id
                notifications.append({'id': row['id'], 'title': row['title'], 'body': row['body'], 'category': row['category'],
                                      'campaignId': campaign_id if visible else None, 'campaignTitle': campaign_title,
                                      'destination': resolved, 'createdAt': row['created_at'], 'read': bool(row['is_read'])})
            return notifications

    @app.post('/activity/{notification_id}/read')
    def mark_read(notification_id: str, user=Depends(auth)):
        with database.transaction() as connection:
            cursor = connection.execute('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', (notification_id, user['id']))
            if cursor.rowcount != 1:
                raise HTTPException(404, 'Notification not found.')
        return {'ok': True}

    def toggle(kind, campaign_id, user):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_visible(campaign, user)
            exists = connection.execute('SELECT 1 FROM tracking WHERE user_id=? AND campaign_id=? AND kind=?', (user['id'], campaign_id, kind)).fetchone()
            if exists:
                connection.execute('DELETE FROM tracking WHERE user_id=? AND campaign_id=? AND kind=?', (user['id'], campaign_id, kind))
            else:
                connection.execute('INSERT INTO tracking VALUES (?,?,?,?)', (user['id'], campaign_id, kind, stamp()))
            return {'active': not bool(exists)}

    @app.post('/campaigns/{campaign_id}/save')
    def save(campaign_id: str, user=Depends(auth)):
        return toggle('save', campaign_id, user)

    @app.post('/campaigns/{campaign_id}/follow')
    def follow(campaign_id: str, user=Depends(auth)):
        return toggle('follow', campaign_id, user)

    @app.get('/campaigns/{campaign_id}/report')
    def report(campaign_id: str, user=Depends(auth_optional)):
        with database.connect() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_visible(campaign, user)
            return report_json(connection, campaign)

    @app.get('/campaigns/{campaign_id}/updates')
    def campaign_updates(campaign_id: str, user=Depends(auth_optional)):
        with database.connect() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_visible(campaign, user)
            updates = []
            for row in connection.execute("SELECT id,detail,created_at FROM campaign_events WHERE campaign_id=? AND event_type='update' ORDER BY created_at DESC,id DESC", (campaign_id,)):
                title, _, body = row['detail'].partition('\n')
                updates.append({'id': row['id'], 'title': title, 'body': body, 'createdAt': row['created_at']})
            return updates

    @app.get('/campaigns/{campaign_id}/history')
    def campaign_history(campaign_id: str, user=Depends(auth)):
        with database.connect() as connection:
            campaign = get_campaign(connection, campaign_id)
            if not can_manage(campaign, user):
                raise HTTPException(403, 'Campaign history is restricted to its creator and reviewers.')
            return [dict(row) for row in connection.execute('''SELECT id,event_type AS type,previous_state AS previousState,
                new_state AS newState,detail,created_at AS createdAt,version FROM campaign_events
                WHERE campaign_id=? ORDER BY created_at,id''', (campaign_id,))]

    @app.post('/campaigns/{campaign_id}/updates')
    def campaign_update(campaign_id: str, payload: CampaignUpdate, user=Depends(auth)):
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            if not can_manage(campaign, user):
                raise HTTPException(403, 'Only the creator or reviewer can publish an update.')
            if not campaign['published_json']:
                raise HTTPException(409, 'Updates become available after publication.')
            event(connection, campaign, user['id'], 'update', campaign['status'], f'{payload.title}\n{payload.body}')
            campaign_notice(connection, campaign, payload.title, payload.body, identifier('update'))
        return {'ok': True}

    @app.post('/campaigns/{campaign_id}/feedback')
    def campaign_feedback(campaign_id: str, payload: CampaignFeedback, user=Depends(auth)):
        visuals, persuasion = payload.visuals, payload.persuasion
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            assert_visible(campaign, user)
            connection.execute('''INSERT INTO feedback VALUES (?,?,?,?,?,?)
                ON CONFLICT(campaign_id,user_id) DO UPDATE SET visuals=excluded.visuals,persuasion=excluded.persuasion,created_at=excluded.created_at''',
                               (identifier('fdb'), campaign_id, user['id'], visuals, persuasion, stamp()))
        return {'ok': True}

    @app.post('/uploads', status_code=201)
    async def upload(request: Request, file: UploadFile = File(), purpose: str = Form(default='story'), user=Depends(auth)):
        if purpose not in {'cover', 'story', 'advertising'}:
            raise HTTPException(422, 'Choose cover, story, or advertising as the asset purpose.')
        if file.content_type not in {'image/jpeg', 'image/png', 'image/webp'}:
            raise HTTPException(415, 'Upload a JPEG, PNG, or WebP image. Video is not supported in this prototype.')
        raw = await file.read(8*1024*1024+1)
        if len(raw) > 8*1024*1024:
            raise HTTPException(413, 'Image must be 8 MB or smaller.')
        try:
            with Image.open(io.BytesIO(raw)) as original:
                original.verify()
            with Image.open(io.BytesIO(raw)) as original:
                if original.format not in {'JPEG', 'PNG', 'WEBP'} or original.width*original.height > 25_000_000:
                    raise ValueError('Unsupported image or too many pixels.')
                image = original.convert('RGB')
                image.thumbnail((3000, 3000))
                output = io.BytesIO()
                image.save(output, 'JPEG', quality=90, optimize=True)
        except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
            raise HTTPException(422, 'This file is not a valid supported image, or it exceeds 25 megapixels.')
        asset_id = identifier('img')
        filename = f'{asset_id}.jpg'
        data = output.getvalue()
        (database.media / filename).write_bytes(data)
        with database.transaction() as connection:
            connection.execute('INSERT INTO assets VALUES (?,?,?,?,?,?,?,?,?)', (asset_id, user['id'], purpose,
                               filename, 'image/jpeg', len(data), image.width, image.height, stamp()))
        return {'id': asset_id, 'url': str(request.base_url).rstrip('/')+f'/media/{filename}',
                'width': image.width, 'height': image.height, 'contentType': 'image/jpeg', 'size': len(data), 'purpose': purpose}

    @app.get('/media/{filename}')
    def media(filename: str):
        if not re.fullmatch(r'img_[a-f0-9]{24}\.jpg', filename):
            raise HTTPException(404, 'Image not found.')
        path = (database.media / filename).resolve()
        if not path.is_relative_to(database.media.resolve()) or not path.is_file():
            raise HTTPException(404, 'Image not found.')
        return FileResponse(path, media_type='image/jpeg', headers={'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff'})

    @app.get('/seed-media/{filename}')
    def seed_media(filename: str):
        if not re.fullmatch(r'(forest|learning|ocean|community|arts|science)\.jpg', filename):
            raise HTTPException(404, 'Sample image not found.')
        from db import ROOT
        path = (ROOT / 'assets' / 'seed' / filename).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            raise HTTPException(404, 'Sample image not found.')
        return FileResponse(path, media_type='image/jpeg', headers={'Cache-Control': 'public, max-age=86400'})

    @app.post('/campaigns/{campaign_id}/progress')
    def progress(campaign_id: str, user=Depends(reviewer)):
        """One controlled midpoint for demonstrating a meaningful distribution notification."""
        with database.transaction() as connection:
            campaign = get_campaign(connection, campaign_id)
            if campaign['status'] != 'Promoting' or not campaign['report_json']:
                raise HTTPException(409, 'Simulated promotion must begin before recording progress.')
            if campaign['revision_status'] or campaign['approved_version'] != campaign['version'] or not campaign['setup_ready']:
                raise HTTPException(409, 'Resolve pending revisions and reconfirm the approved advertising setup before recording distribution progress.')
            report = json.loads(campaign['report_json'])
            allocated = totals(connection, campaign_id)['allocated']
            spent = int(allocated*0.5)
            report.update({'spent': dollars(spent), 'unspent': dollars(allocated-spent),
                           'simulatedReach': int(spent/100*people_rate*0.9),
                           'impressions': int(spent/100*people_rate*1.35), 'clicks': int(spent/100*0.8)})
            connection.execute('UPDATE campaigns SET report_json=? WHERE id=?', (json.dumps(report), campaign_id))
            campaign_notice(connection, campaign, 'Distribution progress', 'The simulation reached its midpoint. View the report for modelled spend and results.', f'progress-midpoint:{campaign_id}', destination_type='report')
            return report_json(connection, get_campaign(connection, campaign_id))

    return app


# Instantiation belongs in run.py or an ASGI factory to keep imports free of database creation.

