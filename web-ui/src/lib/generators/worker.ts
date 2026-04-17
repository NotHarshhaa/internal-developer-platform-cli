import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class WorkerServiceTemplate extends BaseTemplate {
  get templateName(): string {
    return "worker";
  }

  get language(): string {
    return "python";
  }

  get framework(): string {
    return "celery";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcUnder = this.getServiceNameUnderscore();

    // Main entry
    this.addFile(files, "main.py", `"""Main entry point for ${svc} worker service."""

import logging
from worker.app import create_app
from worker.config import settings

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting {settings.APP_NAME} worker...")
    app.worker_main(["worker", "--loglevel=info", "--concurrency=4"])
`);

    // Worker package
    this.addFile(files, "worker/__init__.py", `"""${svc} worker service."""\n`);

    // Celery app
    this.addFile(files, "worker/app.py", `"""Celery application setup for ${svc}."""

from celery import Celery
from worker.config import settings


def create_app() -> Celery:
    """Create and configure the Celery application."""
    app = Celery(
        settings.APP_NAME,
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
    )

    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        task_default_retry_delay=60,
        task_max_retries=3,
    )

    # Auto-discover tasks
    app.autodiscover_tasks(["worker.tasks"])

    # Beat schedule (periodic tasks)
    app.conf.beat_schedule = {
        "health-check-every-5-min": {
            "task": "worker.tasks.monitoring.health_check",
            "schedule": 300.0,
        },
        "cleanup-every-hour": {
            "task": "worker.tasks.maintenance.cleanup_old_results",
            "schedule": 3600.0,
        },
    }

    return app
`);

    // Config
    this.addFile(files, "worker/config.py", `"""Configuration for ${svc}."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "${svc}"
    APP_VERSION: str = "0.1.0"
    REDIS_URL: str = "redis://localhost:6379/0"
    LOG_LEVEL: str = "info"
    CONCURRENCY: int = 4

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
`);

    // Tasks package
    this.addFile(files, "worker/tasks/__init__.py", `"""Task modules for ${svc}."""\n`);

    // Processing tasks
    this.addFile(files, "worker/tasks/processing.py", `"""Data processing tasks for ${svc}."""

import time
import logging
from worker.app import create_app

app = create_app()
logger = logging.getLogger(__name__)


@app.task(bind=True, name="worker.tasks.processing.process_data")
def process_data(self, data: dict) -> dict:
    """Process incoming data."""
    logger.info(f"Processing data: {data.get('id', 'unknown')}")
    try:
        # Simulate processing
        time.sleep(2)
        result = {
            "id": data.get("id"),
            "status": "completed",
            "processed": True,
            "result": f"Processed {len(data)} fields",
        }
        logger.info(f"Processing complete: {result['id']}")
        return result
    except Exception as exc:
        logger.error(f"Processing failed: {exc}")
        self.retry(exc=exc, countdown=60)


@app.task(bind=True, name="worker.tasks.processing.batch_process")
def batch_process(self, items: list) -> dict:
    """Process a batch of items."""
    logger.info(f"Batch processing {len(items)} items")
    results = []
    for item in items:
        results.append({"id": item.get("id"), "status": "processed"})
    return {"count": len(results), "results": results}
`);

    // Notification tasks
    this.addFile(files, "worker/tasks/notifications.py", `"""Notification tasks for ${svc}."""

import logging
from worker.app import create_app

app = create_app()
logger = logging.getLogger(__name__)


@app.task(name="worker.tasks.notifications.send_email")
def send_email(to: str, subject: str, body: str) -> dict:
    """Send an email notification."""
    logger.info(f"Sending email to {to}: {subject}")
    # Replace with actual email sending logic
    return {"to": to, "subject": subject, "status": "sent"}


@app.task(name="worker.tasks.notifications.send_webhook")
def send_webhook(url: str, payload: dict) -> dict:
    """Send a webhook notification."""
    logger.info(f"Sending webhook to {url}")
    # Replace with actual HTTP request
    return {"url": url, "status": "delivered"}
`);

    // Monitoring tasks
    this.addFile(files, "worker/tasks/monitoring.py", `"""Monitoring tasks for ${svc}."""

import logging
from worker.app import create_app

app = create_app()
logger = logging.getLogger(__name__)


@app.task(name="worker.tasks.monitoring.health_check")
def health_check() -> dict:
    """Periodic health check."""
    logger.info("Running worker health check")
    # Check Redis, DB, external services
    return {"status": "healthy", "worker": "${svc}"}
`);

    // Maintenance tasks
    this.addFile(files, "worker/tasks/maintenance.py", `"""Maintenance tasks for ${svc}."""

import logging
from worker.app import create_app

app = create_app()
logger = logging.getLogger(__name__)


@app.task(name="worker.tasks.maintenance.cleanup_old_results")
def cleanup_old_results() -> dict:
    """Clean up old task results."""
    logger.info("Cleaning up old results")
    # Add cleanup logic here
    return {"status": "cleaned", "removed": 0}
`);

    // Requirements
    this.addFile(files, "requirements.txt", `celery[redis]==5.3.6
redis==5.0.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
flower==2.0.1
`);

    this.addFile(files, "requirements-dev.txt", `pytest==7.4.4
pytest-cov==4.1.0
ruff==0.1.14
mypy==1.8.0
`);

    this.addFile(files, ".env.example", `APP_NAME=${svc}
REDIS_URL=redis://localhost:6379/0
LOG_LEVEL=info
CONCURRENCY=4
`);

    this.addFile(files, ".gitignore", `__pycache__/
*.py[cod]
.venv/
venv/
.env
*.log
.pytest_cache/
.coverage
`);

    // Tests
    this.addFile(files, "tests/__init__.py", `"""Tests for ${svc}."""\n`);

    this.addFile(files, "tests/test_tasks.py", `"""Task tests for ${svc}."""

from worker.tasks.processing import process_data, batch_process
from worker.tasks.monitoring import health_check


def test_process_data():
    result = process_data({"id": "test-1", "value": "hello"})
    assert result["status"] == "completed"
    assert result["processed"] is True


def test_batch_process():
    items = [{"id": "1"}, {"id": "2"}, {"id": "3"}]
    result = batch_process(items)
    assert result["count"] == 3


def test_health_check():
    result = health_check()
    assert result["status"] == "healthy"
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["celery", "-A", "worker.app:create_app()", "worker", "--loglevel=info", "--concurrency=4"]
`);

      this.addFile(files, "docker-compose.yml", `version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  worker:
    build: .
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/0
    command: celery -A worker.app:create_app() worker --loglevel=info --concurrency=4

  beat:
    build: .
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/0
    command: celery -A worker.app:create_app() beat --loglevel=info

  flower:
    build: .
    depends_on:
      - redis
    ports:
      - "5555:5555"
    environment:
      - REDIS_URL=redis://redis:6379/0
    command: celery -A worker.app:create_app() flower --port=5555
`);

      this.addFile(files, ".dockerignore", `__pycache__
.venv
.git
.env
tests/
README.md
`);
    }

    // Kubernetes
    if (this.config.k8s) {
      this.addFile(files, "k8s/base/deployment.yaml", `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${svc}
  labels:
    app: ${svc}
spec:
  replicas: ${this.config.replicas}
  selector:
    matchLabels:
      app: ${svc}
  template:
    metadata:
      labels:
        app: ${svc}
    spec:
      containers:
      - name: ${svc}
        image: ${svc}:latest
        command: ["celery", "-A", "worker.app:create_app()", "worker", "--loglevel=info"]
        resources:
          requests:
            cpu: ${this.config.resources.cpuRequest}
            memory: ${this.config.resources.memoryRequest}
          limits:
            cpu: ${this.config.resources.cpuLimit}
            memory: ${this.config.resources.memoryLimit}
        env:
        - name: REDIS_URL
          value: "redis://redis:6379/0"
`);

      this.addFile(files, "k8s/base/kustomization.yaml", `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
commonLabels:
  app: ${svc}
`);
    }

    // README
    if (this.config.docs) {
      this.addFile(files, "README.md", `# ${svc}

A background worker/job processing service with Celery, generated by IDP CLI.

## Features

- Celery task queue with Redis broker
- Task scheduling with Celery Beat
- Retry logic with exponential backoff
- Flower monitoring dashboard
- Processing, notification, and maintenance tasks

## Getting Started

\`\`\`bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start worker
celery -A worker.app:create_app() worker --loglevel=info

# Start beat scheduler (separate terminal)
celery -A worker.app:create_app() beat --loglevel=info

# Start Flower dashboard (separate terminal)
celery -A worker.app:create_app() flower --port=5555
\`\`\`

Flower dashboard: http://localhost:5555

## Docker Compose

\`\`\`bash
docker-compose up -d
\`\`\`

## Tasks

| Task | Type | Description |
|------|------|-------------|
| process_data | On-demand | Process incoming data |
| batch_process | On-demand | Process batch of items |
| send_email | On-demand | Send email notification |
| send_webhook | On-demand | Send webhook |
| health_check | Periodic (5m) | Worker health check |
| cleanup_old_results | Periodic (1h) | Clean old results |

## Testing

\`\`\`bash
pytest
\`\`\`
`);
    }

    return files;
  }
}
