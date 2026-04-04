"""Service management commands for the IDP CLI."""

import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Any

import click
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree
from rich import box
from rich.live import Live
from rich.console import Console, Group
from rich.layout import Layout
from rich.text import Text

from idp_cli.utils.console import console, print_step, print_success, print_error


class ServiceManager:
    """Manages service operations across environments."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load service configuration from file."""
        if not self.config_file.exists():
            return {"services": {}, "environments": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"services": {}, "environments": {}}
    
    def list_services(self, environment: str = "dev") -> List[Dict[str, Any]]:
        """List all services in the specified environment."""
        env_config = self.config.get("environments", {}).get(environment, {})
        services = env_config.get("services", {})
        
        service_list = []
        for service_name, service_config in services.items():
            # Get real-time status from Kubernetes
            status = self._get_service_status(service_name, environment)
            
            service_info = {
                "name": service_name,
                "status": status["status"],
                "replicas": status["replicas"],
                "ready": status["ready"],
                "image": service_config.get("image", "N/A"),
                "team": service_config.get("team", "unassigned"),
                "created": service_config.get("created", "N/A"),
                "cpu_request": service_config.get("resources", {}).get("cpu", "N/A"),
                "memory_request": service_config.get("resources", {}).get("memory", "N/A"),
            }
            service_list.append(service_info)
        
        return sorted(service_list, key=lambda x: x["name"])
    
    def _get_service_status(self, service_name: str, environment: str) -> Dict[str, Any]:
        """Get real-time service status from Kubernetes."""
        try:
            # This would integrate with actual Kubernetes API
            # For now, return mock data
            return {
                "status": "Running",
                "replicas": 3,
                "ready": 3,
                "namespace": f"{environment}",
            }
        except Exception:
            return {
                "status": "Unknown",
                "replicas": 0,
                "ready": 0,
                "namespace": f"{environment}",
            }
    
    def get_service_info(self, service_name: str, environment: str = "dev") -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific service."""
        env_config = self.config.get("environments", {}).get(environment, {})
        services = env_config.get("services", {})
        
        if service_name not in services:
            return None
        
        service_config = services[service_name]
        status = self._get_service_status(service_name, environment)
        
        # Get additional details
        endpoints = self._get_service_endpoints(service_name, environment)
        dependencies = service_config.get("dependencies", [])
        health_checks = self._get_health_checks(service_name, environment)
        
        return {
            "name": service_name,
            "status": status["status"],
            "replicas": status["replicas"],
            "ready": status["ready"],
            "namespace": status["namespace"],
            "image": service_config.get("image", "N/A"),
            "team": service_config.get("team", "unassigned"),
            "created": service_config.get("created", "N/A"),
            "endpoints": endpoints,
            "dependencies": dependencies,
            "health_checks": health_checks,
            "resources": service_config.get("resources", {}),
            "environment_vars": service_config.get("environment", {}),
            "labels": service_config.get("labels", {}),
        }
    
    def _get_service_endpoints(self, service_name: str, environment: str) -> List[str]:
        """Get service endpoints."""
        # Mock implementation - would query Kubernetes service endpoints
        return [
            f"http://{service_name}.{environment}.svc.cluster.local:8080",
            f"https://{service_name}-{environment}.company.com",
        ]
    
    def _get_health_checks(self, service_name: str, environment: str) -> Dict[str, Any]:
        """Get health check information."""
        # Mock implementation - would query health endpoints
        return {
            "readiness": "/health/ready",
            "liveness": "/health/live",
            "startup": "/health/startup",
            "last_check": time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Healthy",
        }
    
    def restart_service(self, service_name: str, environment: str = "dev") -> bool:
        """Restart a service in the specified environment."""
        try:
            # This would trigger a Kubernetes deployment restart
            # For now, simulate the operation
            print_step(f"Restarting {service_name} in {environment}...")
            time.sleep(2)  # Simulate API call
            
            # Update restart timestamp in config
            self._update_service_restart_time(service_name, environment)
            return True
        except Exception as e:
            print_error(f"Failed to restart {service_name}: {e}")
            return False
    
    def _update_service_restart_time(self, service_name: str, environment: str):
        """Update service restart timestamp in config."""
        env_config = self.config.setdefault("environments", {}).setdefault(environment, {})
        services = env_config.setdefault("services", {})
        
        if service_name in services:
            services[service_name]["last_restart"] = time.strftime("%Y-%m-%d %H:%M:%S")
            
            # Save config
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)


@click.group("service")
def service_group():
    """Manage services across environments."""
    pass


@service_group.command("list")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to list services from",
    show_default=True,
)
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["table", "tree", "json"]),
    default="table",
    help="Output format",
    show_default=True,
)
@click.option(
    "--team",
    help="Filter by team",
)
@click.option(
    "--status",
    help="Filter by status",
)
def list_services(environment: str, output_format: str, team: Optional[str], status: Optional[str]):
    """List all services in the specified environment.
    
    Examples:
      idp-cli service list --environment prod
      idp-cli service list --team backend --format tree
      idp-cli service list --status Running
    """
    manager = ServiceManager()
    services = manager.list_services(environment)
    
    # Apply filters
    if team:
        services = [s for s in services if s["team"] == team]
    if status:
        services = [s for s in services if s["status"].lower() == status.lower()]
    
    if not services:
        console.print("[yellow]No services found matching the criteria[/yellow]")
        return
    
    if output_format == "table":
        table = Table(
            title=f"Services - {environment.upper()} Environment",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Service", style="bold white", min_width=15)
        table.add_column("Status", style="bold", min_width=10)
        table.add_column("Replicas", style="white", min_width=8)
        table.add_column("Ready", style="white", min_width=8)
        table.add_column("Team", style="white", min_width=12)
        table.add_column("CPU", style="white", min_width=8)
        table.add_column("Memory", style="white", min_width=10)
        
        for service in services:
            status_style = "green" if service["status"] == "Running" else "red"
            status_text = f"[{status_style}]{service['status']}[/{status_style}]"
            
            replicas_text = f"{service['ready']}/{service['replicas']}"
            replicas_style = "green" if service['ready'] == service['replicas'] else "yellow"
            
            table.add_row(
                service["name"],
                status_text,
                f"{service['replicas']}",
                f"[{replicas_style}]{replicas_text}[/{replicas_style}]",
                service["team"],
                service["cpu_request"],
                service["memory_request"]
            )
        
        console.print(table)
        
        # Summary
        total = len(services)
        running = len([s for s in services if s["status"] == "Running"])
        console.print(f"\n[cyan]Total:[/cyan] {total} | [green]Running:[/green] {running} | [red]Stopped:[/red] {total - running}")
    
    elif output_format == "tree":
        tree = Tree(f"[bold cyan]Services - {environment.upper()}[/bold cyan]")
        
        # Group by team
        teams = {}
        for service in services:
            team = service["team"] or "unassigned"
            if team not in teams:
                teams[team] = []
            teams[team].append(service)
        
        for team_name, team_services in sorted(teams.items()):
            team_branch = tree.add(f"[blue]Team: {team_name}[/blue]")
            for service in sorted(team_services, key=lambda x: x["name"]):
                status_style = "green" if service["status"] == "Running" else "red"
                service_branch = team_branch.add(
                    f"[{status_style}]{service['name']} ({service['status']})[/{status_style}]"
                )
                service_branch.add(f"[dim]Replicas: {service['ready']}/{service['replicas']}[/dim]")
                service_branch.add(f"[dim]CPU: {service['cpu_request']} | Memory: {service['memory_request']}[/dim]")
        
        console.print(tree)
    
    elif output_format == "json":
        console.print(json.dumps(services, indent=2))


@service_group.command("info")
@click.argument("service_name")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to get service info from",
    show_default=True,
)
def service_info(service_name: str, environment: str):
    """Get detailed information about a specific service.
    
    Examples:
      idp-cli service info payment-service
      idp-cli service info user-service --environment staging
    """
    manager = ServiceManager()
    service_info = manager.get_service_info(service_name, environment)
    
    if not service_info:
        print_error(f"Service '{service_name}' not found in {environment} environment")
        raise SystemExit(1)
    
    # Create detailed info panel
    info_text = f"""
[bold cyan]Service Information[/bold cyan]

[basic]Name:[/basic]     {service_info['name']}
[basic]Status:[/basic]    {service_info['status']}
[basic]Replicas:[/basic]  {service_info['ready']}/{service_info['replicas']}
[basic]Namespace:[/basic] {service_info['namespace']}
[basic]Team:[/basic]     {service_info['team']}
[basic]Created:[/basic]   {service_info['created']}
[basic]Image:[/basic]     {service_info['image']}

[bold cyan]Resources[/bold cyan]
[basic]CPU Request:[/basic]      {service_info['resources'].get('cpu', 'N/A')}
[basic]Memory Request:[/basic]   {service_info['resources'].get('memory', 'N/A')}

[bold cyan]Endpoints[/bold cyan]
"""
    
    for endpoint in service_info['endpoints']:
        info_text += f"• {endpoint}\n"
    
    info_text += f"""
[bold cyan]Dependencies[/bold cyan]
"""
    
    if service_info['dependencies']:
        for dep in service_info['dependencies']:
            info_text += f"• {dep}\n"
    else:
        info_text += "None\n"
    
    info_text += f"""
[bold cyan]Health Checks[/bold cyan]
[basic]Readiness:[/basic] {service_info['health_checks']['readiness']}
[basic]Liveness:[/basic]  {service_info['health_checks']['liveness']}
[basic]Startup:[/basic]    {service_info['health_checks']['startup']}
[basic]Last Check:[/basic] {service_info['health_checks']['last_check']}
[basic]Status:[/basic]     {service_info['health_checks']['status']}
"""
    
    console.print(Panel(
        info_text.strip(),
        title=f"[bold white]{service_name} - {environment.upper()}[/bold white]",
        border_style="cyan",
        box=box.ROUNDED,
        padding=(1, 2)
    ))


@service_group.command("restart")
@click.argument("service_name")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to restart service in",
    show_default=True,
)
@click.option(
    "--wait",
    "-w",
    is_flag=True,
    help="Wait for service to be ready after restart",
)
def restart_service(service_name: str, environment: str, wait: bool):
    """Restart a service in the specified environment.
    
    Examples:
      idp-cli service restart payment-service
      idp-cli service restart user-service --environment staging --wait
    """
    manager = ServiceManager()
    
    # Check if service exists
    service_info = manager.get_service_info(service_name, environment)
    if not service_info:
        print_error(f"Service '{service_name}' not found in {environment} environment")
        raise SystemExit(1)
    
    console.print(f"[cyan]Restarting service [bold]{service_name}[/bold] in [bold]{environment}[/bold] environment...[/cyan]")
    
    success = manager.restart_service(service_name, environment)
    
    if success:
        print_success(f"Service '{service_name}' restarted successfully")
        
        if wait:
            console.print("[cyan]Waiting for service to be ready...[/cyan]")
            # In a real implementation, this would poll the Kubernetes API
            time.sleep(5)  # Simulate wait time
            print_success("Service is ready")
    else:
        print_error(f"Failed to restart service '{service_name}'")
        raise SystemExit(1)


@service_group.command("logs")
@click.argument("service_name")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to get logs from",
    show_default=True,
)
@click.option(
    "--follow",
    "-f",
    is_flag=True,
    help="Follow logs in real-time",
)
@click.option(
    "--tail",
    "-n",
    type=int,
    default=50,
    help="Number of lines to show from the end",
    show_default=True,
)
@click.option(
    "--container",
    "-c",
    help="Container name (if multiple containers)",
)
def service_logs(service_name: str, environment: str, follow: bool, tail: int, container: Optional[str]):
    """Get logs for a specific service.
    
    Examples:
      idp-cli service logs payment-service
      idp-cli service logs user-service --environment staging --follow
      idp-cli service logs worker-service --tail 100
    """
    manager = ServiceManager()
    
    # Check if service exists
    service_info = manager.get_service_info(service_name, environment)
    if not service_info:
        print_error(f"Service '{service_name}' not found in {environment} environment")
        raise SystemExit(1)
    
    console.print(f"[cyan]Fetching logs for [bold]{service_name}[/bold] in [bold]{environment}[/bold] environment...[/cyan]")
    
    # Mock log implementation - would integrate with Kubernetes logs API
    mock_logs = [
        f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO: Starting {service_name} service...",
        f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO: Database connection established",
        f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO: Service listening on port 8080",
        f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO: Health check endpoint ready",
        f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] INFO: Request processed successfully",
    ]
    
    if follow:
        console.print("[yellow]Following logs (Press Ctrl+C to stop)...[/yellow]")
        try:
            while True:
                for log_line in mock_logs:
                    console.print(log_line)
                    time.sleep(1)
        except KeyboardInterrupt:
            console.print("\n[cyan]Stopped following logs[/cyan]")
    else:
        # Show last N lines
        for log_line in mock_logs[-tail:]:
            console.print(log_line)
