import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class RustAPITemplate extends BaseTemplate {
  get templateName(): string {
    return "rust-api";
  }

  get language(): string {
    return "rust";
  }

  get framework(): string {
    return "axum";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcUnder = this.getServiceNameUnderscore();

    // Cargo.toml
    this.addFile(files, "Cargo.toml", `[package]
name = "${svc}"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
uuid = { version = "1", features = ["v4"] }
`);

    // src/main.rs
    this.addFile(files, "src/main.rs", `use axum::{
    routing::{get, post, delete},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod handlers;
mod models;
mod state;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let app_state = state::AppState::new();

    let app = Router::new()
        .route("/health", get(handlers::health::health_check))
        .route("/ready", get(handlers::health::readiness_check))
        .route("/api/v1/items", get(handlers::items::list_items))
        .route("/api/v1/items", post(handlers::items::create_item))
        .route("/api/v1/items/:id", get(handlers::items::get_item))
        .route("/api/v1/items/:id", delete(handlers::items::delete_item))
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], ${this.config.port}));
    tracing::info!("Starting ${svc} on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to install CTRL+C signal handler");
    tracing::info!("Shutting down...");
}
`);

    // src/state.rs
    this.addFile(files, "src/state.rs", `use crate::models::Item;
use std::sync::{Arc, RwLock};
use std::sync::atomic::{AtomicU64, Ordering};

#[derive(Clone)]
pub struct AppState {
    pub items: Arc<RwLock<Vec<Item>>>,
    pub counter: Arc<AtomicU64>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            items: Arc::new(RwLock::new(Vec::new())),
            counter: Arc::new(AtomicU64::new(0)),
        }
    }

    pub fn next_id(&self) -> u64 {
        self.counter.fetch_add(1, Ordering::SeqCst) + 1
    }
}
`);

    // src/models.rs
    this.addFile(files, "src/models.rs", `use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: u64,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateItem {
    pub name: String,
    pub description: Option<String>,
}
`);

    // src/handlers/mod.rs
    this.addFile(files, "src/handlers/mod.rs", `pub mod health;
pub mod items;
`);

    // src/handlers/health.rs
    this.addFile(files, "src/handlers/health.rs", `use axum::Json;
use serde_json::{json, Value};

pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "service": "${svc}"
    }))
}

pub async fn readiness_check() -> Json<Value> {
    Json(json!({
        "status": "ready"
    }))
}
`);

    // src/handlers/items.rs
    this.addFile(files, "src/handlers/items.rs", `use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use crate::models::{Item, CreateItem};
use crate::state::AppState;

pub async fn list_items(State(state): State<AppState>) -> Json<Vec<Item>> {
    let items = state.items.read().unwrap();
    Json(items.clone())
}

pub async fn create_item(
    State(state): State<AppState>,
    Json(input): Json<CreateItem>,
) -> (StatusCode, Json<Item>) {
    let item = Item {
        id: state.next_id(),
        name: input.name,
        description: input.description,
    };
    state.items.write().unwrap().push(item.clone());
    (StatusCode::CREATED, Json(item))
}

pub async fn get_item(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> Result<Json<Item>, StatusCode> {
    let items = state.items.read().unwrap();
    items.iter()
        .find(|i| i.id == id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

pub async fn delete_item(
    State(state): State<AppState>,
    Path(id): Path<u64>,
) -> StatusCode {
    let mut items = state.items.write().unwrap();
    if let Some(pos) = items.iter().position(|i| i.id == id) {
        items.remove(pos);
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}
`);

    this.addFile(files, ".env.example", `RUST_LOG=info
PORT=${this.config.port}
`);

    this.addFile(files, ".gitignore", `target/
.env
*.log
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM rust:1.75-alpine AS build
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main(){}" > src/main.rs && cargo build --release && rm -rf src
COPY src ./src
RUN cargo build --release

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=build /app/target/release/${svc} .
EXPOSE ${this.config.port}
CMD ["./${svc}"]
`);

      this.addFile(files, ".dockerignore", `target/
.git
README.md
.env
`);
    }

    // Kubernetes
    if (this.config.k8s) {
      this.addFile(files, "k8s/base/deployment.yaml", `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${svc}
  labels:
    app: ${svc}
spec:
  replicas: ${this.config.replicas}
  selector:
    matchLabels:
      app: ${svc}
  template:
    metadata:
      labels:
        app: ${svc}
    spec:
      containers:
      - name: ${svc}
        image: ${svc}:latest
        ports:
        - containerPort: ${this.config.port}
        resources:
          requests:
            cpu: ${this.config.resources.cpuRequest}
            memory: ${this.config.resources.memoryRequest}
          limits:
            cpu: ${this.config.resources.cpuLimit}
            memory: ${this.config.resources.memoryLimit}
        livenessProbe:
          httpGet:
            path: /health
            port: ${this.config.port}
          initialDelaySeconds: 3
          periodSeconds: 10
`);

      this.addFile(files, "k8s/base/service.yaml", `apiVersion: v1
kind: Service
metadata:
  name: ${svc}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: ${this.config.port}
  selector:
    app: ${svc}
`);

      this.addFile(files, "k8s/base/kustomization.yaml", `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
commonLabels:
  app: ${svc}
`);
    }

    // README
    if (this.config.docs) {
      this.addFile(files, "README.md", `# ${svc}

A blazing-fast Rust API service using Axum, generated by IDP CLI.

## Features

- Axum web framework with async/await
- Type-safe routing and extractors
- Tower middleware (CORS, tracing)
- Graceful shutdown
- Zero-copy JSON serialization

## Getting Started

\`\`\`bash
cargo run
\`\`\`

API: http://localhost:${this.config.port}

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /ready | Readiness probe |
| GET | /api/v1/items | List items |
| POST | /api/v1/items | Create item |
| GET | /api/v1/items/:id | Get item |
| DELETE | /api/v1/items/:id | Delete item |

## Docker

\`\`\`bash
docker build -t ${svc} .
docker run -p ${this.config.port}:${this.config.port} ${svc}
\`\`\`

## Testing

\`\`\`bash
cargo test
\`\`\`
`);
    }

    return files;
  }
}
