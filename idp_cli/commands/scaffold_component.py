"""Generate / Scaffold command - Add production components (Dockerfile, K8s, CI/CD, GitOps) to existing repositories."""

from pathlib import Path
import click
from rich.panel import Panel

from idp_cli.integrations.docker import generate_docker_config
from idp_cli.integrations.kubernetes import generate_k8s_manifests
from idp_cli.integrations.github.actions import generate_github_actions
from idp_cli.integrations.github.gitlab_ci import generate_gitlab_ci
from idp_cli.integrations.github.jenkins import generate_jenkins_pipeline
from idp_cli.integrations.gitops.argocd import generate_argocd_config
from idp_cli.integrations.gitops.flux import generate_flux_config
from idp_cli.integrations.monitoring.prometheus import generate_monitoring_config
from idp_cli.utils.console import console, print_header, print_success, print_error, print_info


@click.group("generate")
def generate_group() -> None:
    """Scaffold and inject components (Docker, Kubernetes, CI/CD, GitOps) into any existing project."""
    pass


@generate_group.command("dockerfile")
@click.option(
    "--lang",
    "-l",
    type=click.Choice(["python", "javascript", "typescript", "go", "rust"]),
    default="python",
    help="Language and runtime ecosystem.",
    show_default=True,
)
@click.option(
    "--name",
    "-n",
    default="app",
    help="Name of the service/app.",
    show_default=True,
)
@click.option(
    "--output-dir",
    "-o",
    type=click.Path(),
    default=".",
    help="Target directory where Dockerfile should be generated.",
    show_default=True,
)
def generate_docker(lang: str, name: str, output_dir: str) -> None:
    """Generate an optimized, secure multi-stage Dockerfile and docker-compose.yml."""
    target = Path(output_dir).resolve()
    generate_docker_config(target, name, lang)
    print_success(f"Generated Dockerfile and docker-compose.yml for [bold cyan]{name}[/bold cyan] ({lang}) in [dim]{target}[/dim]")


@generate_group.command("k8s")
@click.option(
    "--name",
    "-n",
    required=True,
    help="Service name for Kubernetes manifests.",
)
@click.option(
    "--port",
    "-p",
    default=8080,
    type=int,
    help="Container target port.",
    show_default=True,
)
@click.option(
    "--output-dir",
    "-o",
    type=click.Path(),
    default=".",
    help="Target directory.",
    show_default=True,
)
def generate_k8s(name: str, port: int, output_dir: str) -> None:
    """Generate production Kubernetes Deployment, Service, Ingress, HPA, and Kustomize overlays."""
    target = Path(output_dir).resolve()
    generate_k8s_manifests(target, name)
    print_success(f"Generated Kubernetes Kustomize manifests for [bold cyan]{name}[/bold cyan] (Port {port}) in [dim]{target}/k8s[/dim]")


@generate_group.command("ci")
@click.option(
    "--provider",
    "-p",
    type=click.Choice(["github-actions", "gitlab-ci", "jenkins"]),
    default="github-actions",
    help="CI/CD orchestration provider.",
    show_default=True,
)
@click.option(
    "--lang",
    "-l",
    type=click.Choice(["python", "javascript", "typescript", "go", "rust"]),
    default="python",
    help="Programming language for testing and linting jobs.",
    show_default=True,
)
@click.option(
    "--name",
    "-n",
    default="service",
    help="Service name.",
    show_default=True,
)
@click.option(
    "--output-dir",
    "-o",
    type=click.Path(),
    default=".",
    help="Target directory.",
    show_default=True,
)
def generate_ci(provider: str, lang: str, name: str, output_dir: str) -> None:
    """Generate automated CI/CD pipeline configuration (lint, test, build, deploy)."""
    target = Path(output_dir).resolve()
    if provider == "github-actions":
        generate_github_actions(target, name, lang)
    elif provider == "gitlab-ci":
        generate_gitlab_ci(target, name, lang)
    elif provider == "jenkins":
        generate_jenkins_pipeline(target, name, lang)
    print_success(f"Generated [bold cyan]{provider}[/bold cyan] pipeline for [white]{name}[/white] in [dim]{target}[/dim]")


@generate_group.command("gitops")
@click.option(
    "--tool",
    "-t",
    type=click.Choice(["argocd", "flux"]),
    default="argocd",
    help="GitOps deployment controller.",
    show_default=True,
)
@click.option(
    "--name",
    "-n",
    required=True,
    help="Application name for GitOps sync.",
)
@click.option(
    "--output-dir",
    "-o",
    type=click.Path(),
    default=".",
    help="Target directory.",
    show_default=True,
)
def generate_gitops(tool: str, name: str, output_dir: str) -> None:
    """Generate GitOps application manifests for declarative continuous delivery."""
    target = Path(output_dir).resolve()
    if tool == "argocd":
        generate_argocd_config(target, name)
    elif tool == "flux":
        generate_flux_config(target, name)
    print_success(f"Generated [bold cyan]{tool.upper()}[/bold cyan] GitOps configuration for [white]{name}[/white] in [dim]{target}/gitops[/dim]")
