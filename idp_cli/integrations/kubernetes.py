"""Kubernetes manifest generator."""

from pathlib import Path
from typing import List

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_k8s_manifests(
    service_dir: Path,
    service_name: str,
    environments: List[str] = None,
    container_registry: str = "ghcr.io",
) -> None:
    """Generate Kubernetes deployment manifests for a service."""
    print_step("Generating Kubernetes manifests...")
    environments = environments or ["dev", "staging", "production"]
    k8s_dir = service_dir / "k8s"

    _generate_namespace(k8s_dir, service_name)
    _generate_deployment(k8s_dir, service_name, container_registry)
    _generate_service(k8s_dir, service_name)
    _generate_configmap(k8s_dir, service_name)
    _generate_hpa(k8s_dir, service_name)

    # Environment-specific overlays
    for env in environments:
        _generate_env_kustomize(k8s_dir, service_name, env)


def _generate_namespace(k8s_dir: Path, service_name: str) -> None:
    write_file(
        k8s_dir / "base" / "namespace.yaml",
        f"""apiVersion: v1
kind: Namespace
metadata:
  name: {service_name}
  labels:
    app: {service_name}
    managed-by: idp-cli
""",
    )


def _generate_deployment(k8s_dir: Path, service_name: str, registry: str) -> None:
    write_file(
        k8s_dir / "base" / "deployment.yaml",
        f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service_name}
  labels:
    app: {service_name}
    managed-by: idp-cli
spec:
  replicas: 2
  selector:
    matchLabels:
      app: {service_name}
  template:
    metadata:
      labels:
        app: {service_name}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: {service_name}
          image: {registry}/{service_name}:latest
          ports:
            - containerPort: 8000
              protocol: TCP
          env:
            - name: APP_NAME
              value: "{service_name}"
            - name: LOG_LEVEL
              valueFrom:
                configMapKeyRef:
                  name: {service_name}-config
                  key: LOG_LEVEL
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 15
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 30
      restartPolicy: Always
""",
    )


def _generate_service(k8s_dir: Path, service_name: str) -> None:
    write_file(
        k8s_dir / "base" / "service.yaml",
        f"""apiVersion: v1
kind: Service
metadata:
  name: {service_name}
  labels:
    app: {service_name}
    managed-by: idp-cli
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 8000
      protocol: TCP
      name: http
  selector:
    app: {service_name}
""",
    )


def _generate_configmap(k8s_dir: Path, service_name: str) -> None:
    write_file(
        k8s_dir / "base" / "configmap.yaml",
        f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: {service_name}-config
  labels:
    app: {service_name}
    managed-by: idp-cli
data:
  LOG_LEVEL: "info"
  APP_ENV: "production"
""",
    )


def _generate_hpa(k8s_dir: Path, service_name: str) -> None:
    write_file(
        k8s_dir / "base" / "hpa.yaml",
        f"""apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {service_name}
  labels:
    app: {service_name}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {service_name}
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
""",
    )


def _generate_env_kustomize(k8s_dir: Path, service_name: str, env: str) -> None:
    """Generate environment-specific Kustomize overlay."""
    replicas = {"dev": 1, "staging": 2, "production": 3}.get(env, 2)
    cpu_limit = {"dev": "250m", "staging": "500m", "production": "1000m"}.get(env, "500m")
    mem_limit = {"dev": "256Mi", "staging": "512Mi", "production": "1Gi"}.get(env, "512Mi")

    write_file(
        k8s_dir / "overlays" / env / "kustomization.yaml",
        f"""apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: {service_name}-{env}

resources:
  - ../../base

patches:
  - target:
      kind: Deployment
      name: {service_name}
    patch: |
      - op: replace
        path: /spec/replicas
        value: {replicas}
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/cpu
        value: "{cpu_limit}"
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: "{mem_limit}"

commonLabels:
  environment: {env}
""",
    )

    # Base kustomization
    write_file(
        k8s_dir / "base" / "kustomization.yaml",
        f"""apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - namespace.yaml
  - deployment.yaml
  - service.yaml
  - configmap.yaml
  - hpa.yaml

commonLabels:
  app: {service_name}
  managed-by: idp-cli
""",
    )
