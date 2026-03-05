"""Jenkins pipeline generator."""

from pathlib import Path

from idp_cli.utils.file_utils import write_file
from idp_cli.utils.console import print_step


def generate_jenkins_pipeline(service_dir: Path, service_name: str, language: str) -> None:
    """Generate Jenkinsfile for a service."""
    print_step("Generating Jenkins pipeline...")

    if language == "python":
        _generate_python_jenkinsfile(service_dir, service_name)
    elif language == "javascript":
        _generate_node_jenkinsfile(service_dir, service_name)
    else:
        _generate_python_jenkinsfile(service_dir, service_name)


def _generate_python_jenkinsfile(service_dir: Path, service_name: str) -> None:
    write_file(
        service_dir / "Jenkinsfile",
        f"""pipeline {{
    agent any

    environment {{
        SERVICE_NAME = '{service_name}'
        DOCKER_REGISTRY = credentials('docker-registry')
        DOCKER_IMAGE = "${{DOCKER_REGISTRY}}/${{SERVICE_NAME}}"
    }}

    stages {{
        stage('Checkout') {{
            steps {{
                checkout scm
            }}
        }}

        stage('Lint') {{
            agent {{
                docker {{ image 'python:3.11' }}
            }}
            steps {{
                sh 'pip install ruff black'
                sh 'ruff check .'
                sh 'black --check .'
            }}
        }}

        stage('Test') {{
            agent {{
                docker {{ image 'python:3.11' }}
            }}
            steps {{
                sh 'pip install -r requirements.txt'
                sh 'pip install -r requirements-dev.txt'
                sh 'pytest --cov=app --cov-report=xml -v'
            }}
            post {{
                always {{
                    junit 'test-results.xml'
                    cobertura coberturaReportFile: 'coverage.xml'
                }}
            }}
        }}

        stage('Security Scan') {{
            agent {{
                docker {{ image 'python:3.11' }}
            }}
            steps {{
                sh 'pip install bandit safety'
                sh 'bandit -r app/ -f json -o bandit-report.json || true'
                sh 'safety check -r requirements.txt || true'
            }}
        }}

        stage('Build Docker Image') {{
            steps {{
                script {{
                    docker.build("${{DOCKER_IMAGE}}:${{BUILD_NUMBER}}")
                    docker.build("${{DOCKER_IMAGE}}:latest")
                }}
            }}
        }}

        stage('Push Docker Image') {{
            when {{ branch 'main' }}
            steps {{
                script {{
                    docker.withRegistry("https://${{DOCKER_REGISTRY}}", 'docker-credentials') {{
                        docker.image("${{DOCKER_IMAGE}}:${{BUILD_NUMBER}}").push()
                        docker.image("${{DOCKER_IMAGE}}:latest").push()
                    }}
                }}
            }}
        }}

        stage('Deploy to Staging') {{
            when {{ branch 'main' }}
            steps {{
                sh "kubectl apply -f k8s/"
                sh "kubectl set image deployment/${{SERVICE_NAME}} ${{SERVICE_NAME}}=${{DOCKER_IMAGE}}:${{BUILD_NUMBER}}"
                sh "kubectl rollout status deployment/${{SERVICE_NAME}} --timeout=300s"
            }}
        }}
    }}

    post {{
        always {{
            cleanWs()
        }}
        failure {{
            echo "Build failed for ${{SERVICE_NAME}}"
        }}
        success {{
            echo "Build succeeded for ${{SERVICE_NAME}}"
        }}
    }}
}}
""",
    )


def _generate_node_jenkinsfile(service_dir: Path, service_name: str) -> None:
    write_file(
        service_dir / "Jenkinsfile",
        f"""pipeline {{
    agent any

    environment {{
        SERVICE_NAME = '{service_name}'
        DOCKER_REGISTRY = credentials('docker-registry')
        DOCKER_IMAGE = "${{DOCKER_REGISTRY}}/${{SERVICE_NAME}}"
    }}

    stages {{
        stage('Checkout') {{
            steps {{
                checkout scm
            }}
        }}

        stage('Install') {{
            agent {{
                docker {{ image 'node:20' }}
            }}
            steps {{
                sh 'npm ci'
            }}
        }}

        stage('Lint') {{
            agent {{
                docker {{ image 'node:20' }}
            }}
            steps {{
                sh 'npm run lint'
            }}
        }}

        stage('Test') {{
            agent {{
                docker {{ image 'node:20' }}
            }}
            steps {{
                sh 'npm test'
            }}
        }}

        stage('Build Docker Image') {{
            steps {{
                script {{
                    docker.build("${{DOCKER_IMAGE}}:${{BUILD_NUMBER}}")
                }}
            }}
        }}

        stage('Push Docker Image') {{
            when {{ branch 'main' }}
            steps {{
                script {{
                    docker.withRegistry("https://${{DOCKER_REGISTRY}}", 'docker-credentials') {{
                        docker.image("${{DOCKER_IMAGE}}:${{BUILD_NUMBER}}").push()
                        docker.image("${{DOCKER_IMAGE}}:latest").push()
                    }}
                }}
            }}
        }}

        stage('Deploy') {{
            when {{ branch 'main' }}
            steps {{
                sh "kubectl apply -f k8s/"
                sh "kubectl set image deployment/${{SERVICE_NAME}} ${{SERVICE_NAME}}=${{DOCKER_IMAGE}}:${{BUILD_NUMBER}}"
            }}
        }}
    }}

    post {{
        always {{ cleanWs() }}
    }}
}}
""",
    )
