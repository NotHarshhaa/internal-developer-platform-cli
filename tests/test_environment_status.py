"""Tests for the environment status command."""

import json
import pytest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

from idp_cli.commands.environment_status import EnvironmentChecker


class TestEnvironmentChecker:
    """Test cases for EnvironmentChecker."""
    
    def test_load_config_no_file(self):
        """Test loading config when no file exists."""
        checker = EnvironmentChecker(Path("/nonexistent/config.json"))
        config = checker._load_config()
        assert config == {"environments": {}}
    
    def test_load_config_valid_file(self, tmp_path):
        """Test loading config from valid file."""
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "registry": {
                        "url": "docker.io/myorg"
                    },
                    "monitoring": {
                        "prometheus": True,
                        "grafana": True
                    },
                    "gitops": {
                        "tool": "argocd"
                    }
                }
            }
        }
        
        config_file.write_text(json.dumps(test_config))
        checker = EnvironmentChecker(config_file)
        config = checker._load_config()
        assert config == test_config
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_kubernetes_cluster_healthy(self, mock_subprocess, tmp_path):
        """Test checking healthy Kubernetes cluster."""
        # Mock successful kubectl commands
        mock_cluster_info = Mock()
        mock_cluster_info.returncode = 0
        mock_cluster_info.stdout = "Kubernetes control plane is running"
        
        mock_get_nodes = Mock()
        mock_get_nodes.returncode = 0
        mock_get_nodes.stdout = json.dumps({
            "items": [
                {
                    "status": {
                        "conditions": [
                            {"type": "Ready", "status": "True"}
                        ]
                    }
                }
            ]
        })
        
        mock_get_namespace = Mock()
        mock_get_namespace.returncode = 0
        
        mock_subprocess.side_effect = [mock_cluster_info, mock_get_nodes, mock_get_namespace]
        
        checker = EnvironmentChecker()
        result = checker.check_kubernetes_cluster("dev")
        
        assert result["component"] == "kubernetes"
        assert result["status"] == "healthy"
        assert len(result["checks"]) == 3
        assert result["checks"][0]["name"] == "cluster connectivity"
        assert result["checks"][0]["status"] == "healthy"
        assert result["checks"][1]["name"] == "node status"
        assert result["checks"][1]["status"] == "healthy"
        assert result["checks"][2]["name"] == "namespace"
        assert result["checks"][2]["status"] == "healthy"
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_kubernetes_cluster_unhealthy(self, mock_subprocess):
        """Test checking unhealthy Kubernetes cluster."""
        # Mock failed kubectl command
        mock_cluster_info = Mock()
        mock_cluster_info.returncode = 1
        mock_cluster_info.stderr = "Unable to connect to the server"
        
        mock_subprocess.return_value = mock_cluster_info
        
        checker = EnvironmentChecker()
        result = checker.check_kubernetes_cluster("dev")
        
        assert result["status"] == "unhealthy"
        assert len(result["checks"]) == 1
        assert result["checks"][0]["status"] == "unhealthy"
        assert "Unable to connect to the server" in result["checks"][0]["details"]
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_kubernetes_cluster_kubectl_not_found(self, mock_subprocess):
        """Test checking when kubectl is not found."""
        mock_subprocess.side_effect = FileNotFoundError("kubectl not found")
        
        checker = EnvironmentChecker()
        result = checker.check_kubernetes_cluster("dev")
        
        assert result["status"] == "unhealthy"
        assert result["checks"][0]["name"] == "kubectl"
        assert result["checks"][0]["status"] == "unhealthy"
        assert "kubectl not found in PATH" in result["checks"][0]["details"]
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_docker_registry_healthy(self, mock_subprocess, tmp_path):
        """Test checking healthy Docker registry."""
        # Setup config with registry
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "registry": {
                        "url": "docker.io/myorg"
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        # Mock successful docker command
        mock_docker_version = Mock()
        mock_docker_version.returncode = 0
        mock_docker_version.stdout = "Docker version 20.10.0"
        
        mock_subprocess.return_value = mock_docker_version
        
        checker = EnvironmentChecker(config_file)
        result = checker.check_docker_registry("dev")
        
        assert result["component"] == "docker-registry"
        assert result["status"] == "healthy"
        assert len(result["checks"]) == 2
        assert result["checks"][0]["name"] == "docker daemon"
        assert result["checks"][0]["status"] == "healthy"
        assert result["checks"][1]["name"] == "registry connectivity"
        assert result["checks"][1]["status"] == "healthy"
    
    def test_check_docker_registry_no_config(self):
        """Test checking Docker registry with no configuration."""
        checker = EnvironmentChecker()
        result = checker.check_docker_registry("dev")
        
        assert result["status"] == "warning"
        assert len(result["checks"]) == 1
        assert result["checks"][0]["name"] == "registry configuration"
        assert result["checks"][0]["status"] == "warning"
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_monitoring_stack_healthy(self, mock_subprocess, tmp_path):
        """Test checking healthy monitoring stack."""
        # Setup config with monitoring
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "monitoring": {
                        "prometheus": True,
                        "grafana": True
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        # Mock successful kubectl commands
        mock_prometheus = Mock()
        mock_prometheus.returncode = 0
        
        mock_grafana = Mock()
        mock_grafana.returncode = 0
        
        mock_subprocess.side_effect = [mock_prometheus, mock_grafana]
        
        checker = EnvironmentChecker(config_file)
        result = checker.check_monitoring_stack("dev")
        
        assert result["component"] == "monitoring"
        assert result["status"] == "healthy"
        assert len(result["checks"]) == 2
        assert result["checks"][0]["name"] == "prometheus"
        assert result["checks"][0]["status"] == "healthy"
        assert result["checks"][1]["name"] == "grafana"
        assert result["checks"][1]["status"] == "healthy"
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_gitops_argocd_healthy(self, mock_subprocess, tmp_path):
        """Test checking healthy ArgoCD GitOps."""
        # Setup config with ArgoCD
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "gitops": {
                        "tool": "argocd"
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        # Mock successful kubectl command
        mock_argocd = Mock()
        mock_argocd.returncode = 0
        
        mock_subprocess.return_value = mock_argocd
        
        checker = EnvironmentChecker(config_file)
        result = checker.check_gitops_tools("dev")
        
        assert result["component"] == "gitops"
        assert result["status"] == "healthy"
        assert len(result["checks"]) == 1
        assert result["checks"][0]["name"] == "argocd"
        assert result["checks"][0]["status"] == "healthy"
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_gitops_flux_healthy(self, mock_subprocess, tmp_path):
        """Test checking healthy Flux GitOps."""
        # Setup config with Flux
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "gitops": {
                        "tool": "flux"
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        # Mock successful kubectl command
        mock_flux = Mock()
        mock_flux.returncode = 0
        
        mock_subprocess.return_value = mock_flux
        
        checker = EnvironmentChecker(config_file)
        result = checker.check_gitops_tools("dev")
        
        assert result["component"] == "gitops"
        assert result["status"] == "healthy"
        assert len(result["checks"]) == 1
        assert result["checks"][0]["name"] == "flux"
        assert result["checks"][0]["status"] == "healthy"
    
    @patch('idp_cli.commands.environment_status.subprocess.run')
    def test_check_all_components(self, mock_subprocess, tmp_path):
        """Test checking all environment components."""
        # Setup comprehensive config
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "registry": {"url": "docker.io/myorg"},
                    "monitoring": {"prometheus": True},
                    "gitops": {"tool": "argocd"}
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        # Mock all commands to succeed
        mock_subprocess.return_value.returncode = 0
        
        checker = EnvironmentChecker(config_file)
        with patch.object(checker, 'check_kubernetes_cluster') as mock_k8s, \
             patch.object(checker, 'check_docker_registry') as mock_registry, \
             patch.object(checker, 'check_monitoring_stack') as mock_monitoring, \
             patch.object(checker, 'check_gitops_tools') as mock_gitops:
            
            mock_k8s.return_value = {"component": "kubernetes", "status": "healthy"}
            mock_registry.return_value = {"component": "docker-registry", "status": "healthy"}
            mock_monitoring.return_value = {"component": "monitoring", "status": "healthy"}
            mock_gitops.return_value = {"component": "gitops", "status": "healthy"}
            
            results = checker.check_all_components("dev")
            
            assert len(results) == 4
            assert results[0]["component"] == "kubernetes"
            assert results[1]["component"] == "docker-registry"
            assert results[2]["component"] == "monitoring"
            assert results[3]["component"] == "gitops"
            
            mock_k8s.assert_called_once_with("dev")
            mock_registry.assert_called_once_with("dev")
            mock_monitoring.assert_called_once_with("dev")
            mock_gitops.assert_called_once_with("dev")
