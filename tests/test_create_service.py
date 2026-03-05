"""Tests for the create-service command."""

import os
import shutil
import tempfile

from click.testing import CliRunner

from idp_cli.cli import cli


def _normalize(text: str) -> str:
    """Normalize output by collapsing whitespace for assertion checks."""
    return " ".join(text.split())


class TestCreateService:
    """Test suite for the create-service command."""

    def setup_method(self):
        """Create a temporary directory for test output."""
        self.test_dir = tempfile.mkdtemp()

    def teardown_method(self):
        """Clean up test output directory."""
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_create_python_api_service(self):
        """Test creating a Python API service."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "test-service",
                "--template", "python-api",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)

        service_dir = os.path.join(self.test_dir, "test-service")
        assert os.path.isdir(service_dir)
        assert os.path.isfile(os.path.join(service_dir, "app", "main.py"))
        assert os.path.isfile(os.path.join(service_dir, "requirements.txt"))
        assert os.path.isfile(os.path.join(service_dir, "Dockerfile"))
        assert os.path.isdir(os.path.join(service_dir, "k8s"))
        assert os.path.isdir(os.path.join(service_dir, "monitoring"))
        assert os.path.isfile(os.path.join(service_dir, "README.md"))

    def test_create_node_api_service(self):
        """Test creating a Node.js API service."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "node-test-svc",
                "--template", "node-api",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)

        service_dir = os.path.join(self.test_dir, "node-test-svc")
        assert os.path.isdir(service_dir)
        assert os.path.isfile(os.path.join(service_dir, "src", "index.js"))
        assert os.path.isfile(os.path.join(service_dir, "package.json"))
        assert os.path.isfile(os.path.join(service_dir, "Dockerfile"))

    def test_create_worker_service(self):
        """Test creating a worker service."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "bg-worker",
                "--template", "worker",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)

        service_dir = os.path.join(self.test_dir, "bg-worker")
        assert os.path.isfile(os.path.join(service_dir, "app", "worker.py"))

    def test_create_ml_inference_service(self):
        """Test creating an ML inference service."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "ml-svc",
                "--template", "ml-inference",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)

        service_dir = os.path.join(self.test_dir, "ml-svc")
        assert os.path.isfile(os.path.join(service_dir, "app", "ml", "model_manager.py"))

    def test_create_service_with_gitlab_ci(self):
        """Test creating a service with GitLab CI."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "gitlab-svc",
                "--template", "python-api",
                "--ci", "gitlab-ci",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)
        service_dir = os.path.join(self.test_dir, "gitlab-svc")
        assert os.path.isfile(os.path.join(service_dir, ".gitlab-ci.yml"))

    def test_create_service_with_jenkins(self):
        """Test creating a service with Jenkins pipeline."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "jenkins-svc",
                "--template", "python-api",
                "--ci", "jenkins",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)
        service_dir = os.path.join(self.test_dir, "jenkins-svc")
        assert os.path.isfile(os.path.join(service_dir, "Jenkinsfile"))

    def test_create_service_with_argocd(self):
        """Test creating a service with ArgoCD GitOps."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "argo-svc",
                "--template", "python-api",
                "--gitops", "argocd",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)
        service_dir = os.path.join(self.test_dir, "argo-svc")
        assert os.path.isdir(os.path.join(service_dir, "gitops", "argocd"))

    def test_create_service_with_flux(self):
        """Test creating a service with Flux GitOps."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "flux-svc",
                "--template", "python-api",
                "--gitops", "flux",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        assert "created successfully" in _normalize(result.output)
        service_dir = os.path.join(self.test_dir, "flux-svc")
        assert os.path.isdir(os.path.join(service_dir, "gitops", "flux"))

    def test_create_service_no_docker(self):
        """Test creating a service without Docker configuration."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "no-docker-svc",
                "--template", "python-api",
                "--no-docker",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        service_dir = os.path.join(self.test_dir, "no-docker-svc")
        assert not os.path.isfile(os.path.join(service_dir, "Dockerfile"))

    def test_create_service_no_k8s(self):
        """Test creating a service without Kubernetes manifests."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "no-k8s-svc",
                "--template", "python-api",
                "--no-k8s",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code == 0
        service_dir = os.path.join(self.test_dir, "no-k8s-svc")
        assert not os.path.isdir(os.path.join(service_dir, "k8s"))

    def test_invalid_service_name(self):
        """Test that invalid service names are rejected."""
        runner = CliRunner()
        result = runner.invoke(
            cli,
            [
                "create-service",
                "INVALID_NAME",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code != 0
        assert "Invalid service name" in _normalize(result.output)

    def test_duplicate_service_name(self):
        """Test that creating a service in an existing directory fails."""
        runner = CliRunner()
        # Create first time
        runner.invoke(
            cli,
            [
                "create-service",
                "dup-svc",
                "--template", "python-api",
                "--output-dir", self.test_dir,
            ],
        )
        # Try creating again
        result = runner.invoke(
            cli,
            [
                "create-service",
                "dup-svc",
                "--template", "python-api",
                "--output-dir", self.test_dir,
            ],
        )
        assert result.exit_code != 0
        assert "already exists" in _normalize(result.output)
