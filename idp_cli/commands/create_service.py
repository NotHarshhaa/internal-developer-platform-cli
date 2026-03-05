"""Create service command - the main scaffolding command."""

import time
from pathlib import Path

import click
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

from idp_cli import __version__
from idp_cli.config.settings import (
    AVAILABLE_TEMPLATES,
    CI_PROVIDERS,
    DEPLOY_TARGETS,
    DEFAULTS,
)
from idp_cli.templates.registry import get_template
from idp_cli.integrations.docker import generate_docker_config
from idp_cli.integrations.kubernetes import generate_k8s_manifests
from idp_cli.integrations.github.actions import generate_github_actions
from idp_cli.integrations.github.gitlab_ci import generate_gitlab_ci
from idp_cli.integrations.github.jenkins import generate_jenkins_pipeline
from idp_cli.integrations.gitops.argocd import generate_argocd_config
from idp_cli.integrations.gitops.flux import generate_flux_config
from idp_cli.integrations.monitoring.prometheus import generate_monitoring_config
from idp_cli.integrations.docs import generate_documentation
from idp_cli.utils.file_utils import validate_service_name
from idp_cli.utils.console import (
    console,
    print_banner,
    print_success,
    print_error,
    print_step,
    print_config_panel,
    print_next_steps,
)


@click.command("create-service")
@click.argument("service_name")
@click.option(
    "--template",
    "-t",
    "template_name",
    type=click.Choice(list(AVAILABLE_TEMPLATES.keys())),
    default=DEFAULTS["default_template"],
    help="Service template to use.",
    show_default=True,
)
@click.option(
    "--ci",
    type=click.Choice(list(CI_PROVIDERS.keys())),
    default=DEFAULTS["default_ci"],
    help="CI/CD provider.",
    show_default=True,
)
@click.option(
    "--deploy",
    type=click.Choice(list(DEPLOY_TARGETS.keys())),
    default=DEFAULTS["default_deploy"],
    help="Deployment target.",
    show_default=True,
)
@click.option(
    "--gitops",
    type=click.Choice(["argocd", "flux", "none"]),
    default="none",
    help="GitOps tool to configure.",
    show_default=True,
)
@click.option(
    "--output-dir",
    "-o",
    type=click.Path(),
    default=".",
    help="Output directory for the generated service.",
    show_default=True,
)
@click.option(
    "--no-docker",
    is_flag=True,
    default=False,
    help="Skip Docker configuration generation.",
)
@click.option(
    "--no-k8s",
    is_flag=True,
    default=False,
    help="Skip Kubernetes manifest generation.",
)
@click.option(
    "--no-monitoring",
    is_flag=True,
    default=False,
    help="Skip monitoring configuration generation.",
)
@click.option(
    "--no-docs",
    is_flag=True,
    default=False,
    help="Skip documentation generation.",
)
def create_service(
    service_name: str,
    template_name: str,
    ci: str,
    deploy: str,
    gitops: str,
    output_dir: str,
    no_docker: bool,
    no_k8s: bool,
    no_monitoring: bool,
    no_docs: bool,
) -> None:
    """Create a new service with the specified template and configuration.

    SERVICE_NAME is the name of the service to create (e.g., payment-service).
    """
    # Validate service name
    if not validate_service_name(service_name):
        print_error(
            f"Invalid service name '{service_name}'. "
            "Must be lowercase, alphanumeric with hyphens, and at least 2 characters."
        )
        raise SystemExit(1)

    output_path = Path(output_dir).resolve()
    service_path = output_path / service_name

    # Check if service directory already exists
    if service_path.exists():
        print_error(f"Directory '{service_path}' already exists. Aborting.")
        raise SystemExit(1)

    # Show banner and config
    print_banner(__version__)

    print_config_panel("Service Configuration", {
        "Service Name": service_name,
        "Template": f"{template_name} ({AVAILABLE_TEMPLATES[template_name]['name']})",
        "CI/CD": f"{ci} ({CI_PROVIDERS[ci]['name']})",
        "Deploy": f"{deploy} ({DEPLOY_TARGETS[deploy]['name']})",
        "GitOps": gitops,
        "Output": str(output_path),
    })
    console.print()

    # Build the list of steps
    steps = []
    steps.append(("Service Scaffold", lambda: _step_scaffold(template_name, service_name, output_path)))
    steps.append(("Docker Configuration", lambda: _step_docker(no_docker, service_path, service_name, template_name)))
    steps.append(("CI/CD Pipeline", lambda: _step_ci(ci, service_path, service_name, template_name)))
    steps.append(("Kubernetes Manifests", lambda: _step_k8s(no_k8s, service_path, service_name)))
    steps.append(("GitOps Configuration", lambda: _step_gitops(gitops, service_path, service_name)))
    steps.append(("Monitoring & Observability", lambda: _step_monitoring(no_monitoring, service_path, service_name)))
    steps.append(("Documentation", lambda: _step_docs(no_docs, service_path, service_name, template_name, ci)))

    template = None

    try:
        with Progress(
            SpinnerColumn(style="cyan"),
            TextColumn("[bold white]{task.description}"),
            BarColumn(bar_width=30, style="dim", complete_style="cyan", finished_style="green"),
            TaskProgressColumn(),
            console=console,
        ) as progress:
            overall = progress.add_task("[bold cyan]Creating service...", total=len(steps))

            for step_name, step_fn in steps:
                progress.update(overall, description=f"[bold cyan]{step_name}...")
                result = step_fn()
                if result is not None:
                    template = result
                progress.advance(overall)

        console.print()

        # Success summary
        from rich.panel import Panel
        from rich import box

        # Get language from template
        lang = AVAILABLE_TEMPLATES[template_name]["language"]

        summary_lines = [
            f"  [bold green]✓[/bold green] Service [bold cyan]{service_name}[/bold cyan] created successfully!",
            f"  [bold green]✓[/bold green] Location: [dim]{service_path}[/dim]",
            "",
            f"  [dim]Template:[/dim]    {template_name}",
            f"  [dim]CI/CD:[/dim]       {ci}",
            f"  [dim]Docker:[/dim]      {'✓' if not no_docker else '✗ skipped'}",
            f"  [dim]Kubernetes:[/dim]  {'✓' if not no_k8s else '✗ skipped'}",
            f"  [dim]GitOps:[/dim]      {gitops if gitops != 'none' else '✗ skipped'}",
            f"  [dim]Monitoring:[/dim]  {'✓' if not no_monitoring else '✗ skipped'}",
            f"  [dim]Docs:[/dim]        {'✓' if not no_docs else '✗ skipped'}",
        ]

        console.print(Panel(
            "\n".join(summary_lines),
            title="[bold green]Service Created[/bold green]",
            border_style="green",
            box=box.DOUBLE,
            padding=(1, 2),
        ))

        # Next steps
        next_steps = [f"[bold]cd[/bold] {service_name}"]
        if lang == "python":
            next_steps.append("[bold]pip install[/bold] -r requirements.txt")
            next_steps.append("[bold]uvicorn[/bold] app.main:app --reload")
        elif lang == "javascript":
            next_steps.append("[bold]npm install[/bold]")
            next_steps.append("[bold]npm run[/bold] dev")
        next_steps.append("[bold]docker build[/bold] -t {name}:latest .".format(name=service_name))

        print_next_steps(next_steps)
        console.print()

    except Exception as e:
        print_error(f"Failed to create service: {e}")
        raise SystemExit(1)


def _step_scaffold(template_name, service_name, output_path):
    """Generate service scaffold from template."""
    template = get_template(template_name, service_name, output_path)
    template.generate()
    return template


def _step_docker(no_docker, service_path, service_name, template_name):
    """Generate Docker configuration."""
    if not no_docker:
        lang = AVAILABLE_TEMPLATES[template_name]["language"]
        generate_docker_config(service_path, service_name, lang)


def _step_ci(ci, service_path, service_name, template_name):
    """Generate CI/CD pipeline."""
    lang = AVAILABLE_TEMPLATES[template_name]["language"]
    _generate_ci_pipeline(ci, service_path, service_name, lang)


def _step_k8s(no_k8s, service_path, service_name):
    """Generate Kubernetes manifests."""
    if not no_k8s:
        generate_k8s_manifests(service_path, service_name)


def _step_gitops(gitops, service_path, service_name):
    """Generate GitOps configuration."""
    if gitops != "none":
        _generate_gitops(gitops, service_path, service_name)


def _step_monitoring(no_monitoring, service_path, service_name):
    """Generate monitoring configuration."""
    if not no_monitoring:
        generate_monitoring_config(service_path, service_name)


def _step_docs(no_docs, service_path, service_name, template_name, ci):
    """Generate documentation."""
    if not no_docs:
        lang = AVAILABLE_TEMPLATES[template_name]["language"]
        generate_documentation(service_path, service_name, template_name, lang, ci)


def _generate_ci_pipeline(ci: str, service_dir: Path, service_name: str, language: str) -> None:
    """Generate CI/CD pipeline based on the selected provider."""
    if ci == "github-actions":
        generate_github_actions(service_dir, service_name, language)
    elif ci == "gitlab-ci":
        generate_gitlab_ci(service_dir, service_name, language)
    elif ci == "jenkins":
        generate_jenkins_pipeline(service_dir, service_name, language)


def _generate_gitops(gitops: str, service_dir: Path, service_name: str) -> None:
    """Generate GitOps configuration based on the selected tool."""
    if gitops == "argocd":
        generate_argocd_config(service_dir, service_name)
    elif gitops == "flux":
        generate_flux_config(service_dir, service_name)
