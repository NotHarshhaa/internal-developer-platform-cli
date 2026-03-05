"""Documentation generator for services."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_documentation(
    service_dir: Path,
    service_name: str,
    template_name: str,
    language: str,
    ci_provider: str = "github-actions",
) -> None:
    """Generate documentation templates for a service."""
    print_step("Generating documentation...")
    docs_dir = service_dir / "docs"

    _generate_readme(service_dir, service_name, template_name, language, ci_provider)
    _generate_deployment_guide(docs_dir, service_name, ci_provider)
    _generate_architecture_doc(docs_dir, service_name, template_name)


def _generate_readme(
    service_dir: Path,
    service_name: str,
    template_name: str,
    language: str,
    ci_provider: str,
) -> None:
    run_cmd = {
        "python": "uvicorn app.main:app --reload",
        "javascript": "npm run dev",
    }.get(language, "python app/main.py")

    test_cmd = {
        "python": "pytest --cov=app -v",
        "javascript": "npm test",
    }.get(language, "pytest")

    install_cmd = {
        "python": "pip install -r requirements.txt",
        "javascript": "npm install",
    }.get(language, "pip install -r requirements.txt")

    write_file(
        service_dir / "README.md",
        f"""# {service_name}

> Auto-generated service using IDP CLI (`{template_name}` template)

## Overview

This service was scaffolded by the **Internal Developer Platform CLI** and includes:

- Production-ready application code
- CI/CD pipeline configuration
- Docker containerization
- Kubernetes deployment manifests
- Monitoring and observability setup

## Quick Start

### Prerequisites

- {"Python 3.11+" if language == "python" else "Node.js 20+"}
- Docker
- kubectl (for Kubernetes deployment)

### Installation

```bash
{install_cmd}
```

### Running Locally

```bash
{run_cmd}
```

### Running Tests

```bash
{test_cmd}
```

### Building Docker Image

```bash
docker build -t {service_name}:latest .
docker run -p 8000:8000 {service_name}:latest
```

## Project Structure

```
{service_name}/
├── {"app/" if language == "python" else "src/"}
│   ├── {"main.py" if language == "python" else "index.js"}
│   ├── {"api/" if language == "python" else "routes/"}
│   └── {"core/" if language == "python" else "config/"}
├── tests/
├── k8s/
│   ├── base/
│   └── overlays/
├── monitoring/
├── {"requirements.txt" if language == "python" else "package.json"}
├── Dockerfile
└── README.md
```

## Deployment

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## Architecture

See [Architecture Overview](docs/architecture.md) for design details.

## CI/CD

This service uses **{ci_provider}** for continuous integration and deployment.

Pipeline stages:
1. **Lint** — Code quality checks
2. **Test** — Unit and integration tests
3. **Security** — Dependency and code scanning
4. **Build** — Docker image build and push
5. **Deploy** — Kubernetes deployment

## Monitoring

- **Metrics**: Prometheus metrics exposed at `/metrics`
- **Dashboard**: Grafana dashboard in `monitoring/grafana-dashboard.json`
- **Alerts**: Prometheus rules in `monitoring/prometheus-rules.yaml`

## License

MIT
""",
    )


def _generate_deployment_guide(docs_dir: Path, service_name: str, ci_provider: str) -> None:
    write_file(
        docs_dir / "deployment.md",
        f"""# Deployment Guide — {service_name}

## Prerequisites

- Access to the Kubernetes cluster
- `kubectl` configured with appropriate context
- Container registry credentials

## Environments

| Environment | Namespace            | Replicas |
|-------------|----------------------|----------|
| dev         | {service_name}-dev   | 1        |
| staging     | {service_name}-staging | 2      |
| production  | {service_name}-production | 3   |

## Manual Deployment

### 1. Build and Push Docker Image

```bash
docker build -t ghcr.io/org/{service_name}:latest .
docker push ghcr.io/org/{service_name}:latest
```

### 2. Deploy to Kubernetes

```bash
# Deploy to dev
kubectl apply -k k8s/overlays/dev/

# Deploy to staging
kubectl apply -k k8s/overlays/staging/

# Deploy to production
kubectl apply -k k8s/overlays/production/
```

### 3. Verify Deployment

```bash
kubectl get pods -n {service_name}-dev
kubectl logs -f deployment/{service_name} -n {service_name}-dev
```

## GitOps Deployment

If using ArgoCD or Flux, apply the GitOps manifests from the `gitops/` directory.

### ArgoCD

```bash
kubectl apply -f gitops/argocd/
```

### Flux

```bash
kubectl apply -f gitops/flux/
```

## Rollback

```bash
kubectl rollout undo deployment/{service_name} -n {service_name}-<env>
```
""",
    )


def _generate_architecture_doc(docs_dir: Path, service_name: str, template_name: str) -> None:
    write_file(
        docs_dir / "architecture.md",
        f"""# Architecture Overview — {service_name}

## Template

This service was generated using the `{template_name}` template from the IDP CLI.

## Components

```
┌─────────────────────────────────────────┐
│              Load Balancer              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Kubernetes Service            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         {service_name:^25s}         │
│         (Deployment / Pods)             │
├─────────────────────────────────────────┤
│  - Health checks (/health, /ready)      │
│  - Metrics endpoint (/metrics)          │
│  - API endpoints (/api/v1/...)          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          Monitoring Stack               │
│  - Prometheus (metrics collection)      │
│  - Grafana (dashboards)                 │
│  - Alertmanager (alerts)                │
└─────────────────────────────────────────┘
```

## Design Principles

- **12-Factor App** methodology
- **Health checks** for Kubernetes liveness/readiness probes
- **Structured logging** for observability
- **Metrics instrumentation** for monitoring
- **Configuration via environment variables**
- **Non-root container** for security

## Scaling

Horizontal Pod Autoscaler (HPA) is configured with:
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%
""",
    )
