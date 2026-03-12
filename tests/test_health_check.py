"""Tests for the health check command."""

import json
import pytest
import requests
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

from idp_cli.commands.health_check import ServiceHealthChecker


class TestServiceHealthChecker:
    """Test cases for ServiceHealthChecker."""
    
    def test_load_config_no_file(self):
        """Test loading config when no file exists."""
        checker = ServiceHealthChecker(Path("/nonexistent/config.json"))
        config = checker._load_config()
        assert config == {"services": [], "environments": {}}
    
    def test_load_config_valid_file(self, tmp_path):
        """Test loading config from valid file."""
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "url": "http://payment-api:8080/health",
                            "k8s_deployment": "payment-api"
                        }
                    }
                }
            }
        }
        
        config_file.write_text(json.dumps(test_config))
        checker = ServiceHealthChecker(config_file)
        config = checker._load_config()
        assert config == test_config
    
    def test_load_config_invalid_json(self, tmp_path):
        """Test loading config from invalid JSON file."""
        config_file = tmp_path / "invalid-config.json"
        config_file.write_text("invalid json content")
        
        checker = ServiceHealthChecker(config_file)
        config = checker._load_config()
        assert config == {"services": [], "environments": {}}
    
    @patch('idp_cli.commands.health_check.requests.get')
    def test_check_service_health_healthy(self, mock_get, tmp_path):
        """Test checking health of a healthy service."""
        # Setup mock response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.elapsed.total_seconds.return_value = 0.5
        mock_get.return_value = mock_response
        
        # Setup config
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "url": "http://payment-api:8080/health"
                        }
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        checker = ServiceHealthChecker(config_file)
        result = checker.check_service_health("payment-api", "dev")
        
        assert result["service"] == "payment-api"
        assert result["environment"] == "dev"
        assert result["status"] == "healthy"
        assert len(result["checks"]) == 1
        assert result["checks"][0]["type"] == "http"
        assert result["checks"][0]["status"] == "healthy"
        assert result["checks"][0]["response_time"] == "0.50s"
        assert result["checks"][0]["status_code"] == 200
    
    @patch('idp_cli.commands.health_check.requests.get')
    def test_check_service_health_unhealthy(self, mock_get, tmp_path):
        """Test checking health of an unhealthy service."""
        # Setup mock response
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.elapsed.total_seconds.return_value = 1.0
        mock_get.return_value = mock_response
        
        # Setup config
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "url": "http://payment-api:8080/health"
                        }
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        checker = ServiceHealthChecker(config_file)
        result = checker.check_service_health("payment-api", "dev")
        
        assert result["status"] == "unhealthy"
        assert result["checks"][0]["status"] == "unhealthy"
        assert result["checks"][0]["status_code"] == 500
    
    @patch('idp_cli.commands.health_check.requests.get')
    def test_check_service_health_request_error(self, mock_get, tmp_path):
        """Test checking health when request fails."""
        # Setup mock to raise exception
        mock_get.side_effect = requests.exceptions.RequestException("Connection refused")
        
        # Setup config
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "url": "http://payment-api:8080/health"
                        }
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        checker = ServiceHealthChecker(config_file)
        result = checker.check_service_health("payment-api", "dev")
        
        assert result["status"] == "unhealthy"
        assert result["checks"][0]["status"] == "unhealthy"
        assert "Connection refused" in result["checks"][0]["error"]
    
    def test_check_service_health_not_found(self, tmp_path):
        """Test checking health of service not in config."""
        config_file = tmp_path / "test-config.json"
        test_config = {"environments": {"dev": {"services": {}}}}
        config_file.write_text(json.dumps(test_config))
        
        checker = ServiceHealthChecker(config_file)
        result = checker.check_service_health("nonexistent-service", "dev")
        
        assert result["status"] == "unknown"
        assert "not found in configuration" in result["error"]
    
    def test_check_all_services(self, tmp_path):
        """Test checking health of all services."""
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {"url": "http://payment-api:8080/health"},
                        "user-api": {"url": "http://user-api:8080/health"}
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        checker = ServiceHealthChecker(config_file)
        with patch.object(checker, 'check_service_health') as mock_check:
            mock_check.return_value = {"status": "healthy"}
            
            results = checker.check_all_services("dev")
            
            assert len(results) == 2
            assert mock_check.call_count == 2
            mock_check.assert_any_call("payment-api", "dev")
            mock_check.assert_any_call("user-api", "dev")
