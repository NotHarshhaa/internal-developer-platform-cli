"""Console output utilities using Rich for beautiful CLI formatting."""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.theme import Theme
from rich import box

# Custom theme for the IDP CLI
_theme = Theme({
    "info": "cyan",
    "success": "bold green",
    "warning": "bold yellow",
    "error": "bold red",
    "step": "dim cyan",
    "highlight": "bold magenta",
    "muted": "dim white",
})

console = Console(theme=_theme)

# ASCII banner for the CLI
BANNER = r"""[bold cyan]
  _____ _____  _____     _____ _      _____
 |_   _|  __ \|  __ \   / ____| |    |_   _|
   | | | |  | | |__) | | |    | |      | |
   | | | |  | |  ___/  | |    | |      | |
  _| |_| |__| | |      | |____| |____ _| |_
 |_____|_____/|_|       \_____|______|_____|
[/bold cyan]
[dim]  Internal Developer Platform CLI  v{version}[/dim]
[dim]  Self-service infrastructure for developers[/dim]
"""


def print_banner(version: str = "0.1.0") -> None:
    """Print the IDP CLI banner."""
    console.print(BANNER.format(version=version))


def print_success(message: str) -> None:
    """Print a success message."""
    console.print(f"  [success]✓[/success] {message}")


def print_error(message: str) -> None:
    """Print an error message."""
    console.print(f"  [error]✗ {message}[/error]", style="error")


def print_warning(message: str) -> None:
    """Print a warning message."""
    console.print(f"  [warning]⚠ {message}[/warning]")


def print_info(message: str) -> None:
    """Print an info message."""
    console.print(f"  [info]ℹ[/info] {message}")


def print_step(step: str) -> None:
    """Print a step in a process."""
    console.print(f"    [step]→[/step] {step}")


def print_header(title: str) -> None:
    """Print a section header as a Rich panel."""
    console.print()
    console.print(
        Panel(
            Text(title, justify="center", style="bold white"),
            border_style="cyan",
            box=box.DOUBLE,
            padding=(0, 2),
        )
    )
    console.print()


def print_table(headers: list, rows: list, title: str = None) -> None:
    """Print a beautifully formatted Rich table."""
    table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        header_style="bold bright_white",
        title=title,
        title_style="bold cyan",
        show_lines=False,
        padding=(0, 1),
    )

    for header in headers:
        table.add_column(header)

    for row in rows:
        table.add_row(*[str(cell) for cell in row])

    console.print(table)


def print_config_panel(title: str, items: dict) -> None:
    """Print a configuration summary in a panel."""
    lines = []
    for key, value in items.items():
        lines.append(f"  [bold]{key}:[/bold]  [cyan]{value}[/cyan]")
    content = "\n".join(lines)

    console.print(
        Panel(
            content,
            title=f"[bold]{title}[/bold]",
            border_style="bright_blue",
            box=box.ROUNDED,
            padding=(1, 2),
        )
    )


def print_next_steps(steps: list) -> None:
    """Print next steps in a styled panel."""
    lines = []
    for i, step in enumerate(steps, 1):
        lines.append(f"  [bold cyan]{i}.[/bold cyan] [white]{step}[/white]")
    content = "\n".join(lines)

    console.print()
    console.print(
        Panel(
            content,
            title="[bold yellow]Next Steps[/bold yellow]",
            border_style="yellow",
            box=box.ROUNDED,
            padding=(1, 2),
        )
    )
