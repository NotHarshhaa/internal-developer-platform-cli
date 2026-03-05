"""Main CLI entry point for the Internal Developer Platform CLI."""

import click

from idp_cli import __version__
from idp_cli.commands.create_service import create_service
from idp_cli.commands.list_templates import list_templates
from idp_cli.utils.console import print_banner


class IDPGroup(click.Group):
    """Custom Click group that displays the banner before help."""

    def format_help(self, ctx, formatter):
        print_banner(__version__)
        super().format_help(ctx, formatter)


@click.group(cls=IDPGroup)
@click.version_option(version=__version__, prog_name="idp-cli")
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
