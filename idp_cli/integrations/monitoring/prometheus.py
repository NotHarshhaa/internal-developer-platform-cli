"""Prometheus monitoring and Grafana dashboard generator."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_monitoring_config(service_dir: Path, service_name: str) -> None:
    """Generate monitoring configuration for a service."""
    print_step("Generating monitoring configuration...")
    monitoring_dir = service_dir / "monitoring"

    _generate_prometheus_rules(monitoring_dir, service_name)
    _generate_grafana_dashboard(monitoring_dir, service_name)
    _generate_service_monitor(monitoring_dir, service_name)


def _generate_prometheus_rules(monitoring_dir: Path, service_name: str) -> None:
    """Generate Prometheus alerting rules."""
    write_file(
        monitoring_dir / "prometheus-rules.yaml",
        f"""apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: {service_name}-alerts
  labels:
    app: {service_name}
    managed-by: idp-cli
spec:
  groups:
    - name: {service_name}.rules
      rules:
        # High error rate alert
        - alert: {service_name.replace('-', '_').title().replace('_', '')}HighErrorRate
          expr: |
            sum(rate(http_requests_total{{service="{service_name}", status=~"5.."}}[5m]))
            /
            sum(rate(http_requests_total{{service="{service_name}"}}[5m]))
            > 0.05
          for: 5m
          labels:
            severity: critical
            service: {service_name}
          annotations:
            summary: "High error rate for {service_name}"
            description: "Error rate is above 5% for the last 5 minutes."

        # High latency alert
        - alert: {service_name.replace('-', '_').title().replace('_', '')}HighLatency
          expr: |
            histogram_quantile(0.95,
              sum(rate(http_request_duration_seconds_bucket{{service="{service_name}"}}[5m])) by (le)
            ) > 1
          for: 5m
          labels:
            severity: warning
            service: {service_name}
          annotations:
            summary: "High latency for {service_name}"
            description: "P95 latency is above 1 second."

        # Pod restart alert
        - alert: {service_name.replace('-', '_').title().replace('_', '')}PodRestarting
          expr: |
            increase(kube_pod_container_status_restarts_total{{pod=~"{service_name}-.*"}}[1h]) > 3
          for: 10m
          labels:
            severity: warning
            service: {service_name}
          annotations:
            summary: "Pod restarting frequently"
            description: "Pod has restarted more than 3 times in the last hour."
""",
    )


def _generate_service_monitor(monitoring_dir: Path, service_name: str) -> None:
    """Generate ServiceMonitor for Prometheus Operator."""
    write_file(
        monitoring_dir / "service-monitor.yaml",
        f"""apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: {service_name}
  labels:
    app: {service_name}
    managed-by: idp-cli
spec:
  selector:
    matchLabels:
      app: {service_name}
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
      scrapeTimeout: 10s
  namespaceSelector:
    matchNames:
      - {service_name}
""",
    )


def _generate_grafana_dashboard(monitoring_dir: Path, service_name: str) -> None:
    """Generate a Grafana dashboard JSON template."""
    import json

    svc = service_name
    dashboard = {
        "annotations": {"list": []},
        "description": f"Dashboard for {svc}",
        "editable": True,
        "fiscalYearStartMonth": 0,
        "graphTooltip": 0,
        "links": [],
        "liveNow": False,
        "panels": [
            {
                "title": "Request Rate",
                "type": "timeseries",
                "datasource": "Prometheus",
                "targets": [
                    {
                        "expr": f'sum(rate(http_requests_total{{service="{svc}"}}[5m])) by (status)',
                        "legendFormat": "{{status}}",
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
            },
            {
                "title": "Response Latency (P95)",
                "type": "timeseries",
                "datasource": "Prometheus",
                "targets": [
                    {
                        "expr": f'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{{service="{svc}"}}[5m])) by (le))',
                        "legendFormat": "P95",
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
            },
            {
                "title": "Error Rate",
                "type": "stat",
                "datasource": "Prometheus",
                "targets": [
                    {
                        "expr": f'sum(rate(http_requests_total{{service="{svc}", status=~"5.."}}[5m])) / sum(rate(http_requests_total{{service="{svc}"}}[5m])) * 100',
                        "legendFormat": "Error %",
                    }
                ],
                "gridPos": {"h": 4, "w": 6, "x": 0, "y": 8},
            },
            {
                "title": "CPU Usage",
                "type": "timeseries",
                "datasource": "Prometheus",
                "targets": [
                    {
                        "expr": f'sum(rate(container_cpu_usage_seconds_total{{pod=~"{svc}-.*"}}[5m])) by (pod)',
                        "legendFormat": "{{pod}}",
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 0, "y": 12},
            },
            {
                "title": "Memory Usage",
                "type": "timeseries",
                "datasource": "Prometheus",
                "targets": [
                    {
                        "expr": f'sum(container_memory_usage_bytes{{pod=~"{svc}-.*"}}) by (pod)',
                        "legendFormat": "{{pod}}",
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 12, "y": 12},
            },
        ],
        "schemaVersion": 38,
        "style": "dark",
        "tags": [svc, "idp-cli"],
        "templating": {"list": []},
        "time": {"from": "now-6h", "to": "now"},
        "title": f"{svc} Dashboard",
        "version": 1,
    }

    write_file(
        monitoring_dir / "grafana-dashboard.json",
        json.dumps(dashboard, indent=2) + "\n",
    )
