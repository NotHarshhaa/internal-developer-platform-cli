# 🚀 Internal Developer Platform (IDP) CLI

A powerful CLI tool that enables **self-service infrastructure and service creation for developers**, following modern **Platform Engineering principles**.

The IDP CLI automates the creation of production-ready services by generating **repositories, CI/CD pipelines, Kubernetes deployments, and observability integrations** — enabling developers to bootstrap new services in seconds.

---

## 🎯 Problem

In many organizations, creating a new service requires multiple manual steps:

- Requesting a repository
- Setting up CI/CD pipelines
- Writing Dockerfiles
- Creating Kubernetes manifests
- Configuring monitoring and alerts
- Setting up environments

This process slows down development and increases operational overhead.

---

## 💡 Solution

The **Internal Developer Platform CLI** provides a **self-service developer platform** where engineers can create fully configured services with a single command.

Example:

```bash
idp-cli create-service payment-service --template python-api
```

This automatically generates:

- Service repository with application code
- CI/CD pipeline (GitHub Actions / GitLab CI / Jenkins)
- Docker configuration (multi-stage, non-root)
- Kubernetes deployment manifests (with Kustomize overlays)
- Environment configuration (dev / staging / production)
- Monitoring setup (Prometheus rules, Grafana dashboards)
- Documentation templates (README, deployment guide, architecture)

---

## ✨ Features

### 🔧 Service Scaffolding

Generate production-ready microservices using prebuilt templates.

Supported templates:

| Template | Description | Language | Framework |
|---|---|---|---|
| `python-api` | Production-ready Python API service | Python | FastAPI |
| `node-api` | Production-ready Node.js API service | JavaScript | Express |
| `worker` | Background worker/job processing service | Python | Celery |
| `ml-inference` | Machine learning model inference API | Python | FastAPI |

### ⚙️ CI/CD Automation

Automatically include CI/CD pipelines for new services.

| Provider | Pipeline Includes |
|---|---|
| `github-actions` | Build, Test, Security scan, Docker build, Deploy |
| `gitlab-ci` | Lint, Test, Security, Build, Deploy (staging + production) |
| `jenkins` | Checkout, Lint, Test, Security, Docker build/push, Deploy |

### 🐳 Containerization

Automatically generate optimized Docker configurations:

- Multi-stage builds
- Secure base images
- Non-root containers
- Health checks

### ☸️ Kubernetes Deployment

Generate Kubernetes manifests with Kustomize overlays:

- Deployments with resource limits
- Services (ClusterIP)
- ConfigMaps
- Horizontal Pod Autoscaler
- Liveness, readiness, and startup probes
- Environment-specific overlays (dev/staging/production)

### 🔄 GitOps Integration

Supports GitOps workflows:

| Tool | Generated Artifacts |
|---|---|
| `argocd` | Application manifests per environment, AppProject |
| `flux` | GitRepository source, Kustomization per environment |

### 📊 Observability Integration

Automatically configure monitoring:

- Prometheus alerting rules (error rate, latency, pod restarts)
- ServiceMonitor for Prometheus Operator
- Grafana dashboard template (request rate, latency, errors, CPU, memory)

### 🧩 Multi-Environment Support

Environment-specific configuration via Kustomize overlays:

| Environment | Replicas | CPU Limit | Memory Limit |
|---|---|---|---|
| `dev` | 1 | 250m | 256Mi |
| `staging` | 2 | 500m | 512Mi |
| `production` | 3 | 1000m | 1Gi |

### 📄 Documentation Generation

Auto-generated documentation:

- `README.md` — Quick start, project structure, next steps
- `docs/deployment.md` — Deployment guide for all environments
- `docs/architecture.md` — Architecture overview and design principles

---

## 📦 Installation

```bash
pip install idp-cli
```

Or install from source:

```bash
git clone https://github.com/NotHarshhaa/internal-developer-platform-cli.git
cd internal-developer-platform-cli
pip install -e .
```

---

## 🖥️ Usage

### Create a Service

```bash
idp-cli create-service payment-service --template python-api
```

### Create Service with Full Options

```bash
idp-cli create-service payment-service \
  --template node-api \
  --ci github-actions \
  --deploy kubernetes \
  --gitops argocd \
  --output-dir ./services
```

### List Available Templates

```bash
idp-cli list-templates
```

### Skip Optional Components

```bash
idp-cli create-service my-service \
  --template python-api \
  --no-docker \
  --no-k8s \
  --no-monitoring \
  --no-docs
```

### Get Help

```bash
idp-cli --help
idp-cli create-service --help
```

---

## 🏗️ Project Structure

```
idp-cli/
├── idp_cli/
│   ├── cli.py                    # Main CLI entry point
│   ├── commands/
│   │   ├── create_service.py     # create-service command
│   │   └── list_templates.py     # list-templates command
│   ├── templates/
│   │   ├── base.py               # Base template class
│   │   ├── registry.py           # Template registry
│   │   ├── python_api.py         # Python API template
│   │   ├── node_api.py           # Node.js API template
│   │   ├── worker.py             # Worker service template
│   │   └── ml_inference.py       # ML inference template
│   ├── integrations/
│   │   ├── docker.py             # Dockerfile generator
│   │   ├── kubernetes.py         # K8s manifest generator
│   │   ├── github/
│   │   │   ├── actions.py        # GitHub Actions generator
│   │   │   ├── gitlab_ci.py      # GitLab CI generator
│   │   │   └── jenkins.py        # Jenkins pipeline generator
│   │   ├── gitops/
│   │   │   ├── argocd.py         # ArgoCD config generator
│   │   │   └── flux.py           # Flux CD config generator
│   │   ├── monitoring/
│   │   │   └── prometheus.py     # Prometheus & Grafana generator
│   │   └── docs.py               # Documentation generator
│   ├── config/
│   │   └── settings.py           # Default settings & constants
│   └── utils/
│       ├── file_utils.py         # File operations
│       └── console.py            # Console output formatting
├── tests/
│   ├── test_cli.py
│   ├── test_create_service.py
│   ├── test_templates.py
│   └── test_utils.py
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## 🧠 Architecture Overview

The IDP CLI follows **Platform Engineering principles** by providing a standardized developer experience.

```
Developer Request
        ↓
   IDP CLI (Click)
        ↓
┌───────────────────┐
│ Template Registry  │ → Service code scaffolding
├───────────────────┤
│ CI/CD Generator    │ → GitHub Actions / GitLab CI / Jenkins
├───────────────────┤
│ Docker Generator   │ → Multi-stage Dockerfile + .dockerignore
├───────────────────┤
│ K8s Generator      │ → Deployments, Services, ConfigMaps, HPA
├───────────────────┤
│ GitOps Generator   │ → ArgoCD / Flux manifests
├───────────────────┤
│ Monitoring Gen     │ → Prometheus rules, Grafana dashboards
├───────────────────┤
│ Docs Generator     │ → README, deployment guide, architecture
└───────────────────┘
```

---

## 🧪 Development

```bash
# Clone the repository
git clone https://github.com/NotHarshhaa/internal-developer-platform-cli.git
cd internal-developer-platform-cli

# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest -v

# Run tests with coverage
pytest --cov=idp_cli --cov-report=html -v

# Lint
ruff check idp_cli/

# Format
black idp_cli/ tests/
```

---

## 🎯 Goals

- Enable **self-service infrastructure**
- Standardize service creation
- Reduce DevOps bottlenecks
- Improve developer experience (DevEx)
- Promote platform engineering practices

---

## 👨‍💻 Who Is This For?

- Platform Engineers
- DevOps Engineers
- Cloud Engineers
- SRE teams
- Engineering organizations building Internal Developer Platforms

---

## 🚀 Roadmap

- [ ] Service catalog integration
- [ ] Policy as Code support
- [ ] Infrastructure provisioning (Terraform)
- [ ] Web portal interface
- [ ] Plugin architecture
- [ ] Multi-cluster deployment
- [ ] Secrets management integration
- [ ] Custom template support

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
