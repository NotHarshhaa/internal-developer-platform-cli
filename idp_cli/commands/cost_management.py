"""Cost management commands for the IDP CLI."""

import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

import click
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.console import Console

from idp_cli.utils.console import console, print_step, print_success, print_error


class CostManager:
    """Cost management and optimization for cloud resources."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load cost configuration from file."""
        if not self.config_file.exists():
            return {"cost_data": {}, "cost_policies": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"cost_data": {}, "cost_policies": {}}
    
    def _save_config(self):
        """Save configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def get_cost_report(self, environment: str = "dev", period: str = "monthly") -> Dict[str, Any]:
        """Generate cost report for environment."""
        print_step(f"Generating cost report for {environment} environment")
        
        # Mock cost data - in real implementation would integrate with cloud provider APIs
        mock_cost_data = {
            "environment": environment,
            "period": period,
            "timestamp": datetime.now().isoformat(),
            "total_cost": 0.0,
            "services": {},
            "resources": {},
            "breakdown": {
                "compute": 0.0,
                "storage": 0.0,
                "network": 0.0,
                "database": 0.0,
                "monitoring": 0.0,
                "other": 0.0
            },
            "trends": {},
            "recommendations": []
        }
        
        # Generate mock service costs based on environment
        services = self._get_mock_services(environment)
        
        for service_name, service_config in services.items():
            service_cost = self._calculate_service_cost(service_name, service_config, environment)
            mock_cost_data["services"][service_name] = service_cost
            mock_cost_data["total_cost"] += service_cost["total_cost"]
        
        # Calculate resource breakdown
        for service_cost in mock_cost_data["services"].values():
            for resource_type, cost in service_cost["resources"].items():
                if resource_type in mock_cost_data["breakdown"]:
                    mock_cost_data["breakdown"][resource_type] += cost
        
        # Generate trends
        mock_cost_data["trends"] = self._generate_cost_trends(environment, period)
        
        # Generate recommendations
        mock_cost_data["recommendations"] = self._generate_cost_recommendations(mock_cost_data)
        
        # Store cost data
        self._store_cost_data(environment, mock_cost_data)
        
        return mock_cost_data
    
    def _get_mock_services(self, environment: str) -> Dict[str, Any]:
        """Get mock services for environment."""
        base_services = {
            "payment-service": {
                "replicas": 3 if environment == "prod" else 2 if environment == "staging" else 1,
                "cpu_request": "500m",
                "memory_request": "512Mi",
                "storage": "10Gi",
                "database": True
            },
            "user-service": {
                "replicas": 2 if environment == "prod" else 1,
                "cpu_request": "300m",
                "memory_request": "256Mi",
                "storage": "5Gi",
                "database": True
            },
            "notification-service": {
                "replicas": 2 if environment == "prod" else 1,
                "cpu_request": "200m",
                "memory_request": "128Mi",
                "storage": "2Gi",
                "database": False
            }
        }
        
        # Add more services for production
        if environment == "prod":
            base_services.update({
                "api-gateway": {
                    "replicas": 3,
                    "cpu_request": "400m",
                    "memory_request": "384Mi",
                    "storage": "5Gi",
                    "database": False
                },
                "analytics-service": {
                    "replicas": 2,
                    "cpu_request": "1000m",
                    "memory_request": "2Gi",
                    "storage": "50Gi",
                    "database": True
                }
            })
        
        return base_services
    
    def _calculate_service_cost(self, service_name: str, service_config: Dict[str, Any], environment: str) -> Dict[str, Any]:
        """Calculate cost for a specific service."""
        # Mock pricing - in real implementation would use actual cloud provider pricing
        pricing = {
            "compute": {
                "cpu": 0.05,  # $0.05 per vCPU-hour
                "memory": 0.01  # $0.01 per GB-hour
            },
            "storage": {
                "ssd": 0.10,  # $0.10 per GB-month
                "hdd": 0.05   # $0.05 per GB-month
            },
            "database": {
                "small": 50.0,   # $50 per month
                "medium": 150.0, # $150 per month
                "large": 500.0   # $500 per month
            },
            "network": 20.0,  # $20 per month average
            "monitoring": 10.0  # $10 per month
        }
        
        # Calculate compute cost
        cpu_cores = float(service_config["cpu_request"].rstrip("m")) / 1000
        
        # Handle memory units (Mi, Gi, etc.)
        memory_str = service_config["memory_request"]
        if memory_str.endswith("Mi"):
            memory_gb = float(memory_str.rstrip("Mi")) / 1024
        elif memory_str.endswith("Gi"):
            memory_gb = float(memory_str.rstrip("Gi"))
        elif memory_str.endswith("G"):
            memory_gb = float(memory_str.rstrip("G"))
        elif memory_str.endswith("M"):
            memory_gb = float(memory_str.rstrip("M")) / 1024
        else:
            memory_gb = float(memory_str) / 1024  # Assume Mi if no unit
        hours_per_month = 730  # Average hours per month
        
        compute_cost = (cpu_cores * pricing["compute"]["cpu"] + memory_gb * pricing["compute"]["memory"]) * hours_per_month * service_config["replicas"]
        
        # Calculate storage cost
        storage_str = service_config["storage"]
        if storage_str.endswith("Gi"):
            storage_gb = float(storage_str.rstrip("Gi"))
        elif storage_str.endswith("G"):
            storage_gb = float(storage_str.rstrip("G"))
        elif storage_str.endswith("Mi"):
            storage_gb = float(storage_str.rstrip("Mi")) / 1024
        elif storage_str.endswith("M"):
            storage_gb = float(storage_str.rstrip("M")) / 1024
        else:
            storage_gb = float(storage_str)  # Assume Gi if no unit
        
        storage_cost = storage_gb * pricing["storage"]["ssd"]
        
        # Calculate database cost
        database_cost = 0.0
        if service_config.get("database", False):
            if storage_gb < 10:
                database_cost = pricing["database"]["small"]
            elif storage_gb < 50:
                database_cost = pricing["database"]["medium"]
            else:
                database_cost = pricing["database"]["large"]
        
        # Calculate other costs
        network_cost = pricing["network"] * service_config["replicas"]
        monitoring_cost = pricing["monitoring"] * service_config["replicas"]
        
        total_cost = compute_cost + storage_cost + database_cost + network_cost + monitoring_cost
        
        return {
            "service": service_name,
            "total_cost": round(total_cost, 2),
            "resources": {
                "compute": round(compute_cost, 2),
                "storage": round(storage_cost, 2),
                "database": round(database_cost, 2),
                "network": round(network_cost, 2),
                "monitoring": round(monitoring_cost, 2)
            },
            "breakdown": {
                "replicas": service_config["replicas"],
                "cpu_request": service_config["cpu_request"],
                "memory_request": service_config["memory_request"],
                "storage": service_config["storage"]
            }
        }
    
    def _generate_cost_trends(self, environment: str, period: str) -> Dict[str, Any]:
        """Generate cost trend data."""
        # Mock trend data - in real implementation would query historical cost data
        days = 30 if period == "monthly" else 7
        
        trends = {
            "period_days": days,
            "daily_costs": [],
            "trend_direction": "stable",
            "trend_percentage": 0.0
        }
        
        # Generate mock daily costs
        base_cost = 500.0 if environment == "prod" else 200.0 if environment == "staging" else 50.0
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
            # Add some variation
            daily_cost = base_cost + (i % 10) * 5 - 25
            trends["daily_costs"].append({
                "date": date,
                "cost": round(max(0, daily_cost), 2)
            })
        
        # Calculate trend
        if len(trends["daily_costs"]) >= 2:
            first_week_avg = sum(day["cost"] for day in trends["daily_costs"][:7]) / 7
            last_week_avg = sum(day["cost"] for day in trends["daily_costs"][-7:]) / 7
            
            if last_week_avg > first_week_avg:
                trends["trend_direction"] = "increasing"
                trends["trend_percentage"] = round(((last_week_avg - first_week_avg) / first_week_avg) * 100, 1)
            elif last_week_avg < first_week_avg:
                trends["trend_direction"] = "decreasing"
                trends["trend_percentage"] = round(((first_week_avg - last_week_avg) / first_week_avg) * 100, 1)
            else:
                trends["trend_direction"] = "stable"
                trends["trend_percentage"] = 0.0
        
        return trends
    
    def _generate_cost_recommendations(self, cost_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate cost optimization recommendations."""
        recommendations = []
        
        # Analyze each service for optimization opportunities
        for service_name, service_cost in cost_data["services"].items():
            # Check for over-provisioned resources
            if service_cost["resources"]["compute"] > 100:
                recommendations.append({
                    "type": "optimize",
                    "service": service_name,
                    "category": "compute",
                    "title": f"Optimize compute resources for {service_name}",
                    "description": f"Consider reducing CPU/memory allocation. Current compute cost: ${service_cost['resources']['compute']}/month",
                    "potential_savings": round(service_cost["resources"]["compute"] * 0.3, 2),
                    "priority": "medium"
                })
            
            # Check for unused storage
            if service_cost["resources"]["storage"] > 50:
                recommendations.append({
                    "type": "storage",
                    "service": service_name,
                    "category": "storage",
                    "title": f"Optimize storage for {service_name}",
                    "description": f"Consider using cheaper storage tier or implementing cleanup policies. Current storage cost: ${service_cost['resources']['storage']}/month",
                    "potential_savings": round(service_cost["resources"]["storage"] * 0.4, 2),
                    "priority": "low"
                })
        
        # Check for overall cost trends
        if cost_data["trends"]["trend_direction"] == "increasing" and cost_data["trends"]["trend_percentage"] > 10:
            recommendations.append({
                "type": "trend",
                "service": "overall",
                "category": "budget",
                "title": "Rising cost trend detected",
                "description": f"Costs increased by {cost_data['trends']['trend_percentage']}% in the last period. Consider budget review.",
                "potential_savings": round(cost_data["total_cost"] * 0.1, 2),
                "priority": "high"
            })
        
        # Sort by potential savings
        recommendations.sort(key=lambda x: x["potential_savings"], reverse=True)
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _store_cost_data(self, environment: str, cost_data: Dict[str, Any]):
        """Store cost data in configuration."""
        cost_history = self.config.setdefault("cost_data", {})
        env_history = cost_history.setdefault(environment, [])
        
        # Keep only last 12 months of data
        env_history.append(cost_data)
        if len(env_history) > 12:
            env_history = env_history[-12:]
        
        cost_history[environment] = env_history
        self._save_config()
    
    def get_resource_usage(self, service_name: str, environment: str = "dev") -> Dict[str, Any]:
        """Get detailed resource usage for a service."""
        print_step(f"Analyzing resource usage for {service_name} in {environment}")
        
        # Mock resource usage data
        mock_usage = {
            "service": service_name,
            "environment": environment,
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "requested": "500m",
                "limit": "1000m",
                "current_usage": "250m",
                "utilization_percent": 50.0,
                "peak_usage": "750m",
                "peak_utilization": 75.0,
                "average_utilization": 45.0
            },
            "memory": {
                "requested": "512Mi",
                "limit": "1Gi",
                "current_usage": "256Mi",
                "utilization_percent": 50.0,
                "peak_usage": "384Mi",
                "peak_utilization": 75.0,
                "average_utilization": 42.0
            },
            "storage": {
                "requested": "10Gi",
                "used": "6.5Gi",
                "utilization_percent": 65.0,
                "growth_rate": "0.5Gi/month"
            },
            "network": {
                "ingress": "10MB/s",
                "egress": "25MB/s",
                "total_data_transferred": "500GB/month"
            },
            "recommendations": []
        }
        
        # Generate recommendations based on usage
        if mock_usage["cpu"]["average_utilization"] < 30:
            mock_usage["recommendations"].append({
                "resource": "cpu",
                "type": "downsize",
                "message": "CPU utilization is low. Consider reducing CPU allocation.",
                "suggestion": "Reduce CPU request from 500m to 300m"
            })
        
        if mock_usage["memory"]["average_utilization"] < 30:
            mock_usage["recommendations"].append({
                "resource": "memory",
                "type": "downsize",
                "message": "Memory utilization is low. Consider reducing memory allocation.",
                "suggestion": "Reduce memory request from 512Mi to 256Mi"
            })
        
        if mock_usage["storage"]["utilization_percent"] > 80:
            mock_usage["recommendations"].append({
                "resource": "storage",
                "type": "cleanup",
                "message": "Storage utilization is high. Consider cleanup or expansion.",
                "suggestion": "Implement log rotation or increase storage allocation"
            })
        
        return mock_usage
    
    def scale_service(self, service_name: str, environment: str = "dev", replicas: int = 1) -> Dict[str, Any]:
        """Scale a service to specified replica count."""
        print_step(f"Scaling {service_name} to {replicas} replicas in {environment}")
        
        # Mock scaling operation
        scaling_result = {
            "service": service_name,
            "environment": environment,
            "from_replicas": 2,  # Mock current replicas
            "to_replicas": replicas,
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "cost_impact": {
                "previous_cost": 150.0,
                "new_cost": 150.0 * (replicas / 2),
                "monthly_change": round(150.0 * (replicas / 2) - 150.0, 2)
            }
        }
        
        if replicas == 0:
            scaling_result["status"] = "stopped"
            scaling_result["cost_impact"]["new_cost"] = 0
            scaling_result["cost_impact"]["monthly_change"] = -150.0
        
        print_success(f"Service {service_name} scaled to {replicas} replicas")
        return scaling_result


@click.group("cost")
def cost_group():
    """Manage cloud costs and resource optimization."""
    pass


@cost_group.command("report")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to generate report for",
    show_default=True,
)
@click.option(
    "--period",
    "-p",
    type=click.Choice(["daily", "weekly", "monthly"]),
    default="monthly",
    help="Time period for the report",
    show_default=True,
)
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["table", "json"]),
    default="table",
    help="Output format",
    show_default=True,
)
def cost_report(environment: str, period: str, output_format: str):
    """Generate cost report for environment.
    
    Examples:
      idp-cli cost report --environment prod
      idp-cli cost report --period weekly --format json
    """
    cost_manager = CostManager()
    report = cost_manager.get_cost_report(environment, period)
    
    if output_format == "json":
        console.print(json.dumps(report, indent=2))
        return
    
    # Display formatted report
    _display_cost_report(report)


@cost_group.command("usage")
@click.argument("service_name")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to analyze",
    show_default=True,
)
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["table", "json"]),
    default="table",
    help="Output format",
    show_default=True,
)
def resource_usage(service_name: str, environment: str, output_format: str):
    """Get detailed resource usage for a service.
    
    Examples:
      idp-cli cost usage payment-service
      idp-cli cost usage user-service --environment prod --format json
    """
    cost_manager = CostManager()
    usage = cost_manager.get_resource_usage(service_name, environment)
    
    if output_format == "json":
        console.print(json.dumps(usage, indent=2))
        return
    
    _display_resource_usage(usage)


@cost_group.command("scale")
@click.argument("service_name")
@click.option(
    "--replicas",
    "-r",
    type=int,
    required=True,
    help="Number of replicas to scale to",
)
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to scale in",
    show_default=True,
)
def scale_service(service_name: str, replicas: int, environment: str):
    """Scale a service to specified replica count.
    
    Examples:
      idp-cli cost scale payment-service --replicas 3
      idp-cli cost scale user-service --replicas 0 --environment prod
    """
    cost_manager = CostManager()
    result = cost_manager.scale_service(service_name, environment, replicas)
    
    _display_scaling_result(result)


@cost_group.command("optimize")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to analyze for optimization",
    show_default=True,
)
@click.option(
    "--apply",
    is_flag=True,
    help="Apply optimization recommendations automatically",
)
def cost_optimize(environment: str, apply: bool):
    """Get cost optimization recommendations.
    
    Examples:
      idp-cli cost optimize --environment prod
      idp-cli cost optimize --apply
    """
    cost_manager = CostManager()
    report = cost_manager.get_cost_report(environment, "monthly")
    
    recommendations = report.get("recommendations", [])
    
    if not recommendations:
        console.print("[green]✅ No optimization recommendations found![/green]")
        return
    
    console.print(f"[bold cyan]Cost Optimization Recommendations for {environment.upper()}[/bold cyan]")
    
    rec_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    rec_table.add_column("Priority", style="bold", min_width=8)
    rec_table.add_column("Service", style="white", min_width=15)
    rec_table.add_column("Category", style="white", min_width=10)
    rec_table.add_column("Recommendation", style="white", min_width=30)
    rec_table.add_column("Potential Savings", style="green", min_width=12)
    
    priority_colors = {"high": "red", "medium": "yellow", "low": "green"}
    
    for rec in recommendations:
        priority_color = priority_colors.get(rec["priority"], "white")
        rec_table.add_row(
            f"[{priority_color}]{rec['priority'].upper()}[/{priority_color}]",
            rec["service"],
            rec["category"],
            rec["title"][:28] + "..." if len(rec["title"]) > 28 else rec["title"],
            f"${rec['potential_savings']}/mo"
        )
    
    console.print(rec_table)
    
    # Calculate total potential savings
    total_savings = sum(rec["potential_savings"] for rec in recommendations)
    console.print(f"\n[bold green]Total Potential Savings: ${total_savings:.2f}/month[/bold green]")
    
    if apply:
        console.print("\n[yellow]⚠️ Auto-optimization not yet implemented. Please apply recommendations manually.[/yellow]")


def _display_cost_report(report: Dict[str, Any]):
    """Display cost report in formatted table."""
    environment = report["environment"]
    period = report["period"]
    total_cost = report["total_cost"]
    
    # Summary panel
    summary_panel = Panel(
        f"[bold]Environment:[/bold] {environment.upper()}\n"
        f"[bold]Period:[/bold] {period.capitalize()}\n"
        f"[bold]Total Cost:[/bold] ${total_cost:.2f}\n"
        f"[bold]Trend:[/bold] {report['trends']['trend_direction']} ({report['trends']['trend_percentage']}%)",
        title=f"[bold white]Cost Report[/bold white]",
        border_style="cyan",
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(summary_panel)
    
    # Service costs table
    console.print("\n[bold cyan]Service Costs:[/bold cyan]")
    
    service_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    service_table.add_column("Service", style="bold white", min_width=15)
    service_table.add_column("Compute", style="white", min_width=10)
    service_table.add_column("Storage", style="white", min_width=10)
    service_table.add_column("Database", style="white", min_width=10)
    service_table.add_column("Network", style="white", min_width=10)
    service_table.add_column("Total", style="bold green", min_width=10)
    
    for service_name, service_cost in report["services"].items():
        service_table.add_row(
            service_name,
            f"${service_cost['resources']['compute']}",
            f"${service_cost['resources']['storage']}",
            f"${service_cost['resources']['database']}",
            f"${service_cost['resources']['network']}",
            f"[bold]${service_cost['total_cost']}[/bold]"
        )
    
    console.print(service_table)
    
    # Cost breakdown
    console.print("\n[bold cyan]Cost Breakdown by Category:[/bold cyan]")
    
    breakdown_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    breakdown_table.add_column("Category", style="bold white", min_width=12)
    breakdown_table.add_column("Cost", style="white", min_width=10)
    breakdown_table.add_column("Percentage", style="white", min_width=12)
    
    for category, cost in report["breakdown"].items():
        if cost > 0:
            percentage = (cost / total_cost) * 100
            breakdown_table.add_row(
                category.title(),
                f"${cost:.2f}",
                f"{percentage:.1f}%"
            )
    
    console.print(breakdown_table)
    
    # Recommendations
    recommendations = report.get("recommendations", [])
    if recommendations:
        console.print("\n[bold yellow]💡 Cost Optimization Recommendations:[/bold yellow]")
        
        for rec in recommendations[:3]:  # Show top 3
            priority_color = {"high": "red", "medium": "yellow", "low": "green"}.get(rec["priority"], "white")
            console.print(f"  [{priority_color}]{rec['priority'].upper()}[/{priority_color}] {rec['title']}")
            console.print(f"    [dim]{rec['description']}[/dim]")
            console.print(f"    [green]Potential savings: ${rec['potential_savings']}/month[/green]\n")


def _display_resource_usage(usage: Dict[str, Any]):
    """Display resource usage in formatted tables."""
    service_name = usage["service"]
    environment = usage["environment"]
    
    # Summary panel
    summary_panel = Panel(
        f"[bold]Service:[/bold] {service_name}\n"
        f"[bold]Environment:[/bold] {environment.upper()}\n"
        f"[bold]Last Updated:[/bold] {usage['timestamp'][:19]}",
        title=f"[bold white]Resource Usage[/bold white]",
        border_style="cyan",
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(summary_panel)
    
    # CPU usage
    cpu = usage["cpu"]
    console.print("\n[bold cyan]CPU Usage:[/bold cyan]")
    
    cpu_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    cpu_table.add_column("Metric", style="bold white", min_width=15)
    cpu_table.add_column("Value", style="white", min_width=12)
    cpu_table.add_column("Utilization", style="white", min_width=12)
    
    cpu_table.add_row("Requested", cpu["requested"], f"{cpu['utilization_percent']:.1f}%")
    cpu_table.add_row("Limit", cpu["limit"], "")
    cpu_table.add_row("Current", cpu["current_usage"], f"[green]{cpu['utilization_percent']:.1f}%[/green]")
    cpu_table.add_row("Peak", cpu["peak_usage"], f"[yellow]{cpu['peak_utilization']:.1f}%[/yellow]")
    cpu_table.add_row("Average", "", f"[dim]{cpu['average_utilization']:.1f}%[/dim]")
    
    console.print(cpu_table)
    
    # Memory usage
    memory = usage["memory"]
    console.print("\n[bold cyan]Memory Usage:[/bold cyan]")
    
    memory_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    memory_table.add_column("Metric", style="bold white", min_width=15)
    memory_table.add_column("Value", style="white", min_width=12)
    memory_table.add_column("Utilization", style="white", min_width=12)
    
    memory_table.add_row("Requested", memory["requested"], f"{memory['utilization_percent']:.1f}%")
    memory_table.add_row("Limit", memory["limit"], "")
    memory_table.add_row("Current", memory["current_usage"], f"[green]{memory['utilization_percent']:.1f}%[/green]")
    memory_table.add_row("Peak", memory["peak_usage"], f"[yellow]{memory['peak_utilization']:.1f}%[/yellow]")
    memory_table.add_row("Average", "", f"[dim]{memory['average_utilization']:.1f}%[/dim]")
    
    console.print(memory_table)
    
    # Storage usage
    storage = usage["storage"]
    console.print("\n[bold cyan]Storage Usage:[/bold cyan]")
    
    storage_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    storage_table.add_column("Metric", style="bold white", min_width=12)
    storage_table.add_column("Value", style="white", min_width=12)
    storage_table.add_column("Status", style="bold", min_width=12)
    
    storage_color = "red" if storage["utilization_percent"] > 80 else "yellow" if storage["utilization_percent"] > 60 else "green"
    
    storage_table.add_row("Requested", storage["requested"], "")
    storage_table.add_row("Used", storage["used"], f"[{storage_color}]{storage['utilization_percent']:.1f}%[/{storage_color}]")
    storage_table.add_row("Growth Rate", storage["growth_rate"], "")
    
    console.print(storage_table)
    
    # Network usage
    network = usage["network"]
    console.print("\n[bold cyan]Network Usage:[/bold cyan]")
    
    network_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    network_table.add_column("Metric", style="bold white", min_width=15)
    network_table.add_column("Value", style="white", min_width=12)
    
    network_table.add_row("Ingress", network["ingress"])
    network_table.add_row("Egress", network["egress"])
    network_table.add_row("Total Transfer", network["total_data_transferred"])
    
    console.print(network_table)
    
    # Recommendations
    recommendations = usage.get("recommendations", [])
    if recommendations:
        console.print("\n[bold yellow]💡 Resource Optimization Recommendations:[/bold yellow]")
        
        for rec in recommendations:
            resource_color = {"cpu": "blue", "memory": "purple", "storage": "orange"}.get(rec["resource"], "white")
            console.print(f"  [{resource_color}]{rec['resource'].upper()}[/{resource_color}] {rec['message']}")
            console.print(f"    [dim]💡 {rec['suggestion']}[/dim]\n")


def _display_scaling_result(result: Dict[str, Any]):
    """Display scaling operation result."""
    service = result["service"]
    environment = result["environment"]
    from_replicas = result["from_replicas"]
    to_replicas = result["to_replicas"]
    status = result["status"]
    
    status_color = "green" if status == "completed" else "red"
    status_icon = "✅" if status == "completed" else "❌"
    
    # Result panel
    result_panel = Panel(
        f"[bold]Service:[/bold] {service}\n"
        f"[bold]Environment:[/bold] {environment.upper()}\n"
        f"[bold]Scaling:[/bold] {from_replicas} → {to_replicas} replicas\n"
        f"[bold]Status:[/bold] [{status_color}]{status.upper()}[/{status_color}] {status_icon}\n"
        f"[bold]Cost Impact:[/bold] ${result['cost_impact']['previous_cost']:.2f} → ${result['cost_impact']['new_cost']:.2f}/month\n"
        f"[bold]Monthly Change:[/bold] {result['cost_impact']['monthly_change']:+.2f}",
        title=f"[bold white]Scaling Result[/bold white]",
        border_style=status_color,
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(result_panel)
    
    if result["cost_impact"]["monthly_change"] != 0:
        change_color = "green" if result["cost_impact"]["monthly_change"] < 0 else "red"
        change_text = "savings" if result["cost_impact"]["monthly_change"] < 0 else "increase"
        console.print(f"\n[bold {change_color}]Monthly cost {change_text}: ${abs(result['cost_impact']['monthly_change']):.2f}[/{change_color}]")
