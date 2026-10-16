"""ASGI factory with secret-safe cloud startup failures."""
import os


def create_app():
    try:
        from main import create_app as factory
        return factory()
    except Exception:
        if os.getenv('CAMPAIGN_ENV', 'local') != 'local':
            # Suppress raw driver/configuration exception context, which may
            # include connection strings or provider credentials at startup.
            raise RuntimeError('Cloud API initialization failed. Check server configuration and storage availability.') from None
        raise
