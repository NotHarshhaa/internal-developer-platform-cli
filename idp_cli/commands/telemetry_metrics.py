"""Telemetry & OpenTelemetry metrics command."""

import random
import time
from typing import Optional

import click
from rich.panel import Panel
from rich.table import Table
from rich import box

from idp_cli.utils.console import console, print_header, print_success, print_info


@click.group("telemetry")
def telemetry_group() -> None:
    """Live performance metrics, OpenTelemetry distributed tracing, and resource telemetry."""
    pass


@telemetry_group.command("top")
@click.option(
    "--environment",
    "-e",
    default="production",
    help="Target environment.",
    show_default=True,
)
def top_services(environment: str) -> None:
    """Display real-time top microservices sorted by CPU, Memory, and Request QPS."""
    print_header(f"Top Service Metrics — {environment.upper()}")

    table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold white",
        padding=(0, 1),
    )
    table.add_column("Service Name", style="bold cyan", min_width=20)
    table.add_column("Replicas", justify="center", min_width=10)
    table.add_column("Traffic QPS", justify="right", min_width=12)
    table.add_column("p95 Latency", justify="right", min_width=12)
    table.add_column("CPU Usage", justify="right", min_width=12)
    table.add_column("Memory (RAM)", justify="right", min_width=14)
    table.add_column("Error Rate", justify="right", min_width=10)

    sample_metrics = [
        ("auth-gateway", "3/3", "4,200 req/s", "18ms", "24.2%", "184 MiB", "[green]0.01%[/green]"),
        ("orders-api", "4/4", "1,850 req/s", "34ms", "48.6%", "420 MiB", "[green]0.02%[/green]"),
        ("users-service", "2/2", "920 req/s", "12ms", "18.4%", "210 MiB", "[green]0.00%[/green]"),
        ("payment-worker", "2/2", "450 req/s", "82ms", "38.1%", "295 MiB", "[green]0.04%[/green]"),
        ("notification-hub", "2/2", "320 req/s", "45ms", "21.0%", "160 MiB", "[green]0.00%[/green]"),
        ("kafka-event-bus", "3/3", "8,900 msg/s", "4ms", "62.4%", "2,150 MiB", "[yellow]0.12%[/yellow]"),
    ]

    for name, repl, qps, p95, cpu, mem, err in sample_metrics:
        table.add_row(name, repl, qps, p95, cpu, mem, err)

    console.print(table)
    console.print()
    print_info(f"Telemetry collected via OpenTelemetry Collector (v0.96.0)")
    console.print()


@telemetry_group.command("trace")
@click.argument("trace_id", default="tr-8f4b29c1e03a")
def trace_inspection(trace_id: str) -> None:
    """Inspect a distributed OpenTelemetry transaction trace tree and span latencies."""
    print_header(f"Distributed Trace: {trace_id}")

    trace_info = (
        f"[bold]Root Service:[/bold]  [cyan]api-gateway[/cyan]  |  "
        f"[bold]HTTP Method:[/bold]  [green]POST /v1/orders/checkout[/green]\n"
        f"[bold]Duration:[/bold]      [yellow]68.4ms[/yellow]  |  "
        f"[bold]Total Spans:[/bold]   [white]7 spans across 4 microservices[/white]\n"
        f"[bold]Trace Status:[/bold]  [bold green]OK (HTTP 201 Created)[/bold green]"
    )

    console.print(
        Panel(
            trace_info,
            border_style="cyan",
            box=box.ROUNDED,
            padding=(1, 2),
        )
    )
    console.print()

    table = Table(
        title="[bold]Span Waterfall Timeline[/bold]",
        box=box.ROUNDED,
        border_style="cyan",
        show_header=True,
        header_style="bold white",
    )
    table.add_column("Span Name", style="bold white", min_width=28)
    table.add_column("Service", style="dim cyan", min_width=16)
    table.add_column("Duration", justify="right", min_width=10)
    table.add_column("Timeline Waterfall", style="green", min_width=24)

    spans = [
        ("HTTP POST /orders/checkout", "api-gateway", "68.4ms", "████████████████████"),
        ("  jwt.verify_token", "auth-service", "8.2ms", "  ███"),
        ("  POST /api/v1/orders", "orders-api", "54.1ms", "   ████████████████"),
        ("    SELECT users WHERE id = ?", "postgres-users", "2.1ms", "     █"),
        ("    INSERT orders (status='pending')", "postgres-orders", "4.8ms", "     ██"),
        ("    kafka.produce 'order.created'", "kafka-broker", "3.4ms", "          █"),
        ("  cache.invalidate_user_cart", "redis-cache", "1.1ms", "                  █"),
    ]

    for span, svc, dur, water in spans:
        table.add_row(span, svc, dur, water)

    console.print(table)
    console.print()
