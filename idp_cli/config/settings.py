"""Default configuration and settings for the IDP CLI."""

import os
from pathlib import Path

# Default settings
DEFAULTS = {
    "output_dir": os.getcwd(),
    "default_template": "python-api",
    "default_ci": "github-actions",
    "default_deploy": "kubernetes",
    "environments": ["dev", "staging", "production"],
    "container_registry": "ghcr.io",
    "k8s_namespace": "default",
}

# Available templates
AVAILABLE_TEMPLATES = {
    "python-api": {
        "name": "Python API (FastAPI)",
        "description": "Production-ready Python API service using FastAPI",
        "language": "python",
        "framework": "fastapi",
    },
    "node-api": {
        "name": "Node.js API",
        "description": "Production-ready Node.js API service using Express",
        "language": "javascript",
        "framework": "express",
    },
    "worker": {
        "name": "Worker Service",
        "description": "Background worker/job processing service",
        "language": "python",
        "framework": "celery",
    },
    "ml-inference": {
        "name": "ML Inference Service",
        "description": "Machine learning model inference API service",
        "language": "python",
        "framework": "fastapi",
    },
    "go-api": {
        "name": "Go API",
        "description": "Production-ready Go API service using Gin framework",
        "language": "go",
        "framework": "gin",
    },
    "python-graphql": {
        "name": "Python GraphQL API",
        "description": "Python GraphQL API service using Strawberry and FastAPI",
        "language": "python",
        "framework": "strawberry",
    },
    "react-frontend": {
        "name": "React Frontend",
        "description": "React frontend application with TypeScript and Vite",
        "language": "typescript",
        "framework": "react",
    },
    "nextjs-fullstack": {
        "name": "Next.js Full-stack",
        "description": "Full-stack application using Next.js with TypeScript",
        "language": "typescript",
        "framework": "nextjs",
    },
    "python-cli": {
        "name": "Python CLI Tool",
        "description": "Python command-line tool using Click framework",
        "language": "python",
        "framework": "click",
    },
    "rust-api": {
        "name": "Rust API",
        "description": "Production-ready Rust API service using Axum framework",
        "language": "rust",
        "framework": "axum",
    },
    "static-site": {
        "name": "Static Site",
        "description": "Static site generator using HTML, CSS, and JavaScript",
        "language": "javascript",
        "framework": "vanilla",
    },
}

# CI/CD providers
CI_PROVIDERS = {
    "github-actions": {
        "name": "GitHub Actions",
        "description": "CI/CD using GitHub Actions workflows",
    },
    "gitlab-ci": {
        "name": "GitLab CI",
        "description": "CI/CD using GitLab CI/CD pipelines",
    },
    "jenkins": {
        "name": "Jenkins",
        "description": "CI/CD using Jenkins pipelines",
    },
}

# Deployment targets
DEPLOY_TARGETS = {
    "kubernetes": {
        "name": "Kubernetes",
        "description": "Deploy using Kubernetes manifests",
    },
    "helm": {
        "name": "Helm",
        "description": "Deploy using Helm charts",
    },
}

# GitOps tools
GITOPS_TOOLS = {
    "argocd": {
        "name": "ArgoCD",
        "description": "GitOps with ArgoCD",
    },
    "flux": {
        "name": "Flux",
        "description": "GitOps with Flux CD",
    },
}


def get_config_dir() -> Path:
    """Get the IDP CLI configuration directory."""
    config_dir = Path.home() / ".idp-cli"
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir
