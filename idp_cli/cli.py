"""Main CLI entry point for the Internal Developer Platform CLI."""

import sys
import click
from rich.panel import Panel
from rich.table import Table
from rich import box

from idp_cli import __version__
from idp_cli.commands.create_service import create_service
from idp_cli.commands.list_templates import list_templates
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
    Examples:
      idp-cli create-service payment-service --template python-api
      idp-cli create-service user-service --template node-api --ci github-actions
      idp-cli list-templates
    """
    pass


# Register commands
cli.add_command(create_service)
cli.add_command(list_templates)


def main():
    """Entry point for the CLI."""
    cli()


if __name__ == "__main__":
    main()
