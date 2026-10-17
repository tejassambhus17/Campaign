"""Behavioral API tests against isolated, real SQLite files and HTTP requests."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from datetime import timedelta
import base64
import io
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
import uuid

from fastapi.testclient import TestClient
from PIL import Image

from db import ROOT
from domain import stamp, utcnow
from main import create_app


class ApiTests(unittest.TestCase):
    def setUp(self):
        folder = ROOT / 'data' / 'tests'
        folder.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=folder)
        self.env = patch.dict(os.environ, {'CAMPAIGN_REVIEWER_EMAIL': 'test-reviewer@example.test',
                                          'CAMPAIGN_REVIEWER_PASSWORD': 'test-only-reviewer-password'})
        self.env.start()
        self.path = Path(self.temp.name) / 'test.db'
        self.app = create_app(self.path, seed=False)
        self.client = TestClient(self.app)
        self.creator = self.register('creator@example.test')
        self.other = self.register('other@example.test')
        response = self.client.post('/auth/login', json={'email': 'test-reviewer@example.test', 'password': 'test-only-reviewer-password'})
        self.assertEqual(response.status_code, 200, response.text)
        self.reviewer = response.json()

    def tearDown(self):
        self.client.close()
        self.env.stop()
        self.temp.cleanup()

    def register(self, email):
        response = self.client.post('/auth/register', json={'name': 'Test Creator', 'email': email, 'password': 'test-only-password', 'role': 'reviewer'})
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()['user']['role'], 'member')
        return response.json()

    def headers(self, account=None):
        return {'Authorization': f'Bearer {(account or self.creator)["token"]}'}

    def create(self, **changes):
        content = {'title': 'A message for our community', 'category': 'Community', 'creatorName': 'Test Collective',
                   'summary': 'A fictional message', 'storyHeadline': 'Our story', 'intro': 'Context matters.',
                   'sections': [{'id': 'one', 'kind': 'text', 'text': 'A clear story.', 'format': 'bold'}],
                   'sources': [{'id': 'source', 'title': 'Public context', 'url': 'https://example.org/context'}],
                   'geography': 'India', 'channels': ['Instagram'], 'allocation': {'Instagram': 100},
                   'durationDays': 7, 'goal': 100, 'currentStep': 4, **changes}
        response = self.client.post('/campaigns', json=content, headers=self.headers())
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def publish(self, **changes):
        campaign = self.create(**changes)
        campaign_id = campaign['id']
        response = self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.assertEqual(response.status_code, 200, response.text)
        response = self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(response.status_code, 200, response.text)
        response = self.transition(campaign_id, 'Available for Funding')
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def transition(self, campaign_id, target, **extra):
        return self.client.post(f'/campaigns/{campaign_id}/transition', json={'target': target, **extra}, headers=self.headers(self.reviewer))

    def contribute(self, campaign_id, amount=10, outcome='successful', key=None, account=True):
        return self.client.post('/contributions', json={'campaignId': campaign_id, 'amount': amount,
                                'outcome': outcome, 'idempotencyKey': key or str(uuid.uuid4())},
                                headers=self.headers() if account else {})

    def test_auth_password_hash_and_logout(self):
        with self.app.state.database.connect() as connection:
            stored = connection.execute('SELECT password_hash FROM users WHERE email=?', ('creator@example.test',)).fetchone()[0]
            self.assertTrue(stored.startswith('scrypt$'))
            self.assertNotIn('test-only-password', stored)
            raw_session = connection.execute('SELECT token_hash FROM sessions WHERE user_id=?', (self.creator['user']['id'],)).fetchone()[0]
            self.assertNotEqual(raw_session, self.creator['token'])
        self.assertEqual(self.client.post('/auth/login', json={'email': 'creator@example.test', 'password': 'wrong'}).status_code, 401)
        self.assertEqual(self.client.get('/me').status_code, 401)
        self.assertEqual(self.client.post('/auth/logout', headers=self.headers()).status_code, 200)
        self.assertEqual(self.client.get('/me', headers=self.headers()).status_code, 401)

    def test_private_campaign_and_account_responses_cannot_be_http_cached(self):
        campaign_id = self.create()['id']
        for path, account in [(f'/campaigns/{campaign_id}', self.creator),
                              (f'/campaigns/{campaign_id}/history', self.reviewer),
                              ('/review-queue', self.reviewer), ('/me', self.creator), ('/activity', self.creator)]:
            response = self.client.get(path, headers=self.headers(account))
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.headers.get('cache-control'), 'no-store')
            self.assertIn('authorization', response.headers.get('vary', '').lower())
        private_guest = self.client.get(f'/campaigns/{campaign_id}')
        self.assertEqual(private_guest.status_code, 404)
        self.assertEqual(private_guest.headers.get('cache-control'), 'no-store')

    def test_draft_creation_idempotency_is_owner_scoped(self):
        key = str(uuid.uuid4())
        content = {'title': 'A stable local draft', 'clientDraftId': key}
        with ThreadPoolExecutor(max_workers=6) as pool:
            responses = list(pool.map(lambda _: self.client.post('/campaigns', json=content, headers=self.headers()), range(6)))
        self.assertTrue(all(response.status_code == 201 for response in responses))
        self.assertEqual(len({response.json()['id'] for response in responses}), 1)
        other = self.client.post('/campaigns', json=content, headers=self.headers(self.other))
        self.assertNotEqual(responses[0].json()['id'], other.json()['id'])
        self.assertEqual(len(self.client.get('/me', headers=self.headers()).json()['campaigns']), 1)

    def test_draft_persistence_format_order_and_ownership(self):
        campaign = self.create(sections=[{'id': 'second', 'kind': 'image', 'url': 'https://example.org/a.jpg', 'caption': 'Caption', 'credit': 'Credit'},
                                         {'id': 'first', 'kind': 'text', 'text': 'Formatted', 'format': 'italic'}])
        endpoint = f'/campaigns/{campaign["id"]}'
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(self.client.get(endpoint, headers=self.headers(self.other)).status_code, 404)
        self.assertEqual(self.client.put(endpoint, json={'title': 'Hacked'}, headers=self.headers(self.other)).status_code, 403)
        saved = self.client.put(endpoint, json={'summary': 'Saved content', 'currentStep': 2, 'version': campaign['version']}, headers=self.headers())
        self.assertEqual(saved.status_code, 200, saved.text)
        self.assertEqual(self.client.put(endpoint, json={'version': campaign['version']}, headers=self.headers()).status_code, 409)
        second_app = create_app(self.path, seed=False)
        with TestClient(second_app) as second:
            restored = second.get(endpoint, headers=self.headers()).json()
            self.assertEqual(restored['summary'], 'Saved content')
            self.assertEqual(restored['currentStep'], 2)
            self.assertEqual([section['id'] for section in restored['sections']], ['second', 'first'])
            self.assertEqual(restored['sections'][1]['format'], 'italic')
            self.assertEqual(restored['sections'][0]['credit'], 'Credit')

    def test_submission_validation_and_guards(self):
        campaign = self.create(title='', category='', creatorName='', goal=0, allocation={'Instagram': 80})
        campaign_id = campaign['id']
        response = self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': False}, headers=self.headers())
        self.assertEqual(response.status_code, 422)
        self.assertTrue({'title', 'category', 'creatorName', 'goal', 'allocation', 'rulesAccepted'}.issubset(response.json()['detail']))
        self.assertEqual(self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'approve'}, headers=self.headers()).status_code, 403)
        self.assertEqual(self.transition(campaign_id, 'Promoting').status_code, 409)
        self.assertEqual(self.client.post('/campaigns', json={'title': 'x'*61}, headers=self.headers()).status_code, 422)
        self.assertEqual(self.client.put(f'/campaigns/{campaign_id}', json={'sources': [{'id': 'bad', 'title': 'Unsafe', 'url': 'javascript:alert(1)'}]}, headers=self.headers()).status_code, 422)

    def test_review_corrections_resubmit_and_publish(self):
        campaign_id = self.create()['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.assertEqual(self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers()).status_code, 200)
        self.assertEqual(self.client.put(endpoint, json={'title': 'Bypass'}, headers=self.headers()).status_code, 409)
        changes = self.client.post(endpoint+'/review', json={'decision': 'changes', 'feedback': 'Clarify the audience.'}, headers=self.headers(self.reviewer))
        self.assertEqual(changes.json()['status'], 'Changes Requested')
        self.assertEqual(self.transition(campaign_id, 'Available for Funding').status_code, 409)
        self.assertEqual(self.client.put(endpoint, json={'geography': 'India, urban communities'}, headers=self.headers()).status_code, 200)
        self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.client.post(endpoint+'/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(self.transition(campaign_id, 'Available for Funding').status_code, 200)
        self.assertEqual(self.client.get(endpoint).json()['sources'][0]['title'], 'Public context')

    def test_rejected_campaign_never_becomes_public_or_accepts_payment(self):
        campaign_id = self.create()['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers())
        rejected = self.client.post(endpoint+'/review', json={'decision': 'reject', 'feedback': 'This fictional submission is not eligible.'}, headers=self.headers(self.reviewer))
        self.assertEqual(rejected.status_code, 200)
        self.assertEqual(rejected.json()['status'], 'Rejected')
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(self.contribute(campaign_id).status_code, 409)
        self.assertEqual(self.transition(campaign_id, 'Available for Funding').status_code, 409)

    def test_payment_outcomes_and_amount_precision(self):
        campaign_id = self.publish()['id']
        for outcome in ('pending', 'rejected', 'cancelled', 'failed'):
            payment = self.contribute(campaign_id, outcome=outcome)
            self.assertEqual(payment.status_code, 200, payment.text)
            self.assertEqual(payment.json()['status'], outcome)
            self.assertIsNone(payment.json()['receipt'])
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}').json()['raised'], 0)
        for amount in (0, -1, 0.01, 0.99, 0.001, 10000.01, 'NaN'):
            self.assertEqual(self.contribute(campaign_id, amount=amount).status_code, 422, str(amount))
        successful = self.contribute(campaign_id, 10).json()
        self.assertEqual((successful['amount'], successful['fee'], successful['total'], successful['adBudget'], successful['reach']), (10, .5, 10, 9.5, 256))
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}').json()['raised'], 10)

    def test_goal_estimate_uses_same_rounded_fee_formula_as_payments(self):
        campaign = self.create(goal=0.78)
        self.assertEqual(campaign['estimatedReach'], 19)
        campaign_id = self.publish(goal=2)['id']
        payment = self.contribute(campaign_id, 1.11).json()
        self.assertEqual(payment['fee'], .06)
        self.assertEqual(payment['reach'], 28)

    def test_concurrent_idempotency_and_goal_no_auto_advertising(self):
        campaign_id = self.publish(goal=20)['id']
        key = str(uuid.uuid4())
        with ThreadPoolExecutor(max_workers=8) as pool:
            responses = list(pool.map(lambda _: self.contribute(campaign_id, 20, key=key), range(8)))
        self.assertTrue(all(response.status_code == 200 for response in responses), [response.text for response in responses])
        self.assertEqual(len({response.json()['id'] for response in responses}), 1)
        self.assertEqual(self.contribute(campaign_id, 21, key=key).status_code, 409)
        campaign = self.client.get(f'/campaigns/{campaign_id}').json()
        self.assertEqual(campaign['raised'], 20)
        self.assertEqual(campaign['status'], 'Funding Goal Reached')
        self.assertFalse(campaign['report']['available'])
        self.assertEqual(self.contribute(campaign_id, 1).status_code, 409)

    def test_concurrent_unique_payments_totals(self):
        campaign_id = self.publish(goal=1000)['id']
        with ThreadPoolExecutor(max_workers=8) as pool:
            responses = list(pool.map(lambda _: self.contribute(campaign_id, 1.25), range(20)))
        self.assertTrue(all(response.status_code == 200 for response in responses))
        report = self.client.get(f'/campaigns/{campaign_id}/report').json()
        self.assertEqual(report['raised'], 25)
        self.assertEqual(report['fees'], 1.2)
        self.assertEqual(report['allocated'], 23.8)

    def test_milestones_emit_only_highest_new_threshold_without_repeats(self):
        campaign_id = self.publish(goal=125)['id']
        self.assertEqual(self.contribute(campaign_id, 125).status_code, 200)
        milestones = [item['title'] for item in self.client.get('/activity', headers=self.headers()).json()
                      if item['campaignId'] == campaign_id and 'funding milestone' in item['title']]
        self.assertEqual(milestones, ['100% funding milestone'])
        activity = self.client.get('/activity', headers=self.headers()).json()
        milestone = next(item for item in activity if item['campaignId'] == campaign_id and 'funding milestone' in item['title'])
        self.assertEqual(milestone['destination'], {'type': 'report', 'campaignId': campaign_id})
        incremental_id = self.publish(goal=1000)['id']
        self.contribute(incremental_id, 260)
        self.contribute(incremental_id, 10)
        key = str(uuid.uuid4())
        self.contribute(incremental_id, 250, key=key)
        self.contribute(incremental_id, 250, key=key)
        self.assertEqual(self.client.get(f'/campaigns/{incremental_id}').json()['raised'], 520)
        self.contribute(incremental_id, 740)
        milestones = [item['title'] for item in self.client.get('/activity', headers=self.headers()).json()
                      if item['campaignId'] == incremental_id and 'funding milestone' in item['title']]
        self.assertCountEqual(milestones, ['25% funding milestone', '50% funding milestone', '100% funding milestone'])

    def test_private_receipts_and_profile_history(self):
        campaign_id = self.publish()['id']
        payment = self.contribute(campaign_id).json()
        endpoint = '/receipts/'+payment['id']
        self.assertEqual(self.client.get(endpoint).status_code, 403)
        self.assertEqual(self.client.get(endpoint, params={'token': 'é'}).status_code, 403)
        self.assertEqual(self.client.get(endpoint, params={'token': 'a'*1000}).status_code, 403)
        self.assertEqual(self.client.get(endpoint, headers=self.headers(self.other)).status_code, 403)
        self.assertEqual(self.client.get(endpoint, headers=self.headers(self.reviewer)).status_code, 403)
        self.assertEqual(self.client.get(endpoint, headers=self.headers()).status_code, 200)
        self.assertEqual(self.client.get(payment['receipt']['url']).status_code, 200)
        self.assertEqual(len(self.client.get('/me', headers=self.headers()).json()['payments']), 1)
        self.assertEqual(self.client.get('/me', headers=self.headers(self.other)).json()['payments'], [])
        public = self.client.get(f'/campaigns/{campaign_id}').json()
        self.assertNotIn('payments', public)
        self.assertNotIn('backers', public)
        guest = self.contribute(campaign_id, account=False).json()
        self.assertEqual(self.client.get(guest['receipt']['url']).status_code, 200)

    def test_lifecycle_prerequisites_and_final_refund(self):
        campaign_id = self.publish()['id']
        self.assertEqual(self.transition(campaign_id, 'Funding Goal Reached').status_code, 409)
        self.assertEqual(self.transition(campaign_id, 'Funding Period Ends').status_code, 409)
        self.contribute(campaign_id, 100)
        self.assertEqual(self.transition(campaign_id, 'Promoting', setupReady=True).status_code, 409)
        self.assertEqual(self.transition(campaign_id, 'Distribution Preparation').status_code, 200)
        self.assertEqual(self.transition(campaign_id, 'Promoting').status_code, 409)
        self.assertEqual(self.transition(campaign_id, 'Promoting', setupReady=True).status_code, 200)
        self.assertEqual(self.client.post(f'/campaigns/{campaign_id}/progress', headers=self.headers(self.reviewer)).status_code, 200)
        completed = self.transition(campaign_id, 'Completed')
        self.assertEqual(completed.status_code, 200, completed.text)
        report = completed.json()['report']
        self.assertTrue(report['final'])
        self.assertTrue(report['simulated'])
        self.assertEqual((report['raised'], report['fees'], report['allocated'], report['spent'], report['refunded']), (100, 5, 95, 90.25, 4.75))
        self.assertEqual((report['unspentBeforeRefund'], report['refundedAdvertising'], report['refundedFees'],
                          report['remainingAdvertisingBudget'], report['retainedFees'], report['refundPendingAmount']),
                         (4.75, 4.75, 0, 0, 5, 0))
        self.assertEqual(report['refundState'], 'completed')
        self.assertEqual(report['raised'], report['retainedFees'] + report['spent'] + report['refunded'] + report['remainingAdvertisingBudget'])
        self.assertIsNone(report['measuredReach'])
        self.assertEqual(self.transition(campaign_id, 'Completed').json()['report']['refunded'], 4.75)

    def test_deadline_partial_funding_and_notification_dedup(self):
        campaign_id = self.publish()['id']
        self.contribute(campaign_id, 10)
        with self.app.state.database.transaction() as connection:
            connection.execute('UPDATE campaigns SET deadline=? WHERE id=?', (stamp(utcnow()-timedelta(seconds=1)), campaign_id))
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}').json()['status'], 'Funding Period Ends')
        self.assertEqual(self.transition(campaign_id, 'Distribution Preparation').status_code, 409)
        self.assertEqual(self.transition(campaign_id, 'Distribution Preparation', partialFundingApproved=True).status_code, 200)
        for _ in range(3):
            self.client.get('/activity', headers=self.headers())
        notifications = self.client.get('/activity', headers=self.headers()).json()
        self.assertEqual(sum(item['title'] == 'Funding period ended' for item in notifications), 1)

    def test_approaching_deadline_notification_is_deduplicated(self):
        campaign_id = self.publish()['id']
        with self.app.state.database.transaction() as connection:
            connection.execute('UPDATE campaigns SET deadline=? WHERE id=?', (stamp(utcnow()+timedelta(hours=12)), campaign_id))
        for _ in range(3):
            self.client.get('/campaigns')
        notifications = self.client.get('/activity', headers=self.headers()).json()
        self.assertEqual(sum(item['title'] == 'Funding deadline approaching' for item in notifications), 1)

    def test_public_revision_does_not_replace_approved_content_before_review(self):
        campaign = self.publish()
        campaign_id = campaign['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.assertEqual(self.client.post(endpoint+'/revision', headers=self.headers()).status_code, 200)
        revised = self.client.put(endpoint, json={'title': 'A revised message'}, headers=self.headers()).json()
        self.assertEqual(revised['title'], 'A revised message')
        self.assertEqual(self.client.get(endpoint).json()['title'], campaign['title'])
        self.assertEqual(self.client.put(endpoint, json={'goal': 999}, headers=self.headers()).status_code, 409)
        self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.assertEqual(self.client.get(endpoint).json()['title'], campaign['title'])
        self.client.post(endpoint+'/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(self.client.get(endpoint).json()['title'], 'A revised message')
        self.assertEqual(self.client.get(endpoint).json()['status'], 'Available for Funding')

    def test_submission_and_publication_timestamps_track_real_lifecycle_events(self):
        draft = self.create()
        self.assertIsNone(draft['submittedAt'])
        self.assertIsNone(draft['publishedAt'])
        self.assertFalse(draft['setupReady'])
        campaign_id = draft['id']
        endpoint = f'/campaigns/{campaign_id}'
        first = self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers()).json()
        self.assertIsNotNone(first['submittedAt'])
        self.assertIsNone(first['publishedAt'])
        self.client.post(endpoint+'/review', json={'decision': 'changes', 'feedback': 'Clarify this submission.'}, headers=self.headers(self.reviewer))
        self.client.put(endpoint, json={'intro': 'Clarified introduction.'}, headers=self.headers())
        latest = self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers()).json()
        self.assertGreater(latest['submittedAt'], first['submittedAt'])
        self.assertEqual(latest['createdAt'], draft['createdAt'])
        self.client.post(endpoint+'/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        published = self.transition(campaign_id, 'Available for Funding').json()
        self.assertIsNotNone(published['publishedAt'])
        with self.app.state.database.connect() as connection:
            dates = connection.execute("SELECT event_type,new_state,created_at FROM campaign_events WHERE campaign_id=? ORDER BY created_at", (campaign_id,)).fetchall()
        self.assertEqual(published['submittedAt'], [row['created_at'] for row in dates if row['event_type'] == 'submission'][-1])
        self.assertEqual(published['publishedAt'], [row['created_at'] for row in dates if row['new_state'] == 'Available for Funding'][0])
        self.assertEqual(self.client.get(endpoint).json()['publishedAt'], published['publishedAt'])

    def test_promoting_revision_requires_review_and_setup_reconfirmation(self):
        campaign = self.publish(goal=10)
        campaign_id = campaign['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.contribute(campaign_id, 10)
        self.assertEqual(self.transition(campaign_id, 'Distribution Preparation').status_code, 200)
        started = self.transition(campaign_id, 'Promoting', setupReady=True)
        self.assertTrue(started.json()['setupReady'])
        self.client.post(endpoint+'/revision', headers=self.headers())
        self.client.put(endpoint, json={'title': 'A reviewed message update'}, headers=self.headers())
        self.assertEqual(self.transition(campaign_id, 'Completed').status_code, 409)
        self.assertEqual(self.transition(campaign_id, 'Promoting', setupReady=True).status_code, 409)
        self.assertEqual(self.client.post(endpoint+'/progress', headers=self.headers(self.reviewer)).status_code, 409)
        self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers())
        approved = self.client.post(endpoint+'/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        self.assertEqual(approved.status_code, 200, approved.text)
        self.assertEqual(approved.json()['campaignState'], 'Promoting')
        self.assertFalse(approved.json()['setupReady'])
        self.assertEqual(approved.json()['publishedAt'], campaign['publishedAt'])
        self.assertEqual(self.transition(campaign_id, 'Completed').status_code, 409)
        self.assertEqual(self.client.post(endpoint+'/progress', headers=self.headers(self.reviewer)).status_code, 409)
        reconfirmed = self.transition(campaign_id, 'Promoting', setupReady=True)
        self.assertEqual(reconfirmed.status_code, 200, reconfirmed.text)
        self.assertTrue(reconfirmed.json()['setupReady'])
        self.assertEqual(self.client.post(endpoint+'/progress', headers=self.headers(self.reviewer)).status_code, 200)
        history = self.client.get(endpoint+'/history', headers=self.headers(self.reviewer)).json()
        self.assertEqual(history[-1]['type'], 'setup')
        completed = self.transition(campaign_id, 'Completed')
        self.assertEqual(completed.status_code, 200, completed.text)
        self.assertTrue(completed.json()['report']['final'])

    def test_cancel_refund_ledger_and_exceptional_state(self):
        campaign_id = self.publish()['id']
        self.contribute(campaign_id, 10)
        self.assertEqual(self.transition(campaign_id, 'Cancelled').status_code, 422)
        self.assertEqual(self.transition(campaign_id, 'Cancelled', reason='Demonstration cancellation.').status_code, 200)
        pending = self.transition(campaign_id, 'Refund Pending')
        self.assertEqual(pending.status_code, 200)
        self.assertEqual(pending.json()['report']['refundState'], 'pending')
        self.assertEqual(pending.json()['report']['refundPendingAmount'], 10)
        self.assertEqual(pending.json()['report']['refunded'], 0)
        self.assertEqual(self.transition(campaign_id, 'Cancelled').status_code, 200)
        report = self.client.get(f'/campaigns/{campaign_id}/report').json()
        self.assertEqual(report['refunded'], 10)
        self.assertEqual((report['refundedFees'], report['refundedAdvertising'], report['retainedFees'],
                          report['remainingAdvertisingBudget'], report['refundPendingAmount']), (.5, 9.5, 0, 0, 0))
        self.assertEqual(report['refundState'], 'completed')
        self.assertEqual(self.client.get('/me', headers=self.headers()).json()['payments'][0]['refunded'], 10)
        self.assertEqual(self.transition(campaign_id, 'Refund Pending').status_code, 409)
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}/report').json()['refundState'], 'completed')

    def test_failed_promotion_refund_separates_spend_and_pending_net_balance(self):
        campaign_id = self.publish()['id']
        self.contribute(campaign_id, 100)
        self.transition(campaign_id, 'Distribution Preparation')
        self.transition(campaign_id, 'Promoting', setupReady=True)
        progress = self.client.post(f'/campaigns/{campaign_id}/progress', headers=self.headers(self.reviewer)).json()
        self.transition(campaign_id, 'Failed', reason='Controlled simulation failure.')
        pending = self.transition(campaign_id, 'Refund Pending').json()['report']
        self.assertEqual(pending['refundState'], 'pending')
        self.assertEqual(pending['refundPendingAmount'], pending['allocated'] - progress['spent'])
        self.assertEqual(pending['refunded'], 0)
        done = self.transition(campaign_id, 'Cancelled').json()['report']
        self.assertEqual(done['refundState'], 'completed')
        self.assertEqual(done['refundedFees'], 0)
        self.assertEqual(done['remainingAdvertisingBudget'], 0)
        self.assertEqual(done['raised'], done['retainedFees'] + done['spent'] + done['refunded'])

    def test_many_backers_refund_rounding_never_over_refunds_final_payment(self):
        campaign_id = self.publish(goal=130)['id']
        for _ in range(130):
            self.assertEqual(self.contribute(campaign_id, 1).status_code, 200)
        self.transition(campaign_id, 'Distribution Preparation')
        self.transition(campaign_id, 'Promoting', setupReady=True)
        completed = self.transition(campaign_id, 'Completed')
        self.assertEqual(completed.status_code, 200, completed.text)
        payments = self.client.get('/me', headers=self.headers()).json()['payments']
        self.assertTrue(all(payment['refunded'] in {.04, .05} for payment in payments))
        from decimal import Decimal
        self.assertEqual(sum(Decimal(str(payment['refunded'])) for payment in payments), Decimal('6.18'))
        self.assertEqual(completed.json()['report']['refunded'], 6.18)

    def test_notifications_preferences_tracking_and_profile(self):
        campaign_id = self.publish()['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.assertTrue(self.client.post(endpoint+'/save', headers=self.headers()).json()['active'])
        self.assertTrue(self.client.post(endpoint+'/follow', headers=self.headers()).json()['active'])
        me = self.client.get('/me', headers=self.headers()).json()
        self.assertIn(campaign_id, me['saved'])
        self.assertIn(campaign_id, me['followed'])
        self.client.post(endpoint+'/updates', json={'title': 'A meaningful update', 'body': 'New context is ready.'}, headers=self.headers())
        notifications = self.client.get('/activity', headers=self.headers()).json()
        self.assertTrue(any(item['title'] == 'A meaningful update' for item in notifications))
        self.assertEqual(self.client.post('/activity/'+notifications[0]['id']+'/read', headers=self.headers(self.other)).status_code, 404)
        self.assertEqual(self.client.post('/activity/'+notifications[0]['id']+'/read', headers=self.headers()).status_code, 200)
        self.assertEqual(self.client.put('/me/preferences', json={'delivery': {'email': True}}, headers=self.headers()).status_code, 422)
        self.assertEqual(self.client.put('/me/preferences', json={'delivery': 'invalid'}, headers=self.headers()).status_code, 422)
        self.assertEqual(self.client.put('/me/preferences', json={'categories': {'campaigns': False}}, headers=self.headers()).json()['categories']['campaigns'], False)
        self.assertEqual(self.client.put('/me', json={'name': 'Updated Name'}, headers=self.headers()).json()['name'], 'Updated Name')
        self.assertEqual(self.client.post(endpoint+'/feedback', json={'visuals': 'Yes', 'persuasion': 'Somewhat'}, headers=self.headers()).status_code, 200)
        self.assertEqual(self.client.post(endpoint+'/feedback', json={'visuals': [], 'persuasion': 'Somewhat'}, headers=self.headers()).status_code, 422)

    def test_concurrent_partial_preferences_merge_and_persist(self):
        database = self.app.state.database
        original = database.transaction
        barrier = threading.Barrier(2)

        @contextmanager
        def synchronize_writers():
            # Both requests have authenticated before either writer locks the DB,
            # reproducing stale auth preference snapshots deterministically.
            barrier.wait(timeout=10)
            with original() as connection:
                yield connection

        with patch.object(database, 'transaction', synchronize_writers):
            with ThreadPoolExecutor(max_workers=2) as pool:
                responses = list(pool.map(lambda category: self.client.put('/me/preferences',
                                     json={'categories': {category: False}}, headers=self.headers()),
                                     ['campaigns', 'payments']))
        self.assertTrue(all(response.status_code == 200 for response in responses), [response.text for response in responses])
        expected = {'campaigns': False, 'payments': False, 'security': True}
        self.assertEqual(self.client.get('/me', headers=self.headers()).json()['preferences']['categories'], expected)
        with TestClient(create_app(self.path, seed=False)) as restored:
            self.assertEqual(restored.get('/me', headers=self.headers()).json()['preferences']['categories'], expected)

    def test_notification_tied_timestamps_order_and_read_state_are_stable(self):
        campaign_id = self.publish()['id']
        endpoint = f'/campaigns/{campaign_id}/updates'
        frozen = stamp()
        with patch('main.stamp', return_value=frozen):
            self.client.post(endpoint, json={'title': 'First update', 'body': 'First body.'}, headers=self.headers())
            self.client.post(endpoint, json={'title': 'Second update', 'body': 'Second body.'}, headers=self.headers())
        activity = self.client.get('/activity', headers=self.headers()).json()
        updates = [item for item in activity if item['title'] in {'First update', 'Second update'}]
        self.assertEqual([item['title'] for item in updates], ['Second update', 'First update'])
        self.assertFalse(updates[0]['read'])
        read_path = f'/activity/{updates[0]["id"]}/read'
        self.assertEqual(self.client.post(read_path, headers=self.headers(self.other)).status_code, 404)
        self.assertEqual(self.client.post(read_path, headers=self.headers()).status_code, 200)
        self.assertEqual(self.client.post(read_path, headers=self.headers()).status_code, 200)
        with TestClient(create_app(self.path, seed=False)) as restored:
            activity = restored.get('/activity', headers=self.headers()).json()
            updates = [item for item in activity if item['title'] in {'First update', 'Second update'}]
            self.assertEqual([item['title'] for item in updates], ['Second update', 'First update'])
            self.assertTrue(updates[0]['read'])
            self.assertFalse(updates[1]['read'])

    def test_activity_destinations_preserve_revision_privacy_and_current_permissions(self):
        campaign = self.publish(title='Approved public campaign')
        campaign_id = campaign['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.client.post(endpoint+'/follow', headers=self.headers(self.other))
        self.client.post(endpoint+'/revision', headers=self.headers())
        self.client.put(endpoint, json={'title': 'Private pending revision title'}, headers=self.headers())
        self.client.post(endpoint+'/updates', json={'title': 'Public update', 'body': 'A public progress message.'}, headers=self.headers())
        follower_activity = self.client.get('/activity', headers=self.headers(self.other)).json()
        follower_update = next(item for item in follower_activity if item['title'] == 'Public update')
        self.assertEqual(follower_update['campaignTitle'], 'Approved public campaign')
        self.assertEqual(follower_update['destination'], {'type': 'campaign', 'campaignId': campaign_id})
        self.assertNotIn('Private pending revision title', json.dumps(follower_activity))
        self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.client.post(endpoint+'/review', json={'decision': 'changes', 'feedback': 'Private creator correction guidance.'}, headers=self.headers(self.reviewer))
        owner_activity = self.client.get('/activity', headers=self.headers()).json()
        corrections = next(item for item in owner_activity if item['title'] == 'Campaign changes requested')
        self.assertEqual(corrections['campaignTitle'], 'Private pending revision title')
        self.assertEqual(corrections['destination'], {'type': 'creator', 'campaignId': campaign_id})
        self.assertEqual(self.client.get(endpoint, headers=self.headers()).status_code, 200)
        self.assertNotIn('Private creator correction guidance.', json.dumps(self.client.get('/activity', headers=self.headers(self.other)).json()))
        self.client.post(endpoint+'/submit', json={'rulesAccepted': True}, headers=self.headers())
        stale_correction = next(item for item in self.client.get('/activity', headers=self.headers()).json() if item['id'] == corrections['id'])
        self.assertEqual(stale_correction['destination'], {'type': 'campaign', 'campaignId': campaign_id})
        self.client.post(endpoint+'/review', json={'decision': 'approve'}, headers=self.headers(self.reviewer))
        payment = self.contribute(campaign_id, 100).json()
        owner_activity = self.client.get('/activity', headers=self.headers()).json()
        payment_notice = next(item for item in owner_activity if item['category'] == 'payments')
        self.assertEqual(payment_notice['destination'], {'type': 'payments', 'campaignId': campaign_id, 'paymentId': payment['id']})
        self.assertNotIn(payment['receipt']['token'], json.dumps(owner_activity))
        self.assertNotIn(payment['id'], json.dumps(self.client.get('/activity', headers=self.headers(self.other)).json()))
        self.transition(campaign_id, 'Distribution Preparation')
        self.transition(campaign_id, 'Promoting', setupReady=True)
        self.client.post(endpoint+'/progress', headers=self.headers(self.reviewer))
        self.transition(campaign_id, 'Completed')
        final_activity = self.client.get('/activity', headers=self.headers(self.other)).json()
        for title in ('Distribution progress', 'Campaign completed · final report available'):
            item = next(item for item in final_activity if item['title'] == title)
            self.assertEqual(item['destination'], {'type': 'report', 'campaignId': campaign_id})
        completion = [item for item in final_activity if item['campaignId'] == campaign_id and 'final report' in item['title'].lower()]
        self.assertEqual(len(completion), 1)
        self.transition(campaign_id, 'Completed')
        self.assertEqual(len(self.client.get('/activity', headers=self.headers(self.other)).json()), len(final_activity))
        security = next(item for item in final_activity if item['category'] == 'security')
        self.assertEqual(security['destination'], {'type': 'profile'})

    def test_legacy_notifications_and_unavailable_campaigns_use_safe_destinations(self):
        campaign_id = self.create()['id']
        self.client.post(f'/campaigns/{campaign_id}/submit', json={'rulesAccepted': True}, headers=self.headers())
        self.client.post(f'/campaigns/{campaign_id}/review', json={'decision': 'changes', 'feedback': 'Please clarify.'}, headers=self.headers(self.reviewer))
        with self.app.state.database.transaction() as connection:
            # Existing installations have NULL destinations until new domain events.
            connection.execute('UPDATE notifications SET destination_json=NULL WHERE user_id=?', (self.creator['user']['id'],))
            connection.execute('''INSERT INTO notifications
                (id,user_id,campaign_id,category,title,body,created_at,dedup_key,destination_json)
                VALUES (?,?,?,?,?,?,?,?,?)''',
                ('legacy_unavailable', self.other['user']['id'], campaign_id, 'campaigns', 'Earlier campaign update',
                 'This old update does not grant access to a private campaign.', stamp(), 'legacy:unavailable', None))
            connection.execute('''INSERT INTO notifications
                (id,user_id,category,title,body,created_at,dedup_key,destination_json)
                VALUES (?,?,?,?,?,?,?,?)''',
                ('legacy_invalid_metadata', self.other['user']['id'], 'security', 'Account event', 'Account event.', stamp(),
                 'legacy:invalid', '{"type":[]}'))
        owner_activity = self.client.get('/activity', headers=self.headers()).json()
        corrections = next(item for item in owner_activity if item['title'] == 'Campaign changes requested')
        self.assertEqual(corrections['destination'], {'type': 'creator', 'campaignId': campaign_id})
        other_activity = self.client.get('/activity', headers=self.headers(self.other)).json()
        unavailable = next(item for item in other_activity if item['id'] == 'legacy_unavailable')
        self.assertIsNone(unavailable['campaignTitle'])
        self.assertIsNone(unavailable['campaignId'])
        self.assertEqual(unavailable['destination'], {'type': 'profile'})
        invalid = next(item for item in other_activity if item['id'] == 'legacy_invalid_metadata')
        self.assertEqual(invalid['destination'], {'type': 'profile'})
        self.assertEqual(self.client.get(f'/campaigns/{campaign_id}', headers=self.headers(self.other)).status_code, 404)

    def test_preferences_control_future_events_and_multiple_roles_do_not_duplicate(self):
        campaign_id = self.publish()['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.client.post(endpoint+'/follow', headers=self.headers())
        self.client.post(endpoint+'/follow', headers=self.headers(self.other))
        self.contribute(campaign_id, 25)
        activity = self.client.get('/activity', headers=self.headers()).json()
        self.assertEqual(sum(item['title'] == '25% funding milestone' for item in activity), 1)
        self.client.put('/me/preferences', json={'categories': {'campaigns': False, 'payments': False, 'security': False}}, headers=self.headers())
        self.client.post(endpoint+'/updates', json={'title': 'Preference-controlled update', 'body': 'An optional campaign notice.'}, headers=self.headers())
        self.contribute(campaign_id, 5)
        self.client.put('/me', json={'name': 'Updated account'}, headers=self.headers())
        activity = self.client.get('/activity', headers=self.headers()).json()
        self.assertFalse(any(item['title'] == 'Preference-controlled update' for item in activity))
        self.assertEqual(sum(item['title'] == 'Simulated contribution successful' for item in activity), 1)
        self.assertTrue(any(item['title'] == 'Profile updated' for item in activity))
        follower_activity = self.client.get('/activity', headers=self.headers(self.other)).json()
        self.assertTrue(any(item['title'] == 'Preference-controlled update' for item in follower_activity))
        self.assertFalse(any(item['category'] == 'payments' for item in follower_activity))

    def test_public_updates_and_private_history_permissions(self):
        private_id = self.create()['id']
        self.assertEqual(self.client.get(f'/campaigns/{private_id}/updates').status_code, 404)
        self.assertEqual(self.client.get(f'/campaigns/{private_id}/updates', headers=self.headers()).json(), [])
        campaign_id = self.publish()['id']
        endpoint = f'/campaigns/{campaign_id}'
        self.assertEqual(self.client.get(endpoint+'/updates').json(), [])
        self.assertEqual(self.client.post(endpoint+'/updates', json={'title': 'Not authorized', 'body': 'A stranger cannot publish.'}, headers=self.headers(self.other)).status_code, 403)
        self.assertEqual(self.client.post(endpoint+'/updates', json={'title': '   ', 'body': 'A body'}, headers=self.headers()).status_code, 422)
        posted = self.client.post(endpoint+'/updates', json={'title': 'New context', 'body': 'First paragraph.\nSecond paragraph.'}, headers=self.headers())
        self.assertEqual(posted.status_code, 200, posted.text)
        public = self.client.get(endpoint+'/updates')
        self.assertEqual(public.status_code, 200)
        self.assertEqual(len(public.json()), 1)
        update = public.json()[0]
        self.assertEqual(set(update), {'id', 'title', 'body', 'createdAt'})
        self.assertEqual(update['title'], 'New context')
        self.assertEqual(update['body'], 'First paragraph.\nSecond paragraph.')
        self.assertEqual(self.client.get(endpoint+'/history').status_code, 401)
        self.assertEqual(self.client.get(endpoint+'/history', headers=self.headers(self.other)).status_code, 403)
        owner_history = self.client.get(endpoint+'/history', headers=self.headers())
        self.assertEqual(owner_history.status_code, 200)
        self.assertEqual(owner_history.json()[-1]['type'], 'update')
        self.assertEqual(self.client.get(endpoint+'/history', headers=self.headers(self.reviewer)).status_code, 200)

    def test_upload_validation_and_metadata(self):
        self.assertEqual(self.client.post('/uploads', files={'file': ('a.jpg', b'invalid', 'image/jpeg')}, headers=self.headers()).status_code, 422)
        self.assertEqual(self.client.post('/uploads', files={'file': ('a.svg', b'<svg/>', 'image/svg+xml')}, headers=self.headers()).status_code, 415)
        data = io.BytesIO()
        Image.new('RGB', (40, 30), color='green').save(data, 'PNG')
        response = self.client.post('/uploads', files={'file': ('a.png', data.getvalue(), 'image/png')}, data={'purpose': 'story'}, headers=self.headers())
        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual((response.json()['width'], response.json()['height']), (40, 30))
        self.assertEqual(response.json()['purpose'], 'story')
        # Unpublished campaign media is now private. This intentionally tightens
        # the old unlisted-public contract before exposing the API to the cloud.
        self.assertEqual(self.client.get(response.json()['url']).status_code, 404)
        served_image = self.client.get(response.json()['url'], headers=self.headers())
        self.assertEqual(served_image.status_code, 200)
        self.assertIn('no-store', served_image.headers.get('cache-control', ''))

    def test_seeded_discovery_and_completed_reporting(self):
        seeded_path = Path(self.temp.name) / 'seeded.db'
        with TestClient(create_app(seeded_path, seed=True)) as client:
            campaigns = client.get('/campaigns').json()
            self.assertEqual(len(campaigns), 6)
            self.assertEqual(campaigns[0]['publishedAt'], campaigns[0]['createdAt'])
            self.assertIsNone(campaigns[0]['submittedAt'])
            self.assertEqual(len(client.get('/campaigns?category=Environment').json()), 2)
            self.assertEqual(client.get('/campaigns?q=not-a-match').json(), [])
            report = client.get('/campaigns/demo_science/report').json()
            self.assertTrue(report['final'])
            self.assertTrue(report['simulated'])
            self.assertIsNone(report['measuredReach'])

    def test_profile_photo_is_authenticated_private_and_owner_scoped(self):
        stream = io.BytesIO()
        Image.new('RGB', (48, 32), 'purple').save(stream, 'PNG')
        for method in ['get', 'post', 'delete']:
            response = getattr(self.client, method)('/me/avatar')
            self.assertEqual(response.status_code, 401)
        upload = self.client.post('/me/avatar', headers=self.headers(),
                                  files={'file': ('../../another-user.jpg', stream.getvalue(), 'image/png')},
                                  data={'userId': self.other['user']['id'], 'url': '/media/not-an-avatar.jpg'})
        self.assertEqual(upload.status_code, 200, upload.text)
        version = upload.json()['version']
        self.assertTrue(version.startswith('avatar_'))
        self.assertEqual(upload.headers['cache-control'], 'no-store')
        self.assertIn('authorization', upload.headers['vary'].lower())
        own = self.client.get('/me/avatar', headers=self.headers())
        self.assertEqual(own.json(), upload.json())
        self.assertEqual(own.headers['cache-control'], 'no-store')
        for account in [self.other, self.reviewer]:
            response = self.client.get('/me/avatar?userId='+self.creator['user']['id'], headers=self.headers(account))
            self.assertEqual(response.json(), {'version': None, 'dataUri': None})
        self.assertEqual(self.client.delete('/me/avatar?userId='+self.creator['user']['id'], headers=self.headers(self.other)).status_code, 200)
        self.assertEqual(self.client.get('/me/avatar', headers=self.headers()).json()['version'], version)
        self.assertEqual(self.client.get('/me', headers=self.headers()).json()['user']['avatarVersion'], version)
        self.assertEqual(self.client.get('/media/'+version+'.jpg').status_code, 404)
        with self.app.state.database.connect() as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM assets').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT user_id FROM profile_avatars').fetchone()[0], self.creator['user']['id'])

    def test_profile_photo_normalizes_orientation_size_and_removes_metadata(self):
        stream = io.BytesIO()
        original = Image.new('RGB', (1200, 600), 'teal')
        exif = Image.Exif()
        exif[274] = 6  # Rotate 90 degrees clockwise before thumbnailing.
        exif[315] = 'Private artist metadata'
        original.save(stream, 'JPEG', exif=exif)
        response = self.client.post('/me/avatar', headers=self.headers(), files={'file': ('photo.jpg', stream.getvalue(), 'image/jpeg')})
        self.assertEqual(response.status_code, 200, response.text)
        encoded = response.json()['dataUri'].split(',', 1)[1]
        with Image.open(io.BytesIO(base64.b64decode(encoded))) as image:
            self.assertEqual(image.format, 'JPEG')
            self.assertEqual(image.size, (256, 512))
            self.assertEqual(dict(image.getexif()), {})
            self.assertNotIn('icc_profile', image.info)
        self.assertLess(len(encoded), 2 * 1024 * 1024)

    def test_profile_photo_rejects_invalid_files_without_replacing_existing_photo(self):
        stream = io.BytesIO()
        Image.new('RGBA', (32, 32), (0, 0, 0, 0)).save(stream, 'PNG')
        good = self.client.post('/me/avatar', headers=self.headers(), files={'file': ('photo.png', stream.getvalue(), 'image/png')}).json()
        invalid = [('photo.svg', b'<svg/>', 'image/svg+xml', 415),
                   ('broken.jpg', b'not an image', 'image/jpeg', 422),
                   ('oversized.jpg', b'x' * (8 * 1024 * 1024 + 1), 'image/jpeg', 413)]
        huge = io.BytesIO()
        Image.new('1', (5001, 5000)).save(huge, 'PNG')
        invalid.append(('too-many-pixels.png', huge.getvalue(), 'image/png', 422))
        gif = io.BytesIO()
        Image.new('RGB', (20, 20)).save(gif, 'GIF')
        invalid.append(('fake.jpg', gif.getvalue(), 'image/jpeg', 422))
        for filename, data, mime, status in invalid:
            with self.subTest(filename=filename):
                response = self.client.post('/me/avatar', headers=self.headers(), files={'file': (filename, data, mime)})
                self.assertEqual(response.status_code, status, response.text)
                self.assertEqual(self.client.get('/me/avatar', headers=self.headers()).json(), good)
        with Image.open(io.BytesIO(base64.b64decode(good['dataUri'].split(',', 1)[1]))) as normalized:
            self.assertEqual(normalized.getpixel((0, 0)), (255, 255, 255))

    def test_profile_photo_replacement_removal_and_restart_persistence(self):
        versions = []
        for color in ['red', 'blue']:
            stream = io.BytesIO()
            Image.new('RGB', (40, 30), color).save(stream, 'WEBP')
            response = self.client.post('/me/avatar', headers=self.headers(), files={'file': ('photo.webp', stream.getvalue(), 'image/webp')})
            self.assertEqual(response.status_code, 200, response.text)
            versions.append(response.json()['version'])
        self.assertNotEqual(*versions)
        with self.app.state.database.connect() as connection:
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM profile_avatars').fetchone()[0], 1)
        with TestClient(create_app(self.path, seed=False)) as restarted:
            self.assertEqual(restarted.get('/me/avatar', headers=self.headers()).json()['version'], versions[1])
            login = restarted.post('/auth/login', json={'email': 'creator@example.test', 'password': 'test-only-password'}).json()
            self.assertEqual(login['user']['avatarVersion'], versions[1])
            profile = restarted.put('/me', json={'name': 'Updated name'}, headers=self.headers()).json()
            self.assertEqual(profile['avatarVersion'], versions[1])
            removed = restarted.delete('/me/avatar', headers=self.headers())
            self.assertEqual(removed.json(), {'version': None, 'dataUri': None})
            self.assertEqual(restarted.delete('/me/avatar', headers=self.headers()).status_code, 200)
        with TestClient(create_app(self.path, seed=False)) as restarted:
            self.assertEqual(restarted.get('/me/avatar', headers=self.headers()).json(), {'version': None, 'dataUri': None})
            self.assertIsNone(restarted.get('/me', headers=self.headers()).json()['user']['avatarVersion'])


if __name__ == '__main__':
    unittest.main(verbosity=2)

