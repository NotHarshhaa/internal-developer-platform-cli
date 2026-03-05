"""Python GraphQL API template using Strawberry and FastAPI."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import create_directory, write_file


class GraphQLTemplate(BaseTemplate):
    """Template for Python GraphQL API services using Strawberry and FastAPI."""

    @property
    def template_name(self) -> str:
        return "python-graphql"

    @property
    def language(self) -> str:
        return "python"

    @property
    def framework(self) -> str:
        return "strawberry"

    def generate_app_code(self) -> None:
        """Generate Python GraphQL application code."""
        # Create directories
        create_directory(self.service_dir / "app")
        create_directory(self.service_dir / "app" / "schemas")
        create_directory(self.service_dir / "app" / "models")
        create_directory(self.service_dir / "app" / "services")

        # Generate main.py
        main_py = '''"""FastAPI application with GraphQL support."""

import strawberry
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from app.schemas.query import Query
from app.schemas.mutation import Mutation

# Create FastAPI app
app = FastAPI(
    title="{{.service_name}} API",
    description="GraphQL API built with FastAPI and Strawberry",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create GraphQL schema
schema = strawberry.Schema(query=Query, mutation=Mutation)

# Create GraphQL router
graphql_app = GraphQLRouter(schema)

# Mount GraphQL endpoint
app.add_route("/graphql", graphql_app)
app.add_websocket_route("/graphql", graphql_app)

# GraphQL Playground endpoint
@app.get("/")
async def graphql_playground():
    """Redirect to GraphQL Playground."""
    return {
        "message": "GraphQL API",
        "graphql_endpoint": "/graphql",
        "playground": "https://graphql-playground.vercel.app/?endpoint=http://localhost:8000/graphql"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "{{.service_name}}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
        write_file(self.service_dir / "app" / "main.py", main_py, self.get_template_vars())

        # Generate GraphQL schema files
        query_py = '''"""GraphQL Query definitions."""

import strawberry
from typing import List
from app.models.user import User
from app.services.user_service import UserService


@strawberry.type
class Query:
    """Root query type."""

    @strawberry.field
    def users(self) -> List[User]:
        """Get all users."""
        return UserService.get_all_users()

    @strawberry.field
    def user(self, id: strawberry.ID) -> User:
        """Get user by ID."""
        return UserService.get_user_by_id(int(id))

    @strawberry.field
    def hello(self, name: str = "World") -> str:
        """Simple hello query."""
        return f"Hello, {name}!"
'''
        write_file(self.service_dir / "app" / "schemas" / "query.py", query_py, self.get_template_vars())

        mutation_py = '''"""GraphQL Mutation definitions."""

import strawberry
from app.models.user import User, UserInput
from app.services.user_service import UserService


@strawberry.type
class Mutation:
    """Root mutation type."""

    @strawberry.mutation
    def create_user(self, user_input: UserInput) -> User:
        """Create a new user."""
        return UserService.create_user(user_input)

    @strawberry.mutation
    def update_user(self, id: strawberry.ID, user_input: UserInput) -> User:
        """Update an existing user."""
        return UserService.update_user(int(id), user_input)

    @strawberry.mutation
    def delete_user(self, id: strawberry.ID) -> bool:
        """Delete a user."""
        return UserService.delete_user(int(id))
'''
        write_file(self.service_dir / "app" / "schemas" / "mutation.py", mutation_py, self.get_template_vars())

        # Generate models
        user_model_py = '''"""User model definitions."""

import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class User:
    """User model."""
    id: strawberry.ID
    name: str
    email: str
    created_at: datetime
    updated_at: datetime


@strawberry.input
class UserInput:
    """User input for mutations."""
    name: str
    email: str


@strawberry.input
class UserUpdateInput:
    """User update input for mutations."""
    name: Optional[str] = None
    email: Optional[str] = None
'''
        write_file(self.service_dir / "app" / "models" / "user.py", user_model_py, self.get_template_vars())

        # Generate services
        user_service_py = '''"""User service layer."""

from typing import List, Optional
from datetime import datetime
from app.models.user import User, UserInput


class UserService:
    """Service for managing users."""

    # In-memory storage (replace with database in production)
    _users = [
        User(
            id=1,
            name="John Doe",
            email="john@example.com",
            created_at=datetime.now(),
            updated_at=datetime.now()
        ),
        User(
            id=2,
            name="Jane Smith",
            email="jane@example.com",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    ]
    _next_id = 3

    @classmethod
    def get_all_users(cls) -> List[User]:
        """Get all users."""
        return cls._users

    @classmethod
    def get_user_by_id(cls, user_id: int) -> Optional[User]:
        """Get user by ID."""
        for user in cls._users:
            if int(user.id) == user_id:
                return user
        return None

    @classmethod
    def create_user(cls, user_input: UserInput) -> User:
        """Create a new user."""
        user = User(
            id=cls._next_id,
            name=user_input.name,
            email=user_input.email,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        cls._users.append(user)
        cls._next_id += 1
        return user

    @classmethod
    def update_user(cls, user_id: int, user_input: UserInput) -> Optional[User]:
        """Update an existing user."""
        for i, user in enumerate(cls._users):
            if int(user.id) == user_id:
                cls._users[i].name = user_input.name
                cls._users[i].email = user_input.email
                cls._users[i].updated_at = datetime.now()
                return cls._users[i]
        return None

    @classmethod
    def delete_user(cls, user_id: int) -> bool:
        """Delete a user."""
        for i, user in enumerate(cls._users):
            if int(user.id) == user_id:
                del cls._users[i]
                return True
        return False
'''
        write_file(self.service_dir / "app" / "services" / "user_service.py", user_service_py, self.get_template_vars())

        # Generate __init__.py files
        write_file(self.service_dir / "app" / "__init__.py", "")
        write_file(self.service_dir / "app" / "schemas" / "__init__.py", "")
        write_file(self.service_dir / "app" / "models" / "__init__.py", "")
        write_file(self.service_dir / "app" / "services" / "__init__.py", "")

    def generate_config_files(self) -> None:
        """Generate Python configuration files."""
        # requirements.txt
        requirements_txt = '''fastapi>=0.104.0
uvicorn[standard]>=0.24.0
strawberry-graphql>=0.215.0
python-dotenv>=1.0.0
pydantic>=2.5.0
'''
        write_file(self.service_dir / "requirements.txt", requirements_txt)

        # .env.example
        env_example = '''# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Database Configuration (if needed)
DATABASE_URL=sqlite:///./{{.service_name_underscore}}.db

# CORS Configuration
CORS_ORIGINS=["*"]
'''
        write_file(self.service_dir / ".env.example", env_example, self.get_template_vars())

        # .gitignore
        gitignore = '''# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
target/

# Jupyter Notebook
.ipynb_checkpoints

# IPython
profile_default/
ipython_config.py

# pyenv
.python-version

# pipenv
Pipfile.lock

# PEP 582
__pypackages__/

# Celery stuff
celerybeat-schedule
celerybeat.pid

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# Pyre type checker
.pyre/

# Database
*.db
*.sqlite
'''
        write_file(self.service_dir / ".gitignore", gitignore)

    def generate_tests(self) -> None:
        """Generate test files."""
        create_directory(self.service_dir / "tests")

        # Test main app
        test_main_py = '''"""Test main application."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_graphql_endpoint():
    """Test GraphQL endpoint."""
    query = """
    query {
        hello
    }
    """
    response = client.post("/graphql", json={"query": query})
    assert response.status_code == 200
    assert "data" in response.json()


def test_get_users():
    """Test getting users via GraphQL."""
    query = """
    query {
        users {
            id
            name
            email
        }
    }
    """
    response = client.post("/graphql", json={"query": query})
    assert response.status_code == 200
    data = response.json()["data"]
    assert "users" in data
    assert len(data["users"]) >= 2


def test_create_user():
    """Test creating a user via GraphQL."""
    mutation = """
    mutation {
        createUser(userInput: {name: "Test User", email: "test@example.com"}) {
            id
            name
            email
        }
    }
    """
    response = client.post("/graphql", json={"query": mutation})
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["createUser"]["name"] == "Test User"
    assert data["createUser"]["email"] == "test@example.com"
'''
        write_file(self.service_dir / "tests" / "test_main.py", test_main_py, self.get_template_vars())

        # Test services
        test_user_service_py = '''"""Test user service."""

import pytest
from app.services.user_service import UserService
from app.models.user import UserInput


def test_get_all_users():
    """Test getting all users."""
    users = UserService.get_all_users()
    assert len(users) >= 2


def test_create_user():
    """Test creating a user."""
    user_input = UserInput(name="Test User", email="test@example.com")
    user = UserService.create_user(user_input)
    
    assert user.name == "Test User"
    assert user.email == "test@example.com"


def test_get_user_by_id():
    """Test getting user by ID."""
    user = UserService.get_user_by_id(1)
    assert user is not None
    assert user.name == "John Doe"


def test_update_user():
    """Test updating a user."""
    user_input = UserInput(name="Updated Name", email="updated@example.com")
    user = UserService.update_user(1, user_input)
    
    assert user is not None
    assert user.name == "Updated Name"
    assert user.email == "updated@example.com"


def test_delete_user():
    """Test deleting a user."""
    # First create a user
    user_input = UserInput(name="To Delete", email="delete@example.com")
    created_user = UserService.create_user(user_input)
    
    # Then delete them
    result = UserService.delete_user(int(created_user.id))
    assert result is True
    
    # Verify they're gone
    deleted_user = UserService.get_user_by_id(int(created_user.id))
    assert deleted_user is None
'''
        write_file(self.service_dir / "tests" / "test_user_service.py", test_user_service_py, self.get_template_vars())

        # Test __init__.py
        write_file(self.service_dir / "tests" / "__init__.py", "")

        # pytest.ini
        pytest_ini = '''[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
'''
        write_file(self.service_dir / "pytest.ini", pytest_ini)
