"""Docker configuration generator."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_docker_config(service_dir: Path, service_name: str, language: str) -> None:
    """Generate Docker configuration for a service."""
    print_step("Generating Docker configuration...")

    if language == "python":
        _generate_python_dockerfile(service_dir, service_name)
    elif language == "javascript":
        _generate_node_dockerfile(service_dir, service_name)
    else:
        _generate_python_dockerfile(service_dir, service_name)

    _generate_dockerignore(service_dir, language)


def _generate_python_dockerfile(service_dir: Path, service_name: str) -> None:
    """Generate optimized multi-stage Dockerfile for Python services."""
    write_file(
        service_dir / "Dockerfile",
        f"""# ---- Build Stage ----
FROM python:3.11-slim AS builder

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Production Stage ----
FROM python:3.11-slim AS production

# Security: run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
""",
    )


def _generate_node_dockerfile(service_dir: Path, service_name: str) -> None:
    """Generate optimized multi-stage Dockerfile for Node.js services."""
    write_file(
        service_dir / "Dockerfile",
        f"""# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci --only=production

# ---- Production Stage ----
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /build/node_modules ./node_modules

# Copy application code
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "src/index.js"]
""",
    )


def _generate_dockerignore(service_dir: Path, language: str) -> None:
    """Generate .dockerignore file."""
    common = """# Version control
.git
.gitignore

# CI/CD
.github
.gitlab-ci.yml
Jenkinsfile

# Documentation
*.md
docs/

# IDE
.vscode
.idea
*.swp
*.swo

# Kubernetes
k8s/
helm/

# Environment files
.env
.env.*
!.env.example
"""

    if language == "python":
        specific = """
# Python
__pycache__
*.py[cod]
*.so
.Python
venv/
.venv/
*.egg-info/
dist/
build/
.mypy_cache/
.pytest_cache/
.ruff_cache/
.coverage
htmlcov/
tests/
"""
    elif language == "javascript":
        specific = """
# Node.js
node_modules/
coverage/
.nyc_output/
tests/
"""
    else:
        specific = ""

    write_file(service_dir / ".dockerignore", common + specific)
