"""Config command - Manage global CLI configurations, defaults, and multi-cloud contexts."""

import json
from pathlib import Path
from typing import Any, Dict, Optional

import click
from rich.panel import Panel
from rich.table import Table
from rich import box

from idp_cli.config.settings import get_config_dir, DEFAULTS
from idp_cli.utils.console import console, print_header, print_success, print_error, print_info


def _get_config_file() -> Path:
    """Get the path to the global config file."""
    return get_config_dir() / "config.json"


def _load_user_config() -> Dict[str, Any]:
    """Load configuration from ~/.idp-cli/config.json with default fallbacks."""
    config_file = _get_config_file()
    merged = dict(DEFAULTS)
    if config_file.exists():
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                user_data = json.load(f)
                if isinstance(user_data, dict):
                    merged.update(user_data)
        except Exception:
            pass
    return merged


def _save_user_config(config: Dict[str, Any]) -> None:
    """Persist user configuration to disk."""
    config_file = _get_config_file()
    with open(config_file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)


@click.group("config")
def config_group() -> None:
    """Manage global IDP configuration, defaults, and active cloud contexts."""
    pass


@config_group.command("list")
def list_config() -> None:
    """List all current configuration values and active environment contexts."""
    print_header("IDP CLI Configuration")

    cfg = _load_user_config()

    table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold white",
        padding=(0, 1),
    )
    table.add_column("Configuration Key", style="bold cyan", min_width=22)
    table.add_column("Current Value", style="white", min_width=30)
    table.add_column("Type", style="dim", min_width=12)

    for k, v in sorted(cfg.items()):
        val_str = ", ".join(v) if isinstance(v, list) else str(v)
        val_type = type(v).__name__
        table.add_row(k, val_str, val_type)

    console.print(table)
    console.print()
    print_info(f"Config stored at: [dim]{_get_config_file()}[/dim]")
    console.print()


@config_group.command("get")
@click.argument("key")
def get_config(key: str) -> None:
    """Get the value of a specific configuration key."""
    cfg = _load_user_config()
    if key in cfg:
        val = cfg[key]
        console.print(f"[bold cyan]{key}:[/bold cyan] [white]{val}[/white]")
    else:
        print_error(f"Configuration key '{key}' not found.")
        console.print(f"[dim]Available keys: {', '.join(sorted(cfg.keys()))}[/dim]")


@config_group.command("set")
@click.argument("key")
@click.argument("value")
def set_config(key: str, value: str) -> None:
    """Set a configuration key to a specified value."""
    cfg = _load_user_config()

    # Parse booleans/numbers if applicable
    parsed_value: Any = value
    if value.lower() in ("true", "yes", "1"):
        parsed_value = True
    elif value.lower() in ("false", "no", "0"):
        parsed_value = False
    elif value.isdigit():
        parsed_value = int(value)

    cfg[key] = parsed_value
    _save_user_config(cfg)
    print_success(f"Updated configuration [bold cyan]{key}[/bold cyan] = [white]{parsed_value}[/white]")


@config_group.command("context")
@click.argument("environment", required=False)
def context_command(environment: Optional[str]) -> None:
    """View or switch the active target environment context (e.g. dev, staging, production)."""
    cfg = _load_user_config()
    current = cfg.get("active_environment", "dev")

    if not environment:
        console.print(f"Active Environment Context: [bold green]{current}[/bold green]")
        console.print(f"[dim]Available: dev, staging, production[/dim]")
        return

    env_clean = environment.lower().strip()
    valid_envs = ["dev", "development", "staging", "stg", "prod", "production"]
    if env_clean not in valid_envs:
        print_error(f"Invalid environment '{environment}'. Choose dev, staging, or production.")
        return

    canonical = "dev" if "dev" in env_clean else "staging" if "stag" in env_clean else "production"
    cfg["active_environment"] = canonical
    _save_user_config(cfg)
    print_success(f"Switched active environment context to [bold green]{canonical.upper()}[/bold green]")


@config_group.command("reset")
@click.confirmation_option(prompt="Are you sure you want to reset configuration to factory defaults?")
def reset_config() -> None:
    """Reset configuration back to factory default values."""
    _save_user_config(DEFAULTS)
    print_success("Configuration successfully reset to defaults.")
