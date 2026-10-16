"""Opt-in HTTPS API/persistence probe. Never provisions or restarts a provider.

The CLI is preparation until an operator supplies an actual deployed HTTPS URL.
State contains fictional probe credentials and private receipt capabilities;
keep it in ignored tmp/cloud-deployment. Reports contain only sanitized checks.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from decimal import Decimal
import hashlib
import json
import os
from pathlib import Path
import secrets
import sys
from urllib.parse import urlsplit
import uuid

import httpx

from deployment import public_https_url
from domain import cents, fee_for, estimated_reach


PROJECT = Path(__file__).resolve().parents[2]
PRIVATE_DIRECTORY = PROJECT / 'tmp' / 'cloud-deployment'
REPORT_DIRECTORY = PROJECT / 'artifacts' / 'cloud-deployment'
DEFAULT_STATE = PRIVATE_DIRECTORY / 'cloud-probe-state.json'


class ProbeError(Exception):
    """Safe diagnostic that must never include credentials or raw responses."""


class BoundedProbeClient(httpx.Client):
    """The CLI caps bytes while streaming, rather than after a full download."""
    max_response_bytes = 12 * 1024 * 1024

    def request(self, method, url, **kwargs):
        with self.stream(method, url, **kwargs) as response:
            output = bytearray()
            for chunk in response.iter_bytes(64 * 1024):
                if len(output) + len(chunk) > self.max_response_bytes:
                    raise ProbeError('The API response exceeds this probe\'s size limit.')
                output.extend(chunk)
            return httpx.Response(response.status_code, headers=response.headers,
                                  content=bytes(output), request=response.request)


def confined(path: Path, directory: Path) -> Path:
    resolved = Path(path).resolve()
    if not resolved.is_relative_to(directory.resolve()):
        raise ProbeError('Probe output must remain in its Campaign-owned directory.')
    return resolved


def write_json(path: Path, value, *, private=False, exclusive=False):
    path = confined(path, PRIVATE_DIRECTORY if private else REPORT_DIRECTORY)
    path.parent.mkdir(parents=True, exist_ok=True)
    encoded = (json.dumps(value, indent=2, sort_keys=True) + '\n').encode()
    if exclusive:
        try:
            descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        except FileExistsError:
            raise ProbeError('Probe state already exists. Use --step verify; do not create another account.') from None
        with os.fdopen(descriptor, 'wb') as handle:
            handle.write(encoded)
        return
    temporary = confined(path.with_name(path.name + '.' + secrets.token_hex(6) + '.tmp'),
                         PRIVATE_DIRECTORY if private else REPORT_DIRECTORY)
    try:
        descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600 if private else 0o644)
        with os.fdopen(descriptor, 'wb') as handle:
            handle.write(encoded)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


class CloudProbe:
    def __init__(self, client, public_url: str, *, state_path: Path = DEFAULT_STATE,
                 report_directory: Path = REPORT_DIRECTORY, scope='isolated API contract'):
        self.client = client
        self.url = public_https_url(public_url)
        self.state_path = confined(state_path, PRIVATE_DIRECTORY)
        self.report_directory = confined(report_directory, REPORT_DIRECTORY)
        self.scope = scope
        self.state = {}
        self.checks = {}

    def save(self, phase=None, *, exclusive=False):
        if phase:
            self.state['phase'] = phase
        write_json(self.state_path, self.state, private=True, exclusive=exclusive)

    def report(self, step, *, completed=True):
        result = {'step': step, 'scope': self.scope, 'publicApiUrl': self.url,
                  'apiProbeStepCompleted': completed,
                  'checkedAt': datetime.now(timezone.utc).isoformat(),
                  'checks': self.checks,
                  'reviewWorkflow': 'verified' if self.state.get('reviewed') else 'blocked: explicit reviewer credentials were not supplied',
                  'providerRestartPerformed': False,
                  'restartEvidence': 'Not observed by this probe. Record an authorized provider restart separately before comparing saved state.',
                  'independentAndroidVerification': 'Not performed by this API probe.'}
        write_json(self.report_directory / f'cloud-probe-{step}.json', result)
        return result

    @staticmethod
    def auth(token):
        return {'Authorization': 'Bearer ' + token}

    def relative(self, value):
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc:
            origin = f'{parsed.scheme}://{parsed.netloc}'
            if origin != self.url:
                raise ProbeError('The server returned a media or receipt URL outside the configured API.')
        if not parsed.path.startswith('/') or parsed.username or parsed.password or parsed.fragment:
            raise ProbeError('The server returned an invalid media or receipt reference.')
        return parsed.path + ('?' + parsed.query if parsed.query else '')

    def call(self, method, path, *, expected=200, token=None, **kwargs):
        if not path.startswith('/') or path.startswith('//'):
            raise ProbeError('Refusing a request outside the configured API.')
        try:
            response = self.client.request(method, path, headers=self.auth(token) if token else {}, **kwargs)
        except Exception:
            raise ProbeError('The API request did not complete. Private recovery state is preserved; no mutation was retried.') from None
        if response.status_code != expected:
            raise ProbeError(f'The API returned an unexpected status ({response.status_code}). Private state is preserved; inspect the endpoint privately.')
        if len(response.content) > 12 * 1024 * 1024:
            raise ProbeError('The API response exceeds this probe\'s size limit.')
        return response

    def json(self, method, path, **kwargs):
        response = self.call(method, path, **kwargs)
        try:
            return response.json()
        except (ValueError, TypeError):
            raise ProbeError('The API returned an unreadable response.') from None

    def assert_check(self, name, condition):
        self.checks[name] = bool(condition)
        if not condition:
            raise ProbeError('Probe check failed: ' + name)

    def image_bytes(self, *, token=None):
        response = self.call('GET', self.relative(self.state['mediaUrl']), token=token)
        self.assert_check('imageType', response.headers.get('content-type', '').startswith('image/jpeg'))
        self.assert_check('imageSizeBound', 0 < len(response.content) <= 10_000_000)
        return response.content

    def create(self, *, reviewer_email=None, reviewer_password=None):
        # Claim the local state path before even registration. Re-running create
        # never produces a second account or an accidental second payment.
        suffix = uuid.uuid4().hex
        self.state = {'apiUrl': self.url, 'phase': 'registration_pending',
                      'email': f'cloud-probe-{suffix}@example.test',
                      'password': secrets.token_urlsafe(24),
                      'clientDraftId': str(uuid.uuid4()),
                      'paymentIdempotencyKey': str(uuid.uuid4()),
                      'createdAt': datetime.now(timezone.utc).isoformat()}
        self.save(exclusive=True)
        self.assert_check('health', self.json('GET', '/health')['status'] == 'ok')
        config = self.json('GET', '/config')
        self.assert_check('simulationClearlyConfigured', config.get('simulation') is True)
        registered = self.json('POST', '/auth/register', expected=201,
                               json={'name': 'Fictional Cloud Persistence QA',
                                     'email': self.state['email'], 'password': self.state['password']})
        self.assert_check('registrationMemberOnly', registered['user']['role'] == 'member')
        self.state.update(token=registered['token'], userId=registered['user']['id'])
        self.save('registered')
        token = self.state['token']
        campaign = self.json('POST', '/campaigns', expected=201, token=token, json={
            'title': 'Cloud persistence verification', 'category': 'Environment',
            'creatorName': 'Fictional Cloud QA', 'summary': 'Fictional records for verifying the deployed hackathon API.',
            'currentStep': 0, 'clientDraftId': self.state['clientDraftId']})
        self.state['campaignId'] = campaign['id']
        self.save('draft_created')
        endpoint = '/campaigns/' + campaign['id']
        self.assert_check('basicsStepSaved', campaign['currentStep'] == 0 and campaign['goal'] == 0)
        story = {'currentStep': 1, 'storyHeadline': 'A fictional persistence check',
                 'intro': 'This campaign is test data. Contributions and advertising are simulated.',
                 'sections': [{'id': 'probe-story', 'kind': 'text', 'text': 'A clearly labelled fictional campaign.'}],
                 'sources': [{'id': 'probe-source', 'title': 'UN ocean information',
                              'url': 'https://www.un.org/sustainabledevelopment/oceans/'}]}
        campaign = self.json('PUT', endpoint, token=token, json=story)
        self.assert_check('storyStepSaved', campaign['currentStep'] == 1 and campaign['goal'] == 0)
        seed_image = PROJECT / 'services/api/assets/seed/ocean.jpg'
        uploaded = self.json('POST', '/uploads', expected=201, token=token,
                             files={'file': ('fictional-cloud-probe.jpg', seed_image.read_bytes(), 'image/jpeg')},
                             data={'purpose': 'cover'})
        self.state['mediaUrl'] = uploaded['url']
        self.save('image_uploaded')
        self.state['mediaSha256'] = hashlib.sha256(self.image_bytes(token=token)).hexdigest()
        self.call('GET', self.relative(uploaded['url']), expected=404)
        self.assert_check('unpublishedImagePrivate', True)
        campaign = self.json('PUT', endpoint, token=token, json={
            'currentStep': 2, 'coverImage': uploaded['url'], 'adImages': [uploaded['url']],
            'adHeadline': 'Fictional cloud QA', 'adDescription': 'Simulated amplification only.', 'cta': 'Learn more'})
        self.assert_check('visualsStepSaved', campaign['currentStep'] == 2 and campaign['goal'] == 0)
        campaign = self.json('PUT', endpoint, token=token, json={
            'currentStep': 3, 'geography': 'Global', 'interests': 'Ocean literacy',
            'channels': ['Instagram', 'Facebook'], 'allocation': {'Instagram': 60, 'Facebook': 40}, 'durationDays': 14})
        self.assert_check('reachStepSavedWithoutGoal', campaign['currentStep'] == 3 and campaign['goal'] == 0)
        campaign = self.json('PUT', endpoint, token=token, json={'currentStep': 4, 'goal': 10})
        restored = self.json('GET', endpoint, token=token)
        self.assert_check('submitGoalAndDraftRestored', restored['goal'] == 10 and restored['currentStep'] == 4
                          and restored['intro'] == story['intro'] and len(restored['sources']) == 1)
        submitted = self.json('POST', endpoint + '/submit', token=token, json={'rulesAccepted': True})
        self.assert_check('submissionRequiresReview', submitted['status'] == 'Submitted for Review')
        self.call('GET', endpoint, expected=404)
        self.save('submitted')
        if reviewer_email and reviewer_password:
            reviewer = self.json('POST', '/auth/login', json={'email': reviewer_email, 'password': reviewer_password})
            self.assert_check('reviewerRoleEnforced', reviewer['user']['role'] == 'reviewer')
            self.call('POST', endpoint + '/review', token=token, expected=403, json={'decision': 'approve'})
            reviewed = self.json('POST', endpoint + '/review', token=reviewer['token'], json={'decision': 'approve'})
            self.assert_check('approvalSeparateFromPublication', reviewed['status'] == 'Approved')
            published = self.json('POST', endpoint + '/transition', token=reviewer['token'], json={'target': 'Available for Funding'})
            self.assert_check('explicitPublication', published['status'] == 'Available for Funding')
            self.state['reviewed'] = True
            target = self.json('GET', endpoint)
            self.assert_check('publishedImageAvailable', hashlib.sha256(self.image_bytes()).hexdigest() == self.state['mediaSha256'])
        else:
            # The creator's submitted campaign stays private. Use an existing
            # public fictional fixture for payment, without forging review state.
            candidates = self.json('GET', '/campaigns')
            target = next((item for item in candidates if item['status'] == 'Available for Funding'), None)
            if not target:
                raise ProbeError('No funding-eligible public fixture exists; reviewer setup is required.')
            self.state['reviewed'] = False
        self.state.update(paymentCampaignId=target['id'], raisedBefore=target['raised'])
        self.save('contribution_pending')
        payment = self.json('POST', '/contributions', token=token, json={
            'campaignId': target['id'], 'amount': 1, 'outcome': 'successful',
            'idempotencyKey': self.state['paymentIdempotencyKey']})
        self.state['payment'] = payment
        self.save('contribution_received')
        expected_fee = fee_for(100, Decimal(str(config['feeRate'])))
        expected_reach = estimated_reach(100 - expected_fee, float(config['peoplePerAdDollar']))
        self.assert_check('simulatedPaymentAccurate', payment['status'] == 'successful' and payment['simulated'] is True
                          and cents(payment['amount']) == 100 and cents(payment['fee'], allow_zero=True) == expected_fee
                          and cents(payment['total']) == 100 and cents(payment['adBudget']) == 100 - expected_fee
                          and payment['reach'] == expected_reach)
        self.verify_records()
        self.save('complete')
        return self.report('create')

    def verify_records(self):
        token = self.state['token']
        profile = self.json('GET', '/me', token=token)
        self.assert_check('originalSessionStillValid', profile['user']['id'] == self.state['userId'])
        own = self.json('GET', '/campaigns/' + self.state['campaignId'], token=token)
        self.assert_check('createdCampaignPersisted', own['goal'] == 10 and own['currentStep'] == 4
                          and own['status'] == ('Available for Funding' if self.state.get('reviewed') else 'Submitted for Review'))
        self.assert_check('imageBytesPersisted', hashlib.sha256(self.image_bytes(token=token)).hexdigest() == self.state['mediaSha256'])
        payment = self.state['payment']
        receipt = self.json('GET', self.relative(payment['receipt']['url']), token=token)
        self.assert_check('privateReceiptPersisted', receipt['id'] == payment['id'] and receipt['fee'] == payment['fee']
                          and receipt['adBudget'] == payment['adBudget'] and receipt['amount'] == payment['amount'])
        capability_receipt = self.json('GET', self.relative(payment['receipt']['url']))
        self.assert_check('originalReceiptCapabilityStillValid', capability_receipt['id'] == payment['id']
                          and capability_receipt['amount'] == payment['amount'])
        self.call('GET', '/receipts/' + payment['id'], expected=403)
        self.assert_check('receiptPrivateWithoutCapability', True)
        target = self.json('GET', '/campaigns/' + self.state['paymentCampaignId'])
        self.assert_check('fundingUpdatedExactlyOnce', cents(target['raised'], allow_zero=True) ==
                          cents(self.state['raisedBefore'], allow_zero=True) + 100)
        report = self.json('GET', '/campaigns/' + self.state['paymentCampaignId'] + '/report')
        self.assert_check('reportMatchesFunding', report['raised'] == target['raised'] and report['simulated'] is True)
        activity = self.json('GET', '/activity', token=token)
        notices = activity['notifications'] if isinstance(activity, dict) else activity
        self.assert_check('paymentNotificationPersisted', any(item.get('destination', {}).get('paymentId') == payment['id'] for item in notices))
        self.assert_check('profileHistoryPersisted', any(item['id'] == payment['id'] for item in profile['payments']))

    def verify(self):
        try:
            raw = self.state_path.read_bytes()
            if len(raw) > 128 * 1024:
                raise ValueError()
            self.state = json.loads(raw)
        except (OSError, ValueError, TypeError):
            raise ProbeError('A valid saved probe state is required; no account or payment was recreated.') from None
        if self.state.get('apiUrl') != self.url or self.state.get('phase') != 'complete':
            raise ProbeError('Probe state is for another API or an interrupted create. Preserve it and inspect recovery privately.')
        self.assert_check('health', self.json('GET', '/health')['status'] == 'ok')
        self.verify_records()
        # An explicit new login also proves credential-based access, without
        # hiding a missing original session behind silent reauthentication.
        login = self.json('POST', '/auth/login', json={'email': self.state['email'], 'password': self.state['password']})
        self.assert_check('signInAfterComparison', login['user']['id'] == self.state['userId'])
        self.state['token'] = login['token']
        self.save()
        return self.report('verify')


def main():
    parser = argparse.ArgumentParser(description='Opt-in Campaign HTTPS API probe; creates fictional records only.')
    parser.add_argument('--step', choices=['create', 'verify'], required=True)
    parser.add_argument('--url', required=True, help='Actual deployed public HTTPS API origin.')
    args = parser.parse_args()
    try:
        url = public_https_url(args.url)
        with BoundedProbeClient(base_url=url, timeout=httpx.Timeout(90, connect=10),
                                follow_redirects=False, trust_env=False) as client:
            probe = CloudProbe(client, url, scope='operator-executed public HTTPS API probe')
            if args.step == 'create':
                result = probe.create(reviewer_email=os.getenv('CAMPAIGN_REVIEWER_EMAIL'),
                                      reviewer_password=os.getenv('CAMPAIGN_REVIEWER_PASSWORD'))
            else:
                result = probe.verify()
        print(json.dumps({'step': args.step, 'checksPassed': sum(result['checks'].values()),
                          'reviewWorkflow': result['reviewWorkflow'],
                          'report': str(REPORT_DIRECTORY / f'cloud-probe-{args.step}.json')}))
        return 0
    except (ProbeError, ValueError, KeyError, TypeError, OSError):
        # Never print exception text: it may include a provider/client URL or
        # a privately saved server response. The state phase supports recovery.
        if 'probe' in locals():
            try:
                probe.report(args.step, completed=False)
            except (ProbeError, OSError):
                pass
        print('Probe incomplete. Private state was preserved; no mutation was automatically retried. Review configuration and the saved phase privately.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
