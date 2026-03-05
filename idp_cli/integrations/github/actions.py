"""GitHub Actions CI/CD pipeline generator."""

from pathlib import Path
from typing import Dict

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_github_actions(service_dir: Path, service_name: str, language: str) -> None:
    """Generate GitHub Actions workflow files for a service."""
    print_step("Generating GitHub Actions workflows...")
    workflows_dir = service_dir / ".github" / "workflows"

    if language == "python":
        _generate_python_workflow(workflows_dir, service_name)
    elif language == "javascript":
        _generate_node_workflow(workflows_dir, service_name)
    else:
        _generate_python_workflow(workflows_dir, service_name)

    _generate_docker_workflow(workflows_dir, service_name)
    _generate_deploy_workflow(workflows_dir, service_name)


def _generate_python_workflow(workflows_dir: Path, service_name: str) -> None:
    """Generate CI workflow for Python services."""
    write_file(
        workflows_dir / "ci.yml",
        f"""name: CI - {service_name}

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: "3.11"

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{{{ env.PYTHON_VERSION }}}}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run linting
        run: ruff check .

      - name: Check formatting
        run: black --check .

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{{{ env.PYTHON_VERSION }}}}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run tests
        run: pytest --cov=app --cov-report=xml -v

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{{{ env.PYTHON_VERSION }}}}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install bandit safety

      - name: Run Bandit security scan
        run: bandit -r app/ -f json -o bandit-report.json || true

      - name: Check dependencies for vulnerabilities
        run: safety check -r requirements.txt || true
""",
    )


def _generate_node_workflow(workflows_dir: Path, service_name: str) -> None:
    """Generate CI workflow for Node.js services."""
    write_file(
        workflows_dir / "ci.yml",
        f"""name: CI - {service_name}

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{{{ env.NODE_VERSION }}}}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{{{ env.NODE_VERSION }}}}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{{{ env.NODE_VERSION }}}}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --production || true
""",
    )


def _generate_docker_workflow(workflows_dir: Path, service_name: str) -> None:
    """Generate Docker build and push workflow."""
    write_file(
        workflows_dir / "docker.yml",
        f"""name: Docker Build - {service_name}

on:
  push:
    branches: [main]
    tags: ["v*"]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{{{{{ github.repository }}}}}}/{service_name}

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{{{{{ env.REGISTRY }}}}}}
          username: ${{{{{{ github.actor }}}}}}
          password: ${{{{{{ secrets.GITHUB_TOKEN }}}}}}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{{{{{ env.REGISTRY }}}}}}/${{{{{{ env.IMAGE_NAME }}}}}}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{{{{{version}}}}}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{{{{{ steps.meta.outputs.tags }}}}}}
          labels: ${{{{{{ steps.meta.outputs.labels }}}}}}
          cache-from: type=gha
          cache-to: type=gha,mode=max
""",
    )


def _generate_deploy_workflow(workflows_dir: Path, service_name: str) -> None:
    """Generate deployment workflow."""
    write_file(
        workflows_dir / "deploy.yml",
        f"""name: Deploy - {service_name}

on:
  workflow_run:
    workflows: ["Docker Build - {service_name}"]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    name: Deploy to Kubernetes
    runs-on: ubuntu-latest
    if: ${{{{{{ github.event.workflow_run.conclusion == 'success' }}}}}}

    steps:
      - uses: actions/checkout@v4

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{{{{{ secrets.KUBECONFIG }}}}}}" | base64 -d > $HOME/.kube/config

      - name: Deploy to cluster
        run: |
          kubectl apply -f k8s/
          kubectl rollout status deployment/{service_name} -n default --timeout=300s
""",
    )
