"""Tests for service templates."""

import shutil
import tempfile
from pathlib import Path

from idp_cli.templates.registry import get_template, list_templates, get_template_info


class TestTemplateRegistry:
    """Test the template registry."""

    def test_list_templates(self):
        """Test listing all templates."""
        templates = list_templates()
        assert "python-api" in templates
        assert "node-api" in templates
        assert "worker" in templates
        assert "ml-inference" in templates

    def test_get_template_info(self):
        """Test getting template info."""
        info = get_template_info("python-api")
        assert info is not None
        assert info["language"] == "python"
        assert info["framework"] == "fastapi"

    def test_get_template_info_unknown(self):
        """Test getting info for an unknown template."""
        info = get_template_info("unknown-template")
        assert info is None

    def test_get_template_python_api(self):
        """Test getting a Python API template instance."""
        tmp = Path(tempfile.mkdtemp())
        try:
            template = get_template("python-api", "test-svc", tmp)
            assert template.template_name == "python-api"
            assert template.language == "python"
            assert template.framework == "fastapi"
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_get_template_unknown(self):
        """Test getting an unknown template raises ValueError."""
        tmp = Path(tempfile.mkdtemp())
        try:
            try:
                get_template("unknown", "test-svc", tmp)
                assert False, "Should have raised ValueError"
            except ValueError as e:
                assert "Unknown template" in str(e)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


class TestPythonAPITemplate:
    """Test Python API template generation."""

    def setup_method(self):
        self.test_dir = Path(tempfile.mkdtemp())

    def teardown_method(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_generate(self):
        """Test full generation of a Python API service."""
        template = get_template("python-api", "my-api", self.test_dir)
        result = template.generate()

        assert result.exists()
        assert (result / "app" / "main.py").is_file()
        assert (result / "app" / "api" / "routes.py").is_file()
        assert (result / "app" / "core" / "config.py").is_file()
        assert (result / "app" / "core" / "health.py").is_file()
        assert (result / "requirements.txt").is_file()
        assert (result / "tests" / "test_health.py").is_file()
        assert (result / "tests" / "test_api.py").is_file()


class TestNodeAPITemplate:
    """Test Node.js API template generation."""

    def setup_method(self):
        self.test_dir = Path(tempfile.mkdtemp())

    def teardown_method(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_generate(self):
        """Test full generation of a Node.js API service."""
        template = get_template("node-api", "my-node-api", self.test_dir)
        result = template.generate()

        assert result.exists()
        assert (result / "src" / "index.js").is_file()
        assert (result / "src" / "routes" / "health.js").is_file()
        assert (result / "src" / "routes" / "api.js").is_file()
        assert (result / "package.json").is_file()
        assert (result / "tests" / "health.test.js").is_file()
