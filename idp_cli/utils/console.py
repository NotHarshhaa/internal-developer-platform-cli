"""Console output utilities with rich formatting."""

import click


def print_success(message: str) -> None:
    """Print a success message."""
    click.echo(click.style(f"✅ {message}", fg="green"))


def print_error(message: str) -> None:
    """Print an error message."""
    click.echo(click.style(f"❌ {message}", fg="red"), err=True)


def print_warning(message: str) -> None:
    """Print a warning message."""
    click.echo(click.style(f"⚠️  {message}", fg="yellow"))


def print_info(message: str) -> None:
    """Print an info message."""
    click.echo(click.style(f"ℹ️  {message}", fg="blue"))


def print_step(step: str) -> None:
    """Print a step in a process."""
    click.echo(click.style(f"  → {step}", fg="cyan"))


def print_header(title: str) -> None:
    """Print a section header."""
    click.echo()
    click.echo(click.style(f"{'=' * 60}", fg="bright_white"))
    click.echo(click.style(f"  {title}", fg="bright_white", bold=True))
    click.echo(click.style(f"{'=' * 60}", fg="bright_white"))
    click.echo()


def print_table(headers: list, rows: list) -> None:
    """Print a simple table."""
    col_widths = []
    for i, header in enumerate(headers):
        max_width = len(header)
        for row in rows:
            if i < len(row):
                max_width = max(max_width, len(str(row[i])))
        col_widths.append(max_width + 2)

    # Header
    header_str = ""
    for i, header in enumerate(headers):
        header_str += header.ljust(col_widths[i])
    click.echo(click.style(header_str, bold=True))
    click.echo("-" * sum(col_widths))

    # Rows
    for row in rows:
        row_str = ""
        for i, cell in enumerate(row):
            row_str += str(cell).ljust(col_widths[i])
        click.echo(row_str)
