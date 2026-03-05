"""Base template class for service generation."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, List, Optional

from idp_cli.utils.file_utils import create_directory, write_file
from idp_cli.utils.console import print_step


class BaseTemplate(ABC):
    """Abstract base class for service templates."""

    def __init__(self, service_name: str, output_dir: Path):
        self.service_name = service_name
        self.output_dir = output_dir
        self.service_dir = output_dir / service_name

    @property
    @abstractmethod
    def template_name(self) -> str:
        """Return the template identifier."""
        pass

    @property
    @abstractmethod
    def language(self) -> str:
        """Return the programming language."""
        pass

    @property
    @abstractmethod
    def framework(self) -> str:
        """Return the framework used."""
        pass

    def generate(self) -> Path:
        """Generate the full service scaffold."""
        print_step(f"Creating service directory: {self.service_dir}")
        create_directory(self.service_dir)

        print_step("Generating application code...")
        self.generate_app_code()

        print_step("Generating configuration files...")
        self.generate_config_files()

        print_step("Generating test scaffolding...")
        self.generate_tests()

        return self.service_dir

    @abstractmethod
    def generate_app_code(self) -> None:
        """Generate the main application code."""
        pass

    @abstractmethod
    def generate_config_files(self) -> None:
        """Generate configuration files (e.g., requirements.txt, package.json)."""
        pass

    @abstractmethod
    def generate_tests(self) -> None:
        """Generate test scaffolding."""
        pass

    def get_template_vars(self) -> Dict[str, str]:
        """Return common template variables."""
        return {
            "service_name": self.service_name,
            "service_name_underscore": self.service_name.replace("-", "_"),
            "template_name": self.template_name,
            "language": self.language,
            "framework": self.framework,
        }
