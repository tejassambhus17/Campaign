"""Public-safe, additive report snapshots; financial rules stay in main.py."""
from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import json

from assessments import content_hash
from domain import CampaignContent, PUBLIC_STATES, stamp

SCHEMA_VERSION = 'campaign-report-v1'


@contextmanager
def report_read_snapshot(database):
    """One MVCC snapshot, with no reconcile or application write lock."""
    connection = database.connect()
    try:
        if database.backend == 'postgresql':
            # connect() has set transaction-local options, but issued no SELECT.
            connection.execute('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY')
        else:
            connection.execute('BEGIN')
        yield connection
    finally:
        connection.rollback()
        connection.close()


def _latest(values):
    parsed = []
    for value in values:
        if not isinstance(value, str):
            continue
        try:
            date = datetime.fromisoformat(value.replace('Z', '+00:00'))
            if date.tzinfo is not None:
                parsed.append((date, value))
        except ValueError:
            pass
    return max(parsed)[1] if parsed else None


def _next_step(status, final):
    values = {
        'Draft': ('Not published', 'The creator can finish the five steps and submit the draft for review.', 'none'),
        'Submitted for Review': ('Review is next', 'The submitted campaign is awaiting a separate policy decision. It cannot accept backing yet.', 'none'),
        'Changes Requested': ('Corrections are needed', 'The creator must address the review feedback and resubmit. Advertising has not started.', 'none'),
        'Approved': ('Backing must open separately', 'Policy approval is complete. Opening the campaign for funding is a separate reviewer action.', 'none'),
        'Available for Funding': ('Community backing is open', 'Successful simulated contributions build the advertising budget. Funding does not launch ads automatically.', 'back'),
        'Funding Goal Reached': ('Prepare distribution', 'The goal is reached. A reviewer must separately check the approved version, budget and advertising setup.', 'none'),
        'Funding Period Ends': ('Review the available budget', 'The funding period has ended. A reviewer must explicitly accept any partial budget before distribution, or arrange cancellation and refunds.', 'none'),
        'Distribution Preparation': ('Confirm advertising setup', 'The reviewer prepares the approved creative, audience and funds before starting controlled simulated promotion.', 'none'),
        'Promoting': ('Follow simulated progress', 'Controlled simulated delivery is underway. No live advertising provider is connected; measured reach is unavailable.', 'report'),
        'Completed': ('Read the accounting outcome', 'Controlled simulated distribution has finished. Review spend, completed refunds and remaining funds in this report.', 'report'),
        'Rejected': ('Review decision recorded', 'The campaign is not available for backing. An authorized creator can inspect the private review feedback.', 'none'),
        'Cancelled': ('Check the refund outcome', 'Backing is closed. Review the recorded refund state; cancellation alone does not mean a refund has completed.', 'report'),
        'Failed': ('Review funds and refunds', 'Distribution is not continuing. The recorded spend and refund state explain what remains.', 'report'),
        'Refund Pending': ('Refund processing is pending', 'The displayed pending amount has not yet become a completed refund and is not an additional fund balance.', 'report'),
    }
    title, body, action = values.get(status, ('Status unavailable', 'Refresh before relying on this campaign’s current outcome.', 'none'))
    return {'title': title, 'body': body, 'action': action}


def project_report(connection, campaign, metrics, *, asset_urls, policies, fee_rate, people_rate):
    """Whitelist public content even when the caller owns a private revision.

    Existing metrics remain byte-for-value compatible. A private/unpublished
    campaign retains its old authorized report access, but has no exportable
    editorial identity, proposed audience or lifecycle history.
    """
    published = campaign.get('published_json')
    content = CampaignContent.model_validate(json.loads(published)).model_dump() if published else None
    public = asset_urls(content) if content else None
    state = metrics['status']
    approved_version = campaign.get('approved_version') if public else None
    events = []
    if public:
        for row in connection.execute('''SELECT event_type,new_state,created_at,version FROM campaign_events
            WHERE campaign_id=? ORDER BY created_at,id''', (campaign['id'],)):
            kind, target, version = row['event_type'], row['new_state'], row['version']
            if kind == 'seed' and target in PUBLIC_STATES:
                pass
            elif kind in {'transition', 'deadline'} and target in PUBLIC_STATES:
                pass
            elif kind in {'submission', 'review'} and version == approved_version and target in {'Submitted for Review', 'Approved'}:
                pass
            else:
                continue
            events.append({'type': kind, 'state': target, 'occurredAt': row['created_at'],
                           'version': version if approved_version is not None and version <= approved_version else None,
                           'simulated': True, 'seeded': kind == 'seed'})
    finance_date = connection.execute('''SELECT MAX(created_at) AS latest FROM ledger WHERE campaign_id=?''', (campaign['id'],)).fetchone()['latest']
    payment_date = connection.execute('''SELECT MAX(created_at) AS latest FROM payments
        WHERE campaign_id=? AND status='successful' ''', (campaign['id'],)).fetchone()['latest']
    delivery = json.loads(campaign['report_json']) if campaign.get('report_json') else {}
    started, completed = delivery.get('startedAt'), delivery.get('completedAt')
    data_updated = _latest([*(event['occurredAt'] for event in events), finance_date, payment_date,
                            delivery.get('updatedAt'), started, completed,
                            campaign['created_at'] if public else None])
    snapshot = {
        'id': campaign['id'], 'title': public['title'] if public else None,
        'category': public['category'] if public else None,
        'creatorName': public['creatorName'] if public else None,
        'coverImage': public['coverImage'] if public else None,
        'goal': public['goal'] if public else None,
        'durationDays': public['durationDays'] if public else None,
        'version': approved_version, 'contentHash': content_hash(published) if public else None,
        'hasPublicSnapshot': bool(public), 'status': state,
    }
    distribution_state = ('unavailable' if not public else 'completed' if state == 'Completed' and metrics['final']
                          else 'simulated' if delivery else 'prepared' if campaign.get('setup_ready') else 'proposed')
    proposed = ({key: public[key] for key in ['geography', 'interests', 'channels', 'allocation', 'durationDays']} if public else None)
    goal = Decimal(str(snapshot['goal'])) if snapshot['goal'] is not None else Decimal(0)
    percentage = float((Decimal(str(metrics['raised'])) * 100 / goal).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)) if goal > 0 else None
    result = {**metrics, 'reportSchemaVersion': SCHEMA_VERSION, 'campaign': snapshot,
              'generatedAt': stamp(), 'dataUpdatedAt': data_updated,
              'dataTimeNote': 'Latest recorded public lifecycle, ledger, payment or stored delivery timestamp. Earlier progress updates may have no separate observation timestamp.',
              'shareable': bool(public), 'fundingPercentage': percentage,
              'nextStep': _next_step(state, metrics['final']), 'lifecycleEvents': events,
              'reportingPeriod': {'startedAt': started, 'completedAt': completed,
                                  'durationDays': public['durationDays'] if public else None},
              'distribution': {'state': distribution_state, 'proposed': proposed, 'finalized': None,
                  'finalizationNote': ('Reviewer setup has been confirmed; separate finalized audience/channel settings are not recorded.'
                                       if campaign.get('setup_ready') else 'Creator-proposed settings; the platform may finalize them during separate setup review.'),
                  'startedAt': started, 'completedAt': completed},
              'policy': {'currency': 'USD', 'feeRate': float(fee_rate), 'peoplePerNetAdDollar': people_rate,
                         **{key: policies[key] for key in ['purpose', 'fees', 'allocation', 'refunds', 'unspent', 'reach', 'delivery', 'privacy']}},
              'metricAvailability': {'estimatedReach': 'estimated', 'simulatedReach': 'simulated' if metrics['simulatedReach'] is not None else 'unavailable',
                 'measuredReach': 'unavailable' if metrics['measuredReach'] is None else 'measured',
                 'impressions': 'simulated' if metrics['impressions'] is not None else 'unavailable',
                 'clicks': 'simulated' if metrics['clicks'] is not None else 'unavailable'}}
    # Generation time identifies this rendering, not a new accounting revision.
    fingerprint = {key: value for key, value in result.items() if key != 'generatedAt'}
    result['reportSnapshotId'] = hashlib.sha256(json.dumps(fingerprint, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
    return result
