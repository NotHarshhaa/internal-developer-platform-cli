"""Tests for new major CLI commands: doctor, config, generate, telemetry, and plugin."""

import shutil
import tempfile
from pathlib import Path
from click.testing import CliRunner

from idp_cli.cli import cli


class TestDoctorCommand:
    """Test suite for the doctor command."""

    def test_doctor_execution(self):
        runner = CliRunner()
        result = runner.invoke(cli, ["doctor"])
        assert result.exit_code == 0
        assert "IDP Environment Doctor" in result.output
        assert "Doctor Summary & Readiness" in result.output


class TestConfigCommands:
    """Test suite for the config command group."""

    def test_config_list(self):
        runner = CliRunner()
        result = runner.invoke(cli, ["config", "list"])
        assert result.exit_code == 0
        assert "IDP CLI Configuration" in result.output

    def test_config_get_and_set(self):
        runner = CliRunner()
        result_set = runner.invoke(cli, ["config", "set", "custom_key", "custom_value"])
        assert result_set.exit_code == 0
        assert "custom_key" in result_set.output

        result_get = runner.invoke(cli, ["config", "get", "custom_key"])
        assert result_get.exit_code == 0
        assert "custom_value" in result_get.output

    def test_config_context(self):
        runner = CliRunner()
        result_ctx = runner.invoke(cli, ["config", "context", "staging"])
        assert result_ctx.exit_code == 0
        assert "STAGING" in result_ctx.output


class TestGenerateCommands:
    """Test suite for the generate command group."""

    def setup_method(self):
        self.test_dir = tempfile.mkdtemp()

    def teardown_method(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_generate_dockerfile(self):
        runner = CliRunner()
        result = runner.invoke(
            cli,
            ["generate", "dockerfile", "--lang", "python", "--name", "test-app", "--output-dir", self.test_dir],
        )
        assert result.exit_code == 0
        assert Path(self.test_dir, "Dockerfile").is_file()

    def test_generate_k8s(self):
        runner = CliRunner()
        result = runner.invoke(
            cli,
            ["generate", "k8s", "--name", "test-app", "--port", "8000", "--output-dir", self.test_dir],
        )
        assert result.exit_code == 0
        assert Path(self.test_dir, "k8s").is_dir()

    def test_generate_ci(self):
        runner = CliRunner()
        result = runner.invoke(
            cli,
            ["generate", "ci", "--provider", "github-actions", "--lang", "python", "--name", "test-app", "--output-dir", self.test_dir],
        )
        assert result.exit_code == 0
        assert Path(self.test_dir, ".github", "workflows").is_dir()

    def test_generate_gitops(self):
        runner = CliRunner()
        result = runner.invoke(
            cli,
            ["generate", "gitops", "--tool", "argocd", "--name", "test-app", "--output-dir", self.test_dir],
        )
        assert result.exit_code == 0
        assert Path(self.test_dir, "gitops", "argocd").is_dir()


class TestTelemetryCommands:
    """Test suite for telemetry commands."""

    def test_telemetry_top(self):
        runner = CliRunner()
        result = runner.invoke(cli, ["telemetry", "top"])
        assert result.exit_code == 0
        assert "Top Service Metrics" in result.output

    def test_telemetry_trace(self):
        runner = CliRunner()
        result = runner.invoke(cli, ["telemetry", "trace", "tr-test-1234"])
        assert result.exit_code == 0
        assert "Distributed Trace: tr-test-1234" in result.output
        assert "Span Waterfall Timeline" in result.output


class TestPluginCommands:
    """Test suite for plugin commands."""

    def test_plugin_list(self):
        runner = CliRunner()
        result = runner.invoke(cli, ["plugin", "list"])
        assert result.exit_code == 0
        assert "IDP Plugins & Extensions" in result.output

    def test_plugin_install_and_remove(self):
        runner = CliRunner()
        result_inst = runner.invoke(cli, ["plugin", "install", "my-custom-plugin"])
        assert result_inst.exit_code == 0
        assert "my-custom-plugin" in result_inst.output

        result_rem = runner.invoke(cli, ["plugin", "remove", "my-custom-plugin"])
        assert result_rem.exit_code == 0
        assert "Removed plugin" in result_rem.output
