"""Tests for the dependency visualization command."""

import json
import pytest
from pathlib import Path

from idp_cli.commands.dependency_viz import DependencyAnalyzer


class TestDependencyAnalyzer:
    """Test cases for DependencyAnalyzer."""
    
    def test_load_config_no_file(self):
        """Test loading config when no file exists."""
        analyzer = DependencyAnalyzer(Path("/nonexistent/config.json"))
        config = analyzer._load_config()
        assert config == {"services": {}, "dependencies": {}}
    
    def test_load_config_valid_file(self, tmp_path):
        """Test loading config from valid file."""
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "dependencies": ["user-api", "auth-service"],
                            "environment": {
                                "USER_API_URL": "http://user-api:8080",
                                "DATABASE_HOST": "postgres"
                            }
                        },
                        "user-api": {
                            "dependencies": [],
                            "environment": {
                                "DATABASE_HOST": "postgres"
                            }
                        },
                        "auth-service": {
                            "dependencies": [],
                            "environment": {}
                        }
                    }
                }
            }
        }
        
        config_file.write_text(json.dumps(test_config))
        analyzer = DependencyAnalyzer(config_file)
        config = analyzer._load_config()
        assert config == test_config
    
    def test_build_dependency_graph(self, tmp_path):
        """Test building dependency graph."""
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "dependencies": ["user-api", "auth-service"],
                            "environment": {
                                "USER_API_URL": "http://user-api:8080"
                            }
                        },
                        "user-api": {
                            "dependencies": [],
                            "environment": {}
                        },
                        "auth-service": {
                            "dependencies": [],
                            "environment": {}
                        }
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        analyzer = DependencyAnalyzer(config_file)
        dependencies = analyzer.build_dependency_graph("dev")
        
        assert dependencies["payment-api"] == {"user-api", "auth-service"}
        assert dependencies["user-api"] == set()
        assert dependencies["auth-service"] == set()
    
    def test_find_circular_dependencies(self):
        """Test finding circular dependencies."""
        dependencies = {
            "service-a": {"service-b"},
            "service-b": {"service-c"},
            "service-c": {"service-a"},  # Creates circular dependency
            "service-d": {"service-e"},
            "service-e": set()
        }
        
        analyzer = DependencyAnalyzer()
        cycles = analyzer.find_circular_dependencies(dependencies)
        
        assert len(cycles) == 1
        assert cycles[0] == ["service-a", "service-b", "service-c", "service-a"]
    
    def test_find_no_circular_dependencies(self):
        """Test when no circular dependencies exist."""
        dependencies = {
            "service-a": {"service-b"},
            "service-b": {"service-c"},
            "service-c": set(),
            "service-d": set()
        }
        
        analyzer = DependencyAnalyzer()
        cycles = analyzer.find_circular_dependencies(dependencies)
        
        assert len(cycles) == 0
    
    def test_get_service_levels(self):
        """Test calculating service deployment levels."""
        dependencies = {
            "service-a": {"service-b", "service-c"},
            "service-b": {"service-c"},
            "service-c": set(),
            "service-d": set()
        }
        
        analyzer = DependencyAnalyzer()
        levels = analyzer.get_service_levels(dependencies)
        
        # Services with no dependencies should be level 0
        assert levels["service-c"] == 0
        assert levels["service-d"] == 0
        
        # Service that depends on service-c should be level 1
        assert levels["service-b"] == 1
        
        # Service that depends on service-b and service-c should be level 2
        assert levels["service-a"] == 2
    
    def test_generate_mermaid_diagram(self):
        """Test generating Mermaid diagram."""
        dependencies = {
            "payment-api": {"user-api", "auth-service"},
            "user-api": set(),
            "auth-service": set()
        }
        
        analyzer = DependencyAnalyzer()
        diagram = analyzer.generate_mermaid_diagram(dependencies)
        
        assert diagram.startswith("graph TD")
        assert "payment-api[payment-api]" in diagram
        assert "user-api[user-api]" in diagram
        assert "auth-service[auth-service]" in diagram
        assert "user-api --> payment-api" in diagram
        assert "auth-service --> payment-api" in diagram
    
    def test_environment_variable_dependencies(self, tmp_path):
        """Test extracting dependencies from environment variables."""
        config_file = tmp_path / "test-config.json"
        test_config = {
            "environments": {
                "dev": {
                    "services": {
                        "payment-api": {
                            "dependencies": [],
                            "environment": {
                                "USER_API_URL": "http://user-api:8080",
                                "AUTH_SERVICE_HOST": "auth-service",
                                "DATABASE_URL": "postgresql://localhost/db"
                            }
                        },
                        "user-api": {
                            "dependencies": [],
                            "environment": {}
                        },
                        "auth-service": {
                            "dependencies": [],
                            "environment": {}
                        }
                    }
                }
            }
        }
        config_file.write_text(json.dumps(test_config))
        
        analyzer = DependencyAnalyzer(config_file)
        dependencies = analyzer.build_dependency_graph("dev")
        
        # Should extract dependencies from environment variables
        assert "user-api" in dependencies["payment-api"]
        assert "auth-service" in dependencies["payment-api"]
        # Database should not be considered a service dependency
        assert "localhost" not in dependencies["payment-api"]
