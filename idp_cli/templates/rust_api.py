"""Rust API template using Axum framework."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import create_directory, write_file


class RustAPITemplate(BaseTemplate):
    """Template for Rust API services using Axum framework."""

    @property
    def template_name(self) -> str:
        return "rust-api"

    @property
    def language(self) -> str:
        return "rust"

    @property
    def framework(self) -> str:
        return "axum"

    def generate_app_code(self) -> None:
        """Generate Rust application code."""
        # Create directories
        create_directory(self.service_dir / "src")
        create_directory(self.service_dir / "src" / "handlers")
        create_directory(self.service_dir / "src" / "models")
        create_directory(self.service_dir / "src" / "config")
        create_directory(self.service_dir / "tests")

        # Generate Cargo.toml
        cargo_toml = '''[package]
name = "{{.service_name_underscore}}"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
description = "A Rust API service built with Axum"
license = "MIT"

[dependencies]
# Web framework
axum = "0.7"
tokio = { version = "1.0", features = ["full"] }
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Error handling
anyhow = "1.0"
thiserror = "1.0"

# Tracing and logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Configuration
config = "0.14"
dotenv = "0.15"

# Utilities
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }

[dev-dependencies]
reqwest = { version = "0.11", features = ["json"] }
'''
        write_file(self.service_dir / "Cargo.toml", cargo_toml, self.get_template_vars())

        # Generate main.rs
        main_rs = '''use axum::{
    routing::{get, post, put, delete},
    extract::Path,
    http::StatusCode,
    response::IntoResponse,
    Json, Router,
};
use serde_json::json;
use std::net::SocketAddr;
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::{info, Level};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod handlers;
mod models;

use config::Config;
use handlers::{health, users};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load configuration
    dotenv::dotenv().ok();
    let config = Config::from_env()?;

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "{{.service_name_underscore}}".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Build our application with a route
    let app = Router::new()
        // Health check endpoint
        .route("/health", get(health))
        // API routes
        .route("/api/hello", get(handlers::hello))
        .route("/api/users", get(users::get_users).post(users::create_user))
        .route("/api/users/:id", get(users::get_user).put(users::update_user).delete(users::delete_user))
        // Layer middleware
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(
                    CorsLayer::new()
                        .allow_origin(Any)
                        .allow_methods(Any)
                        .allow_headers(Any),
                ),
        );

    // Run the server
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    info!("🚀 {{.service_name}} server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

pub async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "healthy",
        "service": "{{.service_name}}",
        "version": "0.1.0",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}
'''
        write_file(self.service_dir / "src" / "main.rs", main_rs, self.get_template_vars())

        # Generate config module
        config_rs = '''use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub log_level: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            port: 8080,
            database_url: "postgres://localhost/{{.service_name_underscore}}".to_string(),
            log_level: "info".to_string(),
        }
    }
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let mut config = Config::default();

        // Load from environment variables
        if let Ok(port) = std::env::var("PORT") {
            config.port = port.parse()?;
        }

        if let Ok(database_url) = std::env::var("DATABASE_URL") {
            config.database_url = database_url;
        }

        if let Ok(log_level) = std::env::var("LOG_LEVEL") {
            config.log_level = log_level;
        }

        Ok(config)
    }
}
'''
        write_file(self.service_dir / "src" / "config" / "mod.rs", config_rs, self.get_template_vars())

        # Generate models
        models_rs = '''use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

impl ErrorResponse {
    pub fn new(error: &str, message: &str) -> Self {
        Self {
            error: error.to_string(),
            message: message.to_string(),
        }
    }
}
'''
        write_file(self.service_dir / "src" / "models" / "mod.rs", models_rs, self.get_template_vars())

        # Generate handlers
        handlers_mod_rs = '''pub mod health;
pub mod hello;
pub mod users;

pub use health::health;
pub use hello::hello;
pub use users::*;
'''
        write_file(self.service_dir / "src" / "handlers" / "mod.rs", handlers_mod_rs)

        health_rs = '''use axum::{response::IntoResponse, Json};
use serde_json::json;

pub async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "healthy",
        "service": "{{.service_name}}",
        "version": "0.1.0",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}
'''
        write_file(self.service_dir / "src" / "handlers" / "health.rs", health_rs, self.get_template_vars())

        hello_rs = '''use axum::{extract::Query, response::IntoResponse, Json};
use serde::Deserialize;
use serde_json::json;

#[derive(Debug, Deserialize)]
pub struct HelloQuery {
    pub name: Option<String>,
}

pub async fn hello(Query(query): Query<HelloQuery>) -> impl IntoResponse {
    let name = query.name.unwrap_or_else(|| "World".to_string());
    
    Json(json!({
        "message": format!("Hello, {}!", name),
        "service": "{{.service_name}}",
        "version": "0.1.0"
    }))
}
'''
        write_file(self.service_dir / "src" / "handlers" / "hello.rs", hello_rs, self.get_template_vars())

        users_rs = '''use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::models::{User, CreateUserRequest, UpdateUserRequest, UserResponse, ErrorResponse};

type InMemoryDb = Arc<RwLock<Vec<User>>>;

#[derive(Clone)]
pub struct AppState {
    pub db: InMemoryDb,
}

impl AppState {
    pub fn new() -> Self {
        let db = Arc::new(RwLock::new(Vec::new()));
        
        // Add some sample data
        let sample_users = vec![
            User {
                id: Uuid::new_v4(),
                name: "John Doe".to_string(),
                email: "john@example.com".to_string(),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            },
            User {
                id: Uuid::new_v4(),
                name: "Jane Smith".to_string(),
                email: "jane@example.com".to_string(),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            },
        ];
        
        if let Ok(mut db_guard) = db.try_write() {
            *db_guard = sample_users;
        }
        
        Self { db }
    }
}

pub async fn get_users(State(state): State<AppState>) -> impl IntoResponse {
    let users = state.db.read().await;
    let user_responses: Vec<UserResponse> = users.iter().cloned().map(UserResponse::from).collect();
    
    Json(json!({
        "users": user_responses,
        "count": user_responses.len()
    }))
}

pub async fn get_user(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> impl IntoResponse {
    let users = state.db.read().await;
    
    if let Some(user) = users.iter().find(|u| u.id == user_id) {
        Json(UserResponse::from(user.clone()))
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("NOT_FOUND", "User not found")),
        )
            .into_response()
    }
}

pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> impl IntoResponse {
    let new_user = User {
        id: Uuid::new_v4(),
        name: payload.name,
        email: payload.email,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };
    
    let mut users = state.db.write().await;
    users.push(new_user.clone());
    
    (StatusCode::CREATED, Json(UserResponse::from(new_user)))
}

pub async fn update_user(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Json(payload): Json<UpdateUserRequest>,
) -> impl IntoResponse {
    let mut users = state.db.write().await;
    
    if let Some(user) = users.iter_mut().find(|u| u.id == user_id) {
        if let Some(name) = payload.name {
            user.name = name;
        }
        if let Some(email) = payload.email {
            user.email = email;
        }
        user.updated_at = chrono::Utc::now();
        
        Json(UserResponse::from(user.clone()))
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("NOT_FOUND", "User not found")),
        )
            .into_response()
    }
}

pub async fn delete_user(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> impl IntoResponse {
    let mut users = state.db.write().await;
    
    if let Some(pos) = users.iter().position(|u| u.id == user_id) {
        users.remove(pos);
        Json(json!({
            "message": "User deleted successfully"
        }))
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("NOT_FOUND", "User not found")),
        )
            .into_response()
    }
}
'''
        write_file(self.service_dir / "src" / "handlers" / "users.rs", users_rs, self.get_template_vars())

    def generate_config_files(self) -> None:
        """Generate configuration files."""
        # .env.example
        env_example = '''# Server Configuration
PORT=8080
HOST=0.0.0.0

# Database
DATABASE_URL=postgres://localhost/{{.service_name_underscore}}

# Logging
LOG_LEVEL=info

# Application
RUST_LOG={{.service_name_underscore}}=info
'''
        write_file(self.service_dir / ".env.example", env_example, self.get_template_vars())

        # .gitignore
        gitignore = '''# Rust
/target/
**/*.rs.bk
Cargo.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
logs/

# Test output
/target/criterion/
'''
        write_file(self.service_dir / ".gitignore", gitignore)

        # README
        readme_md = '''# {{.service_name}}

A high-performance REST API built with Rust and Axum framework.

## Features

- ⚡ High performance with Rust and Axum
- 🔒 Type-safe with Rust's type system
- 🏗️ Modular architecture with handlers, models, and config
- 📊 RESTful API with full CRUD operations
- 🛡️ Error handling with proper HTTP status codes
- 📝 Structured logging with tracing
- 🔧 Environment-based configuration
- 🧪 Comprehensive test suite
- 🌐 CORS support for web applications

## Quick Start

### Prerequisites

- Rust 1.70+ (install from [rustup.rs](https://rustup.rs/))
- PostgreSQL (optional, for database integration)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd {{.service_name}}

# Copy environment variables
cp .env.example .env

# Run the application
cargo run
```

The server will start on `http://localhost:8080`

## Development

### Running in Development Mode

```bash
# Enable debug logging
RUST_LOG=debug cargo run

# Run with hot reload (requires cargo-watch)
cargo install cargo-watch
cargo watch -x run
```

### Running Tests

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_name
```

### Building

```bash
# Build for development
cargo build

# Build for production
cargo build --release

# Run production build
./target/release/{{.service_name_underscore}}
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Hello
- `GET /api/hello?name=World` - Simple greeting endpoint

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Example API Usage

```bash
# Get all users
curl http://localhost:8080/api/users

# Create a user
curl -X POST http://localhost:8080/api/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Get a specific user
curl http://localhost:8080/api/users/<user-id>

# Update a user
curl -X PUT http://localhost:8080/api/users/<user-id> \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice Smith"}'

# Delete a user
curl -X DELETE http://localhost:8080/api/users/<user-id>
```

## Configuration

The application can be configured using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `DATABASE_URL` | postgres://localhost/{{.service_name_underscore}} | Database connection string |
| `LOG_LEVEL` | info | Logging level |
| `RUST_LOG` | {{.service_name_underscore}}=info | Rust logging filter |

## Project Structure

```
src/
├── main.rs              # Application entry point
├── config/              # Configuration management
│   └── mod.rs
├── handlers/            # HTTP handlers
│   ├── mod.rs
│   ├── health.rs
│   ├── hello.rs
│   └── users.rs
├── models/              # Data models
│   └── mod.rs
└── lib.rs               # Library root (if you want to make it a library)
```

## Dependencies

- **axum** - Web framework
- **tokio** - Async runtime
- **serde** - Serialization/deserialization
- **tracing** - Structured logging
- **uuid** - UUID generation
- **chrono** - Date/time handling
- **tower-http** - HTTP middleware (CORS, tracing)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
'''
        write_file(self.service_dir / "README.md", readme_md, self.get_template_vars())

    def generate_tests(self) -> None:
        """Generate test files."""
        # Integration tests
        integration_tests_rs = '''use reqwest;
use serde_json::json;
use uuid::Uuid;

#[tokio::test]
async fn test_health_endpoint() {
    let client = reqwest::Client::new();
    let response = client
        .get("http://localhost:8080/health")
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), 200);

    let body: serde_json::Value = response.json().await.expect("Failed to parse JSON");
    assert_eq!(body["status"], "healthy");
    assert_eq!(body["service"], "{{.service_name}}");
}

#[tokio::test]
async fn test_hello_endpoint() {
    let client = reqwest::Client::new();
    let response = client
        .get("http://localhost:8080/api/hello?name=Rust")
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(response.status(), 200);

    let body: serde_json::Value = response.json().await.expect("Failed to parse JSON");
    assert_eq!(body["message"], "Hello, Rust!");
}

#[tokio::test]
async fn test_users_crud() {
    let client = reqwest::Client::new();
    
    // Create a user
    let create_payload = json!({
        "name": "Test User",
        "email": "test@example.com"
    });
    
    let create_response = client
        .post("http://localhost:8080/api/users")
        .json(&create_payload)
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(create_response.status(), 201);
    
    let created_user: serde_json::Value = create_response.json().await.expect("Failed to parse JSON");
    let user_id = created_user["id"].as_str().expect("User ID not found");
    
    // Get all users
    let users_response = client
        .get("http://localhost:8080/api/users")
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(users_response.status(), 200);
    
    let users_body: serde_json::Value = users_response.json().await.expect("Failed to parse JSON");
    assert!(users_body["count"].as_u64().expect("Count not found") >= 1);
    
    // Get specific user
    let get_response = client
        .get(&format!("http://localhost:8080/api/users/{}", user_id))
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(get_response.status(), 200);
    
    let get_user: serde_json::Value = get_response.json().await.expect("Failed to parse JSON");
    assert_eq!(get_user["name"], "Test User");
    assert_eq!(get_user["email"], "test@example.com");
    
    // Update user
    let update_payload = json!({
        "name": "Updated User"
    });
    
    let update_response = client
        .put(&format!("http://localhost:8080/api/users/{}", user_id))
        .json(&update_payload)
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(update_response.status(), 200);
    
    let updated_user: serde_json::Value = update_response.json().await.expect("Failed to parse JSON");
    assert_eq!(updated_user["name"], "Updated User");
    
    // Delete user
    let delete_response = client
        .delete(&format!("http://localhost:8080/api/users/{}", user_id))
        .send()
        .await
        .expect("Failed to execute request");

    assert_eq!(delete_response.status(), 200);
}
'''
        write_file(self.service_dir / "tests" / "integration_tests.rs", integration_tests_rs, self.get_template_vars())

        # Unit tests for handlers
        handlers_tests_rs = '''use axum::{
    body::Body,
    http::{Request, StatusCode},
    response::IntoResponse,
};
use serde_json::json;
use tower::ServiceExt;

use {{.service_name_underscore}}::{handlers, AppState};

#[tokio::test]
async fn test_hello_handler() {
    let state = AppState::new();
    let app = axum::Router::new()
        .route("/api/hello", axum::routing::get(handlers::hello))
        .with_state(state);

    let request = Request::builder()
        .uri("/api/hello?name=Test")
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let body: serde_json::Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["message"], "Hello, Test!");
}

#[tokio::test]
async fn test_health_handler() {
    let state = AppState::new();
    let app = axum::Router::new()
        .route("/health", axum::routing::get(handlers::health))
        .with_state(state);

    let request = Request::builder()
        .uri("/health")
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let body: serde_json::Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["status"], "healthy");
    assert_eq!(body["service"], "{{.service_name}}");
}
'''
        write_file(self.service_dir / "tests" / "handlers_tests.rs", handlers_tests_rs, self.get_template_vars())

        # Test configuration
        config_tests_rs = '''use {{.service_name_underscore}}::config::Config;

#[test]
fn test_default_config() {
    let config = Config::default();
    assert_eq!(config.port, 8080);
    assert_eq!(config.database_url, "postgres://localhost/{{.service_name_underscore}}");
    assert_eq!(config.log_level, "info");
}

#[test]
fn test_config_from_env() {
    // Set environment variables
    std::env::set_var("PORT", "3000");
    std::env::set_var("DATABASE_URL", "postgres://localhost/test");
    std::env::set_var("LOG_LEVEL", "debug");

    let config = Config::from_env().unwrap();
    assert_eq!(config.port, 3000);
    assert_eq!(config.database_url, "postgres://localhost/test");
    assert_eq!(config.log_level, "debug");

    // Clean up
    std::env::remove_var("PORT");
    std::env::remove_var("DATABASE_URL");
    std::env::remove_var("LOG_LEVEL");
}
'''
        write_file(self.service_dir / "tests" / "config_tests.rs", config_tests_rs, self.get_template_vars())
