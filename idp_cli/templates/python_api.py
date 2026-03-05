"""Python API (FastAPI) service template."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import write_file


class PythonAPITemplate(BaseTemplate):
    """Generate a production-ready Python FastAPI service."""

    @property
    def template_name(self) -> str:
        return "python-api"

    @property
    def language(self) -> str:
        return "python"

    @property
    def framework(self) -> str:
        return "fastapi"

    def generate_app_code(self) -> None:
        svc = self.service_name
        svc_under = svc.replace("-", "_")
        app_dir = self.service_dir / "app"

        # Main application
        write_file(
            app_dir / "__init__.py",
            f'"""Application package for {svc}."""\n',
        )

        write_file(
            app_dir / "main.py",
            f'''"""Main FastAPI application for {svc}."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.health import health_router

app = FastAPI(
    title="{svc}",
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
''',
        )

        # API routes
        write_file(
            app_dir / "api" / "__init__.py",
            '"""API package."""\n',
        )

        write_file(
            app_dir / "api" / "routes.py",
            f'''"""API routes for {svc}."""

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
    new_item = {{"id": _counter, "name": item.name, "description": item.description}}
    _items.append(new_item)
    return new_item


@router.get("/items/{{item_id}}", response_model=ItemResponse)
async def get_item(item_id: int):
    """Get an item by ID."""
    for item in _items:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")


@router.delete("/items/{{item_id}}", status_code=204)
async def delete_item(item_id: int):
    """Delete an item by ID."""
    global _items
    _items = [item for item in _items if item["id"] != item_id]
''',
        )

        # Core config
        write_file(
            app_dir / "core" / "__init__.py",
            '"""Core package."""\n',
        )

        write_file(
            app_dir / "core" / "config.py",
            f'''"""Application configuration for {svc}."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "{svc}"
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
''',
        )

        # Health check
        write_file(
            app_dir / "core" / "health.py",
            f'''"""Health check endpoints for {svc}."""

from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {{"status": "healthy", "service": "{svc}"}}


@health_router.get("/ready")
async def readiness_check():
    """Readiness probe endpoint."""
    return {{"status": "ready", "service": "{svc}"}}
''',
        )

    def generate_config_files(self) -> None:
        write_file(
            self.service_dir / "requirements.txt",
            """fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
httpx==0.26.0
python-dotenv==1.0.0
prometheus-client==0.19.0
structlog==24.1.0
""",
        )

        write_file(
            self.service_dir / "requirements-dev.txt",
            """pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
httpx==0.26.0
ruff==0.1.14
mypy==1.8.0
black==24.1.1
""",
        )

        write_file(
            self.service_dir / ".env.example",
            f"""# {self.service_name} environment configuration
APP_NAME={self.service_name}
DEBUG=false
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info
""",
        )

        write_file(
            self.service_dir / ".gitignore",
            """__pycache__/
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
""",
        )

    def generate_tests(self) -> None:
        tests_dir = self.service_dir / "tests"

        write_file(
            tests_dir / "__init__.py",
            '"""Test package."""\n',
        )

        write_file(
            tests_dir / "conftest.py",
            '''"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client."""
    with TestClient(app) as c:
        yield c
''',
        )

        write_file(
            tests_dir / "test_health.py",
            '''"""Health check endpoint tests."""


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
''',
        )

        write_file(
            tests_dir / "test_api.py",
            '''"""API endpoint tests."""


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
''',
        )
