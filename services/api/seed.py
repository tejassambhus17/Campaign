"""Coherent, explicitly fictional campaigns. No seeded backer identities are public."""
import json
import secrets
from datetime import timedelta

from db import ROOT, hash_password, identifier
from domain import CampaignContent, DEFAULT_PREFERENCES, stamp, utcnow


SAMPLES = [
    ('forest', 'Let our forests keep growing', 'Environment', 'Canopy Collective',
     'A community message about protecting the green spaces we share.', 2400, 1840,
     'Available for Funding', 'photo-1448375240586-882707db888b', True),
    ('learning', 'A brighter start for every learner', 'Education', 'Open Chapter Studio',
     'Bring a hopeful message about everyday learning into more conversations.', 1600, 720,
     'Available for Funding', 'photo-1503676260728-1c00da094a0b', True),
    ('ocean', 'The ocean connects all of us', 'Environment', 'Blue Current Community',
     'An invitation to notice, understand, and care for our shared coastline.', 3000, 2460,
     'Available for Funding', 'photo-1518837695005-2083093ee35b', False),
    ('community', 'Good neighbours make stronger communities', 'Community', 'The Neighbourhood Table',
     'Help a simple message of belonging travel beyond one neighbourhood.', 900, 900,
     'Funding Goal Reached', 'photo-1511632765486-a01980e01a18', False),
    ('arts', 'Make room for local creativity', 'Arts & Culture', 'Common Ground Arts',
     'A local arts message, now in a simulated distribution demonstration.', 2000, 2000,
     'Promoting', 'photo-1460661419201-fd4cecdf8a8b', False),
    ('science', 'Curiosity belongs to everyone', 'Science', 'Everyday Science Club',
     'See how a completed message campaign is reported with clear demo metrics.', 1200, 1200,
     'Completed', 'photo-1451187580459-43490279c0fa', False),
]


def seed_demo(database, fee_rate, people_per_dollar):
    from domain import cents, fee_for
    with database.transaction() as connection:
        if connection.execute('SELECT 1 FROM campaigns LIMIT 1').fetchone():
            return
        owner = identifier('usr')
        connection.execute('INSERT INTO users VALUES (?,?,?,?,?,?,?)', (
            owner, 'Demonstration Campaigns', 'samples@amplify.local', hash_password(secrets.token_urlsafe(32)),
            'member', json.dumps(DEFAULT_PREFERENCES), stamp()))
        for index, (key, title, category, creator, summary, goal, raised, state, photo, featured) in enumerate(SAMPLES):
            campaign_id = f'demo_{key}'
            cover = f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=1200&q=85'
            if (ROOT / 'assets' / 'seed' / f'{key}.jpg').is_file():
                cover = f'/seed-media/{key}.jpg'
            content = CampaignContent(
                title=title, category=category, creatorName=creator, summary=summary, coverImage=cover,
                storyHeadline=title, intro=summary,
                sections=[
                    {'id': 'why', 'kind': 'heading', 'text': 'A message worth sharing'},
                    {'id': 'story', 'kind': 'text', 'text': 'A single conversation can start a wider one. This fictional campaign brings a thoughtful, accessible message to people beyond its creator’s existing network. It is a demonstration of community-funded distribution, with no direct transfer of funds to the cause.'},
                    {'id': 'photo', 'kind': 'image', 'text': '', 'url': cover, 'caption': 'Illustrative stock photography for this fictional campaign.', 'credit': 'Unsplash'},
                    {'id': 'evidence', 'kind': 'heading', 'text': 'Context, with care'},
                    {'id': 'source-note', 'kind': 'text', 'text': 'The public reference below offers general context. It does not independently verify this fictional campaign, its creator, its sample funding, or any delivery results.'},
                    {'id': 'action', 'kind': 'action', 'text': 'Read the context, start a conversation, and share the message if it matters to you.'},
                ],
                sources=[{'id': 'context', 'title': 'United Nations Sustainable Development Goals — general context', 'url': 'https://sdgs.un.org/goals'}],
                adImages=[cover], adHeadline=title[:60], adDescription=summary, cta='Read the story',
                geography='India', interests='Community, learning and a shared future',
                channels=['Instagram', 'Facebook'], allocation={'Instagram': 60, 'Facebook': 40},
                durationDays=14, goal=goal, featured=featured,
            ).model_dump()
            created = stamp(utcnow() - timedelta(days=3 + index))
            deadline = stamp(utcnow() + timedelta(days=8 - index))
            amount = cents(raised)
            fee = fee_for(amount, fee_rate)
            net = amount - fee
            report = None
            if state in {'Promoting', 'Completed'}:
                spent = int(net * (0.95 if state == 'Completed' else 0.40))
                report = {
                    'simulated': True, 'provenance': 'Fictional seeded delivery demonstration; no advertising was purchased.',
                    'allocated': net / 100, 'spent': spent / 100,
                    'estimatedReach': int(net / 100 * people_per_dollar),
                    'simulatedReach': int(spent / 100 * people_per_dollar * 0.9),
                    'measuredReach': None, 'impressions': int(spent / 100 * people_per_dollar * 1.35),
                    'clicks': int(spent / 100 * 0.8), 'durationDays': 14,
                    'final': state == 'Completed', 'unspent': (net - spent) / 100,
                    'refundStatus': 'Simulated unspent refund complete' if state == 'Completed' else 'Calculated on completion',
                    'startedAt': stamp(utcnow() - timedelta(days=14 if state == 'Completed' else 2)),
                    'completedAt': stamp() if state == 'Completed' else None,
                }
            connection.execute('''INSERT INTO campaigns
                (id,owner_id,data_json,published_json,status,version,approved_version,setup_ready,created_at,updated_at,deadline,report_json)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
                (campaign_id, owner, json.dumps(content), json.dumps(content), state, 1, 1,
                 int(state in {'Promoting', 'Completed'}), created, created, deadline, json.dumps(report) if report else None))
            payment_id = f'seed_{key}'
            connection.execute('''INSERT INTO payments
                (id,campaign_id,user_id,actor_scope,idempotency_hash,request_hash,status,amount_cents,fee_cents,ad_cents,estimated_reach,title,created_at)
                VALUES (?,?,NULL,'seed',?,?, 'successful',?,?,?,?,?,?)''',
                (payment_id, campaign_id, key, key, amount, fee, net,
                 int(net / 100 * people_per_dollar), title, created))
            connection.execute('INSERT INTO ledger VALUES (?,?,?,?,?,?,?,?)',
                               (identifier('led'), payment_id, campaign_id, 'contribution', amount, fee, net, created))
            if state == 'Completed':
                unspent = net - int(report['spent'] * 100)
                connection.execute('INSERT INTO ledger VALUES (?,?,?,?,?,?,?,?)',
                                   (identifier('led'), payment_id, campaign_id, 'refund', -unspent, 0, -unspent, stamp()))
                connection.execute('UPDATE payments SET refunded_cents=? WHERE id=?', (unspent, payment_id))
            connection.execute('INSERT INTO campaign_events VALUES (?,?,?,?,?,?,?,?,?)',
                               (identifier('evt'), campaign_id, None, 'seed', None, state, 1,
                                'Fictional sample campaign and simulated ledger.', created))


def localize_seed_assets(database):
    """Use bundled photos when available, including databases made before caching."""
    with database.transaction() as connection:
        for sample in SAMPLES:
            key, photo = sample[0], sample[8]
            if not (ROOT / 'assets' / 'seed' / f'{key}.jpg').is_file():
                continue
            row = connection.execute('SELECT data_json,published_json FROM campaigns WHERE id=?', (f'demo_{key}',)).fetchone()
            if not row:
                continue
            old = f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=1200&q=85'
            def replace_json(value):
                return value.replace(old, f'/seed-media/{key}.jpg') if value else value
            connection.execute('UPDATE campaigns SET data_json=?,published_json=? WHERE id=?',
                               (replace_json(row['data_json']), replace_json(row['published_json']), f'demo_{key}'))


