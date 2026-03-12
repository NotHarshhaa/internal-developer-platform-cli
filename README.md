# 🚀 Internal Developer Platform (IDP) CLI

A powerful CLI tool that enables **self-service infrastructure, service creation, and operational observability for developers**, following modern **Platform Engineering principles**.

The IDP CLI automates the creation of production-ready services by generating **repositories, CI/CD pipelines, Kubernetes deployments, and observability integrations** — enabling developers to bootstrap new services in seconds.

**NEW in v0.3.0**: Enhanced with **service health monitoring, dependency visualization, and environment status checking** for complete platform observability.

---

## 🎯 Problem

In many organizations, creating a new service requires multiple manual steps:

- Requesting a repository
- Setting up CI/CD pipelines
- Writing Dockerfiles
- Creating Kubernetes manifests
- Configuring monitoring and alerts
- Setting up environments

This process slows down development and increases operational overhead. Additionally, **monitoring service health, understanding dependencies, and verifying environment readiness** remain challenging tasks for platform teams.

---

## 💡 Solution

The **Internal Developer Platform CLI** provides a **self-service developer platform** where engineers can create fully configured services with a single command, plus **monitor their health, visualize dependencies, and verify environment readiness**.

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

**Plus new operational capabilities**:

```bash
# Monitor service health across environments
idp-cli health --environment dev

# Visualize service dependencies and deployment order
idp-cli deps --format mermaid --check-cycles

# Verify environment infrastructure readiness
idp-cli env-status --component kubernetes
```

---

## ✨ Features

### 🔧 Service Scaffolding

Generate production-ready microservices using prebuilt templates.

#### 🌐 Backend APIs

| Template | Description | Language | Framework |
|---|---|---|---|
| `python-api` | Production-ready Python API service | Python | FastAPI |
| `node-api` | Production-ready Node.js API service | JavaScript | Express |
| `go-api` | Production-ready Go API service | Go | Gin |
| `rust-api` | High-performance Rust API service | Rust | Axum |
| `python-graphql` | GraphQL API with Strawberry and FastAPI | Python | Strawberry |
| `ml-inference` | Machine learning model inference API | Python | FastAPI |

#### 🎨 Frontend Applications

| Template | Description | Language | Framework |
|---|---|---|---|
| `react-frontend` | React frontend with TypeScript and Vite | TypeScript | React |
| `nextjs-fullstack` | Full-stack application with Next.js | TypeScript | Next.js |
| `static-site` | Modern static site with HTML, CSS, JS | JavaScript | Vanilla |

#### 🛠️ Developer Tools

| Template | Description | Language | Framework |
|---|---|---|---|
| `python-cli` | Command-line tool with Click and Rich | Python | Click |
| `worker` | Background worker/job processing service | Python | Celery |

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

### 🏥 Service Health Monitoring

Monitor the health and availability of your deployed services across different environments.

```bash
# Check health of all services in dev environment
idp-cli health --environment dev

# Check health of a specific service
idp-cli health --service payment-api --environment staging

# Continuously monitor service health
idp-cli health --watch --interval 15
```

### 🔗 Service Dependency Visualization

Understand service relationships and identify potential issues like circular dependencies.

```bash
# Show dependency tree
idp-cli deps --environment dev --format tree

# Show dependency table with deployment order
idp-cli deps --format table --deployment-order

# Generate Mermaid diagram for documentation
idp-cli deps --format mermaid

# Check for circular dependencies
idp-cli deps --check-cycles
```

### 🌍 Environment Status Check

Verify that your environment infrastructure is ready for deployments.

```bash
# Check all environment components
idp-cli env-status --environment dev

# Check specific component only
idp-cli env-status --component kubernetes --detailed

# Check production environment readiness
idp-cli env-status --environment production
```

### 📄 Documentation Generation

Auto-generated documentation:

- `README.md` — Quick start, project structure, next steps
- `docs/deployment.md` — Deployment guide for all environments
- `docs/architecture.md` — Architecture overview and design principles

### 🎯 Template Coverage

The IDP CLI supports **11 production-ready templates** covering the entire modern development stack:

| Category | Templates | Use Cases |
|---|---|---|
| **Backend APIs** (6) | `python-api`, `node-api`, `go-api`, `rust-api`, `python-graphql`, `ml-inference` | Microservices, APIs, GraphQL, ML services |
| **Frontend Apps** (3) | `react-frontend`, `nextjs-fullstack`, `static-site` | SPAs, full-stack apps, marketing sites |
| **Developer Tools** (2) | `python-cli`, `worker` | CLI tools, background jobs, task processing |

Each template includes:
- ✅ Production-ready code with best practices
- ✅ Comprehensive testing setup
- ✅ Docker configuration (multi-stage, secure)
- ✅ Kubernetes manifests with HPA
- ✅ CI/CD pipelines (GitHub/GitLab/Jenkins)
- ✅ Monitoring and observability
- ✅ Environment-specific configs
- ✅ Complete documentation

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

**Latest Version**: v0.3.0 (includes health monitoring, dependency visualization, and environment status checking)

---

## 🖥️ Usage

### Create a Service

```bash
# Python API service
idp-cli create-service payment-service --template python-api

# Go API service
idp-cli create-service user-service --template go-api

# React frontend
idp-cli create-service web-app --template react-frontend

# Rust API service
idp-cli create-service auth-service --template rust-api
```

### Create Service with Full Options

```bash
# Full-stack Next.js application with complete CI/CD
idp-cli create-service my-app \
  --template nextjs-fullstack \
  --ci github-actions \
  --deploy kubernetes \
  --gitops argocd \
  --output-dir ./services

# High-performance Go API with GitLab CI
idp-cli create-service api-gateway \
  --template go-api \
  --ci gitlab-ci \
  --deploy kubernetes
```

### List Available Templates

```bash
idp-cli list-templates
```

### Check Service Health

```bash
# Check all services in dev environment
idp-cli health --environment dev

# Monitor specific service continuously
idp-cli health --service payment-api --watch --interval 30
```

### Visualize Service Dependencies

```bash
# Show dependency tree
idp-cli deps --environment dev

# Check for circular dependencies and show deployment order
idp-cli deps --check-cycles --deployment-order
```

### Check Environment Status

```bash
# Check all environment components
idp-cli env-status --environment dev

# Check specific component with details
idp-cli env-status --component kubernetes --detailed
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
idp-cli health --help
idp-cli deps --help
idp-cli env-status --help
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
│ Health Monitor     │ → Service health checks and monitoring
├───────────────────┤
│ Dependency Analyzer│ → Service relationships and deployment order
├───────────────────┤
│ Environment Checker│ → Infrastructure readiness validation
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
- **Provide operational observability** (health monitoring, dependency visualization)
- **Ensure environment readiness** before deployments
- **Automate platform operations** and reduce manual overhead

---

## 👨‍💻 Who Is This For?

- Platform Engineers
- DevOps Engineers
- Cloud Engineers
- SRE teams
- Engineering organizations building Internal Developer Platforms

---

## � Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and release notes.

---

## �🚀 Roadmap

- [x] Service health monitoring
- [x] Service dependency visualization  
- [x] Environment status checking
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
