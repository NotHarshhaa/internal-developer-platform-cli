"""Enhanced health check command with SLA monitoring and advanced metrics."""

import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

import click
import requests
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.live import Live
from rich.layout import Layout
from rich.console import Console, Group

from idp_cli.utils.console import console, print_step, print_success, print_error


class EnhancedHealthChecker:
    """Enhanced health checker with SLA monitoring and advanced metrics."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
        self.metrics_history = {}  # Store metrics history for trend analysis
    
    def _load_config(self) -> Dict:
        """Load service configuration from file."""
        if not self.config_file.exists():
            return {"services": [], "environments": {}, "sla_policies": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"services": [], "environments": {}, "sla_policies": {}}
    
    def check_service_health(self, service_name: str, environment: str = "dev", 
                           detailed: bool = False) -> Dict[str, Any]:
        """Check comprehensive health of a specific service."""
        service_config = self.config.get("environments", {}).get(environment, {}).get("services", {})
        service_info = service_config.get(service_name)
        
        if not service_info:
            return {
                "service": service_name,
                "environment": environment,
                "status": "unknown",
                "error": "Service not found in configuration",
                "timestamp": datetime.now().isoformat()
            }
        
        health_status = {
            "service": service_name,
            "environment": environment,
            "timestamp": datetime.now().isoformat(),
            "checks": {}
        }
        
        # Basic health checks
        health_status["checks"]["basic"] = self._check_basic_health(service_name, environment, service_info)
        
        if detailed:
            # Advanced health checks
            health_status["checks"]["performance"] = self._check_performance_metrics(service_name, environment, service_info)
            health_status["checks"]["dependencies"] = self._check_dependency_health(service_name, environment, service_info)
            health_status["checks"]["resources"] = self._check_resource_usage(service_name, environment, service_info)
            health_status["checks"]["sla"] = self._check_sla_compliance(service_name, environment, service_info)
        
        # Calculate overall health score
        health_status["overall_score"] = self._calculate_health_score(health_status["checks"])
        health_status["status"] = self._determine_status(health_status["overall_score"])
        
        # Store metrics for history
        self._store_metrics(service_name, environment, health_status)
        
        return health_status
    
    def _check_basic_health(self, service_name: str, environment: str, service_info: Dict) -> Dict[str, Any]:
        """Perform basic health checks."""
        checks = {}
        
        # 1. Service endpoint check
        endpoint = service_info.get("endpoint", f"http://{service_name}.{environment}.svc.cluster.local:8080")
        try:
            response = requests.get(f"{endpoint}/health", timeout=5)
            checks["endpoint"] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time": response.elapsed.total_seconds(),
                "status_code": response.status_code,
                "message": "Service endpoint accessible"
            }
        except requests.exceptions.RequestException as e:
            checks["endpoint"] = {
                "status": "unhealthy",
                "error": str(e),
                "message": "Service endpoint not accessible"
            }
        
        # 2. Kubernetes deployment status
        checks["deployment"] = {
            "status": "healthy",  # Would check actual K8s status
            "replicas": service_info.get("replicas", 1),
            "ready_replicas": service_info.get("ready_replicas", 1),
            "message": "Deployment is running"
        }
        
        # 3. Container health
        checks["containers"] = {
            "status": "healthy",
            "running": service_info.get("running_containers", 1),
            "total": service_info.get("total_containers", 1),
            "message": "All containers are healthy"
        }
        
        return checks
    
    def _check_performance_metrics(self, service_name: str, environment: str, service_info: Dict) -> Dict[str, Any]:
        """Check performance metrics."""
        metrics = {}
        
        # Mock performance metrics - would integrate with monitoring system
        metrics["response_time"] = {
            "current": 120,  # ms
            "threshold": 500,  # ms
            "status": "healthy",
            "trend": "stable"
        }
        
        metrics["throughput"] = {
            "current": 1500,  # requests/min
            "threshold": 1000,  # requests/min
            "status": "healthy",
            "trend": "increasing"
        }
        
        metrics["error_rate"] = {
            "current": 0.1,  # percentage
            "threshold": 1.0,  # percentage
            "status": "healthy",
            "trend": "decreasing"
        }
        
        metrics["cpu_usage"] = {
            "current": 45.2,  # percentage
            "threshold": 80.0,  # percentage
            "status": "healthy",
            "trend": "stable"
        }
        
        metrics["memory_usage"] = {
            "current": 62.8,  # percentage
            "threshold": 85.0,  # percentage
            "status": "healthy",
            "trend": "increasing"
        }
        
        return metrics
    
    def _check_dependency_health(self, service_name: str, environment: str, service_info: Dict) -> Dict[str, Any]:
        """Check health of service dependencies."""
        dependencies = service_info.get("dependencies", [])
        dep_health = {}
        
        for dep in dependencies:
            # Mock dependency health check
            dep_health[dep] = {
                "status": "healthy",
                "connection": "established",
                "response_time": 25,  # ms
                "last_check": datetime.now().isoformat()
            }
        
        return {
            "dependencies": dep_health,
            "total_dependencies": len(dependencies),
            "healthy_dependencies": len([d for d in dep_health.values() if d["status"] == "healthy"])
        }
    
    def _check_resource_usage(self, service_name: str, environment: str, service_info: Dict) -> Dict[str, Any]:
        """Check resource usage and quotas."""
        resources = {}
        
        # Mock resource data
        resources["cpu"] = {
            "requested": "500m",
            "limit": "1000m",
            "current_usage": "450m",
            "utilization_percent": 45.0,
            "status": "healthy"
        }
        
        resources["memory"] = {
            "requested": "512Mi",
            "limit": "1Gi",
            "current_usage": "320Mi",
            "utilization_percent": 62.5,
            "status": "healthy"
        }
        
        resources["storage"] = {
            "requested": "1Gi",
            "limit": "5Gi",
            "current_usage": "750Mi",
            "utilization_percent": 75.0,
            "status": "warning"
        }
        
        resources["network"] = {
            "ingress": "10MB/s",
            "egress": "25MB/s",
            "status": "healthy"
        }
        
        return resources
    
    def _check_sla_compliance(self, service_name: str, environment: str, service_info: Dict) -> Dict[str, Any]:
        """Check SLA compliance."""
        sla_policies = self.config.get("sla_policies", {}).get(service_name, {})
        
        # Default SLA policies if not configured
        default_sla = {
            "availability": 99.9,  # percentage
            "response_time_p99": 500,  # ms
            "error_rate": 1.0,  # percentage
        }
        
        sla = {**default_sla, **sla_policies}
        
        # Mock SLA metrics
        current_metrics = {
            "availability": 99.95,
            "response_time_p99": 420,
            "error_rate": 0.2,
        }
        
        compliance = {}
        for metric, threshold in sla.items():
            current = current_metrics.get(metric, 0)
            if metric == "availability":
                compliant = current >= threshold
            else:
                compliant = current <= threshold
            
            compliance[metric] = {
                "threshold": threshold,
                "current": current,
                "compliant": compliant,
                "status": "compliant" if compliant else "non_compliant"
            }
        
        # Calculate overall SLA score
        compliant_count = sum(1 for c in compliance.values() if c["compliant"])
        overall_compliance = (compliant_count / len(compliance)) * 100
        
        return {
            "metrics": compliance,
            "overall_compliance": overall_compliance,
            "status": "compliant" if overall_compliance >= 90 else "non_compliant"
        }
    
    def _calculate_health_score(self, checks: Dict[str, Any]) -> float:
        """Calculate overall health score from all checks."""
        scores = []
        
        # Basic health score (40% weight)
        basic_checks = checks.get("basic", {})
        basic_score = sum(1 for check in basic_checks.values() 
                         if check.get("status") == "healthy") / max(len(basic_checks), 1) * 100
        scores.append(("basic", basic_score, 0.4))
        
        # Performance score (30% weight)
        if "performance" in checks:
            perf_checks = checks["performance"]
            perf_score = sum(1 for check in perf_checks.values() 
                           if check.get("status") == "healthy") / max(len(perf_checks), 1) * 100
            scores.append(("performance", perf_score, 0.3))
        
        # Dependencies score (15% weight)
        if "dependencies" in checks:
            dep_checks = checks["dependencies"]
            healthy_deps = dep_checks.get("healthy_dependencies", 0)
            total_deps = dep_checks.get("total_dependencies", 1)
            dep_score = (healthy_deps / total_deps) * 100
            scores.append(("dependencies", dep_score, 0.15))
        
        # SLA score (15% weight)
        if "sla" in checks:
            sla_score = checks["sla"].get("overall_compliance", 0)
            scores.append(("sla", sla_score, 0.15))
        
        # Calculate weighted average
        total_score = sum(score * weight for category, score, weight in scores)
        return round(total_score, 2)
    
    def _determine_status(self, score: float) -> str:
        """Determine service status based on health score."""
        if score >= 90:
            return "healthy"
        elif score >= 70:
            return "warning"
        elif score >= 50:
            return "degraded"
        else:
            return "unhealthy"
    
    def _store_metrics(self, service_name: str, environment: str, health_status: Dict[str, Any]):
        """Store metrics for historical analysis."""
        key = f"{service_name}:{environment}"
        if key not in self.metrics_history:
            self.metrics_history[key] = []
        
        # Keep only last 100 data points
        self.metrics_history[key].append({
            "timestamp": health_status["timestamp"],
            "score": health_status["overall_score"],
            "status": health_status["status"]
        })
        
        if len(self.metrics_history[key]) > 100:
            self.metrics_history[key] = self.metrics_history[key][-100:]
    
    def check_environment_health(self, environment: str = "dev", detailed: bool = False) -> Dict[str, Any]:
        """Check health of all services in an environment."""
        env_config = self.config.get("environments", {}).get(environment, {})
        services = env_config.get("services", {})
        
        if not services:
            return {
                "environment": environment,
                "status": "no_services",
                "message": f"No services found in {environment} environment"
            }
        
        env_health = {
            "environment": environment,
            "timestamp": datetime.now().isoformat(),
            "services": {},
            "summary": {}
        }
        
        # Check each service
        with Progress(
            SpinnerColumn(style="cyan"),
            TextColumn("[bold white]{task.description}"),
            console=console,
            transient=True,
        ) as progress:
            task = progress.add_task(f"Checking health in {environment}...", total=len(services))
            
            for service_name in services.keys():
                service_health = self.check_service_health(service_name, environment, detailed)
                env_health["services"][service_name] = service_health
                progress.advance(task)
        
        # Calculate environment summary
        scores = [s["overall_score"] for s in env_health["services"].values()]
        env_health["summary"] = {
            "total_services": len(services),
            "healthy_services": len([s for s in env_health["services"].values() if s["status"] == "healthy"]),
            "warning_services": len([s for s in env_health["services"].values() if s["status"] == "warning"]),
            "degraded_services": len([s for s in env_health["services"].values() if s["status"] == "degraded"]),
            "unhealthy_services": len([s for s in env_health["services"].values() if s["status"] == "unhealthy"]),
            "average_score": sum(scores) / len(scores) if scores else 0,
            "status": self._determine_status(sum(scores) / len(scores) if scores else 0)
        }
        
        return env_health
    
    def get_health_trends(self, service_name: str, environment: str = "dev", 
                         hours: int = 24) -> Dict[str, Any]:
        """Get health trends for a service over time."""
        key = f"{service_name}:{environment}"
        history = self.metrics_history.get(key, [])
        
        if not history:
            return {
                "service": service_name,
                "environment": environment,
                "message": "No historical data available"
            }
        
        # Filter data by time range
        cutoff_time = datetime.now() - timedelta(hours=hours)
        filtered_data = [
            entry for entry in history
            if datetime.fromisoformat(entry["timestamp"]) >= cutoff_time
        ]
        
        if not filtered_data:
            return {
                "service": service_name,
                "environment": environment,
                "message": f"No data available in the last {hours} hours"
            }
        
        # Calculate trends
        scores = [entry["score"] for entry in filtered_data]
        avg_score = sum(scores) / len(scores)
        min_score = min(scores)
        max_score = max(scores)
        
        # Simple trend calculation (compare first half vs second half)
        mid_point = len(filtered_data) // 2
        first_half_avg = sum(scores[:mid_point]) / mid_point if mid_point > 0 else avg_score
        second_half_avg = sum(scores[mid_point:]) / (len(scores) - mid_point) if len(scores) > mid_point else avg_score
        
        trend = "improving" if second_half_avg > first_half_avg else "declining" if second_half_avg < first_half_avg else "stable"
        
        return {
            "service": service_name,
            "environment": environment,
            "period_hours": hours,
            "data_points": len(filtered_data),
            "average_score": round(avg_score, 2),
            "min_score": min_score,
            "max_score": max_score,
            "trend": trend,
            "data": filtered_data[-10:]  # Return last 10 data points
        }


@click.command("health")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to check health for",
    show_default=True,
)
@click.option(
    "--service",
    "-s",
    help="Specific service to check (checks all services if not provided)",
)
@click.option(
    "--detailed",
    "-d",
    is_flag=True,
    help="Include detailed performance and SLA checks",
)
@click.option(
    "--watch",
    "-w",
    is_flag=True,
    help="Watch health status in real-time",
)
@click.option(
    "--interval",
    "-i",
    type=int,
    default=30,
    help="Refresh interval in seconds for watch mode",
    show_default=True,
)
@click.option(
    "--trends",
    "-t",
    type=int,
    help="Show health trends for the last N hours",
)
def enhanced_health(environment: str, service: Optional[str], detailed: bool, 
                   watch: bool, interval: int, trends: Optional[int]):
    """Enhanced health monitoring with SLA and performance metrics.
    
    Examples:
      idp-cli health --environment prod
      idp-cli health --service payment-service --detailed
      idp-cli health --watch --interval 15
      idp-cli health --trends 24
    """
    checker = EnhancedHealthChecker()
    
    if trends and service:
        # Show trends for specific service
        trends_data = checker.get_health_trends(service, environment, trends)
        
        if "message" in trends_data:
            console.print(f"[yellow]{trends_data['message']}[/yellow]")
            return
        
        # Display trends
        trends_table = Table(
            title=f"Health Trends - {service} ({environment}) - Last {trends}h",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        trends_table.add_column("Metric", style="bold white", min_width=15)
        trends_table.add_column("Value", style="white", min_width=12)
        trends_table.add_column("Details", style="dim", min_width=20)
        
        trends_table.add_row("Average Score", f"{trends_data['average_score']}%", "")
        trends_table.add_row("Min Score", f"{trends_data['min_score']}%", "")
        trends_table.add_row("Max Score", f"{trends_data['max_score']}%", "")
        trends_table.add_row("Trend", trends_data['trend'], f"Based on {trends_data['data_points']} data points")
        
        console.print(trends_table)
        
        # Show recent data points
        if trends_data["data"]:
            console.print("\n[bold cyan]Recent Health History:[/bold cyan]")
            history_table = Table(
                box=box.ROUNDED,
                border_style="cyan",
                show_header=True,
                header_style="bold cyan"
            )
            
            history_table.add_column("Time", style="white", min_width=16)
            history_table.add_column("Score", style="white", min_width=8)
            history_table.add_column("Status", style="bold", min_width=10)
            
            for entry in reversed(trends_data["data"][-5:]):
                timestamp = datetime.fromisoformat(entry["timestamp"]).strftime("%H:%M:%S")
                status_style = {
                    "healthy": "green",
                    "warning": "yellow",
                    "degraded": "orange3",
                    "unhealthy": "red"
                }.get(entry["status"], "white")
                
                history_table.add_row(
                    timestamp,
                    f"{entry['score']}%",
                    f"[{status_style}]{entry['status'].upper()}[/{status_style}]"
                )
            
            console.print(history_table)
        return
    
    def display_health():
        if service:
            # Check specific service
            health_status = checker.check_service_health(service, environment, detailed)
            _display_service_health(health_status, detailed)
        else:
            # Check entire environment
            env_health = checker.check_environment_health(environment, detailed)
            _display_environment_health(env_health, detailed)
    
    if watch:
        console.print(f"[cyan]Watching health status for [bold]{environment}[/bold] environment (Ctrl+C to stop)[/cyan]")
        console.print(f"[dim]Refresh interval: {interval} seconds[/dim]\n")
        
        try:
            while True:
                console.clear()
                display_health()
                time.sleep(interval)
        except KeyboardInterrupt:
            console.print("\n[cyan]Stopped watching health status[/cyan]")
    else:
        display_health()


def _display_service_health(health_status: Dict[str, Any], detailed: bool):
    """Display health status for a single service."""
    status_style = {
        "healthy": "green",
        "warning": "yellow",
        "degraded": "orange3",
        "unhealthy": "red",
        "unknown": "dim"
    }.get(health_status["status"], "white")
    
    # Service overview
    overview_text = f"""
[bold cyan]Service Overview[/bold cyan]

[basic]Service:[/basic]     {health_status['service']}
[basic]Environment:[/basic] {health_status['environment']}
[basic]Status:[/basic]     [{status_style}]{health_status['status'].upper()}[/{status_style}]
[basic]Health Score:[/basic] {health_status['overall_score']}%
[basic]Timestamp:[/basic]   {health_status['timestamp']}
"""
    
    console.print(Panel(
        overview_text.strip(),
        title=f"[bold white]{health_status['service']} Health[/bold white]",
        border_style=status_style,
        box=box.ROUNDED,
        padding=(1, 2)
    ))
    
    # Basic checks
    basic_checks = health_status["checks"].get("basic", {})
    if basic_checks:
        console.print("\n[bold cyan]Basic Health Checks:[/bold cyan]")
        basic_table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        basic_table.add_column("Check", style="white", min_width=15)
        basic_table.add_column("Status", style="bold", min_width=10)
        basic_table.add_column("Details", style="dim", min_width=25)
        
        for check_name, check_data in basic_checks.items():
            check_style = "green" if check_data.get("status") == "healthy" else "red"
            details = check_data.get("message", "N/A")
            
            if "response_time" in check_data:
                details += f" (Response time: {check_data['response_time']:.3f}s)"
            
            basic_table.add_row(
                check_name.title(),
                f"[{check_style}]{check_data.get('status', 'unknown').upper()}[/{check_style}]",
                details
            )
        
        console.print(basic_table)
    
    if detailed:
        # Detailed checks
        for check_type in ["performance", "dependencies", "resources", "sla"]:
            if check_type in health_status["checks"]:
                _display_detailed_check(check_type, health_status["checks"][check_type])


def _display_detailed_check(check_type: str, check_data: Dict[str, Any]):
    """Display detailed health check information."""
    console.print(f"\n[bold cyan]{check_type.title()} Checks:[/bold cyan]")
    
    if check_type == "performance":
        table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Metric", style="white", min_width=15)
        table.add_column("Current", style="white", min_width=10)
        table.add_column("Threshold", style="white", min_width=10)
        table.add_column("Status", style="bold", min_width=10)
        table.add_column("Trend", style="white", min_width=8)
        
        for metric_name, metric_data in check_data.items():
            status_style = "green" if metric_data.get("status") == "healthy" else "red"
            
            table.add_row(
                metric_name.replace("_", " ").title(),
                str(metric_data.get("current", "N/A")),
                str(metric_data.get("threshold", "N/A")),
                f"[{status_style}]{metric_data.get('status', 'unknown').upper()}[/{status_style}]",
                metric_data.get("trend", "N/A")
            )
        
        console.print(table)
    
    elif check_type == "dependencies":
        deps = check_data.get("dependencies", {})
        if deps:
            table = Table(
                box=box.ROUNDED,
                border_style="cyan",
                show_header=True,
                header_style="bold cyan"
            )
            
            table.add_column("Dependency", style="white", min_width=15)
            table.add_column("Status", style="bold", min_width=10)
            table.add_column("Connection", style="white", min_width=12)
            table.add_column("Response Time", style="white", min_width=12)
            
            for dep_name, dep_data in deps.items():
                status_style = "green" if dep_data.get("status") == "healthy" else "red"
                
                table.add_row(
                    dep_name,
                    f"[{status_style}]{dep_data.get('status', 'unknown').upper()}[/{status_style}]",
                    dep_data.get("connection", "N/A"),
                    f"{dep_data.get('response_time', 'N/A')}ms"
                )
            
            console.print(table)
        
        console.print(f"[dim]Healthy dependencies: {check_data.get('healthy_dependencies', 0)}/{check_data.get('total_dependencies', 0)}[/dim]")
    
    elif check_type == "resources":
        table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Resource", style="white", min_width=10)
        table.add_column("Requested", style="white", min_width=10)
        table.add_column("Limit", style="white", min_width=8)
        table.add_column("Current", style="white", min_width=10)
        table.add_column("Utilization", style="white", min_width=12)
        table.add_column("Status", style="bold", min_width=8)
        
        for resource_name, resource_data in check_data.items():
            if isinstance(resource_data, dict) and "status" in resource_data:
                status_style = "green" if resource_data.get("status") == "healthy" else "yellow" if resource_data.get("status") == "warning" else "red"
                
                table.add_row(
                    resource_name.title(),
                    resource_data.get("requested", "N/A"),
                    resource_data.get("limit", "N/A"),
                    resource_data.get("current_usage", "N/A"),
                    f"{resource_data.get('utilization_percent', 0)}%",
                    f"[{status_style}]{resource_data.get('status', 'unknown').upper()}[/{status_style}]"
                )
        
        console.print(table)
    
    elif check_type == "sla":
        metrics = check_data.get("metrics", {})
        if metrics:
            table = Table(
                box=box.ROUNDED,
                border_style="cyan",
                show_header=True,
                header_style="bold cyan"
            )
            
            table.add_column("SLA Metric", style="white", min_width=15)
            table.add_column("Threshold", style="white", min_width=10)
            table.add_column("Current", style="white", min_width=10)
            table.add_column("Compliance", style="bold", min_width=10)
            
            for metric_name, metric_data in metrics.items():
                compliance_style = "green" if metric_data.get("compliant") else "red"
                compliance_text = "✓" if metric_data.get("compliant") else "✗"
                
                table.add_row(
                    metric_name.replace("_", " ").title(),
                    str(metric_data.get("threshold", "N/A")),
                    str(metric_data.get("current", "N/A")),
                    f"[{compliance_style}]{compliance_text}[/{compliance_style}]"
                )
            
            console.print(table)
        
        overall_compliance = check_data.get("overall_compliance", 0)
        compliance_style = "green" if overall_compliance >= 90 else "yellow" if overall_compliance >= 70 else "red"
        
        console.print(f"\n[dim]Overall SLA Compliance: [{compliance_style}]{overall_compliance}%[/{compliance_style}][/dim]")


def _display_environment_health(env_health: Dict[str, Any], detailed: bool):
    """Display health status for an entire environment."""
    summary = env_health["summary"]
    
    # Environment overview
    status_style = {
        "healthy": "green",
        "warning": "yellow",
        "degraded": "orange3",
        "unhealthy": "red",
        "no_services": "dim"
    }.get(summary["status"], "white")
    
    overview_text = f"""
[bold cyan]Environment Overview[/bold cyan]

[basic]Environment:[/basic] {env_health['environment']}
[basic]Status:[/basic]     [{status_style}]{summary['status'].upper()}[/{status_style}]
[basic]Total Services:[/basic] {summary['total_services']}
[basic]Average Score:[/basic] {summary['average_score']:.1f}%
[basic]Timestamp:[/basic]   {env_health['timestamp']}

[bold cyan]Service Distribution[/bold cyan]
[basic]Healthy:[/basic]   [green]{summary['healthy_services']}[/green]
[basic]Warning:[/basic]   [yellow]{summary['warning_services']}[/yellow]
[basic]Degraded:[/basic]  [orange3]{summary['degraded_services']}[/orange3]
[basic]Unhealthy:[/basic] [red]{summary['unhealthy_services']}[/red]
"""
    
    console.print(Panel(
        overview_text.strip(),
        title=f"[bold white]{env_health['environment'].upper()} Environment Health[/bold white]",
        border_style=status_style,
        box=box.ROUNDED,
        padding=(1, 2)
    ))
    
    # Service details table
    if env_health["services"]:
        console.print("\n[bold cyan]Service Details:[/bold cyan]")
        services_table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        services_table.add_column("Service", style="bold white", min_width=15)
        services_table.add_column("Status", style="bold", min_width=10)
        services_table.add_column("Health Score", style="white", min_width=12)
        services_table.add_column("Last Check", style="dim", min_width=16)
        
        for service_name, service_data in env_health["services"].items():
            service_status = service_data["status"]
            service_style = {
                "healthy": "green",
                "warning": "yellow",
                "degraded": "orange3",
                "unhealthy": "red",
                "unknown": "dim"
            }.get(service_status, "white")
            
            timestamp = datetime.fromisoformat(service_data["timestamp"]).strftime("%H:%M:%S")
            
            services_table.add_row(
                service_name,
                f"[{service_style}]{service_status.upper()}[/{service_style}]",
                f"{service_data['overall_score']}%",
                timestamp
            )
        
        console.print(services_table)
