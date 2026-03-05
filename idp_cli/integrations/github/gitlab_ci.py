"""GitLab CI pipeline generator."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_gitlab_ci(service_dir: Path, service_name: str, language: str) -> None:
    """Generate GitLab CI/CD pipeline configuration."""
    print_step("Generating GitLab CI pipeline...")

    if language == "python":
        _generate_python_pipeline(service_dir, service_name)
    elif language == "javascript":
        _generate_node_pipeline(service_dir, service_name)
    else:
        _generate_python_pipeline(service_dir, service_name)


def _generate_python_pipeline(service_dir: Path, service_name: str) -> None:
    write_file(
        service_dir / ".gitlab-ci.yml",
        f"""stages:
  - lint
  - test
  - security
  - build
  - deploy

variables:
  PYTHON_VERSION: "3.11"
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE/{service_name}

# --- Lint ---
lint:
  stage: lint
  image: python:${{PYTHON_VERSION}}
  script:
    - pip install ruff black
    - ruff check .
    - black --check .

# --- Test ---
test:
  stage: test
  image: python:${{PYTHON_VERSION}}
  script:
    - pip install -r requirements.txt
    - pip install -r requirements-dev.txt
    - pytest --cov=app --cov-report=xml -v
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

# --- Security Scan ---
security_scan:
  stage: security
  image: python:${{PYTHON_VERSION}}
  script:
    - pip install bandit safety
    - bandit -r app/ -f json -o bandit-report.json || true
    - safety check -r requirements.txt || true
  artifacts:
    paths:
      - bandit-report.json

# --- Build Docker Image ---
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA -t $DOCKER_IMAGE:latest .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
    - docker push $DOCKER_IMAGE:latest
  only:
    - main

# --- Deploy ---
deploy_staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/
    - kubectl set image deployment/{service_name} {service_name}=$DOCKER_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/{service_name} --timeout=300s
  environment:
    name: staging
  only:
    - main

deploy_production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/
    - kubectl set image deployment/{service_name} {service_name}=$DOCKER_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/{service_name} --timeout=300s
  environment:
    name: production
  when: manual
  only:
    - main
""",
    )


def _generate_node_pipeline(service_dir: Path, service_name: str) -> None:
    write_file(
        service_dir / ".gitlab-ci.yml",
        f"""stages:
  - lint
  - test
  - security
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE/{service_name}

lint:
  stage: lint
  image: node:${{NODE_VERSION}}
  script:
    - npm ci
    - npm run lint

test:
  stage: test
  image: node:${{NODE_VERSION}}
  script:
    - npm ci
    - npm test
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security_scan:
  stage: security
  image: node:${{NODE_VERSION}}
  script:
    - npm ci
    - npm audit --production || true

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA -t $DOCKER_IMAGE:latest .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
    - docker push $DOCKER_IMAGE:latest
  only:
    - main

deploy_staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/
    - kubectl set image deployment/{service_name} {service_name}=$DOCKER_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/{service_name} --timeout=300s
  environment:
    name: staging
  only:
    - main
""",
    )
