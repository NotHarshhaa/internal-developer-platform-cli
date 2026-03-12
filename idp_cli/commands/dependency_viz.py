"""Service dependency visualization command."""

import json
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional

import click
from rich.tree import Tree
from rich.panel import Panel
from rich.table import Table
from rich import box

from idp_cli.utils.console import console, print_step, print_success


class DependencyAnalyzer:
    """Analyzer for service dependencies and relationships."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load service configuration from file."""
        if not self.config_file.exists():
            return {"services": {}, "dependencies": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"services": {}, "dependencies": {}}
    
    def build_dependency_graph(self, environment: str = "dev") -> Dict[str, Set[str]]:
        """Build dependency graph for services."""
        dependencies = {}
        env_config = self.config.get("environments", {}).get(environment, {})
        services = env_config.get("services", {})
        
        for service_name, service_config in services.items():
            service_deps = set()
            
            # Add explicit dependencies
            explicit_deps = service_config.get("dependencies", [])
            service_deps.update(explicit_deps)
            
            # Add dependencies from environment variables (common pattern)
            env_vars = service_config.get("environment", {})
            for var_name, var_value in env_vars.items():
                if var_name.endswith("_URL") or var_name.endswith("_HOST"):
                    # Extract service name from env var
                    for other_service in services:
                        if other_service.lower() in var_value.lower():
                            service_deps.add(other_service)
            
            dependencies[service_name] = service_deps
        
        return dependencies
    
    def find_circular_dependencies(self, dependencies: Dict[str, Set[str]]) -> List[List[str]]:
        """Find circular dependencies using DFS."""
        def dfs(node: str, visited: Set[str], rec_stack: Set[str], path: List[str]) -> List[str]:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in dependencies.get(node, []):
                if neighbor not in visited:
                    cycle = dfs(neighbor, visited, rec_stack, path.copy())
                    if cycle:
                        return cycle
                elif neighbor in rec_stack:
                    # Found cycle
                    cycle_start = path.index(neighbor)
                    return path[cycle_start:] + [neighbor]
            
            rec_stack.remove(node)
            return []
        
        visited = set()
        cycles = []
        
        for node in dependencies:
            if node not in visited:
                cycle = dfs(node, visited, set(), [])
                if cycle and cycle not in cycles:
                    cycles.append(cycle)
        
        return cycles
    
    def get_service_levels(self, dependencies: Dict[str, Set[str]]) -> Dict[str, int]:
        """Calculate deployment levels based on dependencies."""
        levels = {}
        remaining = set(dependencies.keys())
        current_level = 0
        
        while remaining:
            # Find services with no unprocessed dependencies
            ready = {
                service for service in remaining
                if not dependencies.get(service, set()) & remaining
            }
            
            if not ready:
                # Circular dependency or orphaned services
                for service in remaining:
                    levels[service] = current_level
                break
            
            for service in ready:
                levels[service] = current_level
                remaining.remove(service)
            
            current_level += 1
        
        return levels
    
    def generate_mermaid_diagram(self, dependencies: Dict[str, Set[str]]) -> str:
        """Generate Mermaid diagram for dependency visualization."""
        lines = ["graph TD"]
        
        # Add nodes
        for service in dependencies:
            lines.append(f"    {service}[{service}]")
        
        # Add edges
        for service, deps in dependencies.items():
            for dep in deps:
                lines.append(f"    {dep} --> {service}")
        
        return "\n".join(lines)


@click.command("deps")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to analyze (dev, staging, production)",
    show_default=True,
)
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["tree", "table", "mermaid"]),
    default="tree",
    help="Output format for dependency visualization",
    show_default=True,
)
@click.option(
    "--check-cycles",
    is_flag=True,
    help="Check for circular dependencies",
)
@click.option(
    "--deployment-order",
    is_flag=True,
    help="Show recommended deployment order",
)
@click.option(
    "--config",
    "-c",
    type=click.Path(exists=True, path_type=Path),
    help="Path to IDP configuration file",
)
def dependency_viz(environment: str, output_format: str, check_cycles: bool, deployment_order: bool, config: Optional[Path]):
    """Visualize service dependencies and relationships.
    
    Understand how your services are connected and identify potential issues
    like circular dependencies or deployment order constraints.
    
    Examples:
      idp-cli deps --environment dev
      idp-cli deps --format table --check-cycles
      idp-cli deps --format mermaid --deployment-order
    """
    analyzer = DependencyAnalyzer(config)
    
    print_step(f"Analyzing Dependencies - {environment.upper()} Environment")
    
    dependencies = analyzer.build_dependency_graph(environment)
    
    if not dependencies:
        console.print("[yellow]No services or dependencies found[/yellow]")
        return
    
    # Check for circular dependencies if requested
    if check_cycles:
        cycles = analyzer.find_circular_dependencies(dependencies)
        if cycles:
            console.print("[red]⚠️  Circular Dependencies Detected:[/red]")
            for i, cycle in enumerate(cycles, 1):
                cycle_str = " → ".join(cycle)
                console.print(f"  {i}. {cycle_str}")
            console.print()
        else:
            print_success("No circular dependencies found")
            console.print()
    
    if output_format == "tree":
        # Tree visualization
        tree = Tree(f"[bold cyan]Service Dependencies - {environment.upper()}[/bold cyan]")
        
        # Create a mapping of service to its dependents
        dependents = {}
        for service, deps in dependencies.items():
            for dep in deps:
                dependents.setdefault(dep, []).append(service)
        
        # Find root services (no dependencies)
        root_services = [
            service for service in dependencies
            if not dependencies[service]
        ]
        
        if not root_services:
            # If no roots, pick the first service
            root_services = [list(dependencies.keys())[0]]
        
        for root in root_services:
            branch = tree.add(f"[green]{root}[/green]")
            _build_dependency_tree(branch, root, dependencies, dependents, set())
        
        console.print(tree)
    
    elif output_format == "table":
        # Table visualization
        table = Table(
            title=f"Service Dependencies - {environment.upper()}",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Service", style="bold white", min_width=15)
        table.add_column("Dependencies", style="white", min_width=25)
        table.add_column("Dependents", style="white", min_width=25)
        table.add_column("Level", style="yellow", min_width=8)
        
        # Calculate levels if deployment order is requested
        levels = analyzer.get_service_levels(dependencies) if deployment_order else {}
        
        # Calculate dependents
        dependents = {}
        for service, deps in dependencies.items():
            for dep in deps:
                dependents.setdefault(dep, []).append(service)
        
        for service in sorted(dependencies.keys()):
            deps_list = ", ".join(sorted(dependencies[service])) if dependencies[service] else "None"
            deps_count = len(dependencies[service])
            
            dependent_list = ", ".join(sorted(dependents.get(service, []))) if service in dependents else "None"
            dependent_count = len(dependents.get(service, []))
            
            level_str = str(levels.get(service, "N/A")) if deployment_order else "N/A"
            
            table.add_row(
                service,
                f"{deps_list} ({deps_count})",
                f"{dependent_list} ({dependent_count})",
                level_str
            )
        
        console.print(table)
    
    elif output_format == "mermaid":
        # Mermaid diagram
        mermaid_diagram = analyzer.generate_mermaid_diagram(dependencies)
        
        mermaid_panel = Panel(
            mermaid_diagram,
            title=f"[bold white]Mermaid Diagram - {environment.upper()}[/bold white]",
            subtitle="[dim]Copy this to https://mermaid.live to visualize[/dim]",
            border_style="cyan",
            box=box.ROUNDED
        )
        console.print(mermaid_panel)
    
    # Deployment order information
    if deployment_order:
        levels = analyzer.get_service_levels(dependencies)
        max_level = max(levels.values()) if levels else 0
        
        order_table = Table(
            title="Recommended Deployment Order",
            box=box.ROUNDED,
            border_style="green",
            show_header=True,
            header_style="bold green"
        )
        
        order_table.add_column("Level", style="bold yellow", min_width=8)
        order_table.add_column("Services", style="white", min_width=30)
        
        for level in range(max_level + 1):
            services_at_level = [
                service for service, lvl in levels.items()
                if lvl == level
            ]
            services_str = ", ".join(sorted(services_at_level))
            order_table.add_row(str(level), services_str)
        
        console.print(order_table)
    
    # Summary statistics
    total_services = len(dependencies)
    total_dependencies = sum(len(deps) for deps in dependencies.values())
    avg_dependencies = total_dependencies / total_services if total_services > 0 else 0
    
    summary_panel = Panel(
        f"[cyan]Services: {total_services}[/cyan] | "
        f"[white]Dependencies: {total_dependencies}[/white] | "
        f"[yellow]Avg per service: {avg_dependencies:.1f}[/yellow]",
        title="[bold]Dependency Summary[/bold]",
        border_style="cyan"
    )
    console.print(summary_panel)
    
    print_success("Dependency analysis completed")


def _build_dependency_tree(branch, service: str, dependencies: Dict[str, Set[str]], 
                          dependents: Dict[str, List[str]], visited: Set[str]):
    """Recursively build dependency tree."""
    if service in visited:
        branch.add("[red]⚠️ Circular reference[/red]")
        return
    
    visited.add(service)
    
    # Add dependencies
    deps = dependencies.get(service, set())
    if deps:
        deps_branch = branch.add("[dim]Dependencies:[/dim]")
        for dep in sorted(deps):
            dep_branch = deps_branch.add(f"[blue]{dep}[/blue]")
            # Add dependents of this dependency
            dep_dependents = dependents.get(dep, [])
            if dep_dependents:
                for dependent in sorted(dep_dependents):
                    if dependent != service:  # Avoid showing the current service
                        dep_branch.add(f"[dim]← {dependent}[/dim]")
    
    # Add direct dependents
    service_dependents = dependents.get(service, [])
    if service_dependents:
        dependents_branch = branch.add("[dim]Dependents:[/dim]")
        for dependent in sorted(service_dependents):
            dependents_branch.add(f"[green]{dependent}[/green]")
    
    visited.remove(service)
