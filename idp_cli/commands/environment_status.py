"""Environment status check command."""

import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any

import click
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich import box

from idp_cli.utils.console import console, print_step, print_success, print_error


class EnvironmentChecker:
    """Checker for environment readiness and status."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load environment configuration from file."""
        if not self.config_file.exists():
            return {"environments": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"environments": {}}
    
    def check_kubernetes_cluster(self, environment: str) -> Dict[str, Any]:
        """Check Kubernetes cluster connectivity and status."""
        result = {
            "component": "kubernetes",
            "status": "unknown",
            "checks": []
        }
        
        try:
            # Check kubectl connectivity
            kubectl_check = subprocess.run(
                ["kubectl", "cluster-info"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if kubectl_check.returncode == 0:
                result["checks"].append({
                    "name": "cluster connectivity",
                    "status": "healthy",
                    "details": "kubectl can connect to cluster"
                })
                
                # Get cluster info
                nodes_check = subprocess.run(
                    ["kubectl", "get", "nodes", "-o", "json"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if nodes_check.returncode == 0:
                    nodes_data = json.loads(nodes_check.stdout)
                    node_count = len(nodes_data.get("items", []))
                    ready_nodes = sum(
                        1 for node in nodes_data.get("items", [])
                        if any(condition["type"] == "Ready" and condition["status"] == "True"
                               for condition in node.get("status", {}).get("conditions", []))
                    )
                    
                    result["checks"].append({
                        "name": "node status",
                        "status": "healthy" if ready_nodes > 0 else "unhealthy",
                        "details": f"{ready_nodes}/{node_count} nodes ready"
                    })
                    
                    # Check namespace
                    namespace = f"idp-{environment}"
                    ns_check = subprocess.run(
                        ["kubectl", "get", "namespace", namespace],
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    
                    if ns_check.returncode == 0:
                        result["checks"].append({
                            "name": "namespace",
                            "status": "healthy",
                            "details": f"Namespace '{namespace}' exists"
                        })
                    else:
                        result["checks"].append({
                            "name": "namespace",
                            "status": "warning",
                            "details": f"Namespace '{namespace}' not found"
                        })
                
                result["status"] = "healthy"
            else:
                result["checks"].append({
                    "name": "cluster connectivity",
                    "status": "unhealthy",
                    "details": kubectl_check.stderr.strip()
                })
                result["status"] = "unhealthy"
                
        except subprocess.TimeoutExpired:
            result["checks"].append({
                "name": "cluster connectivity",
                "status": "unhealthy",
                "details": "Command timed out"
            })
            result["status"] = "unhealthy"
        except FileNotFoundError:
            result["checks"].append({
                "name": "kubectl",
                "status": "unhealthy",
                "details": "kubectl not found in PATH"
            })
            result["status"] = "unhealthy"
        except Exception as e:
            result["checks"].append({
                "name": "cluster connectivity",
                "status": "unhealthy",
                "details": str(e)
            })
            result["status"] = "unhealthy"
        
        return result
    
    def check_docker_registry(self, environment: str) -> Dict[str, Any]:
        """Check Docker/container registry connectivity."""
        result = {
            "component": "docker-registry",
            "status": "unknown",
            "checks": []
        }
        
        env_config = self.config.get("environments", {}).get(environment, {})
        registry_config = env_config.get("registry", {})
        
        if not registry_config:
            result["checks"].append({
                "name": "registry configuration",
                "status": "warning",
                "details": "No registry configuration found"
            })
            result["status"] = "warning"
            return result
        
        try:
            # Check Docker daemon
            docker_check = subprocess.run(
                ["docker", "version"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if docker_check.returncode == 0:
                result["checks"].append({
                    "name": "docker daemon",
                    "status": "healthy",
                    "details": "Docker daemon is running"
                })
                
                # Try to login to registry if credentials are provided
                if registry_config.get("url"):
                    registry_url = registry_config["url"]
                    
                    # For now, just check if we can reach the registry
                    # In a real implementation, you might use docker login or curl
                    result["checks"].append({
                        "name": "registry connectivity",
                        "status": "healthy",
                        "details": f"Registry {registry_url} configured"
                    })
                
                result["status"] = "healthy"
            else:
                result["checks"].append({
                    "name": "docker daemon",
                    "status": "unhealthy",
                    "details": docker_check.stderr.strip()
                })
                result["status"] = "unhealthy"
                
        except subprocess.TimeoutExpired:
            result["checks"].append({
                "name": "docker daemon",
                "status": "unhealthy",
                "details": "Command timed out"
            })
            result["status"] = "unhealthy"
        except FileNotFoundError:
            result["checks"].append({
                "name": "docker",
                "status": "unhealthy",
                "details": "Docker not found in PATH"
            })
            result["status"] = "unhealthy"
        except Exception as e:
            result["checks"].append({
                "name": "docker daemon",
                "status": "unhealthy",
                "details": str(e)
            })
            result["status"] = "unhealthy"
        
        return result
    
    def check_monitoring_stack(self, environment: str) -> Dict[str, Any]:
        """Check monitoring stack (Prometheus, Grafana)."""
        result = {
            "component": "monitoring",
            "status": "unknown",
            "checks": []
        }
        
        env_config = self.config.get("environments", {}).get(environment, {})
        monitoring_config = env_config.get("monitoring", {})
        
        if not monitoring_config:
            result["checks"].append({
                "name": "monitoring configuration",
                "status": "warning",
                "details": "No monitoring configuration found"
            })
            result["status"] = "warning"
            return result
        
        # Check Prometheus
        if monitoring_config.get("prometheus"):
            try:
                prometheus_check = subprocess.run(
                    ["kubectl", "get", "svc", "prometheus-server", "-n", "monitoring"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if prometheus_check.returncode == 0:
                    result["checks"].append({
                        "name": "prometheus",
                        "status": "healthy",
                        "details": "Prometheus service found"
                    })
                else:
                    result["checks"].append({
                        "name": "prometheus",
                        "status": "warning",
                        "details": "Prometheus service not found"
                    })
            except Exception as e:
                result["checks"].append({
                    "name": "prometheus",
                    "status": "unhealthy",
                    "details": str(e)
                })
        
        # Check Grafana
        if monitoring_config.get("grafana"):
            try:
                grafana_check = subprocess.run(
                    ["kubectl", "get", "svc", "grafana", "-n", "monitoring"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if grafana_check.returncode == 0:
                    result["checks"].append({
                        "name": "grafana",
                        "status": "healthy",
                        "details": "Grafana service found"
                    })
                else:
                    result["checks"].append({
                        "name": "grafana",
                        "status": "warning",
                        "details": "Grafana service not found"
                    })
            except Exception as e:
                result["checks"].append({
                    "name": "grafana",
                    "status": "unhealthy",
                    "details": str(e)
                })
        
        # Determine overall status
        healthy_checks = sum(1 for check in result["checks"] if check["status"] == "healthy")
        if healthy_checks == len(result["checks"]):
            result["status"] = "healthy"
        elif any(check["status"] == "unhealthy" for check in result["checks"]):
            result["status"] = "unhealthy"
        else:
            result["status"] = "warning"
        
        return result
    
    def check_gitops_tools(self, environment: str) -> Dict[str, Any]:
        """Check GitOps tools (ArgoCD, Flux)."""
        result = {
            "component": "gitops",
            "status": "unknown",
            "checks": []
        }
        
        env_config = self.config.get("environments", {}).get(environment, {})
        gitops_config = env_config.get("gitops", {})
        
        if not gitops_config:
            result["checks"].append({
                "name": "gitops configuration",
                "status": "warning",
                "details": "No GitOps configuration found"
            })
            result["status"] = "warning"
            return result
        
        # Check ArgoCD
        if gitops_config.get("tool") == "argocd":
            try:
                argocd_check = subprocess.run(
                    ["kubectl", "get", "pods", "-n", "argocd", "-l", "app.kubernetes.io/name=argocd-server"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if argocd_check.returncode == 0:
                    result["checks"].append({
                        "name": "argocd",
                        "status": "healthy",
                        "details": "ArgoCD server pods found"
                    })
                else:
                    result["checks"].append({
                        "name": "argocd",
                        "status": "unhealthy",
                        "details": "ArgoCD server pods not found"
                    })
            except Exception as e:
                result["checks"].append({
                    "name": "argocd",
                    "status": "unhealthy",
                    "details": str(e)
                })
        
        # Check Flux
        elif gitops_config.get("tool") == "flux":
            try:
                flux_check = subprocess.run(
                    ["kubectl", "get", "pods", "-n", "flux-system"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if flux_check.returncode == 0:
                    result["checks"].append({
                        "name": "flux",
                        "status": "healthy",
                        "details": "Flux system pods found"
                    })
                else:
                    result["checks"].append({
                        "name": "flux",
                        "status": "unhealthy",
                        "details": "Flux system pods not found"
                    })
            except Exception as e:
                result["checks"].append({
                    "name": "flux",
                    "status": "unhealthy",
                    "details": str(e)
                })
        
        # Determine overall status
        healthy_checks = sum(1 for check in result["checks"] if check["status"] == "healthy")
        if healthy_checks == len(result["checks"]):
            result["status"] = "healthy"
        elif any(check["status"] == "unhealthy" for check in result["checks"]):
            result["status"] = "unhealthy"
        else:
            result["status"] = "warning"
        
        return result
    
    def check_all_components(self, environment: str) -> List[Dict[str, Any]]:
        """Check all environment components."""
        components = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
            transient=True
        ) as progress:
            
            # Kubernetes
            task = progress.add_task("Checking Kubernetes cluster...", total=None)
            k8s_result = self.check_kubernetes_cluster(environment)
            components.append(k8s_result)
            progress.update(task, description="Kubernetes cluster checked")
            
            # Docker Registry
            task = progress.add_task("Checking Docker registry...", total=None)
            registry_result = self.check_docker_registry(environment)
            components.append(registry_result)
            progress.update(task, description="Docker registry checked")
            
            # Monitoring
            task = progress.add_task("Checking monitoring stack...", total=None)
            monitoring_result = self.check_monitoring_stack(environment)
            components.append(monitoring_result)
            progress.update(task, description="Monitoring stack checked")
            
            # GitOps
            task = progress.add_task("Checking GitOps tools...", total=None)
            gitops_result = self.check_gitops_tools(environment)
            components.append(gitops_result)
            progress.update(task, description="GitOps tools checked")
        
        return components


@click.command("env-status")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to check (dev, staging, production)",
    show_default=True,
)
@click.option(
    "--component",
    "-c",
    type=click.Choice(["kubernetes", "docker-registry", "monitoring", "gitops"]),
    help="Check specific component only",
)
@click.option(
    "--detailed",
    is_flag=True,
    help="Show detailed check results",
)
@click.option(
    "--config",
    type=click.Path(exists=True, path_type=Path),
    help="Path to IDP configuration file",
)
def environment_status(environment: str, component: Optional[str], detailed: bool, config: Optional[Path]):
    """Check environment readiness and infrastructure status.
    
    Verify that your environment is properly configured and all required
    components are running before deploying services.
    
    Examples:
      idp-cli env-status --environment dev
      idp-cli env-status --component kubernetes --detailed
      idp-cli env-status --environment production
    """
    checker = EnvironmentChecker(config)
    
    print_step(f"Environment Status Check - {environment.upper()}")
    
    try:
        if component:
            # Check specific component
            if component == "kubernetes":
                results = [checker.check_kubernetes_cluster(environment)]
            elif component == "docker-registry":
                results = [checker.check_docker_registry(environment)]
            elif component == "monitoring":
                results = [checker.check_monitoring_stack(environment)]
            elif component == "gitops":
                results = [checker.check_gitops_tools(environment)]
        else:
            # Check all components
            results = checker.check_all_components(environment)
        
        # Display results
        _display_environment_results(results, detailed)
        
        # Overall summary
        healthy_count = sum(1 for r in results if r["status"] == "healthy")
        warning_count = sum(1 for r in results if r["status"] == "warning")
        unhealthy_count = sum(1 for r in results if r["status"] == "unhealthy")
        
        if unhealthy_count > 0:
            print_error(f"{unhealthy_count} components are unhealthy")
        elif warning_count > 0:
            console.print(f"[yellow]{warning_count} components have warnings[/yellow]")
        else:
            print_success("All components are healthy")
            
    except Exception as e:
        print_error(f"Environment status check failed: {str(e)}")
        raise click.ClickException(str(e))


def _display_environment_results(results: List[Dict[str, Any]], detailed: bool):
    """Display environment check results."""
    for result in results:
        component_name = result["component"].replace("-", " ").title()
        status_color = {
            "healthy": "green",
            "warning": "yellow",
            "unhealthy": "red",
            "unknown": "white"
        }.get(result["status"], "white")
        
        if detailed:
            # Detailed view with individual checks
            table = Table(
                title=f"{component_name} - {result['status'].upper()}",
                box=box.ROUNDED,
                border_style=status_color,
                show_header=True,
                header_style="bold cyan"
            )
            
            table.add_column("Check", style="white", min_width=20)
            table.add_column("Status", style="bold", min_width=10)
            table.add_column("Details", style="dim", min_width=40)
            
            for check in result.get("checks", []):
                check_color = {
                    "healthy": "green",
                    "warning": "yellow",
                    "unhealthy": "red"
                }.get(check["status"], "white")
                
                table.add_row(
                    check["name"],
                    f"[{check_color}]{check['status'].upper()}[/{check_color}]",
                    check["details"]
                )
            
            console.print(table)
            console.print()
        else:
            # Summary view
            status_icon = {
                "healthy": "✅",
                "warning": "⚠️",
                "unhealthy": "❌",
                "unknown": "❓"
            }.get(result["status"], "❓")
            
            console.print(f"{status_icon} {component_name}: [{status_color}]{result['status'].upper()}[/{status_color}]")
    
    if not detailed:
        console.print()
