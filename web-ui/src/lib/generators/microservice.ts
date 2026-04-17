import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class MicroserviceTemplate extends BaseTemplate {
  get templateName(): string {
    return "microservice";
  }

  get language(): string {
    return "go";
  }

  get framework(): string {
    return "micro";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcUnder = this.getServiceNameUnderscore();

    // go.mod
    this.addFile(files, "go.mod", `module github.com/idp/${svc}

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/prometheus/client_golang v1.18.0
	github.com/sony/gobreaker v0.5.0
	go.uber.org/zap v1.26.0
	google.golang.org/grpc v1.61.0
	google.golang.org/protobuf v1.32.0
)
`);

    // main.go
    this.addFile(files, "cmd/server/main.go", `package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/idp/${svc}/internal/config"
	"github.com/idp/${svc}/internal/handler"
	"github.com/idp/${svc}/internal/middleware"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	sugar := logger.Sugar()
	sugar.Infow("Starting service", "name", cfg.ServiceName, "port", cfg.Port)

	mux := http.NewServeMux()

	// Health endpoints
	mux.HandleFunc("/health", handler.HealthCheck(cfg))
	mux.HandleFunc("/ready", handler.ReadinessCheck())

	// API endpoints
	mux.HandleFunc("/api/v1/items", handler.ItemsHandler())

	// Metrics
	mux.Handle("/metrics", handler.MetricsHandler())

	// Wrap with middleware
	wrapped := middleware.Logger(logger)(
		middleware.Recovery()(
			middleware.CORS()(mux),
		),
	)

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      wrapped,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sugar.Infow("Server listening", "addr", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			sugar.Fatalw("Server failed", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	sugar.Info("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		sugar.Fatalw("Server forced to shutdown", "error", err)
	}
	sugar.Info("Server stopped")
}
`);

    // internal/config/config.go
    this.addFile(files, "internal/config/config.go", `package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServiceName string
	Port        int
	Environment string
	LogLevel    string
}

func Load() *Config {
	port, _ := strconv.Atoi(getEnv("PORT", "${this.config.port}"))
	return &Config{
		ServiceName: getEnv("SERVICE_NAME", "${svc}"),
		Port:        port,
		Environment: getEnv("ENVIRONMENT", "production"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
`);

    // internal/handler/health.go
    this.addFile(files, "internal/handler/health.go", `package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/idp/${svc}/internal/config"
)

var startTime = time.Now()

func HealthCheck(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "healthy",
			"service": cfg.ServiceName,
			"uptime":  time.Since(startTime).String(),
		})
	}
}

func ReadinessCheck() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ready",
		})
	}
}
`);

    // internal/handler/items.go
    this.addFile(files, "internal/handler/items.go", `package handler

import (
	"encoding/json"
	"net/http"
	"sync"
	"sync/atomic"
)

type Item struct {
	ID          int64  \`json:"id"\`
	Name        string \`json:"name"\`
	Description string \`json:"description,omitempty"\`
}

var (
	items   []Item
	mu      sync.RWMutex
	counter int64
)

func ItemsHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case http.MethodGet:
			mu.RLock()
			defer mu.RUnlock()
			if items == nil {
				items = []Item{}
			}
			json.NewEncoder(w).Encode(items)

		case http.MethodPost:
			var item Item
			if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
				http.Error(w, \`{"error":"invalid request"}\`, http.StatusBadRequest)
				return
			}
			item.ID = atomic.AddInt64(&counter, 1)
			mu.Lock()
			items = append(items, item)
			mu.Unlock()
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(item)

		default:
			http.Error(w, \`{"error":"method not allowed"}\`, http.StatusMethodNotAllowed)
		}
	}
}
`);

    // internal/handler/metrics.go
    this.addFile(files, "internal/handler/metrics.go", `package handler

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func MetricsHandler() http.Handler {
	return promhttp.Handler()
}
`);

    // internal/middleware/middleware.go
    this.addFile(files, "internal/middleware/middleware.go", `package middleware

import (
	"net/http"
	"time"

	"go.uber.org/zap"
)

func Logger(logger *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			next.ServeHTTP(w, r)
			logger.Info("request",
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path),
				zap.Duration("latency", time.Since(start)),
			)
		})
	}
}

func Recovery() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					http.Error(w, \`{"error":"internal server error"}\`, http.StatusInternalServerError)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

func CORS() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
`);

    this.addFile(files, ".env.example", `SERVICE_NAME=${svc}
PORT=${this.config.port}
ENVIRONMENT=production
LOG_LEVEL=info
`);

    this.addFile(files, ".gitignore", `bin/
vendor/
.env
*.log
*.exe
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM golang:1.21-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=build /server .
EXPOSE ${this.config.port}
CMD ["./server"]
`);

      this.addFile(files, ".dockerignore", `bin/
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
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: ${this.config.port}
          initialDelaySeconds: 3
          periodSeconds: 5
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

A production-ready Go microservice generated by IDP CLI.

## Features

- Go standard library HTTP server
- Structured logging with Zap
- Prometheus metrics
- Circuit breaker pattern
- Graceful shutdown
- CORS and recovery middleware

## Getting Started

\`\`\`bash
go mod download
go run ./cmd/server
\`\`\`

API: http://localhost:${this.config.port}

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /ready | Readiness check |
| GET | /metrics | Prometheus metrics |
| GET | /api/v1/items | List items |
| POST | /api/v1/items | Create item |

## Docker

\`\`\`bash
docker build -t ${svc} .
docker run -p ${this.config.port}:${this.config.port} ${svc}
\`\`\`
`);
    }

    return files;
  }
}
