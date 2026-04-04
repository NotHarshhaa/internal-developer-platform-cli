"""Security scanning commands for the IDP CLI."""

import json
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

import click
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.console import Console

from idp_cli.utils.console import console, print_step, print_success, print_error, print_config_panel


class SecurityScanner:
    """Security scanner for container images and source code."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.cwd() / "idp-config.json"
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load security configuration from file."""
        if not self.config_file.exists():
            return {"security_policies": {}, "scan_results": {}}
        
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"security_policies": {}, "scan_results": {}}
    
    def _save_config(self):
        """Save configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def scan_container_image(self, image_name: str, scanner: str = "trivy") -> Dict[str, Any]:
        """Scan a container image for vulnerabilities."""
        print_step(f"Scanning container image: {image_name}")
        
        scan_result = {
            "image": image_name,
            "scanner": scanner,
            "timestamp": datetime.now().isoformat(),
            "vulnerabilities": [],
            "summary": {},
            "status": "scanning"
        }
        
        try:
            if scanner == "trivy":
                scan_result = self._scan_with_trivy(image_name, scan_result)
            elif scanner == "snyk":
                scan_result = self._scan_with_snyk(image_name, scan_result)
            else:
                raise ValueError(f"Unsupported scanner: {scanner}")
            
            # Calculate summary
            scan_result["summary"] = self._calculate_vulnerability_summary(scan_result["vulnerabilities"])
            scan_result["status"] = "completed"
            
        except Exception as e:
            scan_result["status"] = "failed"
            scan_result["error"] = str(e)
        
        # Store results
        self._store_scan_results(image_name, scan_result)
        
        return scan_result
    
    def _scan_with_trivy(self, image_name: str, scan_result: Dict[str, Any]) -> Dict[str, Any]:
        """Scan image using Trivy."""
        try:
            # Mock Trivy scan results - in real implementation would run Trivy CLI
            # subprocess.run(["trivy", "image", "--format", "json", image_name], capture_output=True, text=True)
            
            # Mock vulnerabilities based on common patterns
            mock_vulns = [
                {
                    "id": "CVE-2023-1234",
                    "title": "Critical vulnerability in OpenSSL",
                    "severity": "CRITICAL",
                    "package": "openssl",
                    "version": "1.1.1f",
                    "fixed_version": "1.1.1g",
                    "description": "Buffer overflow in OpenSSL TLS handling",
                    "references": ["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-1234"]
                },
                {
                    "id": "CVE-2023-5678",
                    "title": "High severity vulnerability in curl",
                    "severity": "HIGH",
                    "package": "curl",
                    "version": "7.68.0",
                    "fixed_version": "7.86.0",
                    "description": "Information disclosure in curl",
                    "references": ["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-5678"]
                },
                {
                    "id": "CVE-2023-9012",
                    "title": "Medium severity vulnerability in nginx",
                    "severity": "MEDIUM",
                    "package": "nginx",
                    "version": "1.18.0",
                    "fixed_version": "1.21.0",
                    "description": "Path traversal in nginx",
                    "references": ["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-9012"]
                },
                {
                    "id": "CVE-2023-3456",
                    "title": "Low severity vulnerability in bash",
                    "severity": "LOW",
                    "package": "bash",
                    "version": "5.0.0",
                    "fixed_version": "5.1.0",
                    "description": "Command injection in bash",
                    "references": ["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-3456"]
                }
            ]
            
            scan_result["vulnerabilities"] = mock_vulns
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"Trivy scan failed: {e.stderr}")
        except FileNotFoundError:
            raise Exception("Trivy not found. Please install Trivy: https://github.com/aquasecurity/trivy")
        
        return scan_result
    
    def _scan_with_snyk(self, image_name: str, scan_result: Dict[str, Any]) -> Dict[str, Any]:
        """Scan image using Snyk."""
        try:
            # Mock Snyk scan results - in real implementation would run Snyk CLI
            # subprocess.run(["snyk", "container", "test", image_name, "--json"], capture_output=True, text=True)
            
            # Mock vulnerabilities with Snyk-specific format
            mock_vulns = [
                {
                    "id": "SNYK-PYTHON-DJANGO-123456",
                    "title": "SQL Injection in Django ORM",
                    "severity": "HIGH",
                    "package": "django",
                    "version": "3.2.0",
                    "fixed_version": "4.0.0",
                    "description": "SQL injection vulnerability in Django ORM queries",
                    "references": ["https://snyk.io/vuln/SNYK-PYTHON-DJANGO-123456"]
                },
                {
                    "id": "SNYK-PYTHON-REQUESTS-789012",
                    "title": "URL redirection vulnerability in requests",
                    "severity": "MEDIUM",
                    "package": "requests",
                    "version": "2.25.0",
                    "fixed_version": "2.28.0",
                    "description": "Open redirect vulnerability in requests library",
                    "references": ["https://snyk.io/vuln/SNYK-PYTHON-REQUESTS-789012"]
                }
            ]
            
            scan_result["vulnerabilities"] = mock_vulns
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"Snyk scan failed: {e.stderr}")
        except FileNotFoundError:
            raise Exception("Snyk not found. Please install Snyk CLI: https://docs.snyk.io/snyk-cli/install")
        
        return scan_result
    
    def _calculate_vulnerability_summary(self, vulnerabilities: List[Dict]) -> Dict[str, int]:
        """Calculate vulnerability summary by severity."""
        summary = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
            "TOTAL": 0
        }
        
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "UNKNOWN").upper()
            if severity in summary:
                summary[severity] += 1
                summary["TOTAL"] += 1
        
        return summary
    
    def _store_scan_results(self, image_name: str, scan_result: Dict[str, Any]):
        """Store scan results in configuration."""
        scan_results = self.config.setdefault("scan_results", {})
        scan_results[image_name] = scan_result
        self._save_config()
    
    def get_scan_history(self, image_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get scan history for all images or specific image."""
        scan_results = self.config.get("scan_results", {})
        
        if image_name:
            return [scan_results[image_name]] if image_name in scan_results else []
        
        return list(scan_results.values())
    
    def check_security_policies(self, image_name: str) -> Dict[str, Any]:
        """Check scan results against security policies."""
        scan_results = self.config.get("scan_results", {})
        scan_result = scan_results.get(image_name)
        
        if not scan_result:
            return {"status": "no_scan", "message": f"No scan results found for {image_name}"}
        
        policies = self.config.get("security_policies", {})
        default_policies = {
            "max_critical": 0,
            "max_high": 1,
            "max_medium": 5,
            "max_low": 10
        }
        
        effective_policies = {**default_policies, **policies}
        summary = scan_result.get("summary", {})
        
        policy_violations = []
        compliant = True
        
        for severity, max_allowed in effective_policies.items():
            if severity == "TOTAL":
                continue
            
            actual_count = summary.get(severity, 0)
            if actual_count > max_allowed:
                compliant = False
                policy_violations.append({
                    "severity": severity,
                    "actual": actual_count,
                    "allowed": max_allowed,
                    "exceeded": actual_count - max_allowed
                })
        
        return {
            "status": "compliant" if compliant else "non_compliant",
            "compliant": compliant,
            "violations": policy_violations,
            "summary": summary,
            "policies": effective_policies
        }
    
    def scan_source_code(self, project_path: Path, scanner: str = "snyk") -> Dict[str, Any]:
        """Scan source code for security vulnerabilities."""
        print_step(f"Scanning source code in: {project_path}")
        
        scan_result = {
            "project_path": str(project_path),
            "scanner": scanner,
            "timestamp": datetime.now().isoformat(),
            "vulnerabilities": [],
            "summary": {},
            "status": "scanning"
        }
        
        try:
            if scanner == "snyk":
                scan_result = self._scan_code_with_snyk(project_path, scan_result)
            else:
                raise ValueError(f"Unsupported code scanner: {scanner}")
            
            scan_result["summary"] = self._calculate_vulnerability_summary(scan_result["vulnerabilities"])
            scan_result["status"] = "completed"
            
        except Exception as e:
            scan_result["status"] = "failed"
            scan_result["error"] = str(e)
        
        return scan_result
    
    def _scan_code_with_snyk(self, project_path: Path, scan_result: Dict[str, Any]) -> Dict[str, Any]:
        """Scan source code using Snyk."""
        try:
            # Mock Snyk code scan results
            mock_vulns = [
                {
                    "id": "SNYK-PYTHON-PYYAML-345678",
                    "title": "Unsafe YAML parsing vulnerability",
                    "severity": "HIGH",
                    "package": "PyYAML",
                    "version": "5.4.0",
                    "fixed_version": "6.0.0",
                    "file": "requirements.txt",
                    "description": "Unsafe YAML loading allows code execution",
                    "references": ["https://snyk.io/vuln/SNYK-PYTHON-PYYAML-345678"]
                },
                {
                    "id": "SNYK-JS-EXPRESS-901234",
                    "title": "Express.js open redirect",
                    "severity": "MEDIUM",
                    "package": "express",
                    "version": "4.17.0",
                    "fixed_version": "4.18.0",
                    "file": "package.json",
                    "description": "Open redirect vulnerability in Express.js",
                    "references": ["https://snyk.io/vuln/SNYK-JS-EXPRESS-901234"]
                }
            ]
            
            scan_result["vulnerabilities"] = mock_vulns
            
        except subprocess.CalledProcessError as e:
            raise Exception(f"Snyk code scan failed: {e.stderr}")
        
        return scan_result


@click.group("security")
def security_group():
    """Security scanning and vulnerability management."""
    pass


@security_group.command("scan")
@click.argument("target")
@click.option(
    "--type",
    "scan_type",
    type=click.Choice(["image", "code"]),
    default="image",
    help="Type of scan to perform",
    show_default=True,
)
@click.option(
    "--scanner",
    type=click.Choice(["trivy", "snyk"]),
    default="trivy",
    help="Security scanner to use",
    show_default=True,
)
@click.option(
    "--policy-check",
    is_flag=True,
    help="Check results against security policies",
)
def security_scan(target: str, scan_type: str, scanner: str, policy_check: bool):
    """Scan container images or source code for vulnerabilities.
    
    Examples:
      idp-cli security scan payment-service:latest
      idp-cli security scan payment-service:latest --scanner snyk --policy-check
      idp-cli security scan ./src --type code --scanner snyk
    """
    scanner_instance = SecurityScanner()
    
    if scan_type == "image":
        scan_result = scanner_instance.scan_container_image(target, scanner)
        _display_image_scan_results(scan_result)
        
        if policy_check:
            policy_result = scanner_instance.check_security_policies(target)
            _display_policy_check_results(policy_result, target)
    
    else:  # code scan
        project_path = Path(target)
        if not project_path.exists():
            print_error(f"Path '{target}' does not exist")
            raise SystemExit(1)
        
        scan_result = scanner_instance.scan_source_code(project_path, scanner)
        _display_code_scan_results(scan_result)


@security_group.command("history")
@click.option(
    "--image",
    help="Show history for specific image only",
)
@click.option(
    "--format",
    "output_format",
    type=click.Choice(["table", "json"]),
    default="table",
    help="Output format",
    show_default=True,
)
def security_history(image: Optional[str], output_format: str):
    """Show security scan history.
    
    Examples:
      idp-cli security history
      idp-cli security history --image payment-service:latest
      idp-cli security history --format json
    """
    scanner_instance = SecurityScanner()
    history = scanner_instance.get_scan_history(image)
    
    if not history:
        console.print("[yellow]No scan history found[/yellow]")
        return
    
    if output_format == "table":
        table = Table(
            title="Security Scan History",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        table.add_column("Target", style="bold white", min_width=20)
        table.add_column("Scanner", style="white", min_width=10)
        table.add_column("Status", style="bold", min_width=10)
        table.add_column("Critical", style="red", min_width=8)
        table.add_column("High", style="orange3", min_width=6)
        table.add_column("Medium", style="yellow", min_width=8)
        table.add_column("Low", style="green", min_width=6)
        table.add_column("Timestamp", style="dim", min_width=16)
        
        for scan in sorted(history, key=lambda x: x.get("timestamp", ""), reverse=True):
            summary = scan.get("summary", {})
            status = scan.get("status", "unknown")
            status_style = {
                "completed": "green",
                "failed": "red",
                "scanning": "yellow"
            }.get(status, "white")
            
            table.add_row(
                scan.get("image", scan.get("project_path", "Unknown")),
                scan.get("scanner", "Unknown"),
                f"[{status_style}]{status.upper()}[/{status_style}]",
                str(summary.get("CRITICAL", 0)),
                str(summary.get("HIGH", 0)),
                str(summary.get("MEDIUM", 0)),
                str(summary.get("LOW", 0)),
                scan.get("timestamp", "Unknown")[:19]  # Remove microseconds
            )
        
        console.print(table)
    else:
        console.print(json.dumps(history, indent=2))


@security_group.command("policy")
@click.option(
    "--show",
    "show_option",
    type=click.Choice(["current", "default"]),
    default="current",
    help="Show current or default policies",
    show_default=True,
)
@click.option(
    "--set",
    "policy_set",
    help="Set policy in format 'severity:max' (e.g., 'critical:0')",
    multiple=True,
)
def security_policy(show_option: str, policy_set: List[str]):
    """Manage security policies.
    
    Examples:
      idp-cli security policy --show current
      idp-cli security policy --show default
      idp-cli security policy --set critical:0 --set high:1 --set medium:5
    """
    scanner_instance = SecurityScanner()
    
    if policy_set:
        # Set policies
        policies = scanner_instance.config.setdefault("security_policies", {})
        
        for policy in policy_set:
            try:
                severity, max_count = policy.split(":")
                max_count = int(max_count)
                policies[severity.upper()] = max_count
                print_success(f"Set {severity.upper()} max to {max_count}")
            except ValueError:
                print_error(f"Invalid policy format: {policy}. Use 'severity:max'")
        
        scanner_instance._save_config()
        return
    
    # Show policies
    if show_option == "current":
        policies = scanner_instance.config.get("security_policies", {})
        title = "Current Security Policies"
    else:
        policies = {
            "CRITICAL": 0,
            "HIGH": 1,
            "MEDIUM": 5,
            "LOW": 10
        }
        title = "Default Security Policies"
    
    console.print(f"\n[bold cyan]{title}[/bold cyan]")
    
    policy_table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold cyan"
    )
    
    policy_table.add_column("Severity", style="bold white", min_width=10)
    policy_table.add_column("Max Allowed", style="white", min_width=12)
    policy_table.add_column("Description", style="dim", min_width=30)
    
    descriptions = {
        "CRITICAL": "Critical vulnerabilities that require immediate attention",
        "HIGH": "High severity vulnerabilities that should be addressed soon",
        "MEDIUM": "Medium severity vulnerabilities that should be addressed",
        "LOW": "Low severity vulnerabilities that can be addressed later"
    }
    
    for severity, max_allowed in policies.items():
        severity_style = {
            "CRITICAL": "red",
            "HIGH": "orange3",
            "MEDIUM": "yellow",
            "LOW": "green"
        }.get(severity, "white")
        
        policy_table.add_row(
            f"[{severity_style}]{severity}[/{severity_style}]",
            str(max_allowed),
            descriptions.get(severity, "No description")
        )
    
    console.print(policy_table)


def _display_image_scan_results(scan_result: Dict[str, Any]):
    """Display container image scan results."""
    status = scan_result.get("status", "unknown")
    image = scan_result.get("image", "Unknown")
    scanner = scan_result.get("scanner", "Unknown")
    timestamp = scan_result.get("timestamp", "Unknown")
    
    if status == "failed":
        console.print(f"[red]❌ Scan failed for {image}[/red]")
        console.print(f"[dim]Error: {scan_result.get('error', 'Unknown error')}[/dim]")
        return
    
    # Summary panel
    summary = scan_result.get("summary", {})
    total_vulns = summary.get("TOTAL", 0)
    critical = summary.get("CRITICAL", 0)
    high = summary.get("HIGH", 0)
    
    status_color = "red" if critical > 0 or high > 2 else "yellow" if total_vulns > 0 else "green"
    status_icon = "🚨" if critical > 0 else "⚠️" if total_vulns > 0 else "✅"
    
    summary_panel = Panel(
        f"[bold]Image:[/bold] {image}\n"
        f"[bold]Scanner:[/bold] {scanner}\n"
        f"[bold]Status:[/bold] [{status_color}]{status.upper()}[/{status_color}] {status_icon}\n"
        f"[bold]Total Vulnerabilities:[/bold] {total_vulns}\n"
        f"[bold]Critical:[/bold] [red]{critical}[/red] | "
        f"[bold]High:[/bold] [orange3]{high}[/orange3] | "
        f"[bold]Medium:[/bold] [yellow]{summary.get('MEDIUM', 0)}[/yellow] | "
        f"[bold]Low:[/bold] [green]{summary.get('LOW', 0)}[/green]\n"
        f"[bold]Scanned:[/bold] {timestamp[:19]}",
        title=f"[bold white]Security Scan Results[/bold white]",
        border_style=status_color,
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(summary_panel)
    
    # Vulnerabilities table
    vulnerabilities = scan_result.get("vulnerabilities", [])
    if vulnerabilities:
        console.print("\n[bold cyan]Vulnerabilities Found:[/bold cyan]")
        
        vuln_table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        vuln_table.add_column("ID", style="white", min_width=15)
        vuln_table.add_column("Severity", style="bold", min_width=10)
        vuln_table.add_column("Package", style="white", min_width=12)
        vuln_table.add_column("Version", style="white", min_width=10)
        vuln_table.add_column("Fixed In", style="green", min_width=10)
        vuln_table.add_column("Title", style="white", min_width=30)
        
        for vuln in vulnerabilities[:10]:  # Show first 10
            severity = vuln.get("severity", "UNKNOWN").upper()
            severity_style = {
                "CRITICAL": "red",
                "HIGH": "orange3",
                "MEDIUM": "yellow",
                "LOW": "green"
            }.get(severity, "white")
            
            vuln_table.add_row(
                vuln.get("id", "Unknown"),
                f"[{severity_style}]{severity}[/{severity_style}]",
                vuln.get("package", "Unknown"),
                vuln.get("version", "Unknown"),
                vuln.get("fixed_version", "N/A"),
                vuln.get("title", "No title")[:28] + "..." if len(vuln.get("title", "")) > 28 else vuln.get("title", "No title")
            )
        
        console.print(vuln_table)
        
        if len(vulnerabilities) > 10:
            console.print(f"[dim]... and {len(vulnerabilities) - 10} more vulnerabilities[/dim]")
    else:
        console.print("\n[green]✅ No vulnerabilities found![/green]")


def _display_code_scan_results(scan_result: Dict[str, Any]):
    """Display source code scan results."""
    status = scan_result.get("status", "unknown")
    project_path = scan_result.get("project_path", "Unknown")
    scanner = scan_result.get("scanner", "Unknown")
    
    if status == "failed":
        console.print(f"[red]❌ Code scan failed for {project_path}[/red]")
        console.print(f"[dim]Error: {scan_result.get('error', 'Unknown error')}[/dim]")
        return
    
    # Summary panel
    summary = scan_result.get("summary", {})
    total_vulns = summary.get("TOTAL", 0)
    
    status_color = "red" if total_vulns > 0 else "green"
    status_icon = "🚨" if total_vulns > 0 else "✅"
    
    summary_panel = Panel(
        f"[bold]Project:[/bold] {project_path}\n"
        f"[bold]Scanner:[/bold] {scanner}\n"
        f"[bold]Status:[/bold] [{status_color}]{status.upper()}[/{status_color}] {status_icon}\n"
        f"[bold]Total Vulnerabilities:[/bold] {total_vulns}\n"
        f"[bold]Critical:[/bold] [red]{summary.get('CRITICAL', 0)}[/red] | "
        f"[bold]High:[/bold] [orange3]{summary.get('HIGH', 0)}[/orange3] | "
        f"[bold]Medium:[/bold] [yellow]{summary.get('MEDIUM', 0)}[/yellow] | "
        f"[bold]Low:[/bold] [green]{summary.get('LOW', 0)}[/green]",
        title=f"[bold white]Code Security Scan Results[/bold white]",
        border_style=status_color,
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(summary_panel)
    
    # Vulnerabilities table
    vulnerabilities = scan_result.get("vulnerabilities", [])
    if vulnerabilities:
        console.print("\n[bold cyan]Vulnerabilities Found:[/bold cyan]")
        
        vuln_table = Table(
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold cyan"
        )
        
        vuln_table.add_column("ID", style="white", min_width=20)
        vuln_table.add_column("Severity", style="bold", min_width=10)
        vuln_table.add_column("Package", style="white", min_width=12)
        vuln_table.add_column("File", style="dim", min_width=15)
        vuln_table.add_column("Title", style="white", min_width=30)
        
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "UNKNOWN").upper()
            severity_style = {
                "CRITICAL": "red",
                "HIGH": "orange3",
                "MEDIUM": "yellow",
                "LOW": "green"
            }.get(severity, "white")
            
            vuln_table.add_row(
                vuln.get("id", "Unknown"),
                f"[{severity_style}]{severity}[/{severity_style}]",
                vuln.get("package", "Unknown"),
                vuln.get("file", "Unknown"),
                vuln.get("title", "No title")[:28] + "..." if len(vuln.get("title", "")) > 28 else vuln.get("title", "No title")
            )
        
        console.print(vuln_table)
    else:
        console.print("\n[green]✅ No vulnerabilities found![/green]")


def _display_policy_check_results(policy_result: Dict[str, Any], target: str):
    """Display security policy check results."""
    status = policy_result.get("status", "unknown")
    compliant = policy_result.get("compliant", False)
    
    if status == "no_scan":
        console.print(f"[yellow]⚠️ {policy_result.get('message')}[/yellow]")
        return
    
    status_color = "green" if compliant else "red"
    status_icon = "✅" if compliant else "❌"
    
    # Policy compliance panel
    compliance_panel = Panel(
        f"[bold]Target:[/bold] {target}\n"
        f"[bold]Status:[/bold] [{status_color}]{status.upper()}[/{status_color}] {status_icon}\n"
        f"[bold]Compliant:[/bold] [{status_color}]{'YES' if compliant else 'NO'}[/{status_color}]",
        title=f"[bold white]Security Policy Check[/bold white]",
        border_style=status_color,
        box=box.ROUNDED,
        padding=(1, 2)
    )
    
    console.print(compliance_panel)
    
    # Show violations if any
    violations = policy_result.get("violations", [])
    if violations:
        console.print("\n[bold red]🚨 Policy Violations:[/bold red]")
        
        violation_table = Table(
            box=box.ROUNDED,
            border_style="red",
            show_header=True,
            header_style="bold red"
        )
        
        violation_table.add_column("Severity", style="bold", min_width=10)
        violation_table.add_column("Actual", style="white", min_width=8)
        violation_table.add_column("Allowed", style="white", min_width=8)
        violation_table.add_column("Exceeded", style="red", min_width=10)
        
        for violation in violations:
            violation_table.add_row(
                violation["severity"],
                str(violation["actual"]),
                str(violation["allowed"]),
                f"+{violation['exceeded']}"
            )
        
        console.print(violation_table)
    else:
        console.print("\n[green]✅ All security policies satisfied![/green]")
