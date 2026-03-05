"""Python CLI Tool template using Click framework."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import create_directory, write_file


class PythonCLITemplate(BaseTemplate):
    """Template for Python CLI tools using Click framework."""

    @property
    def template_name(self) -> str:
        return "python-cli"

    @property
    def language(self) -> str:
        return "python"

    @property
    def framework(self) -> str:
        return "click"

    def generate_app_code(self) -> None:
        """Generate Python CLI application code."""
        # Create directories
        create_directory(self.service_dir / "{{.service_name_underscore}}")
        create_directory(self.service_dir / "{{.service_name_underscore}}" / "commands")
        create_directory(self.service_dir / "{{.service_name_underscore}}" / "utils")
        create_directory(self.service_dir / "tests")
        create_directory(self.service_dir / "docs")

        # Generate main CLI module
        cli_py = '''"""Main CLI entry point for {{.service_name}}."""

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box

from {{.service_name_underscore}}.commands.hello import hello_cmd
from {{.service_name_underscore}}.commands.config import config_cmd
from {{.service_name_underscore}}.utils.config import get_config
from {{.service_name_underscore}} import __version__

console = Console()

@click.group()
@click.version_option(version=__version__, prog_name="{{.service_name}}")
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose output")
@click.pass_context
def cli(ctx, verbose):
    """{{.service_name}} - A powerful CLI tool built with Click and Rich."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose

@cli.command()
@click.option("--name", "-n", default="World", help="Name to greet")
@click.option("--count", "-c", default=1, help="Number of greetings")
@click.pass_context
def greet(ctx, name, count):
    """Greet someone with a styled message."""
    verbose = ctx.obj.get("verbose", False)
    
    if verbose:
        console.print(f"[dim]Greeting {name} {count} time(s)...[/dim]")
    
    panel_content = "\\n".join([f"Hello, {name}!" for _ in range(count)])
    
    console.print()
    console.print(
        Panel(
            panel_content,
            title=f"[bold green]Greetings[/bold green]",
            border_style="green",
            box=box.ROUNDED,
            padding=(1, 2),
        )
    )

@cli.command()
def status():
    """Show system status information."""
    table = Table(
        title="[bold cyan]System Status[/bold cyan]",
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
    )
    table.add_column("Component", style="bold white")
    table.add_column("Status", style="green")
    table.add_column("Details", style="dim")
    
    table.add_row("CLI Tool", "✓ Running", f"Version {__version__}")
    table.add_row("Configuration", "✓ Loaded", str(get_config().config_file))
    table.add_row("Environment", "✓ Ready", "All systems operational")
    
    console.print(table)

# Add sub-commands
cli.add_command(hello_cmd, name="hello")
cli.add_command(config_cmd, name="config")

if __name__ == "__main__":
    cli()
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "cli.py", cli_py, self.get_template_vars())

        # Generate __init__.py
        init_py = '''"""{{.service_name}} - A powerful CLI tool."""

__version__ = "0.1.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "__init__.py", init_py, self.get_template_vars())

        # Generate hello command
        hello_cmd_py = '''"""Hello command implementation."""

import click
import time
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from rich import box

console = Console()

@click.command()
@click.option("--name", "-n", default="Friend", help="Name to greet")
@click.option("--style", type=click.Choice(["simple", "fancy", "minimal"]), default="fancy", help="Greeting style")
@click.option("--emoji/--no-emoji", default=True, help="Include emoji in greeting")
def hello_cmd(name, style, emoji):
    """Say hello in different styles."""
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
        transient=True,
    ) as progress:
        task = progress.add_task("Preparing greeting...", total=None)
        time.sleep(0.5)
        progress.update(task, description="Crafting message...")
        time.sleep(0.3)
        progress.update(task, description="Adding style...", completed=True)
    
    greetings = {
        "simple": f"Hi {name}!",
        "fancy": f"🌟Greetings and salutations, {name}!🌟",
        "minimal": f"{name}."
    }
    
    greeting = greetings[style]
    if not emoji:
        greeting = greeting.replace("🌟", "").replace("  ", " ")
    
    style_colors = {
        "simple": "blue",
        "fancy": "magenta",
        "minimal": "white"
    }
    
    color = style_colors[style]
    
    console.print()
    console.print(
        Panel(
            f"[bold {color}]{greeting}[/bold {color}]",
            title=f"[bold white]Hello Command[/bold white]",
            subtitle=f"[dim]Style: {style}[/dim]",
            border_style=color,
            box=box.DOUBLE,
            padding=(1, 3),
        )
    )
    
    if style == "fancy":
        console.print()
        console.print("[dim]✨ Extra fancy greeting delivered! ✨[/dim]")
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "commands" / "hello.py", hello_cmd_py, self.get_template_vars())

        # Generate config command
        config_cmd_py = '''"""Configuration management command."""

import click
import json
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box
from rich.prompt import Prompt, Confirm

from {{.service_name_underscore}}.utils.config import get_config, set_config

console = Console()

@click.group()
def config_cmd():
    """Manage configuration settings."""
    pass

@config_cmd.command("show")
@click.option("--format", type=click.Choice(["table", "json"]), default="table", help="Output format")
def show_config(format):
    """Show current configuration."""
    config = get_config()
    
    if format == "json":
        console.print(json.dumps(config.data, indent=2))
    else:
        table = Table(
            title="[bold cyan]Configuration[/bold cyan]",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
        )
        table.add_column("Setting", style="bold white")
        table.add_column("Value", style="green")
        table.add_column("Description", style="dim")
        
        for key, value in config.data.items():
            description = {
                "name": "Application name",
                "debug": "Enable debug mode",
                "log_level": "Logging level",
                "output_format": "Default output format"
            }.get(key, "Configuration setting")
            
            table.add_row(key, str(value), description)
        
        console.print(table)

@config_cmd.command("set")
@click.argument("key")
@click.argument("value")
def set_config_cmd(key, value):
    """Set a configuration value."""
    config = get_config()
    
    if key not in config.data:
        console.print(f"[red]Error: Unknown configuration key '{key}'[/red]")
        return
    
    # Convert value to appropriate type
    if key in ["debug"]:
        value = value.lower() in ["true", "1", "yes", "on"]
    
    set_config(key, value)
    console.print(f"[green]✓ Set {key} = {value}[/green]")

@config_cmd.command("reset")
@click.option("--confirm", is_flag=True, help="Skip confirmation prompt")
def reset_config(confirm):
    """Reset configuration to defaults."""
    if not confirm:
        if not Confirm.ask("Are you sure you want to reset all configuration to defaults?"):
            console.print("[yellow]Configuration reset cancelled.[/yellow]")
            return
    
    config = get_config()
    config.reset()
    console.print("[green]✓ Configuration reset to defaults[/green]")

@config_cmd.command("edit")
def edit_config():
    """Open configuration file in default editor."""
    config = get_config()
    config_file = config.config_file
    
    if not config_file.exists():
        console.print("[yellow]Configuration file does not exist. Creating it...[/yellow]")
        config.save()
    
    import os
    import subprocess
    
    editor = os.environ.get("EDITOR", "notepad" if os.name == "nt" else "nano")
    
    try:
        subprocess.run([editor, str(config_file)], check=True)
        console.print(f"[green]✓ Configuration file opened in {editor}[/green]")
    except subprocess.CalledProcessError:
        console.print(f"[red]Error: Could not open {editor}[/red]")
    except FileNotFoundError:
        console.print(f"[red]Error: Editor {editor} not found[/red]")
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "commands" / "config.py", config_cmd_py, self.get_template_vars())

        # Generate commands __init__.py
        commands_init_py = '''"""Commands module."""
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "commands" / "__init__.py", commands_init_py)

        # Generate config utility
        config_util_py = '''"""Configuration management utilities."""

import json
from pathlib import Path
from typing import Any, Dict

class Config:
    """Configuration manager."""
    
    DEFAULT_CONFIG = {
        "name": "{{.service_name}}",
        "debug": False,
        "log_level": "INFO",
        "output_format": "table"
    }
    
    def __init__(self, config_file: Path = None):
        if config_file is None:
            config_dir = Path.home() / ".{{.service_name_underscore}}"
            config_dir.mkdir(exist_ok=True)
            config_file = config_dir / "config.json"
        
        self.config_file = config_file
        self._data = self.DEFAULT_CONFIG.copy()
        self.load()
    
    @property
    def data(self) -> Dict[str, Any]:
        """Get configuration data."""
        return self._data.copy()
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self._data.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set configuration value."""
        if key in self._data:
            self._data[key] = value
            self.save()
        else:
            raise KeyError(f"Unknown configuration key: {key}")
    
    def load(self) -> None:
        """Load configuration from file."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    loaded_data = json.load(f)
                    self._data.update(loaded_data)
            except (json.JSONDecodeError, IOError):
                pass  # Use defaults if file is corrupted
    
    def save(self) -> None:
        """Save configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self._data, f, indent=2)
    
    def reset(self) -> None:
        """Reset configuration to defaults."""
        self._data = self.DEFAULT_CONFIG.copy()
        self.save()

# Global config instance
_config = None

def get_config() -> Config:
    """Get global configuration instance."""
    global _config
    if _config is None:
        _config = Config()
    return _config

def set_config(key: str, value: Any) -> None:
    """Set configuration value."""
    config = get_config()
    config.set(key, value)
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "utils" / "config.py", config_util_py, self.get_template_vars())

        # Generate utils __init__.py
        utils_init_py = '''"""Utilities module."""
'''
        write_file(self.service_dir / "{{.service_name_underscore}}" / "utils" / "__init__.py", utils_init_py)

        # Generate entry point script
        main_py = '''#!/usr/bin/env python3
"""Entry point script for {{.service_name}}."""

from {{.service_name_underscore}}.cli import cli

if __name__ == "__main__":
    cli()
'''
        write_file(self.service_dir / "main.py", main_py, self.get_template_vars())

    def generate_config_files(self) -> None:
        """Generate configuration files."""
        # requirements.txt
        requirements_txt = '''click>=8.1.0
rich>=13.0.0
pyyaml>=6.0
'''
        write_file(self.service_dir / "requirements.txt", requirements_txt)

        # setup.py for packaging
        setup_py = '''"""Setup script for {{.service_name}}."""

from setuptools import setup, find_packages

setup(
    name="{{.service_name}}",
    version="0.1.0",
    description="A powerful CLI tool built with Click and Rich",
    author="Your Name",
    author_email="your.email@example.com",
    packages=find_packages(),
    install_requires=[
        "click>=8.1.0",
        "rich>=13.0.0",
        "pyyaml>=6.0",
    ],
    entry_points={
        "console_scripts": [
            "{{.service_name}}={{.service_name_underscore}}.cli:cli",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
'''
        write_file(self.service_dir / "setup.py", setup_py, self.get_template_vars())

        # pyproject.toml
        pyproject_toml = '''[build-system]
requires = ["setuptools>=45", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "{{.service_name}}"
version = "0.1.0"
description = "A powerful CLI tool built with Click and Rich"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your.email@example.com"},
]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
]
dependencies = [
    "click>=8.1.0",
    "rich>=13.0.0",
    "pyyaml>=6.0",
]

[project.scripts]
{{.service_name}} = "{{.service_name_underscore}}.cli:cli"

[project.urls]
Homepage = "https://github.com/yourusername/{{.service_name}}"
Repository = "https://github.com/yourusername/{{.service_name}}"
Issues = "https://github.com/yourusername/{{.service_name}}/issues"
'''
        write_file(self.service_dir / "pyproject.toml", pyproject_toml, self.get_template_vars())

        # .gitignore
        gitignore = '''# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Local configuration
config.local.json
'''
        write_file(self.service_dir / ".gitignore", gitignore)

        # README
        readme_md = '''# {{.service_name}}

A powerful CLI tool built with Click and Rich, featuring beautiful terminal output and comprehensive configuration management.

## Features

- 🎨 Beautiful terminal output with Rich
- ⚙️ Comprehensive configuration management
- 🔧 Modular command structure
- 📊 Status and monitoring commands
- 🧪 Full test coverage
- 📦 Easy installation and packaging

## Installation

### From PyPI (recommended)

```bash
pip install {{.service_name}}
```

### From source

```bash
git clone https://github.com/yourusername/{{.service_name}}.git
cd {{.service_name}}
pip install -e .
```

## Usage

### Basic Commands

```bash
# Show help
{{.service_name}} --help

# Greet someone
{{.service_name}} greet --name "Alice"

# Show system status
{{.service_name}} status

# Use hello command with different styles
{{.service_name}} hello --name "Bob" --style fancy
```

### Configuration Management

```bash
# Show current configuration
{{.service_name}} config show

# Set configuration values
{{.service_name}} config set debug true
{{.service_name}} config set log_level DEBUG

# Reset configuration to defaults
{{.service_name}} config reset

# Edit configuration file
{{.service_name}} config edit
```

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/{{.service_name}}.git
cd {{.service_name}}

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install in development mode
pip install -e ".[dev]"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov={{.service_name_underscore}}

# Run specific test
pytest tests/test_cli.py
```

### Building and Publishing

```bash
# Build package
python -m build

# Publish to PyPI
twine upload dist/*
```

## Configuration

Configuration is stored in `~/.{{.service_name_underscore}}/config.json`. Available settings:

- `name`: Application name
- `debug`: Enable debug mode (bool)
- `log_level`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `output_format`: Default output format (table, json)

## License

MIT License - see LICENSE file for details.
'''
        write_file(self.service_dir / "README.md", readme_md, self.get_template_vars())

    def generate_tests(self) -> None:
        """Generate test files."""
        # Test CLI
        test_cli_py = '''"""Test CLI commands."""

import pytest
from click.testing import CliRunner
from {{.service_name_underscore}}.cli import cli


def test_cli_help():
    """Test CLI help command."""
    runner = CliRunner()
    result = runner.invoke(cli, ["--help"])
    assert result.exit_code == 0
    assert "{{.service_name}}" in result.output


def test_greet_command():
    """Test greet command."""
    runner = CliRunner()
    result = runner.invoke(cli, ["greet", "--name", "Test"])
    assert result.exit_code == 0
    assert "Test" in result.output


def test_greet_command_with_count():
    """Test greet command with count option."""
    runner = CliRunner()
    result = runner.invoke(cli, ["greet", "--name", "Test", "--count", "3"])
    assert result.exit_code == 0
    # Should greet 3 times
    assert result.output.count("Test") == 3


def test_status_command():
    """Test status command."""
    runner = CliRunner()
    result = runner.invoke(cli, ["status"])
    assert result.exit_code == 0
    assert "System Status" in result.output


def test_verbose_flag():
    """Test verbose flag."""
    runner = CliRunner()
    result = runner.invoke(cli, ["--verbose", "greet", "--name", "Test"])
    assert result.exit_code == 0
'''
        write_file(self.service_dir / "tests" / "test_cli.py", test_cli_py, self.get_template_vars())

        # Test config
        test_config_py = '''"""Test configuration management."""

import pytest
import tempfile
import json
from pathlib import Path

from {{.service_name_underscore}}.utils.config import Config


def test_config_defaults():
    """Test default configuration values."""
    with tempfile.TemporaryDirectory() as tmpdir:
        config_file = Path(tmpdir) / "test_config.json"
        config = Config(config_file)
        
        assert config.get("name") == "{{.service_name}}"
        assert config.get("debug") is False
        assert config.get("log_level") == "INFO"


def test_config_set_get():
    """Test setting and getting configuration values."""
    with tempfile.TemporaryDirectory() as tmpdir:
        config_file = Path(tmpdir) / "test_config.json"
        config = Config(config_file)
        
        config.set("debug", True)
        assert config.get("debug") is True
        
        config.set("log_level", "DEBUG")
        assert config.get("log_level") == "DEBUG"


def test_config_save_load():
    """Test saving and loading configuration."""
    with tempfile.TemporaryDirectory() as tmpdir:
        config_file = Path(tmpdir) / "test_config.json"
        config = Config(config_file)
        
        config.set("debug", True)
        assert config_file.exists()
        
        # Load config in new instance
        config2 = Config(config_file)
        assert config2.get("debug") is True


def test_config_reset():
    """Test resetting configuration to defaults."""
    with tempfile.TemporaryDirectory() as tmpdir:
        config_file = Path(tmpdir) / "test_config.json"
        config = Config(config_file)
        
        config.set("debug", True)
        config.reset()
        assert config.get("debug") is False


def test_config_invalid_key():
    """Test setting invalid configuration key."""
    with tempfile.TemporaryDirectory() as tmpdir:
        config_file = Path(tmpdir) / "test_config.json"
        config = Config(config_file)
        
        with pytest.raises(KeyError):
            config.set("invalid_key", "value")
'''
        write_file(self.service_dir / "tests" / "test_config.py", test_config_py, self.get_template_vars())

        # Test __init__.py
        tests_init_py = '''"""Tests module."""
'''
        write_file(self.service_dir / "tests" / "__init__.py", tests_init_py)

        # pytest.ini
        pytest_ini = '''[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
'''
        write_file(self.service_dir / "pytest.ini", pytest_ini)
