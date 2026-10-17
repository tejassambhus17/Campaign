"""Real report HTTP/privacy/finance snapshots on disposable SQLite data."""
import json
from unittest.mock import patch
import unittest

import main
import test_api


class ReportProjectionTests(unittest.TestCase):
    setUp, tearDown = test_api.ApiTests.setUp, test_api.ApiTests.tearDown
    register, headers, create = test_api.ApiTests.register, test_api.ApiTests.headers, test_api.ApiTests.create
    publish, transition, contribute = test_api.ApiTests.publish, test_api.ApiTests.transition, test_api.ApiTests.contribute

    def report(self, campaign_id, account=None):
        response = self.client.get(f'/campaigns/{campaign_id}/report', headers=self.headers(account) if account else {})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_additive_contract_matches_existing_accounting(self):
        campaign = self.publish()
        self.contribute(campaign['id'], 10)
        old = self.client.get(f'/campaigns/{campaign["id"]}').json()['report']
        report = self.report(campaign['id'])
        self.assertEqual({key: report[key] for key in old}, old)
        self.assertEqual(report['reportSchemaVersion'], 'campaign-report-v1')
        self.assertEqual(report['campaign']['title'], campaign['title'])
        self.assertEqual(report['campaign']['goal'], 100)
        self.assertEqual(report['campaign']['version'], 1)
        self.assertEqual(report['fundingPercentage'], 10)
        self.assertTrue(report['shareable'])
        self.assertEqual(report['policy']['currency'], 'USD')
        self.assertEqual(report['policy']['peoplePerNetAdDollar'], 27)
        self.assertEqual(report['nextStep']['action'], 'back')
        self.assertEqual(report['reportingPeriod']['startedAt'], None)

    def test_unpublished_access_preserved_but_no_exportable_identity(self):
        draft = self.create(title='PRIVATE TITLE', geography='PRIVATE PLACE')
        endpoint = f'/campaigns/{draft["id"]}/report'
        self.assertEqual(self.client.get(endpoint).status_code, 404)
        self.assertEqual(self.client.get(endpoint, headers=self.headers(self.other)).status_code, 404)
        for account in [self.creator, self.reviewer]:
            response = self.report(draft['id'], account)
            self.assertFalse(response['shareable'])
            self.assertIsNone(response['campaign']['title'])
            self.assertIsNone(response['campaign']['goal'])
            self.assertIsNone(response['distribution']['proposed'])
            self.assertEqual(response['lifecycleEvents'], [])
            self.assertNotIn('PRIVATE', json.dumps(response))

    def test_private_revision_and_review_notes_never_enter_report(self):
        campaign = self.publish(title='Public original')
        before = self.report(campaign['id'])
        endpoint = f'/campaigns/{campaign["id"]}'
        edited = self.client.put(endpoint, headers=self.headers(), json={'title': 'PRIVATE EDIT', 'geography': 'PRIVATE PLACE'})
        self.assertEqual(edited.status_code, 200, edited.text)
        self.assertEqual(self.client.post(endpoint+'/submit', headers=self.headers(), json={'rulesAccepted': True}).status_code, 200)
        self.assertEqual(self.client.post(endpoint+'/review', headers=self.headers(self.reviewer),
                                        json={'decision': 'changes', 'feedback': 'PRIVATE REVIEW NOTE'}).status_code, 200)
        for account in [None, self.creator, self.reviewer]:
            report = self.report(campaign['id'], account)
            self.assertEqual(report['campaign'], before['campaign'])
            self.assertEqual(report['distribution'], before['distribution'])
            self.assertEqual(report['lifecycleEvents'], before['lifecycleEvents'])
            self.assertEqual(report['dataUpdatedAt'], before['dataUpdatedAt'])
            self.assertNotIn('PRIVATE', json.dumps(report))
        self.assertEqual(self.client.get(endpoint+'/history').status_code, 401)
        self.assertEqual(self.client.get(endpoint+'/history', headers=self.headers(self.other)).status_code, 403)

    def test_public_events_have_real_dates_and_no_private_actor_or_details(self):
        campaign = self.publish()
        report = self.report(campaign['id'])
        self.assertEqual([event['state'] for event in report['lifecycleEvents']],
                         ['Submitted for Review', 'Approved', 'Available for Funding'])
        for event in report['lifecycleEvents']:
            self.assertEqual(set(event), {'type', 'state', 'occurredAt', 'version', 'simulated', 'seeded'})
            self.assertTrue(event['occurredAt'])
            self.assertFalse(event['seeded'])
        raw = json.dumps(report)
        for forbidden in ['password', 'actorId', 'actor_id', 'token', 'feedback', 'reviewer@example']:
            self.assertNotIn(forbidden, raw)

    def test_unavailable_differs_from_simulated_zero_and_no_fake_platform_results(self):
        campaign = self.publish(goal=10)
        before = self.report(campaign['id'])
        self.assertIsNone(before['measuredReach'])
        self.assertIsNone(before['simulatedReach'])
        self.assertEqual(before['metricAvailability']['simulatedReach'], 'unavailable')
        self.contribute(campaign['id'], 10)
        self.assertEqual(self.transition(campaign['id'], 'Distribution Preparation').status_code, 200)
        self.assertEqual(self.transition(campaign['id'], 'Promoting', setupReady=True).status_code, 200)
        report = self.report(campaign['id'])
        self.assertEqual(report['simulatedReach'], 0)
        self.assertEqual(report['metricAvailability']['simulatedReach'], 'simulated')
        self.assertIsNone(report['measuredReach'])
        self.assertEqual(report['metricAvailability']['measuredReach'], 'unavailable')
        self.assertIsNone(report['distribution']['finalized'])
        self.assertEqual(report['distribution']['state'], 'simulated')
        self.assertEqual(report['distribution']['proposed']['allocation'], {'Instagram': 100})
        self.assertNotIn('channelResults', report)

    def test_completed_refund_snapshot_is_reconciled_and_timestamped(self):
        campaign = self.publish(goal=100)
        self.contribute(campaign['id'], 100)
        self.transition(campaign['id'], 'Distribution Preparation')
        self.transition(campaign['id'], 'Promoting', setupReady=True)
        progress = self.client.post(f'/campaigns/{campaign["id"]}/progress', headers=self.headers(self.reviewer))
        self.assertEqual(progress.status_code, 200)
        report = self.report(campaign['id'])
        self.assertEqual(report['dataUpdatedAt'], progress.json()['updatedAt'])
        self.assertEqual(self.transition(campaign['id'], 'Completed').status_code, 200)
        report = self.report(campaign['id'])
        self.assertTrue(report['final'])
        self.assertEqual(report['distribution']['state'], 'completed')
        self.assertTrue(report['reportingPeriod']['completedAt'])
        self.assertEqual((report['raised'], report['fees'], report['allocated'], report['spent'], report['refunded']), (100, 5, 95, 90.25, 4.75))
        self.assertEqual(report['raised'], report['spent'] + report['retainedFees'] + report['refunded'] + report['remainingAdvertisingBudget'])
        self.assertEqual(report['refundState'], 'completed')

    def test_generated_time_is_not_a_new_snapshot_revision(self):
        campaign = self.publish()
        first, second = self.report(campaign['id']), self.report(campaign['id'])
        self.assertNotEqual(first['generatedAt'], second['generatedAt'])
        self.assertEqual(first['reportSnapshotId'], second['reportSnapshotId'])
        self.contribute(campaign['id'], 5)
        third = self.report(campaign['id'])
        self.assertNotEqual(first['reportSnapshotId'], third['reportSnapshotId'])
        self.assertNotEqual(first['dataUpdatedAt'], third['dataUpdatedAt'])

    def test_private_unsuccessful_checkout_does_not_change_public_report_snapshot(self):
        campaign = self.publish()
        before = self.report(campaign['id'])
        for outcome in ['pending', 'failed', 'rejected', 'cancelled']:
            self.assertEqual(self.contribute(campaign['id'], 5, outcome=outcome).status_code, 200)
        after = self.report(campaign['id'])
        self.assertEqual(before['dataUpdatedAt'], after['dataUpdatedAt'])
        self.assertEqual(before['reportSnapshotId'], after['reportSnapshotId'])
        self.assertEqual((after['raised'], after['contributionCount']), (0, 0))

    def test_snapshot_cannot_mix_a_later_payment_into_earlier_metrics(self):
        campaign = self.publish()
        self.contribute(campaign['id'], 10)
        before = self.report(campaign['id'])
        if self.app.state.database.backend == 'sqlite':
            # WAL allows the real isolated writer to commit while a read
            # snapshot is open, rather than waiting for its rollback-journal lock.
            with self.app.state.database.connect() as connection:
                connection.execute('PRAGMA journal_mode=WAL')
        original = main.project_report
        called = False
        def interleave(connection, row, metrics, **kwargs):
            nonlocal called
            if not called:
                called = True
                response = self.contribute(campaign['id'], 5)
                self.assertEqual(response.status_code, 200)
            return original(connection, row, metrics, **kwargs)
        with patch.object(main, 'project_report', side_effect=interleave):
            consistent = self.report(campaign['id'])
        self.assertEqual(consistent['raised'], 10)
        self.assertEqual(consistent['contributionCount'], 1)
        self.assertEqual(consistent['dataUpdatedAt'], before['dataUpdatedAt'])
        self.assertEqual(consistent['reportSnapshotId'], before['reportSnapshotId'])
        after = self.report(campaign['id'])
        self.assertEqual((after['raised'], after['contributionCount']), (15, 2))


if __name__ == '__main__':
    unittest.main(verbosity=2)
