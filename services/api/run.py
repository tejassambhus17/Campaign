"""Run with the project-local Python: .venv/Scripts/python.exe run.py."""
import os
import uvicorn

if __name__ == '__main__':
    uvicorn.run('main:create_app', factory=True, host=os.getenv('CAMPAIGN_HOST', '0.0.0.0'),
                port=int(os.getenv('CAMPAIGN_PORT', '8787')), log_level='info',
                # Private guest receipts use capability URLs. Uvicorn's access log
                # includes query strings, so keep startup/errors but omit request logs.
                access_log=False)

