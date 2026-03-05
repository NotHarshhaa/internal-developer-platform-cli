"""Worker / background service template."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import write_file


class WorkerTemplate(BaseTemplate):
    """Generate a production-ready background worker service."""

    @property
    def template_name(self) -> str:
        return "worker"

    @property
    def language(self) -> str:
        return "python"

    @property
    def framework(self) -> str:
        return "celery"

    def generate_app_code(self) -> None:
        svc = self.service_name
        svc_under = svc.replace("-", "_")
        app_dir = self.service_dir / "app"

        write_file(
            app_dir / "__init__.py",
            f'"""Worker application package for {svc}."""\n',
        )

        write_file(
            app_dir / "worker.py",
            f'''"""Celery worker configuration for {svc}."""

from celery import Celery
from app.config import settings

app = Celery(
    "{svc_under}",
    broker=settings.BROKER_URL,
    backend=settings.RESULT_BACKEND,
)

app.config_from_object({{
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "timezone": "UTC",
    "enable_utc": True,
    "task_track_started": True,
    "task_acks_late": True,
    "worker_prefetch_multiplier": 1,
}})

app.autodiscover_tasks(["app.tasks"])
''',
        )

        write_file(
            app_dir / "config.py",
            f'''"""Configuration for {svc}."""

import os


class Settings:
    """Worker settings loaded from environment variables."""

    APP_NAME: str = "{svc}"
    BROKER_URL: str = os.getenv("BROKER_URL", "redis://localhost:6379/0")
    RESULT_BACKEND: str = os.getenv("RESULT_BACKEND", "redis://localhost:6379/1")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")


settings = Settings()
''',
        )

        write_file(
            app_dir / "tasks" / "__init__.py",
            '"""Task definitions."""\n',
        )

        write_file(
            app_dir / "tasks" / "example_tasks.py",
            f'''"""Example tasks for {svc}."""

import time
import logging
from app.worker import app

logger = logging.getLogger(__name__)


@app.task(bind=True, max_retries=3)
def process_job(self, job_data: dict) -> dict:
    """Process a background job.

    Args:
        job_data: Dictionary containing job parameters.

    Returns:
        Dictionary with processing results.
    """
    try:
        logger.info(f"Processing job: {{job_data}}")
        # Simulate work
        time.sleep(1)
        return {{"status": "completed", "data": job_data}}
    except Exception as exc:
        logger.error(f"Job failed: {{exc}}")
        raise self.retry(exc=exc, countdown=60)


@app.task
def scheduled_cleanup() -> dict:
    """Periodic cleanup task."""
    logger.info("Running scheduled cleanup")
    return {{"status": "cleanup_complete"}}
''',
        )

        # Health check HTTP server for Kubernetes probes
        write_file(
            app_dir / "health.py",
            f'''"""Health check HTTP server for {svc} worker."""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import threading


class HealthHandler(BaseHTTPRequestHandler):
    """Simple health check handler."""

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({{"status": "healthy", "service": "{svc}"}}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs


def start_health_server(port: int = 8080):
    """Start health check server in a background thread."""
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server
''',
        )

    def generate_config_files(self) -> None:
        write_file(
            self.service_dir / "requirements.txt",
            """celery==5.3.6
redis==5.0.1
kombu==5.3.4
prometheus-client==0.19.0
structlog==24.1.0
python-dotenv==1.0.0
""",
        )

        write_file(
            self.service_dir / "requirements-dev.txt",
            """pytest==7.4.4
pytest-cov==4.1.0
ruff==0.1.14
mypy==1.8.0
""",
        )

        write_file(
            self.service_dir / ".env.example",
            f"""# {self.service_name} environment configuration
BROKER_URL=redis://localhost:6379/0
RESULT_BACKEND=redis://localhost:6379/1
LOG_LEVEL=info
""",
        )

        write_file(
            self.service_dir / ".gitignore",
            """__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
.env
*.log
.mypy_cache/
.pytest_cache/
.coverage
""",
        )

    def generate_tests(self) -> None:
        tests_dir = self.service_dir / "tests"

        write_file(tests_dir / "__init__.py", '"""Test package."""\n')

        write_file(
            tests_dir / "test_tasks.py",
            '''"""Task tests."""

from unittest.mock import patch
from app.tasks.example_tasks import process_job


def test_process_job():
    """Test the process_job task."""
    result = process_job.apply(args=[{"key": "value"}]).get()
    assert result["status"] == "completed"
    assert result["data"] == {"key": "value"}
''',
        )
