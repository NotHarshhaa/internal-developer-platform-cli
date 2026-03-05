"""Flux CD GitOps integration."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_flux_config(
    service_dir: Path,
    service_name: str,
    repo_url: str = "https://github.com/org/repo.git",
) -> None:
    """Generate Flux CD manifests."""
    print_step("Generating Flux CD configuration...")
    gitops_dir = service_dir / "gitops" / "flux"

    # GitRepository source
    write_file(
        gitops_dir / "source.yaml",
        f"""apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: {service_name}
  namespace: flux-system
spec:
  interval: 1m
  url: {repo_url}
  ref:
    branch: main
  secretRef:
    name: {service_name}-git-credentials
""",
    )

    # Kustomization per environment
    for env in ["dev", "staging", "production"]:
        write_file(
            gitops_dir / f"kustomization-{env}.yaml",
            f"""apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: {service_name}-{env}
  namespace: flux-system
spec:
  interval: 5m
  path: ./k8s/overlays/{env}
  prune: true
  sourceRef:
    kind: GitRepository
    name: {service_name}
  targetNamespace: {service_name}-{env}
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: {service_name}
      namespace: {service_name}-{env}
  timeout: 3m
""",
        )
