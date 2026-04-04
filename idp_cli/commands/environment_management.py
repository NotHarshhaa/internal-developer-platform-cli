"""Environment management commands for the IDP CLI."""

import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Any

import click
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn

from idp_cli.utils.console import console, print_step, print_success, print_error, print_config_panel


class EnvironmentManager:
    """Manages environment operations and promotions."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load environment configuration from file."""
        if not self.config_file.exists():
            return {"environments": {}, "promotion_policies": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"environments": {}, "promotion_policies": {}}
    
    def _save_config(self):
        """Save configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def list_environments(self) -> List[Dict[str, Any]]:
        """List all available environments."""
        environments = self.config.get("environments", {})
        env_list = []
        
        for env_name, env_config in environments.items():
            services = env_config.get("services", {})
            service_count = len(services)
            
            # Calculate environment health
            healthy_services = sum(1 for s in services.values() 
                                  if s.get("status", "unknown") == "running")
            health_percentage = (healthy_services / service_count * 100) if service_count > 0 else 0
            
            env_info = {
                "name": env_name,
                "service_count": service_count,
                "healthy_services": healthy_services,
                "health_percentage": health_percentage,
                "created": env_config.get("created", "N/A"),
                "last_updated": env_config.get("last_updated", "N/A"),
                "promotion_gate": env_config.get("promotion_gate", "automatic"),
            }
            env_list.append(env_info)
        
        return sorted(env_list, key=lambda x: x["name"])
    
    def create_environment(self, env_name: str, base_env: Optional[str] = None) -> bool:
        """Create a new environment."""
        if env_name in self.config.get("environments", {}):
            print_error(f"Environment '{env_name}' already exists")
            return False
        
        environments = self.config.setdefault("environments", {})
        
        # Create new environment config
        env_config = {
            "created": time.strftime("%Y-%m-%d %H:%M:%S"),
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S"),
            "services": {},
            "promotion_gate": "manual",  # Require manual approval for new environments
            "promotion_policies": {
                "requires_approval": True,
                "min_health_score": 95,
                "required_checks": ["security_scan", "performance_test"],
            }
        }
        
        # Copy services from base environment if specified
        if base_env and base_env in environments:
            base_config = environments[base_env]
            env_config["services"] = {
                name: config.copy() for name, config in base_config.get("services", {}).items()
            }
            console.print(f"[cyan]Copied {len(env_config['services'])} services from '{base_env}'[/cyan]")
        
        environments[env_name] = env_config
        self._save_config()
        
        return True
    
    def promote_service(self, service_name: str, from_env: str, to_env: str, 
                       force: bool = False, dry_run: bool = False) -> Dict[str, Any]:
        """Promote a service from one environment to another."""
        
        # Validate environments
        environments = self.config.get("environments", {})
        if from_env not in environments:
            raise ValueError(f"Source environment '{from_env}' does not exist")
        if to_env not in environments:
            raise ValueError(f"Target environment '{to_env}' does not exist")
        
        # Check if service exists in source environment
        source_services = environments[from_env].get("services", {})
        if service_name not in source_services:
            raise ValueError(f"Service '{service_name}' not found in '{from_env}' environment")
        
        source_service = source_services[service_name]
        
        # Check promotion policies
        promotion_result = self._check_promotion_policies(service_name, from_env, to_env, force)
        
        if not promotion_result["can_promote"] and not force:
            return promotion_result
        
        if dry_run:
            promotion_result["dry_run"] = True
            return promotion_result
        
        # Perform promotion
        try:
            with Progress(
                SpinnerColumn(style="cyan"),
                TextColumn("[bold white]{task.description}"),
                BarColumn(bar_width=30, style="dim", complete_style="cyan", finished_style="green"),
                TaskProgressColumn(),
                console=console,
            ) as progress:
                
                # Step 1: Validate source service health
                task1 = progress.add_task("Validating source service health...", total=100)
                time.sleep(1)  # Simulate health check
                progress.update(task1, advance=100)
                
                # Step 2: Copy service configuration
                task2 = progress.add_task("Copying service configuration...", total=100)
                target_services = environments[to_env].setdefault("services", {})
                target_services[service_name] = source_service.copy()
                target_services[service_name]["promoted_from"] = from_env
                target_services[service_name]["promoted_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                target_services[service_name]["promotion_version"] = self._get_next_promotion_version(service_name, to_env)
                progress.update(task2, advance=100)
                
                # Step 3: Deploy to target environment
                task3 = progress.add_task("Deploying to target environment...", total=100)
                # This would trigger actual deployment in real implementation
                time.sleep(2)  # Simulate deployment
                progress.update(task3, advance=100)
                
                # Step 4: Verify deployment
                task4 = progress.add_task("Verifying deployment...", total=100)
                time.sleep(1)  # Simulate verification
                progress.update(task4, advance=100)
            
            # Update environment timestamp
            environments[to_env]["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S")
            self._save_config()
            
            return {
                "success": True,
                "service": service_name,
                "from_environment": from_env,
                "to_environment": to_env,
                "promotion_version": target_services[service_name]["promotion_version"],
                "message": f"Service '{service_name}' promoted successfully from '{from_env}' to '{to_env}'"
            }
            
        except Exception as e:
            return {
                "success": False,
                "service": service_name,
                "from_environment": from_env,
                "to_environment": to_env,
                "error": str(e),
                "message": f"Failed to promote service: {e}"
            }
    
    def _check_promotion_policies(self, service_name: str, from_env: str, to_env: str, 
                                force: bool) -> Dict[str, Any]:
        """Check if service can be promoted based on policies."""
        environments = self.config.get("environments", {})
        target_env_config = environments.get(to_env, {})
        promotion_policies = target_env_config.get("promotion_policies", {})
        
        checks = []
        can_promote = True
        
        # Check 1: Service health in source environment
        source_service = environments[from_env]["services"][service_name]
        if source_service.get("status") != "running":
            checks.append({
                "name": "Source Service Health",
                "status": "failed",
                "message": f"Service status is '{source_service.get('status')}', expected 'running'"
            })
            can_promote = False
        else:
            checks.append({
                "name": "Source Service Health",
                "status": "passed",
                "message": "Service is running"
            })
        
        # Check 2: Required approvals
        if promotion_policies.get("requires_approval", True) and not force:
            checks.append({
                "name": "Approval Required",
                "status": "warning",
                "message": "Manual approval required (use --force to override)"
            })
            can_promote = False
        else:
            checks.append({
                "name": "Approval Required",
                "status": "passed",
                "message": "Approval granted or forced"
            })
        
        # Check 3: Minimum health score
        min_health = promotion_policies.get("min_health_score", 90)
        current_health = self._calculate_service_health(service_name, from_env)
        if current_health < min_health:
            checks.append({
                "name": "Health Score",
                "status": "failed",
                "message": f"Health score {current_health}% is below required {min_health}%"
            })
            can_promote = False
        else:
            checks.append({
                "name": "Health Score",
                "status": "passed",
                "message": f"Health score {current_health}% meets requirements"
            })
        
        # Check 4: Required checks (security, performance, etc.)
        required_checks = promotion_policies.get("required_checks", [])
        for check_name in required_checks:
            # Mock check results - in real implementation would run actual checks
            check_passed = True  # Simulate passed checks
            status = "passed" if check_passed else "failed"
            message = f"{check_name} check passed" if check_passed else f"{check_name} check failed"
            
            checks.append({
                "name": check_name.replace("_", " ").title(),
                "status": status,
                "message": message
            })
            
            if not check_passed:
                can_promote = False
        
        return {
            "can_promote": can_promote or force,
            "checks": checks,
            "service": service_name,
            "from_environment": from_env,
            "to_environment": to_env
        }
    
    def _calculate_service_health(self, service_name: str, environment: str) -> int:
        """Calculate health score for a service."""
        # Mock implementation - would calculate based on metrics
        return 95
    
    def _get_next_promotion_version(self, service_name: str, environment: str) -> str:
        """Get next promotion version for service."""
        services = self.config.get("environments", {}).get(environment, {}).get("services", {})
        current_service = services.get(service_name, {})
        current_version = current_service.get("promotion_version", "v0.0.0")
        
        # Parse and increment version
        try:
            if current_version.startswith('v'):
                version_parts = current_version[1:].split('.')
                patch = int(version_parts[2]) + 1
                return f"v{version_parts[0]}.{version_parts[1]}.{patch}"
        except (IndexError, ValueError):
            pass
        
        return "v1.0.1"
    
    def compare_environments(self, env1: str, env2: str) -> Dict[str, Any]:
        """Compare two environments."""
        environments = self.config.get("environments", {})
        
        if env1 not in environments:
            raise ValueError(f"Environment '{env1}' does not exist")
        if env2 not in environments:
            raise ValueError(f"Environment '{env2}' does not exist")
        
        env1_services = set(environments[env1].get("services", {}).keys())
        env2_services = set(environments[env2].get("services", {}).keys())
        
        common_services = env1_services & env2_services
        only_in_env1 = env1_services - env2_services
        only_in_env2 = env2_services - env1_services
        
        # Compare versions for common services
        version_diffs = []
        for service in common_services:
            env1_version = environments[env1]["services"][service].get("version", "unknown")
            env2_version = environments[env2]["services"][service].get("version", "unknown")
            if env1_version != env2_version:
                version_diffs.append({
                    "service": service,
                    "env1_version": env1_version,
                    "env2_version": env2_version
                })
        
        return {
            "environment1": env1,
            "environment2": env2,
            "common_services": sorted(list(common_services)),
            "only_in_env1": sorted(list(only_in_env1)),
            "only_in_env2": sorted(list(only_in_env2)),
            "version_differences": version_diffs
        }


@click.group("env")
def env_group():
    """Manage environments and promotions."""
    pass


@env_group.command("list")
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["table", "json"]),
    default="table",
    help="Output format",
    show_default=True,
)
def list_environments(output_format: str):
    """List all environments.
    
    Examples:
      idp-cli env list
      idp-cli env list --format json
    """
    manager = EnvironmentManager()
    environments = manager.list_environments()
    
    if not environments:
        console.print("[yellow]No environments found[/yellow]")
        return
    
    if output_format == "table":
        table = Table(
            title="Environments",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Environment", style="bold white", min_width=12)
        table.add_column("Services", style="white", min_width=8)
        table.add_column("Healthy", style="green", min_width=8)
        table.add_column("Health %", style="yellow", min_width=8)
        table.add_column("Created", style="white", min_width=16)
        table.add_column("Promotion Gate", style="white", min_width=12)
        
        for env in environments:
            health_style = "green" if env["health_percentage"] >= 90 else "yellow" if env["health_percentage"] >= 70 else "red"
            
            table.add_row(
                env["name"],
                str(env["service_count"]),
                f"{env['healthy_services']}/{env['service_count']}",
                f"[{health_style}]{env['health_percentage']:.0f}%[/{health_style}]",
                env["created"],
                env["promotion_gate"]
            )
        
        console.print(table)
    else:
        console.print(json.dumps(environments, indent=2))


@env_group.command("create")
@click.argument("environment_name")
@click.option(
    "--base",
    "-b",
    help="Base environment to copy services from",
)
def create_environment(environment_name: str, base: Optional[str]):
    """Create a new environment.
    
    Examples:
      idp-cli env create staging
      idp-cli env create production --base staging
    """
    manager = EnvironmentManager()
    
    success = manager.create_environment(environment_name, base)
    
    if success:
        print_success(f"Environment '{environment_name}' created successfully")
        if base:
            console.print(f"[dim]Services copied from '{base}' environment[/dim]")
    else:
        raise SystemExit(1)


@env_group.command("promote")
@click.argument("service_name")
@click.option(
    "--from",
    "from_env",
    required=True,
    help="Source environment",
)
@click.option(
    "--to",
    "to_env",
    required=True,
    help="Target environment",
)
@click.option(
    "--force",
    "-f",
    is_flag=True,
    help="Force promotion (skip approval checks)",
)
@click.option(
    "--dry-run",
    "-n",
    is_flag=True,
    help="Show what would be promoted without actually promoting",
)
def promote_service(service_name: str, from_env: str, to_env: str, force: bool, dry_run: bool):
    """Promote a service from one environment to another.
    
    Examples:
      idp-cli env promote payment-service --from dev --to staging
      idp-cli env promote user-service --from staging --to production --force
      idp-cli env promote worker-service --from dev --to staging --dry-run
    """
    manager = EnvironmentManager()
    
    try:
        result = manager.promote_service(service_name, from_env, to_env, force, dry_run)
        
        if dry_run or not result.get("can_promote", True):
            # Show promotion check results
            console.print(Panel(
                f"[bold cyan]Promotion Check Results[/bold cyan]\n\n"
                f"Service: {service_name}\n"
                f"From: {from_env}\n"
                f"To: {to_env}\n\n"
                f"Can Promote: {'[green]Yes[/green]' if result.get('can_promote', True) else '[red]No[/red]'}",
                title="[bold white]Promotion Analysis[/bold white]",
                border_style="cyan",
                box=box.ROUNDED
            ))
            
            # Show individual checks
            checks = result.get("checks", [])
            if checks:
                check_table = Table(
                    title="Promotion Checks",
                    box=box.ROUNDED,
                    border_style="cyan",
                    show_header=True,
                    header_style="bold cyan"
                )
                
                check_table.add_column("Check", style="white", min_width=20)
                check_table.add_column("Status", style="bold", min_width=10)
                check_table.add_column("Message", style="white", min_width=30)
                
                for check in checks:
                    status_style = {
                        "passed": "green",
                        "failed": "red", 
                        "warning": "yellow"
                    }.get(check["status"], "white")
                    
                    check_table.add_row(
                        check["name"],
                        f"[{status_style}]{check['status'].upper()}[/{status_style}]",
                        check["message"]
                    )
                
                console.print(check_table)
            
            if dry_run:
                console.print("\n[yellow]This was a dry run - no changes were made[/yellow]")
            elif not result.get("can_promote", True):
                console.print("\n[yellow]Promotion blocked by policies. Use --force to override.[/yellow]")
                raise SystemExit(1)
        
        else:
            # Show promotion results
            if result["success"]:
                print_success(result["message"])
                console.print(f"[dim]Promotion version: {result['promotion_version']}[/dim]")
            else:
                print_error(result["message"])
                raise SystemExit(1)
                
    except ValueError as e:
        print_error(str(e))
        raise SystemExit(1)
    except Exception as e:
        print_error(f"Promotion failed: {e}")
        raise SystemExit(1)


@env_group.command("diff")
@click.argument("environment1")
@click.argument("environment2")
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["table", "json"]),
    default="table",
    help="Output format",
    show_default=True,
)
def compare_environments(environment1: str, environment2: str, output_format: str):
    """Compare two environments.
    
    Examples:
      idp-cli env diff dev staging
      idp-cli env diff staging production --format json
    """
    manager = EnvironmentManager()
    
    try:
        comparison = manager.compare_environments(environment1, environment2)
        
        if output_format == "table":
            # Summary table
            summary_table = Table(
                title=f"Environment Comparison: {environment1} vs {environment2}",
                box=box.ROUNDED,
                border_style="cyan",
                show_header=True,
                header_style="bold cyan"
            )
            
            summary_table.add_column("Metric", style="bold white", min_width=15)
            summary_table.add_column("Count", style="white", min_width=8)
            summary_table.add_column("Services", style="dim", min_width=30)
            
            summary_table.add_row(
                "Common Services",
                str(len(comparison["common_services"])),
                ", ".join(comparison["common_services"][:3]) + ("..." if len(comparison["common_services"]) > 3 else "")
            )
            
            summary_table.add_row(
                f"Only in {environment1}",
                str(len(comparison["only_in_env1"])),
                ", ".join(comparison["only_in_env1"][:3]) + ("..." if len(comparison["only_in_env1"]) > 3 else "")
            )
            
            summary_table.add_row(
                f"Only in {environment2}",
                str(len(comparison["only_in_env2"])),
                ", ".join(comparison["only_in_env2"][:3]) + ("..." if len(comparison["only_in_env2"]) > 3 else "")
            )
            
            console.print(summary_table)
            
            # Version differences
            if comparison["version_differences"]:
                console.print("\n[bold yellow]Version Differences:[/bold yellow]")
                version_table = Table(
                    box=box.ROUNDED,
                    border_style="yellow",
                    show_header=True,
                    header_style="bold yellow"
                )
                
                version_table.add_column("Service", style="white", min_width=15)
                version_table.add_column(f"{environment1} Version", style="white", min_width=12)
                version_table.add_column(f"{environment2} Version", style="white", min_width=12)
                
                for diff in comparison["version_differences"]:
                    version_table.add_row(
                        diff["service"],
                        diff["env1_version"],
                        diff["env2_version"]
                    )
                
                console.print(version_table)
            else:
                console.print("\n[green]✓ No version differences found[/green]")
                
        else:
            console.print(json.dumps(comparison, indent=2))
            
    except ValueError as e:
        print_error(str(e))
        raise SystemExit(1)
