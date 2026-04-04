"""API documentation viewer commands for the IDP CLI."""

import json
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import webbrowser

import click
import requests
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.console import Console
from rich.markdown import Markdown
from rich.syntax import Syntax

from idp_cli.utils.console import console, print_step, print_success, print_error


class APIDocumentationViewer:
    """API documentation viewer and generator."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load API documentation configuration from file."""
        if not self.config_file.exists():
            return {"api_docs": {}, "openapi_specs": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"api_docs": {}, "openapi_specs": {}}
    
    def _save_config(self):
        """Save configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def discover_api_endpoints(self, service_name: str, environment: str = "dev") -> Dict[str, Any]:
        """Discover API endpoints for a service."""
        print_step(f"Discovering API endpoints for {service_name} in {environment}")
        
        # Get service configuration
        services = self.config.get("environments", {}).get(environment, {}).get("services", {})
        service_config = services.get(service_name, {})
        
        if not service_config:
            return {
                "service": service_name,
                "environment": environment,
                "status": "not_found",
                "error": f"Service {service_name} not found in {environment}"
            }
        
        # Mock API discovery - in real implementation would scan service
        discovery_result = {
            "service": service_name,
            "environment": environment,
            "status": "discovered",
            "timestamp": datetime.now().isoformat(),
            "base_url": service_config.get("endpoint", f"http://{service_name}.{environment}.svc.cluster.local:8080"),
            "endpoints": [],
            "openapi_url": f"{service_config.get('endpoint', f'http://{service_name}.{environment}.svc.cluster.local:8080')}/docs/openapi.json",
            "documentation_url": f"{service_config.get('endpoint', f'http://{service_name}.{environment}.svc.cluster.local:8080')}/docs"
        }
        
        # Generate mock endpoints based on service type
        mock_endpoints = self._generate_mock_endpoints(service_name)
        discovery_result["endpoints"] = mock_endpoints
        
        # Store discovery results
        self._store_api_discovery(discovery_result)
        
        return discovery_result
    
    def _generate_mock_endpoints(self, service_name: str) -> List[Dict[str, Any]]:
        """Generate mock API endpoints based on service name."""
        base_endpoints = [
            {
                "path": "/health",
                "method": "GET",
                "summary": "Health check endpoint",
                "description": "Returns the health status of the service",
                "parameters": [],
                "responses": {
                    "200": {"description": "Service is healthy"},
                    "503": {"description": "Service is unhealthy"}
                }
            },
            {
                "path": "/metrics",
                "method": "GET",
                "summary": "Prometheus metrics",
                "description": "Returns Prometheus-compatible metrics",
                "parameters": [],
                "responses": {
                    "200": {"description": "Metrics in Prometheus format"}
                }
            }
        ]
        
        # Service-specific endpoints
        if "payment" in service_name.lower():
            payment_endpoints = [
                {
                    "path": "/api/v1/payments",
                    "method": "POST",
                    "summary": "Create a new payment",
                    "description": "Process a new payment transaction",
                    "parameters": [
                        {"name": "amount", "type": "number", "required": True, "description": "Payment amount"},
                        {"name": "currency", "type": "string", "required": True, "description": "Currency code"},
                        {"name": "payment_method", "type": "string", "required": True, "description": "Payment method"}
                    ],
                    "responses": {
                        "201": {"description": "Payment created successfully"},
                        "400": {"description": "Invalid payment data"},
                        "402": {"description": "Payment failed"}
                    }
                },
                {
                    "path": "/api/v1/payments/{payment_id}",
                    "method": "GET",
                    "summary": "Get payment details",
                    "description": "Retrieve details of a specific payment",
                    "parameters": [
                        {"name": "payment_id", "type": "string", "required": True, "description": "Payment ID"}
                    ],
                    "responses": {
                        "200": {"description": "Payment details"},
                        "404": {"description": "Payment not found"}
                    }
                },
                {
                    "path": "/api/v1/payments/{payment_id}/refund",
                    "method": "POST",
                    "summary": "Refund a payment",
                    "description": "Process a refund for a payment",
                    "parameters": [
                        {"name": "payment_id", "type": "string", "required": True, "description": "Payment ID"},
                        {"name": "amount", "type": "number", "required": False, "description": "Refund amount"}
                    ],
                    "responses": {
                        "200": {"description": "Refund processed"},
                        "404": {"description": "Payment not found"},
                        "400": {"description": "Invalid refund amount"}
                    }
                }
            ]
            base_endpoints.extend(payment_endpoints)
        
        elif "user" in service_name.lower():
            user_endpoints = [
                {
                    "path": "/api/v1/users",
                    "method": "POST",
                    "summary": "Create a new user",
                    "description": "Register a new user account",
                    "parameters": [
                        {"name": "email", "type": "string", "required": True, "description": "User email"},
                        {"name": "password", "type": "string", "required": True, "description": "User password"},
                        {"name": "name", "type": "string", "required": True, "description": "User name"}
                    ],
                    "responses": {
                        "201": {"description": "User created successfully"},
                        "400": {"description": "Invalid user data"},
                        "409": {"description": "User already exists"}
                    }
                },
                {
                    "path": "/api/v1/users/{user_id}",
                    "method": "GET",
                    "summary": "Get user profile",
                    "description": "Retrieve user profile information",
                    "parameters": [
                        {"name": "user_id", "type": "string", "required": True, "description": "User ID"}
                    ],
                    "responses": {
                        "200": {"description": "User profile"},
                        "404": {"description": "User not found"}
                    }
                },
                {
                    "path": "/api/v1/users/{user_id}",
                    "method": "PUT",
                    "summary": "Update user profile",
                    "description": "Update user profile information",
                    "parameters": [
                        {"name": "user_id", "type": "string", "required": True, "description": "User ID"},
                        {"name": "name", "type": "string", "required": False, "description": "User name"},
                        {"name": "email", "type": "string", "required": False, "description": "User email"}
                    ],
                    "responses": {
                        "200": {"description": "User updated successfully"},
                        "404": {"description": "User not found"},
                        "400": {"description": "Invalid update data"}
                    }
                }
            ]
            base_endpoints.extend(user_endpoints)
        
        # Add generic CRUD endpoints for other services
        else:
            generic_endpoints = [
                {
                    "path": "/api/v1/resources",
                    "method": "GET",
                    "summary": "List resources",
                    "description": "Retrieve a list of resources",
                    "parameters": [
                        {"name": "limit", "type": "integer", "required": False, "description": "Maximum number of items"},
                        {"name": "offset", "type": "integer", "required": False, "description": "Number of items to skip"}
                    ],
                    "responses": {
                        "200": {"description": "List of resources"}
                    }
                },
                {
                    "path": "/api/v1/resources/{resource_id}",
                    "method": "GET",
                    "summary": "Get resource",
                    "description": "Retrieve a specific resource",
                    "parameters": [
                        {"name": "resource_id", "type": "string", "required": True, "description": "Resource ID"}
                    ],
                    "responses": {
                        "200": {"description": "Resource details"},
                        "404": {"description": "Resource not found"}
                    }
                }
            ]
            base_endpoints.extend(generic_endpoints)
        
        return base_endpoints
    
    def _store_api_discovery(self, discovery_result: Dict[str, Any]):
        """Store API discovery results."""
        api_docs = self.config.setdefault("api_docs", {})
        service_key = f"{discovery_result['service']}:{discovery_result['environment']}"
        api_docs[service_key] = discovery_result
        self._save_config()
    
    def generate_openapi_spec(self, service_name: str, environment: str = "dev") -> Dict[str, Any]:
        """Generate OpenAPI specification for a service."""
        print_step(f"Generating OpenAPI spec for {service_name} in {environment}")
        
        # Get discovered endpoints
        api_docs = self.config.get("api_docs", {})
        service_key = f"{service_name}:{environment}"
        discovery = api_docs.get(service_key)
        
        if not discovery:
            # Try to discover first
            discovery = self.discover_api_endpoints(service_name, environment)
        
        if discovery.get("status") != "discovered":
            return {
                "service": service_name,
                "environment": environment,
                "status": "failed",
                "error": "Could not discover API endpoints"
            }
        
        # Generate OpenAPI spec
        openapi_spec = {
            "openapi": "3.0.0",
            "info": {
                "title": f"{service_name} API",
                "description": f"API documentation for {service_name} service",
                "version": "1.0.0",
                "contact": {
                    "name": "Platform Team",
                    "email": "platform@company.com"
                }
            },
            "servers": [
                {
                    "url": discovery["base_url"],
                    "description": f"{environment.capitalize()} environment"
                }
            ],
            "paths": {},
            "components": {
                "schemas": {
                    "Error": {
                        "type": "object",
                        "properties": {
                            "error": {"type": "string"},
                            "message": {"type": "string"},
                            "timestamp": {"type": "string", "format": "date-time"}
                        }
                    },
                    "Health": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string"},
                            "timestamp": {"type": "string", "format": "date-time"},
                            "version": {"type": "string"}
                        }
                    }
                }
            }
        }
        
        # Convert endpoints to OpenAPI paths
        for endpoint in discovery["endpoints"]:
            path = endpoint["path"]
            method = endpoint["method"].lower()
            
            if path not in openapi_spec["paths"]:
                openapi_spec["paths"][path] = {}
            
            openapi_spec["paths"][path][method] = {
                "summary": endpoint["summary"],
                "description": endpoint["description"],
                "parameters": [],
                "responses": {}
            }
            
            # Add parameters
            for param in endpoint.get("parameters", []):
                openapi_spec["paths"][path][method]["parameters"].append({
                    "name": param["name"],
                    "in": "path" if "{" + param["name"] + "}" in path else "query",
                    "required": param.get("required", False),
                    "schema": {
                        "type": param["type"]
                    },
                    "description": param.get("description", "")
                })
            
            # Add responses
            for status_code, response_info in endpoint.get("responses", {}).items():
                openapi_spec["paths"][path][method]["responses"][status_code] = {
                    "description": response_info["description"]
                }
        
        # Store OpenAPI spec
        openapi_specs = self.config.setdefault("openapi_specs", {})
        openapi_specs[service_key] = {
            "spec": openapi_spec,
            "generated_at": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        self._save_config()
        
        return {
            "service": service_name,
            "environment": environment,
            "status": "generated",
            "spec": openapi_spec,
            "generated_at": datetime.now().isoformat()
        }
    
    def test_api_endpoint(self, service_name: str, endpoint_path: str, environment: str = "dev") -> Dict[str, Any]:
        """Test an API endpoint."""
        print_step(f"Testing endpoint {endpoint_path} for {service_name}")
        
        # Get service configuration
        services = self.config.get("environments", {}).get(environment, {}).get("services", {})
        service_config = services.get(service_name, {})
        
        if not service_config:
            return {
                "service": service_name,
                "endpoint": endpoint_path,
                "environment": environment,
                "status": "not_found",
                "error": f"Service {service_name} not found in {environment}"
            }
        
        base_url = service_config.get("endpoint", f"http://{service_name}.{environment}.svc.cluster.local:8080")
        full_url = f"{base_url}{endpoint_path}"
        
        test_result = {
            "service": service_name,
            "endpoint": endpoint_path,
            "environment": environment,
            "url": full_url,
            "timestamp": datetime.now().isoformat(),
            "status": "testing"
        }
        
        try:
            # Mock API test - in real implementation would make actual HTTP request
            # response = requests.get(full_url, timeout=10)
            
            # Mock successful response
            mock_response = {
                "status_code": 200,
                "response_time": 0.125,  # seconds
                "content_type": "application/json",
                "response_body": {"status": "ok", "timestamp": datetime.now().isoformat()}
            }
            
            test_result.update({
                "status_code": mock_response["status_code"],
                "response_time": mock_response["response_time"],
                "content_type": mock_response["content_type"],
                "response_body": mock_response["response_body"],
                "status": "success" if mock_response["status_code"] < 400 else "error"
            })
            
        except requests.exceptions.RequestException as e:
            test_result.update({
                "status": "error",
                "error": str(e)
            })
        except Exception as e:
            test_result.update({
                "status": "error",
                "error": f"Unexpected error: {str(e)}"
            })
        
        return test_result
    
    def generate_markdown_docs(self, service_name: str, environment: str = "dev") -> str:
        """Generate Markdown documentation for a service."""
        print_step(f"Generating Markdown docs for {service_name}")
        
        # Get OpenAPI spec
        openapi_specs = self.config.get("openapi_specs", {})
        service_key = f"{service_name}:{environment}"
        spec_data = openapi_specs.get(service_key)
        
        if not spec_data:
            # Generate OpenAPI spec first
            spec_result = self.generate_openapi_spec(service_name, environment)
            if spec_result["status"] != "generated":
                return f"# {service_name} API Documentation\n\nError: Could not generate documentation"
            spec_data = {
                "spec": spec_result["spec"],
                "generated_at": spec_result["generated_at"]
            }
        
        spec = spec_data["spec"]
        
        # Generate Markdown documentation
        markdown = f"# {spec['info']['title']}\n\n"
        markdown += f"{spec['info']['description']}\n\n"
        markdown += f"**Version:** {spec['info']['version']}\n\n"
        markdown += f"**Generated:** {spec_data['generated_at'][:19]}\n\n"
        
        # Add server information
        markdown += "## Servers\n\n"
        for server in spec.get("servers", []):
            markdown += f"- **{server['description']}**: `{server['url']}`\n"
        markdown += "\n"
        
        # Add endpoints
        markdown += "## API Endpoints\n\n"
        
        for path, path_item in spec.get("paths", {}).items():
            markdown += f"### {path}\n\n"
            
            for method, operation in path_item.items():
                method_color = {
                    "get": "🟢",
                    "post": "🟡", 
                    "put": "🔵",
                    "delete": "🔴",
                    "patch": "🟣"
                }.get(method, "⚪")
                
                markdown += f"#### {method_color.upper()} {method.upper()} {operation['summary']}\n\n"
                markdown += f"{operation['description']}\n\n"
                
                # Add parameters
                parameters = operation.get("parameters", [])
                if parameters:
                    markdown += "**Parameters:**\n\n"
                    markdown += "| Name | Type | Required | Description |\n"
                    markdown += "|------|------|----------|-------------|\n"
                    
                    for param in parameters:
                        required = "✅" if param.get("required", False) else "❌"
                        markdown += f"| {param['name']} | {param['schema']['type']} | {required} | {param.get('description', '')} |\n"
                    markdown += "\n"
                
                # Add responses
                responses = operation.get("responses", {})
                if responses:
                    markdown += "**Responses:**\n\n"
                    for status_code, response in responses.items():
                        markdown += f"- **{status_code}**: {response['description']}\n"
                    markdown += "\n"
                
                markdown += "---\n\n"
        
        return markdown
    
    def open_docs_in_browser(self, service_name: str, environment: str = "dev") -> bool:
        """Open API documentation in browser."""
        print_step(f"Opening documentation for {service_name} in browser")
        
        # Get service configuration
        services = self.config.get("environments", {}).get(environment, {}).get("services", {})
        service_config = services.get(service_name, {})
        
        if not service_config:
            print_error(f"Service {service_name} not found in {environment}")
            return False
        
        docs_url = service_config.get("endpoint", f"http://{service_name}.{environment}.svc.cluster.local:8080") + "/docs"
        
        try:
            webbrowser.open(docs_url)
            print_success(f"Opened documentation: {docs_url}")
            return True
        except Exception as e:
            print_error(f"Failed to open browser: {e}")
            return False


@click.group("api")
def api_group():
    """API documentation viewer and generator."""
    pass


@api_group.command("discover")
@click.argument("service_name")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to discover APIs in",
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
def discover_endpoints(service_name: str, environment: str, output_format: str):
    """Discover API endpoints for a service.
    
    Examples:
      idp-cli api discover payment-service
      idp-cli api discover user-service --environment prod --format json
    """
    viewer = APIDocumentationViewer()
    result = viewer.discover_api_endpoints(service_name, environment)
    
    if output_format == "json":
        console.print(json.dumps(result, indent=2))
        return
    
    _display_discovery_results(result)


@api_group.command("docs")
@click.argument("service_name")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to generate docs for",
    show_default=True,
)
@click.option(
    "--format",
    "-f",
    "output_format",
    type=click.Choice(["markdown", "openapi", "view"]),
    default="view",
    help="Documentation format",
    show_default=True,
)
@click.option(
    "--output",
    "-o",
    type=click.Path(),
    help="Output file for generated documentation",
)
def generate_docs(service_name: str, environment: str, output_format: str, output: Optional[str]):
    """Generate API documentation for a service.
    
    Examples:
      idp-cli api docs payment-service
      idp-cli api docs user-service --format openapi
      idp-cli api docs payment-service --format markdown --output api-docs.md
      idp-cli api docs user-service --format view
    """
    viewer = APIDocumentationViewer()
    
    if output_format == "view":
        success = viewer.open_docs_in_browser(service_name, environment)
        if not success:
            raise SystemExit(1)
        return
    
    if output_format == "openapi":
        result = viewer.generate_openapi_spec(service_name, environment)
        
        if result["status"] != "generated":
            print_error(f"Failed to generate OpenAPI spec: {result.get('error', 'Unknown error')}")
            raise SystemExit(1)
        
        openapi_json = json.dumps(result["spec"], indent=2)
        
        if output:
            with open(output, 'w') as f:
                f.write(openapi_json)
            print_success(f"OpenAPI spec saved to {output}")
        else:
            console.print(Syntax(openapi_json, "json", theme="monokai", line_numbers=True))
    
    elif output_format == "markdown":
        markdown = viewer.generate_markdown_docs(service_name, environment)
        
        if output:
            with open(output, 'w') as f:
                f.write(markdown)
            print_success(f"Markdown documentation saved to {output}")
        else:
            console.print(Markdown(markdown))


@api_group.command("test")
@click.argument("service_name")
@click.argument("endpoint_path")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to test in",
    show_default=True,
)
@click.option(
    "--method",
    "-m",
    type=click.Choice(["GET", "POST", "PUT", "DELETE"]),
    default="GET",
    help="HTTP method to use",
    show_default=True,
)
@click.option(
    "--data",
    "-d",
    help="JSON data for POST/PUT requests",
)
def test_endpoint(service_name: str, endpoint_path: str, environment: str, method: str, data: Optional[str]):
    """Test an API endpoint.
    
    Examples:
      idp-cli api test payment-service /health
      idp-cli api test user-service /api/v1/users --method POST --data '{"name":"John","email":"john@example.com"}'
      idp-cli api test payment-service /api/v1/payments/123 --environment prod
    """
    viewer = APIDocumentationViewer()
    result = viewer.test_api_endpoint(service_name, endpoint_path, environment)
    
    _display_test_result(result)


@api_group.command("list")
@click.option(
    "--environment",
    "-e",
    default="dev",
    help="Environment to list services for",
    show_default=True,
)
def list_apis(environment: str):
    """List all services with discovered APIs.
    
    Examples:
      idp-cli api list
      idp-cli api list --environment prod
    """
    viewer = APIDocumentationViewer()
    api_docs = viewer.config.get("api_docs", {})
    
    # Filter by environment
    filtered_apis = {}
    for service_key, discovery in api_docs.items():
        service_name, env = service_key.split(":")
        if env == environment:
            filtered_apis[service_key] = discovery
    
    if not filtered_apis:
        console.print(f"[yellow]No discovered APIs found in {environment} environment[/yellow]")
        console.print("[dim]Use 'idp-cli api discover <service-name>' to discover APIs first[/dim]")
        return
    
    # Display table
    table = Table(
        title=f"Discovered APIs - {environment.upper()}",
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    table.add_column("Service", style="bold white", min_width=15)
    table.add_column("Endpoints", style="white", min_width=8)
    table.add_column("Base URL", style="dim", min_width=30)
    table.add_column("Status", style="bold", min_width=10)
    table.add_column("Discovered", style="dim", min_width=16)
    
    for service_key, discovery in filtered_apis.items():
        service_name, _ = service_key.split(":")
        endpoints_count = len(discovery.get("endpoints", []))
        
        status_style = {
            "discovered": "green",
            "failed": "red",
            "not_found": "yellow"
        }.get(discovery.get("status", "unknown"), "white")
        
        table.add_row(
            service_name,
            str(endpoints_count),
            discovery.get("base_url", "Unknown"),
            f"[{status_style}]{discovery.get('status', 'unknown').upper()}[/{status_style}]",
            discovery.get("timestamp", "Unknown")[:19]
        )
    
    console.print(table)


def _display_discovery_results(result: Dict[str, Any]):
    """Display API discovery results."""
    service = result["service"]
    environment = result["environment"]
    status = result["status"]
    
    if status == "not_found":
        console.print(f"[red]❌ Service {service} not found in {environment}[/red]")
        return
    
    # Summary panel
    endpoints_count = len(result.get("endpoints", []))
    status_color = "green" if status == "discovered" else "red"
    status_icon = "✅" if status == "discovered" else "❌"
    
    summary_panel = Panel(
        f"[bold]Service:[/bold] {service}\n"
        f"[bold]Environment:[/bold] {environment.upper()}\n"
        f"[bold]Status:[/bold] [{status_color}]{status.upper()}[/{status_color}] {status_icon}\n"
        f"[bold]Endpoints Found:[/bold] {endpoints_count}\n"
        f"[bold]Base URL:[/bold] {result.get('base_url', 'Unknown')}\n"
        f"[bold]Documentation:[/bold] {result.get('documentation_url', 'Unknown')}",
        title=f"[bold white]API Discovery Results[/bold white]",
        border_style=status_color,
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(summary_panel)
    
    # Endpoints table
    endpoints = result.get("endpoints", [])
    if endpoints:
        console.print("\n[bold cyan]Discovered Endpoints:[/bold cyan]")
        
        endpoint_table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        endpoint_table.add_column("Method", style="bold", min_width=8)
        endpoint_table.add_column("Path", style="white", min_width=20)
        endpoint_table.add_column("Summary", style="white", min_width=25)
        endpoint_table.add_column("Parameters", style="dim", min_width=12)
        
        method_colors = {
            "GET": "green",
            "POST": "yellow",
            "PUT": "blue",
            "DELETE": "red",
            "PATCH": "purple"
        }
        
        for endpoint in endpoints:
            method = endpoint["method"]
            method_color = method_colors.get(method, "white")
            params_count = len(endpoint.get("parameters", []))
            
            endpoint_table.add_row(
                f"[{method_color}]{method}[/{method_color}]",
                endpoint["path"],
                endpoint["summary"][:23] + "..." if len(endpoint["summary"]) > 23 else endpoint["summary"],
                str(params_count)
            )
        
        console.print(endpoint_table)
    else:
        console.print("\n[yellow]⚠️ No endpoints discovered[/yellow]")


def _display_test_result(result: Dict[str, Any]):
    """Display API test results."""
    service = result["service"]
    endpoint = result["endpoint"]
    environment = result["environment"]
    status = result["status"]
    
    if status == "not_found":
        console.print(f"[red]❌ Service {service} not found in {environment}[/red]")
        return
    
    # Result panel
    if status == "success":
        status_color = "green"
        status_icon = "✅"
        status_text = f"{result['status_code']} - {result['response_time']:.3f}s"
    else:
        status_color = "red"
        status_icon = "❌"
        status_text = result.get("error", "Test failed")
    
    result_panel = Panel(
        f"[bold]Service:[/bold] {service}\n"
        f"[bold]Endpoint:[/bold] {endpoint}\n"
        f"[bold]Environment:[/bold] {environment.upper()}\n"
        f"[bold]URL:[/bold] {result.get('url', 'Unknown')}\n"
        f"[bold]Status:[/bold] [{status_color}]{status_text}[/{status_color}] {status_icon}\n"
        f"[bold]Content-Type:[/bold] {result.get('content_type', 'Unknown')}",
        title=f"[bold white]API Test Result[/bold white]",
        border_style=status_color,
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(result_panel)
    
    # Show response body if available
    if status == "success" and "response_body" in result:
        console.print("\n[bold cyan]Response Body:[/bold cyan]")
        response_json = json.dumps(result["response_body"], indent=2)
        console.print(Syntax(response_json, "json", theme="monokai", line_numbers=False))
