import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class PythonAPITemplate extends BaseTemplate {
  get templateName(): string {
    return "python-api";
  }

  get language(): string {
    return "python";
  }

  get framework(): string {
    return "fastapi";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcUnder = this.getServiceNameUnderscore();

    // App package
    this.addFile(files, "app/__init__.py", `"""Application package for ${svc}."""\n`);

    // Main application
    this.addFile(
      files,
      "app/main.py",
      `"""Main FastAPI application for ${svc}."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.health import health_router

app = FastAPI(
    title="${svc}",
    description="Auto-generated service by IDP CLI",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
app.include_router(health_router, tags=["health"])

# API routes
app.include_router(router, prefix="/api/v1", tags=["api"])


@app.on_event("startup")
async def startup_event():
    """Run startup tasks."""
    pass


@app.on_event("shutdown")
async def shutdown_event():
    """Run shutdown tasks."""
    pass
`
    );

    // API routes
    this.addFile(files, "app/api/__init__.py", '"""API package."""\n');

    this.addFile(
      files,
      "app/api/routes.py",
      `"""API routes for ${svc}."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class ItemCreate(BaseModel):
    """Schema for creating an item."""
    name: str
    description: Optional[str] = None


class ItemResponse(BaseModel):
    """Schema for item response."""
    id: int
    name: str
    description: Optional[str] = None


# In-memory storage for demo purposes
_items: List[dict] = []
_counter = 0


@router.get("/items", response_model=List[ItemResponse])
async def list_items():
    """List all items."""
    return _items


@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate):
    """Create a new item."""
    global _counter
    _counter += 1
    new_item = {"id": _counter, "name": item.name, "description": item.description}
    _items.append(new_item)
    return new_item


@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    """Get an item by ID."""
    for item in _items:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    """Delete an item by ID."""
    global _items
    _items = [item for item in _items if item["id"] != item_id]
`
    );

    // Core config
    this.addFile(files, "app/core/__init__.py", '"""Core package."""\n');

    this.addFile(
      files,
      "app/core/config.py",
      `"""Application configuration for ${svc}."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "${svc}"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"
    ALLOWED_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
`
    );

    // Health check
    this.addFile(
      files,
      "app/core/health.py",
      `"""Health check endpoints for ${svc}."""

from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "${svc}"}


@health_router.get("/ready")
async def readiness_check():
    """Readiness probe endpoint."""
    return {"status": "ready", "service": "${svc}"}
`
    );

    // Config files
    this.addFile(
      files,
      "requirements.txt",
      `fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
httpx==0.26.0
python-dotenv==1.0.0
prometheus-client==0.19.0
structlog==24.1.0
`
    );

    this.addFile(
      files,
      "requirements-dev.txt",
      `pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
httpx==0.26.0
ruff==0.1.14
mypy==1.8.0
black==24.1.1
`
    );

    this.addFile(
      files,
      ".env.example",
      `# ${this.config.name} environment configuration
APP_NAME=${this.config.name}
DEBUG=false
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info
`
    );

    this.addFile(
      files,
      ".gitignore",
      `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/
dist/
build/
.eggs/
.mypy_cache/
.pytest_cache/
.ruff_cache/
.coverage
htmlcov/
.env
*.log
`
    );

    // Tests
    this.addFile(files, "tests/__init__.py", '"""Test package."""\n');

    this.addFile(
      files,
      "tests/conftest.py",
      `"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client."""
    with TestClient(app) as c:
        yield c
`
    );

    this.addFile(
      files,
      "tests/test_health.py",
      `"""Health check endpoint tests."""


def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_readiness_check(client):
    """Test the readiness check endpoint."""
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
`
    );

    this.addFile(
      files,
      "tests/test_api.py",
      `"""API endpoint tests."""


def test_list_items_empty(client):
    """Test listing items when empty."""
    response = client.get("/api/v1/items")
    assert response.status_code == 200
    assert response.json() == []


def test_create_item(client):
    """Test creating a new item."""
    response = client.post(
        "/api/v1/items",
        json={"name": "Test Item", "description": "A test item"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["id"] is not None


def test_get_item_not_found(client):
    """Test getting a non-existent item."""
    response = client.get("/api/v1/items/99999")
    assert response.status_code == 404
`
    );

    // Docker file
    if (this.config.docker) {
      this.addFile(
        files,
        "Dockerfile",
        `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`
      );

      this.addFile(
        files,
        ".dockerignore",
        `__pycache__
*.pyc
.env
.venv
venv/
.git
.gitignore
README.md
tests/
.pytest_cache
.coverage
htmlcov/
`
      );
    }

    // Kubernetes manifests
    if (this.config.k8s) {
      this.addFile(
        files,
        "k8s/base/deployment.yaml",
        `apiVersion: apps/v1
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
        ports:
        - containerPort: 8000
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
        - name: PORT
          value: "8000"
`
      );

      this.addFile(
        files,
        "k8s/base/service.yaml",
        `apiVersion: v1
kind: Service
metadata:
  name: ${svc}
  labels:
    app: ${svc}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
  selector:
    app: ${svc}
`
      );

      this.addFile(
        files,
        "k8s/base/kustomization.yaml",
        `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

commonLabels:
  app: ${svc}
`
      );
    }

    // README
    if (this.config.docs) {
      this.addFile(
        files,
        "README.md",
        `# ${svc}

A production-ready FastAPI service generated by IDP CLI.

## Features

- FastAPI with async support
- CORS middleware
- Health check endpoints
- RESTful API with CRUD operations
- Type-safe with Pydantic
- Docker support
- Kubernetes manifests
- Comprehensive tests

## Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

\`\`\`bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

### Running Locally

\`\`\`bash
# Set environment variables
cp .env.example .env

# Run the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

The API will be available at http://localhost:8000

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

\`\`\`bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
\`\`\`

## Docker

\`\`\`bash
# Build image
docker build -t ${svc} .

# Run container
docker run -p 8000:8000 ${svc}
\`\`\`

## Kubernetes

\`\`\`bash
# Deploy to Kubernetes
kubectl apply -k k8s/base

# Check deployment
kubectl get pods -l app=${svc}
\`\`\`

## Project Structure

\`\`\`
${svc}/
├── app/
│   ├── api/
│   │   └── routes.py       # API endpoints
│   ├── core/
│   │   ├── config.py       # Configuration
│   │   └── health.py       # Health checks
│   └── main.py             # FastAPI app
├── tests/                  # Test suite
├── requirements.txt        # Dependencies
├── Dockerfile             # Docker image
└── k8s/                   # Kubernetes manifests
\`\`\`
`
      );
    }

    return files;
  }
}
