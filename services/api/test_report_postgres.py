"""Actual isolated PostgreSQL coverage of the additive report snapshot."""
import unittest
import test_postgres
import test_report_projection


@unittest.skipUnless(test_postgres.TEST_URL, 'Requires an explicitly configured isolated PostgreSQL test database.')
class PostgresReportProjectionTests(test_report_projection.ReportProjectionTests):
    setUp = test_postgres.PostgresApiTests.setUp
    tearDown = test_postgres.PostgresApiTests.tearDown
    make_schema = test_postgres.PostgresApiTests.make_schema


if __name__ == '__main__':
    unittest.main(verbosity=2)
