"""Main CLI entry point for the Internal Developer Platform CLI."""

import sys
import click
from rich.panel import Panel
from rich.table import Table
from rich import box

from idp_cli import __version__
from idp_cli.commands.create_service import create_service
from idp_cli.commands.list_templates import list_templates
from idp_cli.commands.health_check import health_check
from idp_cli.commands.dependency_viz import dependency_viz
from idp_cli.commands.environment_status import environment_status
from idp_cli.commands.service_management import service_group
from idp_cli.commands.environment_management import env_group
from idp_cli.commands.enhanced_health import enhanced_health
from idp_cli.utils.console import console


class IDPGroup(click.Group):
    """Custom Click group that displays the banner before help."""

    def format_help(self, ctx, formatter):
        from idp_cli.utils.console import print_banner
        print_banner(__version__)
        super().format_help(ctx, formatter)


def print_version(ctx, param, value):
    """Display beautiful version information."""
    if not value or ctx.resilient_parsing:
        return

    # Create a beautiful version panel
    version_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=False,
        padding=(0, 1),
    )
    version_table.add_column("Property", style="bold cyan", min_width=12)
    version_table.add_column("Value", style="white")

    version_table.add_row("CLI Version", f"[bold green]{__version__}[/bold green]")
    version_table.add_row("Python", f"[dim]{sys.version.split()[0]}[/dim]")
    version_table.add_row("Platform", f"[dim]{sys.platform}[/dim]")

    console.print()
    console.print(
        Panel(
            version_table,
            title="[bold white]IDP CLI[/bold white]",
            subtitle="[dim]Internal Developer Platform[/dim]",
            border_style="cyan",
            box=box.DOUBLE,
            padding=(1, 2),
        )
    )
    console.print()

    # Links section
    links_table = Table(
        box=None,
        show_header=False,
        padding=(0, 0),
    )
    links_table.add_column("", style="dim")
    links_table.add_row("  📦 [link=https://pypi.org/project/idp-cli/]PyPI[/link]")
    links_table.add_row("  📖 [link=https://github.com/notHarshhaa/internal-developer-platform-cli]GitHub[/link]")
    links_table.add_row("  🐛 [link=https://github.com/notHarshhaa/internal-developer-platform-cli/issues]Issues[/link]")

    console.print(links_table)
    console.print()

    ctx.exit()


@click.group(cls=IDPGroup)
@click.option(
    "--version",
    is_flag=True,
    callback=print_version,
    expose_value=False,
    is_eager=True,
    help="Show version information and exit.",
)
def cli():
    """Self-service infrastructure for developers.

    \b
    Create production-ready services with CI/CD, Docker, Kubernetes,
    monitoring, and documentation — all in seconds.

    \b
    Service Management:
      idp-cli service list --environment prod
      idp-cli service info payment-service
      idp-cli service restart user-service --environment staging
      idp-cli service logs worker-service --follow

    \b
    Environment Management:
      idp-cli env list
      idp-cli env create staging --base dev
      idp-cli env promote payment-service --from dev --to staging
      idp-cli env diff staging production

    \b
    Health Monitoring:
      idp-cli health --environment prod
      idp-cli health --service payment-service --detailed
      idp-cli health --watch --interval 15
      idp-cli health --trends 24

    \b
    Service Creation:
      idp-cli create-service payment-service --template python-api
      idp-cli create-service user-service --template node-api --ci github-actions

    \b
    Other Commands:
      idp-cli list-templates
      idp-cli deps --format tree
      idp-cli env-status --environment staging
    """
    pass


# Register commands
cli.add_command(create_service)
cli.add_command(list_templates)
cli.add_command(health_check)
cli.add_command(enhanced_health)
cli.add_command(dependency_viz)
cli.add_command(environment_status)
cli.add_command(service_group)
cli.add_command(env_group)


def main():
    """Entry point for the CLI."""
    cli()


if __name__ == "__main__":
    main()
