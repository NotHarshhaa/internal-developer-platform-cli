"""Main CLI entry point for the Internal Developer Platform CLI."""

import click

from idp_cli import __version__
from idp_cli.commands.create_service import create_service
from idp_cli.commands.list_templates import list_templates


@click.group()
@click.version_option(version=__version__, prog_name="idp-cli")
def cli():
    """Internal Developer Platform CLI — Self-service infrastructure for developers.

    Create production-ready services with CI/CD, Docker, Kubernetes,
    monitoring, and documentation in seconds.

    Examples:

      idp-cli create-service payment-service --template python-api

      idp-cli create-service user-service --template node-api --ci github-actions --deploy kubernetes

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
