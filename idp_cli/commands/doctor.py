"""Doctor command - Diagnostic tool for local environment and platform readiness."""

import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import click
from rich.panel import Panel
from rich.table import Table
from rich import box

from idp_cli.utils.console import console, print_header, print_success, print_error, print_warning


def _check_command(command: str) -> Tuple[bool, str]:
    """Check if a CLI binary is available and retrieve its version."""
    path = shutil.which(command)
    if not path:
        return False, "Not Installed"
    try:
        proc = subprocess.run(
            [command, "--version"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        out = proc.stdout.strip() or proc.stderr.strip()
        version_line = out.split("\n")[0] if out else "Installed"
        return True, version_line[:40]
    except Exception:
        return True, "Installed"


def _check_docker_daemon() -> Tuple[bool, str]:
    """Check if Docker daemon is running."""
    if not shutil.which("docker"):
        return False, "Docker CLI not found"
    try:
        proc = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        if proc.returncode == 0:
            return True, "Daemon Active & Responsive"
        return False, "Daemon Not Running"
    except Exception:
        return False, "Daemon Not Responding"


def _check_kubectl_cluster() -> Tuple[bool, str]:
    """Check if kubectl has an active cluster context."""
    if not shutil.which("kubectl"):
        return False, "kubectl CLI not found"
    try:
        proc = subprocess.run(
            ["kubectl", "config", "current-context"],
            capture_output=True,
            text=True,
            timeout=3,
        )
        if proc.returncode == 0 and proc.stdout.strip():
            return True, f"Active Context: {proc.stdout.strip()}"
        return False, "No active cluster context"
    except Exception:
        return False, "Cluster unreachable"


@click.command("doctor")
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Show detailed diagnostic output.",
)
def doctor_command(verbose: bool) -> None:
    """Diagnose your local development environment and cloud prerequisites.

    Checks installed runtimes, container engines, Kubernetes tools, and cloud CLIs.
    """
    console.print()
    print_header("IDP Environment Doctor")

    categories = {
        "Container & Kubernetes Engines": [
            ("docker", "Docker CLI", "Container runtime & image builder", _check_command("docker")),
            ("docker-daemon", "Docker Daemon", "Active container daemon engine", _check_docker_daemon()),
            ("kubectl", "Kubectl CLI", "Kubernetes cluster administration", _check_command("kubectl")),
            ("k8s-cluster", "Kubernetes Cluster", "Connected cluster context", _check_kubectl_cluster()),
            ("helm", "Helm CLI", "Kubernetes package manager", _check_command("helm")),
            ("minikube", "Minikube / Kind", "Local Kubernetes test cluster", _check_command("minikube")),
        ],
        "Developer SDKs & Toolchains": [
            ("python", "Python 3 Runtime", "Python SDK interpreter", (True, f"Python {sys.version.split()[0]}")),
            ("node", "Node.js Runtime", "JavaScript / TypeScript runtime", _check_command("node")),
            ("npm", "NPM Package Manager", "Node package dependency tool", _check_command("npm")),
            ("go", "Go Language Toolchain", "Go compiler and modules", _check_command("go")),
            ("rustc", "Rust Compiler", "Rust cargo & rustc toolchain", _check_command("rustc")),
            ("git", "Git Version Control", "Source control management", _check_command("git")),
        ],
        "Cloud & GitOps CLIs": [
            ("aws", "AWS CLI", "Amazon Web Services management", _check_command("aws")),
            ("gcloud", "Google Cloud SDK", "GCP cloud management", _check_command("gcloud")),
            ("az", "Azure CLI", "Microsoft Azure management", _check_command("az")),
            ("argocd", "ArgoCD CLI", "GitOps deployment controller", _check_command("argocd")),
            ("flux", "Flux CLI", "GitOps continuous delivery", _check_command("flux")),
        ],
    }

    total_checks = 0
    passed_checks = 0
    recommendations: List[str] = []

    for cat_name, items in categories.items():
        table = Table(
            title=f"[bold cyan]{cat_name}[/bold cyan]",
            box=box.ROUNDED,
            border_style="cyan",
            show_header=True,
            header_style="bold white",
            padding=(0, 1),
        )
        table.add_column("Tool / Engine", style="bold white", min_width=18)
        table.add_column("Status", min_width=10)
        table.add_column("Detected Version / Details", style="dim", min_width=32)

        for _, display_name, purpose, (passed, details) in items:
            total_checks += 1
            if passed:
                passed_checks += 1
                status_str = "[bold green]PASS[/bold green]"
            else:
                status_str = "[bold yellow]OPTIONAL[/bold yellow]" if "Cloud" in cat_name or "minikube" in display_name else "[bold red]MISSING[/bold red]"
                recommendations.append(f"Install [bold cyan]{display_name}[/bold cyan] for {purpose}")

            table.add_row(display_name, status_str, details)

        console.print(table)
        console.print()

    # Summary Panel
    score = int((passed_checks / total_checks) * 100) if total_checks else 100
    score_color = "green" if score >= 70 else "yellow"
    summary_text = (
        f"[bold]Diagnostic Score:[/bold]  [{score_color}]{score}%[/{score_color}] "
        f"({passed_checks}/{total_checks} checks satisfied)\n\n"
    )

    if recommendations:
        summary_text += "[bold yellow]Remediation Recommendations:[/bold yellow]\n"
        for i, rec in enumerate(recommendations[:5], 1):
            summary_text += f"  {i}. {rec}\n"
    else:
        summary_text += "[bold green]All core development prerequisites are fully satisfied![/bold green]"

    console.print(
        Panel(
            summary_text.strip(),
            title="[bold white]Doctor Summary & Readiness[/bold white]",
            border_style="green" if score >= 70 else "yellow",
            box=box.ROUNDED,
            padding=(1, 2),
        )
    )
    console.print()
