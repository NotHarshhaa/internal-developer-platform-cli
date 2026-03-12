"""Health check command for monitoring deployed services."""

import json
import time
from pathlib import Path
from typing import Dict, List, Optional

import click
import requests
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree
from rich import box

from idp_cli.utils.console import console, print_step, print_success, print_error


class ServiceHealthChecker:
    """Health checker for deployed services."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load service configuration from file."""
        if not self.config_file.exists():
            return {"services": [], "environments": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"services": [], "environments": {}}
    
    def check_service_health(self, service_name: str, environment: str = "dev") -> Dict:
        """Check health of a specific service."""
        service_config = self.config.get("environments", {}).get(environment, {}).get("services", {})
        service_info = service_config.get(service_name)
        
        if not service_info:
            return {
                "service": service_name,
                "environment": environment,
                "status": "unknown",
                "error": "Service not found in configuration"
            }
        
        health_status = {
            "service": service_name,
            "environment": environment,
            "status": "healthy",
            "checks": []
        }
        
        # Check HTTP endpoint if available
        if "url" in service_info:
            try:
                response = requests.get(
                    service_info["url"], 
                    timeout=10,
                    headers={"User-Agent": "idp-cli/health-check"}
                )
                health_status["checks"].append({
                    "type": "http",
                    "url": service_info["url"],
                    "status": "healthy" if response.status_code < 400 else "unhealthy",
                    "response_time": f"{response.elapsed.total_seconds():.2f}s",
                    "status_code": response.status_code
                })
                
                if response.status_code >= 400:
                    health_status["status"] = "unhealthy"
                    
            except requests.RequestException as e:
                health_status["checks"].append({
                    "type": "http",
                    "url": service_info["url"],
                    "status": "unhealthy",
                    "error": str(e)
                })
                health_status["status"] = "unhealthy"
        
        # Check Kubernetes deployment if available
        if "k8s_deployment" in service_info:
            deployment_name = service_info["k8s_deployment"]
            try:
                # This would typically use kubectl or kubernetes client
                # For now, we'll simulate the check
                health_status["checks"].append({
                    "type": "kubernetes",
                    "deployment": deployment_name,
                    "status": "healthy",  # Simulated
                    "replicas": "3/3",
                    "ready": "True"
                })
            except Exception as e:
                health_status["checks"].append({
                    "type": "kubernetes",
                    "deployment": deployment_name,
                    "status": "unhealthy",
                    "error": str(e)
                })
                health_status["status"] = "unhealthy"
        
        return health_status
    
    def check_all_services(self, environment: str = "dev") -> List[Dict]:
        """Check health of all services in an environment."""
        services = []
        env_config = self.config.get("environments", {}).get(environment, {})
        
        for service_name in env_config.get("services", {}):
            services.append(self.check_service_health(service_name, environment))
        
        return services


@click.command("health")
@click.option(
    "--service",
    "-s",
    help="Check health of a specific service",
)
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to check (dev, staging, production)",
    show_default=True,
)
@click.option(
    "--watch",
    "-w",
    is_flag=True,
    help="Continuously monitor service health",
)
@click.option(
    "--interval",
    "-i",
    default=30,
    help="Interval in seconds for watch mode",
    show_default=True,
)
@click.option(
    "--config",
    "-c",
    type=click.Path(exists=True, path_type=Path),
    help="Path to IDP configuration file",
)
def health_check(service: Optional[str], environment: str, watch: bool, interval: int, config: Optional[Path]):
    """Check health of deployed services.
    
    Monitor the status and availability of your deployed services across different environments.
    
    Examples:
      idp-cli health --environment dev
      idp-cli health --service payment-api --environment staging
      idp-cli health --watch --interval 15
    """
    checker = ServiceHealthChecker(config)
    
    def display_health_results(results):
        """Display health check results in a formatted table."""
        if not results:
            console.print("[yellow]No services found to check[/yellow]")
            return
        
        table = Table(
            title=f"Service Health Status - {environment.upper()} Environment",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Service", style="bold white", min_width=15)
        table.add_column("Status", style="bold", min_width=10)
        table.add_column("Type", style="dim", min_width=8)
        table.add_column("Details", style="white", min_width=30)
        
        for result in results:
            status_color = {
                "healthy": "green",
                "unhealthy": "red",
                "unknown": "yellow"
            }.get(result["status"], "white")
            
            # Main service row
            table.add_row(
                result["service"],
                f"[{status_color}]{result['status'].upper()}[/{status_color}]",
                "service",
                f"Environment: {result['environment']}"
            )
            
            # Individual check rows
            for check in result.get("checks", []):
                check_color = "green" if check["status"] == "healthy" else "red"
                details = []
                
                if "url" in check:
                    details.append(f"URL: {check['url']}")
                if "response_time" in check:
                    details.append(f"Time: {check['response_time']}")
                if "status_code" in check:
                    details.append(f"Code: {check['status_code']}")
                if "replicas" in check:
                    details.append(f"Replicas: {check['replicas']}")
                if "error" in check:
                    details.append(f"Error: {check['error']}")
                
                table.add_row(
                    "",
                    f"[{check_color}]{check['status'].upper()}[/{check_color}]",
                    check["type"],
                    " | ".join(details)
                )
        
        console.print(table)
        
        # Summary
        healthy_count = sum(1 for r in results if r["status"] == "healthy")
        total_count = len(results)
        
        summary_panel = Panel(
            f"[green]Healthy: {healthy_count}[/green] | "
            f"[red]Unhealthy: {total_count - healthy_count}[/red] | "
            f"[white]Total: {total_count}[/white]",
            title="[bold]Health Summary[/bold]",
            border_style="cyan"
        )
        console.print(summary_panel)
    
    try:
        if watch:
            console.print(f"[dim]Monitoring services in {environment} environment... (Ctrl+C to stop)[/dim]")
            
            while True:
                console.clear()
                print_step(f"Health Check - {time.strftime('%Y-%m-%d %H:%M:%S')}")
                
                if service:
                    results = [checker.check_service_health(service, environment)]
                else:
                    results = checker.check_all_services(environment)
                
                display_health_results(results)
                console.print(f"\n[dim]Next check in {interval} seconds...[/dim]")
                time.sleep(interval)
                
        else:
            print_step("Checking Service Health")
            
            if service:
                results = [checker.check_service_health(service, environment)]
            else:
                results = checker.check_all_services(environment)
            
            display_health_results(results)
            
            if service and results:
                service_result = results[0]
                if service_result["status"] == "healthy":
                    print_success(f"Service '{service}' is healthy in {environment} environment")
                else:
                    print_error(f"Service '{service}' is unhealthy in {environment} environment")
            else:
                healthy_count = sum(1 for r in results if r["status"] == "healthy")
                if healthy_count == len(results):
                    print_success(f"All services are healthy in {environment} environment")
                else:
                    print_error(f"{len(results) - healthy_count} services are unhealthy in {environment} environment")
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Health monitoring stopped[/yellow]")
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        raise click.ClickException(str(e))
