"""ArgoCD GitOps integration."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_argocd_config(
    service_dir: Path,
    service_name: str,
    repo_url: str = "https://github.com/org/repo.git",
) -> None:
    """Generate ArgoCD Application manifests."""
    print_step("Generating ArgoCD configuration...")
    gitops_dir = service_dir / "gitops" / "argocd"

    for env in ["dev", "staging", "production"]:
        write_file(
            gitops_dir / f"{service_name}-{env}.yaml",
            f"""apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: {service_name}-{env}
  namespace: argocd
  labels:
    app: {service_name}
    environment: {env}
    managed-by: idp-cli
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default

  source:
    repoURL: {repo_url}
    targetRevision: HEAD
    path: k8s/overlays/{env}

  destination:
    server: https://kubernetes.default.svc
    namespace: {service_name}-{env}

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true
      - ApplyOutOfSyncOnly=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m0s
""",
        )

    # AppProject
    write_file(
        gitops_dir / f"{service_name}-project.yaml",
        f"""apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: {service_name}
  namespace: argocd
spec:
  description: "Project for {service_name}"
  sourceRepos:
    - "{repo_url}"
  destinations:
    - namespace: "{service_name}-*"
      server: "https://kubernetes.default.svc"
  clusterResourceWhitelist:
    - group: ""
      kind: Namespace
""",
    )
