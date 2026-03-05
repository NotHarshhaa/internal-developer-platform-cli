"""Template registry - maps template names to their implementations."""

from pathlib import Path
from typing import Dict, Optional

from idp_cli.templates.base import BaseTemplate
from idp_cli.templates.python_api import PythonAPITemplate
from idp_cli.templates.node_api import NodeAPITemplate
from idp_cli.templates.worker import WorkerTemplate
from idp_cli.templates.ml_inference import MLInferenceTemplate
from idp_cli.config.settings import AVAILABLE_TEMPLATES


# Registry mapping template names to classes
_TEMPLATE_CLASSES = {
    "python-api": PythonAPITemplate,
    "node-api": NodeAPITemplate,
    "worker": WorkerTemplate,
    "ml-inference": MLInferenceTemplate,
}


def get_template(template_name: str, service_name: str, output_dir: Path) -> BaseTemplate:
    """Get a template instance by name.

    Args:
        template_name: The template identifier (e.g., 'python-api').
        service_name: The name of the service to generate.
        output_dir: The output directory for the generated service.

    Returns:
        A BaseTemplate instance.

    Raises:
        ValueError: If the template name is not found.
    """
    cls = _TEMPLATE_CLASSES.get(template_name)
    if cls is None:
        available = ", ".join(_TEMPLATE_CLASSES.keys())
        raise ValueError(f"Unknown template '{template_name}'. Available: {available}")
    return cls(service_name=service_name, output_dir=output_dir)


def list_templates() -> Dict[str, dict]:
    """Return all available templates with their metadata."""
    return AVAILABLE_TEMPLATES


def get_template_info(template_name: str) -> Optional[dict]:
    """Get metadata for a specific template."""
    return AVAILABLE_TEMPLATES.get(template_name)
