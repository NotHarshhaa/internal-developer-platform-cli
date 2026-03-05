"""List templates command."""

import click
from rich.table import Table
from rich import box

from idp_cli import __version__
from idp_cli.config.settings import AVAILABLE_TEMPLATES, CI_PROVIDERS, DEPLOY_TARGETS, GITOPS_TOOLS
from idp_cli.utils.console import console, print_banner

# Language icons for visual flair
_LANG_ICONS = {
    "python": "[yellow]Python[/yellow]",
    "javascript": "[green]Node.js[/green]",
}

_FRAMEWORK_BADGES = {
    "fastapi": "[bold white on blue] FastAPI [/bold white on blue]",
    "express": "[bold white on green] Express [/bold white on green]",
    "celery": "[bold white on red] Celery [/bold white on red]",
}


@click.command("list-templates")
def list_templates() -> None:
    """List all available service templates."""
    print_banner(__version__)

    # --- Service Templates ---
    tpl_table = Table(
        title="[bold]Service Templates[/bold]",
        box=box.ROUNDED,
        border_style="cyan",
        header_style="bold bright_white on dark_blue",
        title_style="bold cyan",
        show_lines=True,
        padding=(0, 1),
        expand=True,
    )
    tpl_table.add_column("Template", style="bold cyan", min_width=14)
    tpl_table.add_column("Language", justify="center", min_width=10)
    tpl_table.add_column("Framework", justify="center", min_width=12)
    tpl_table.add_column("Description", style="white")

    for key, info in AVAILABLE_TEMPLATES.items():
        lang_display = _LANG_ICONS.get(info["language"], info["language"])
        fw_display = _FRAMEWORK_BADGES.get(info["framework"], info["framework"])
        tpl_table.add_row(key, lang_display, fw_display, info["description"])

    console.print(tpl_table)
    console.print()

    # --- CI/CD and Deploy side by side ---
    ci_table = Table(
        title="[bold]CI/CD Providers[/bold]",
        box=box.ROUNDED,
        border_style="magenta",
        header_style="bold bright_white on dark_magenta",
        title_style="bold magenta",
        show_lines=False,
        padding=(0, 1),
    )
    ci_table.add_column("Provider", style="bold magenta", min_width=16)
    ci_table.add_column("Description", style="white")

    for key, info in CI_PROVIDERS.items():
        ci_table.add_row(key, info["description"])

    deploy_table = Table(
        title="[bold]Deployment Targets[/bold]",
        box=box.ROUNDED,
        border_style="green",
        header_style="bold bright_white on dark_green",
        title_style="bold green",
        show_lines=False,
        padding=(0, 1),
    )
    deploy_table.add_column("Target", style="bold green", min_width=12)
    deploy_table.add_column("Description", style="white")

    for key, info in DEPLOY_TARGETS.items():
        deploy_table.add_row(key, info["description"])

    # Print side by side using columns
    from rich.columns import Columns
    console.print(Columns([ci_table, deploy_table], padding=2))
    console.print()

    # --- GitOps Tools ---
    gitops_table = Table(
        title="[bold]GitOps Tools[/bold]",
        box=box.ROUNDED,
        border_style="yellow",
        header_style="bold bright_white on dark_red",
        title_style="bold yellow",
        show_lines=False,
        padding=(0, 1),
    )
    gitops_table.add_column("Tool", style="bold yellow", min_width=10)
    gitops_table.add_column("Name", style="white", min_width=10)
    gitops_table.add_column("Description", style="white")

    for key, info in GITOPS_TOOLS.items():
        gitops_table.add_row(key, info["name"], info["description"])

    console.print(gitops_table)
    console.print()

    # Usage hint
    console.print(
        "  [dim]Usage:[/dim]  [bold]idp-cli create-service[/bold] "
        "[cyan]<name>[/cyan] "
        "[dim]--template[/dim] [cyan]<template>[/cyan] "
        "[dim]--ci[/dim] [magenta]<provider>[/magenta] "
        "[dim]--deploy[/dim] [green]<target>[/green]"
    )
    console.print()
