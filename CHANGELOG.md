# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-03-12

### 🚀 Added
- **Service Health Monitoring** (`idp-cli health`)
  - HTTP endpoint health checks with response times
  - Kubernetes deployment status verification
  - Continuous monitoring with watch mode
  - Beautiful formatted output with health summaries
  - Environment-specific health checks

- **Service Dependency Visualization** (`idp-cli deps`)
  - Multiple output formats: tree, table, Mermaid diagrams
  - Circular dependency detection and reporting
  - Deployment order calculation based on dependencies
  - Environment variable dependency extraction
  - Integration with service configuration files

- **Environment Status Check** (`idp-cli env-status`)
  - Kubernetes cluster connectivity verification
  - Docker/registry status checking
  - Monitoring stack validation (Prometheus, Grafana)
  - GitOps tools verification (ArgoCD, Flux)
  - Component-specific or full environment checks
  - Detailed and summary output modes

### 📦 Dependencies
- Added `requests>=2.28.0` for HTTP health checks

### 🧪 Testing
- Added comprehensive test suites for all new commands
- 29 new test cases covering all functionality
- All tests passing (54 total tests)

### 📚 Documentation
- Updated README with new feature documentation
- Added usage examples for all new commands
- Updated CLI help text and examples

### 🔧 Internal
- Enhanced error handling and user feedback
- Improved Rich console output formatting
- Better configuration file handling

## [0.2.0] - Previous Release

### 🚀 Added
- Service scaffolding with 11 production-ready templates
- CI/CD pipeline generation (GitHub Actions, GitLab CI, Jenkins)
- Docker configuration with multi-stage builds
- Kubernetes deployment manifests with Kustomize
- GitOps integration (ArgoCD, Flux)
- Monitoring setup (Prometheus, Grafana)
- Documentation generation
- Multi-environment support

---

## [Unreleased]

### 🚀 Planned
- Service catalog integration
- Policy as Code support
- Infrastructure provisioning (Terraform)
- Web portal interface
- Plugin architecture
- Multi-cluster deployment
- Secrets management integration
- Custom template support
