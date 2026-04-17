import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class CronJobTemplate extends BaseTemplate {
  get templateName(): string {
    return "cron-job";
  }

  get language(): string {
    return "python";
  }

  get framework(): string {
    return "apscheduler";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcUnder = this.getServiceNameUnderscore();

    // Main entry
    this.addFile(files, "main.py", `"""Main entry point for ${svc} scheduler."""

import signal
import sys
from scheduler.app import create_scheduler
from scheduler.config import settings
from scheduler.logger import get_logger

logger = get_logger(__name__)


def main():
    """Start the scheduler."""
    logger.info(f"Starting {settings.APP_NAME} scheduler...")
    scheduler = create_scheduler()

    def shutdown(signum, frame):
        logger.info("Shutting down scheduler...")
        scheduler.shutdown(wait=True)
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    try:
        scheduler.start()
        logger.info("Scheduler is running. Press Ctrl+C to exit.")
        signal.pause()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown(wait=True)
        logger.info("Scheduler stopped.")


if __name__ == "__main__":
    main()
`);

    // scheduler package
    this.addFile(files, "scheduler/__init__.py", `"""Scheduler package for ${svc}."""\n`);

    // scheduler/app.py
    this.addFile(files, "scheduler/app.py", `"""Scheduler application setup."""

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from scheduler.jobs import cleanup_job, report_job, health_check_job
from scheduler.config import settings
from scheduler.logger import get_logger

logger = get_logger(__name__)


def create_scheduler() -> BlockingScheduler:
    """Create and configure the scheduler."""
    scheduler = BlockingScheduler(
        timezone=settings.TIMEZONE,
        job_defaults={
            "coalesce": True,
            "max_instances": 1,
            "misfire_grace_time": 60,
        },
    )

    # Daily cleanup at 2 AM
    scheduler.add_job(
        cleanup_job,
        trigger=CronTrigger(hour=2, minute=0),
        id="cleanup_job",
        name="Daily Cleanup",
        replace_existing=True,
    )

    # Hourly report
    scheduler.add_job(
        report_job,
        trigger=IntervalTrigger(hours=1),
        id="report_job",
        name="Hourly Report",
        replace_existing=True,
    )

    # Health check every 5 minutes
    scheduler.add_job(
        health_check_job,
        trigger=IntervalTrigger(minutes=5),
        id="health_check_job",
        name="Health Check",
        replace_existing=True,
    )

    scheduler.add_listener(on_job_error, mask=1 << 11)  # EVENT_JOB_ERROR
    logger.info(f"Registered {len(scheduler.get_jobs())} jobs")
    return scheduler


def on_job_error(event):
    """Handle job execution errors."""
    logger.error(f"Job {event.job_id} failed: {event.exception}")
`);

    // scheduler/jobs.py
    this.addFile(files, "scheduler/jobs.py", `"""Job definitions for ${svc}."""

import time
from scheduler.logger import get_logger

logger = get_logger(__name__)


def cleanup_job():
    """Daily cleanup task - remove old data, temp files, etc."""
    logger.info("Running cleanup job...")
    start = time.time()
    try:
        # Add your cleanup logic here
        # e.g., delete old logs, temp files, expired sessions
        logger.info("Cleanup completed successfully.")
    except Exception as e:
        logger.error(f"Cleanup job failed: {e}")
        raise
    finally:
        elapsed = time.time() - start
        logger.info(f"Cleanup job took {elapsed:.2f}s")


def report_job():
    """Hourly report generation task."""
    logger.info("Running report job...")
    start = time.time()
    try:
        # Add your report generation logic here
        # e.g., aggregate metrics, send email reports
        logger.info("Report generated successfully.")
    except Exception as e:
        logger.error(f"Report job failed: {e}")
        raise
    finally:
        elapsed = time.time() - start
        logger.info(f"Report job took {elapsed:.2f}s")


def health_check_job():
    """Periodic health check task."""
    logger.info("Running health check...")
    try:
        # Add your health check logic here
        # e.g., check DB connections, external APIs
        logger.info("Health check passed.")
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise
`);

    // scheduler/config.py
    this.addFile(files, "scheduler/config.py", `"""Configuration for ${svc}."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "${svc}"
    APP_VERSION: str = "0.1.0"
    TIMEZONE: str = "UTC"
    LOG_LEVEL: str = "info"
    LOG_FORMAT: str = "json"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
`);

    // scheduler/logger.py
    this.addFile(files, "scheduler/logger.py", `"""Logging configuration for ${svc}."""

import logging
import sys
from scheduler.config import settings


def get_logger(name: str) -> logging.Logger:
    """Create a configured logger instance."""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
`);

    // requirements.txt
    this.addFile(files, "requirements.txt", `apscheduler==3.10.4
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
structlog==24.1.0
`);

    this.addFile(files, "requirements-dev.txt", `pytest==7.4.4
pytest-cov==4.1.0
ruff==0.1.14
mypy==1.8.0
`);

    this.addFile(files, ".env.example", `APP_NAME=${svc}
TIMEZONE=UTC
LOG_LEVEL=info
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

    this.addFile(files, "tests/test_jobs.py", `"""Test job functions."""

from scheduler.jobs import cleanup_job, report_job, health_check_job


def test_cleanup_job():
    """Test that cleanup job runs without error."""
    cleanup_job()


def test_report_job():
    """Test that report job runs without error."""
    report_job()


def test_health_check_job():
    """Test that health check job runs without error."""
    health_check_job()
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
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
  replicas: 1
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
        resources:
          requests:
            cpu: ${this.config.resources.cpuRequest}
            memory: ${this.config.resources.memoryRequest}
          limits:
            cpu: ${this.config.resources.cpuLimit}
            memory: ${this.config.resources.memoryLimit}
        env:
        - name: APP_NAME
          value: "${svc}"
        - name: TIMEZONE
          value: "UTC"
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

A scheduled task runner generated by IDP CLI.

## Features

- APScheduler with cron and interval triggers
- Structured logging
- Graceful shutdown
- Health check job
- Retry and error handling

## Getting Started

\`\`\`bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
\`\`\`

## Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| cleanup_job | Daily 2 AM | Remove old data and temp files |
| report_job | Every hour | Generate reports |
| health_check_job | Every 5 min | Check system health |

## Docker

\`\`\`bash
docker build -t ${svc} .
docker run ${svc}
\`\`\`

## Testing

\`\`\`bash
pytest
\`\`\`
`);
    }

    return files;
  }
}
