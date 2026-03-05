"""Tests for utility functions."""

from idp_cli.utils.file_utils import validate_service_name, render_template


def test_validate_service_name_valid():
    """Test valid service names."""
    assert validate_service_name("my-service") is True
    assert validate_service_name("payment-api") is True
    assert validate_service_name("svc1") is True
    assert validate_service_name("my-cool-service-v2") is True


def test_validate_service_name_invalid():
    """Test invalid service names."""
    assert validate_service_name("") is False
    assert validate_service_name("a") is False
    assert validate_service_name("MyService") is False
    assert validate_service_name("my_service") is False
    assert validate_service_name("-service") is False
    assert validate_service_name("service-") is False
    assert validate_service_name("123service") is False


def test_render_template():
    """Test template rendering."""
    template = "Hello {{name}}, welcome to {{project}}!"
    result = render_template(template, {"name": "World", "project": "IDP"})
    assert result == "Hello World, welcome to IDP!"


def test_render_template_no_vars():
    """Test template rendering with no variables."""
    template = "No variables here"
    result = render_template(template, {})
    assert result == "No variables here"
