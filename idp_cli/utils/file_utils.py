"""File and directory utility functions."""

import os
import shutil
from pathlib import Path
from typing import Dict, Optional

import click


def create_directory(path: Path, exist_ok: bool = True) -> Path:
    """Create a directory and return its path."""
    path.mkdir(parents=True, exist_ok=exist_ok)
    return path


def write_file(path: Path, content: str) -> Path:
    """Write content to a file, creating parent directories if needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return path


def render_template(template: str, variables: Dict[str, str]) -> str:
    """Render a template string by replacing {{variable}} placeholders."""
    result = template
    for key, value in variables.items():
        result = result.replace(f"{{{{{key}}}}}", str(value))
    return result


def validate_service_name(name: str) -> bool:
    """Validate that a service name is valid (lowercase, alphanumeric, hyphens)."""
    import re
    return bool(re.match(r"^[a-z][a-z0-9-]*[a-z0-9]$", name)) and len(name) >= 2


def get_output_path(output_dir: Optional[str], service_name: str) -> Path:
    """Get the output path for a generated service."""
    base = Path(output_dir) if output_dir else Path.cwd()
    return base / service_name
