"""Tests for the main CLI interface."""

from click.testing import CliRunner

from idp_cli.cli import cli


def test_cli_version():
    """Test --version flag."""
    runner = CliRunner()
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert "idp-cli" in result.output


def test_cli_help():
    """Test --help flag."""
    runner = CliRunner()
    result = runner.invoke(cli, ["--help"])
    assert result.exit_code == 0
    assert "Self-service infrastructure" in result.output


def test_create_service_help():
    """Test create-service --help."""
    runner = CliRunner()
    result = runner.invoke(cli, ["create-service", "--help"])
    assert result.exit_code == 0
    assert "SERVICE_NAME" in result.output
    assert "--template" in result.output
    assert "--ci" in result.output


def test_list_templates():
    """Test list-templates command."""
    runner = CliRunner()
    result = runner.invoke(cli, ["list-templates"])
    assert result.exit_code == 0
    assert "python-api" in result.output
    assert "node-api" in result.output
    assert "worker" in result.output
    assert "ml-inference" in result.output
