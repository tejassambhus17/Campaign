"""Run with the project-local Python: .venv/Scripts/python.exe run.py."""
import os
import uvicorn

if __name__ == '__main__':
    cloud = os.getenv('CAMPAIGN_ENV', 'local') == 'cloud'
    port = (os.getenv('PORT') if cloud else None) or os.getenv('CAMPAIGN_PORT', '8787')
    uvicorn.run('asgi:create_app', factory=True, host=os.getenv('CAMPAIGN_HOST', '0.0.0.0'),
                port=int(port), log_level='info',
                # Uvicorn trusts only its configured proxy peers (loopback by
                # default). Public asset origins do not rely on forwarded Host.
                proxy_headers=True,
                forwarded_allow_ips=os.getenv('FORWARDED_ALLOW_IPS', '127.0.0.1'),
                # Private guest receipts use capability URLs. Uvicorn's access log
                # includes query strings, so keep startup/errors but omit request logs.
                access_log=False)

