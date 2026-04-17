import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class DatabaseServiceTemplate extends BaseTemplate {
  get templateName(): string {
    return "database-service";
  }

  get language(): string {
    return "python";
  }

  get framework(): string {
    return "alembic";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcUnder = this.getServiceNameUnderscore();

    // Main entry
    this.addFile(files, "main.py", `"""Main entry point for ${svc} database service."""

import click
from db.engine import get_engine
from db.migrate import run_migrations, create_migration, rollback_migration
from db.seed import run_seeds
from db.config import settings
import logging

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper()))
logger = logging.getLogger(__name__)


@click.group()
def cli():
    """${svc} - Database migration and management service."""
    pass


@cli.command()
def migrate():
    """Run all pending migrations."""
    logger.info("Running migrations...")
    run_migrations()
    logger.info("Migrations completed.")


@cli.command()
@click.argument("name")
def create(name: str):
    """Create a new migration."""
    logger.info(f"Creating migration: {name}")
    create_migration(name)


@cli.command()
@click.option("--steps", default=1, help="Number of migrations to rollback")
def rollback(steps: int):
    """Rollback migrations."""
    logger.info(f"Rolling back {steps} migration(s)...")
    rollback_migration(steps)
    logger.info("Rollback completed.")


@cli.command()
def seed():
    """Run database seeders."""
    logger.info("Running seeders...")
    run_seeds()
    logger.info("Seeding completed.")


@cli.command()
def status():
    """Show migration status."""
    from db.migrate import get_status
    statuses = get_status()
    click.echo(f"\\nMigration Status for {settings.APP_NAME}:")
    click.echo("-" * 50)
    for s in statuses:
        icon = "✓" if s["applied"] else "✗"
        click.echo(f"  {icon} {s['name']} ({s['date']})")
    click.echo(f"\\nTotal: {len(statuses)} migrations")


if __name__ == "__main__":
    cli()
`);

    // db package
    this.addFile(files, "db/__init__.py", `"""Database package for ${svc}."""\n`);

    // db/config.py
    this.addFile(files, "db/config.py", `"""Database configuration for ${svc}."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "${svc}"
    DATABASE_URL: str = "sqlite:///./data/${svcUnder}.db"
    LOG_LEVEL: str = "info"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
`);

    // db/engine.py
    this.addFile(files, "db/engine.py", `"""Database engine setup for ${svc}."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from db.config import settings

engine = None
SessionLocal = None
Base = declarative_base()


def get_engine():
    """Get or create the database engine."""
    global engine, SessionLocal
    if engine is None:
        engine = create_engine(settings.DATABASE_URL, echo=False)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine


def get_session():
    """Get a database session."""
    if SessionLocal is None:
        get_engine()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
`);

    // db/migrate.py
    this.addFile(files, "db/migrate.py", `"""Migration management for ${svc}."""

import os
import json
from datetime import datetime
from pathlib import Path

MIGRATIONS_DIR = Path("migrations")
STATE_FILE = Path("migrations/.state.json")


def _load_state() -> dict:
    """Load migration state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"applied": []}


def _save_state(state: dict):
    """Save migration state."""
    MIGRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


def run_migrations():
    """Run all pending migrations."""
    state = _load_state()
    applied = set(state["applied"])

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    for mf in migration_files:
        if mf.name not in applied:
            print(f"  Applying: {mf.name}")
            # In production: execute SQL against database
            # with get_engine().connect() as conn:
            #     conn.execute(text(mf.read_text()))
            state["applied"].append(mf.name)

    _save_state(state)


def create_migration(name: str):
    """Create a new migration file."""
    MIGRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{name}.sql"
    filepath = MIGRATIONS_DIR / filename

    filepath.write_text(f\"\"\"-- Migration: {name}
-- Created: {datetime.now().isoformat()}

-- UP
-- Write your migration SQL here


-- DOWN
-- Write your rollback SQL here
\"\"\")

    print(f"  Created: {filepath}")


def rollback_migration(steps: int = 1):
    """Rollback the last N migrations."""
    state = _load_state()
    for _ in range(min(steps, len(state["applied"]))):
        removed = state["applied"].pop()
        print(f"  Rolled back: {removed}")
    _save_state(state)


def get_status() -> list[dict]:
    """Get migration status."""
    state = _load_state()
    applied = set(state["applied"])
    statuses = []

    MIGRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    for mf in sorted(MIGRATIONS_DIR.glob("*.sql")):
        parts = mf.stem.split("_", 1)
        statuses.append({
            "name": mf.name,
            "date": parts[0] if parts else "unknown",
            "applied": mf.name in applied,
        })

    return statuses
`);

    // db/seed.py
    this.addFile(files, "db/seed.py", `"""Database seeder for ${svc}."""

import logging

logger = logging.getLogger(__name__)

SEEDS = [
    {
        "name": "initial_data",
        "description": "Insert initial reference data",
    },
    {
        "name": "test_data",
        "description": "Insert test/demo data",
    },
]


def run_seeds():
    """Run all database seeders."""
    for seed in SEEDS:
        logger.info(f"  Running seeder: {seed['name']} - {seed['description']}")
        # In production: execute seed logic against database
        # e.g., insert default roles, categories, configs
    logger.info(f"  Completed {len(SEEDS)} seeders")
`);

    // db/models.py
    this.addFile(files, "db/models.py", `"""Database models for ${svc}."""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from db.engine import Base


class Migration(Base):
    """Track applied migrations."""
    __tablename__ = "migrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    applied_at = Column(DateTime, server_default=func.now())
    success = Column(Boolean, default=True)


class SchemaVersion(Base):
    """Track schema version."""
    __tablename__ = "schema_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(String(50), nullable=False)
    description = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())
`);

    // Initial migration
    this.addFile(files, "migrations/.gitkeep", ``);

    this.addFile(files, "migrations/00000001_initial.sql", `-- Migration: initial
-- Created: auto-generated by IDP CLI

-- UP
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOWN
DROP TABLE IF EXISTS items;
`);

    // Requirements
    this.addFile(files, "requirements.txt", `click==8.1.7
sqlalchemy==2.0.25
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
alembic==1.13.1
`);

    this.addFile(files, "requirements-dev.txt", `pytest==7.4.4
pytest-cov==4.1.0
ruff==0.1.14
mypy==1.8.0
`);

    this.addFile(files, ".env.example", `APP_NAME=${svc}
DATABASE_URL=sqlite:///./data/${svcUnder}.db
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
data/
*.db
`);

    // Tests
    this.addFile(files, "tests/__init__.py", `"""Tests for ${svc}."""\n`);

    this.addFile(files, "tests/test_migrate.py", `"""Migration tests."""

from db.migrate import create_migration, get_status, _load_state


def test_get_status():
    """Test getting migration status."""
    statuses = get_status()
    assert isinstance(statuses, list)


def test_load_state():
    """Test loading migration state."""
    state = _load_state()
    assert "applied" in state
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p data
CMD ["python", "main.py", "migrate"]
`);

      this.addFile(files, ".dockerignore", `__pycache__
.venv
.git
.env
tests/
README.md
data/
`);
    }

    // Kubernetes
    if (this.config.k8s) {
      this.addFile(files, "k8s/base/job.yaml", `apiVersion: batch/v1
kind: Job
metadata:
  name: ${svc}-migrate
  labels:
    app: ${svc}
spec:
  template:
    metadata:
      labels:
        app: ${svc}
    spec:
      containers:
      - name: ${svc}
        image: ${svc}:latest
        command: ["python", "main.py", "migrate"]
        resources:
          requests:
            cpu: ${this.config.resources.cpuRequest}
            memory: ${this.config.resources.memoryRequest}
          limits:
            cpu: ${this.config.resources.cpuLimit}
            memory: ${this.config.resources.memoryLimit}
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ${svc}-secrets
              key: database-url
      restartPolicy: Never
  backoffLimit: 3
`);

      this.addFile(files, "k8s/base/kustomization.yaml", `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - job.yaml
commonLabels:
  app: ${svc}
`);
    }

    // README
    if (this.config.docs) {
      this.addFile(files, "README.md", `# ${svc}

A database migration and management service generated by IDP CLI.

## Features

- CLI-based migration management
- Create, apply, and rollback migrations
- Database seeding
- Schema versioning
- SQLAlchemy ORM support

## Getting Started

\`\`\`bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
\`\`\`

## Commands

\`\`\`bash
# Run all pending migrations
python main.py migrate

# Create a new migration
python main.py create add-users-table

# Rollback last migration
python main.py rollback

# Rollback N migrations
python main.py rollback --steps 3

# Run seeders
python main.py seed

# Check migration status
python main.py status
\`\`\`

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
