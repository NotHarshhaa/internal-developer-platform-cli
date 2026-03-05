"""Create service command - the main scaffolding command."""

from pathlib import Path

import click

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
    print_success,
    print_error,
    print_header,
    print_step,
    print_info,
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

    print_header(f"Creating Service: {service_name}")
    print_info(f"Template: {template_name}")
    print_info(f"CI/CD: {ci}")
    print_info(f"Deploy: {deploy}")
    print_info(f"Output: {output_path}")
    click.echo()

    try:
        # 1. Generate service from template
        print_step("Step 1/7: Generating service scaffold...")
        template = get_template(template_name, service_name, output_path)
        template.generate()

        # 2. Generate Docker configuration
        if not no_docker:
            print_step("Step 2/7: Generating Docker configuration...")
            generate_docker_config(service_path, service_name, template.language)
        else:
            print_step("Step 2/7: Skipping Docker configuration")

        # 3. Generate CI/CD pipeline
        print_step("Step 3/7: Generating CI/CD pipeline...")
        _generate_ci_pipeline(ci, service_path, service_name, template.language)

        # 4. Generate Kubernetes manifests
        if not no_k8s:
            print_step("Step 4/7: Generating Kubernetes manifests...")
            generate_k8s_manifests(service_path, service_name)
        else:
            print_step("Step 4/7: Skipping Kubernetes manifests")

        # 5. Generate GitOps configuration
        if gitops != "none":
            print_step(f"Step 5/7: Generating GitOps configuration ({gitops})...")
            _generate_gitops(gitops, service_path, service_name)
        else:
            print_step("Step 5/7: Skipping GitOps configuration")

        # 6. Generate monitoring configuration
        if not no_monitoring:
            print_step("Step 6/7: Generating monitoring configuration...")
            generate_monitoring_config(service_path, service_name)
        else:
            print_step("Step 6/7: Skipping monitoring configuration")

        # 7. Generate documentation
        if not no_docs:
            print_step("Step 7/7: Generating documentation...")
            generate_documentation(
                service_path, service_name, template_name, template.language, ci
            )
        else:
            print_step("Step 7/7: Skipping documentation")

        click.echo()
        print_success(f"Service '{service_name}' created successfully!")
        print_info(f"Location: {service_path}")
        click.echo()
        click.echo("Next steps:")
        click.echo(f"  cd {service_name}")
        if template.language == "python":
            click.echo("  pip install -r requirements.txt")
            click.echo("  uvicorn app.main:app --reload")
        elif template.language == "javascript":
            click.echo("  npm install")
            click.echo("  npm run dev")

    except Exception as e:
        print_error(f"Failed to create service: {e}")
        raise SystemExit(1)


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
