"""List templates command."""

import click

from idp_cli.config.settings import AVAILABLE_TEMPLATES, CI_PROVIDERS, DEPLOY_TARGETS, GITOPS_TOOLS
from idp_cli.utils.console import print_header, print_table


@click.command("list-templates")
def list_templates() -> None:
    """List all available service templates."""
    print_header("Available Service Templates")

    rows = []
    for key, info in AVAILABLE_TEMPLATES.items():
        rows.append([key, info["name"], info["language"], info["description"]])

    print_table(
        headers=["Template", "Name", "Language", "Description"],
        rows=rows,
    )

    click.echo()
    print_header("CI/CD Providers")

    ci_rows = []
    for key, info in CI_PROVIDERS.items():
        ci_rows.append([key, info["name"], info["description"]])

    print_table(
        headers=["Provider", "Name", "Description"],
        rows=ci_rows,
    )

    click.echo()
    print_header("Deployment Targets")

    deploy_rows = []
    for key, info in DEPLOY_TARGETS.items():
        deploy_rows.append([key, info["name"], info["description"]])

    print_table(
        headers=["Target", "Name", "Description"],
        rows=deploy_rows,
    )

    click.echo()
    print_header("GitOps Tools")

    gitops_rows = []
    for key, info in GITOPS_TOOLS.items():
        gitops_rows.append([key, info["name"], info["description"]])

    print_table(
        headers=["Tool", "Name", "Description"],
        rows=gitops_rows,
    )
