import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class GoAPITemplate extends BaseTemplate {
  get templateName(): string {
    return "go-api";
  }

  get language(): string {
    return "go";
  }

  get framework(): string {
    return "gin";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();

    // go.mod
    this.addFile(files, "go.mod", `module github.com/idp/${svc}

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/prometheus/client_golang v1.18.0
	go.uber.org/zap v1.26.0
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

	"github.com/gin-gonic/gin"
	"github.com/idp/${svc}/internal/config"
	"github.com/idp/${svc}/internal/handler"
	"github.com/idp/${svc}/internal/middleware"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger(logger))
	r.Use(middleware.CORS())

	// Health endpoints
	r.GET("/health", handler.HealthCheck(cfg))
	r.GET("/ready", handler.ReadinessCheck())

	// API routes
	v1 := r.Group("/api/v1")
	{
		v1.GET("/items", handler.ListItems)
		v1.POST("/items", handler.CreateItem)
		v1.GET("/items/:id", handler.GetItem)
		v1.PUT("/items/:id", handler.UpdateItem)
		v1.DELETE("/items/:id", handler.DeleteItem)
	}

	// Metrics
	r.GET("/metrics", handler.MetricsHandler())

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		logger.Info("Server starting", zap.Int("port", cfg.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server failed", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}
	logger.Info("Server stopped")
}
`);

    // config
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
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}
`);

    // handler/health.go
    this.addFile(files, "internal/handler/health.go", `package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/idp/${svc}/internal/config"
)

var startTime = time.Now()

func HealthCheck(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": cfg.ServiceName,
			"uptime":  time.Since(startTime).String(),
		})
	}
}

func ReadinessCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready"})
	}
}
`);

    // handler/items.go
    this.addFile(files, "internal/handler/items.go", `package handler

import (
	"net/http"
	"strconv"
	"sync"
	"sync/atomic"

	"github.com/gin-gonic/gin"
)

type Item struct {
	ID          int64  \`json:"id"\`
	Name        string \`json:"name" binding:"required"\`
	Description string \`json:"description"\`
}

var (
	items   = make([]Item, 0)
	mu      sync.RWMutex
	counter int64
)

func ListItems(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()
	c.JSON(http.StatusOK, items)
}

func CreateItem(c *gin.Context) {
	var item Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.ID = atomic.AddInt64(&counter, 1)
	mu.Lock()
	items = append(items, item)
	mu.Unlock()
	c.JSON(http.StatusCreated, item)
}

func GetItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	mu.RLock()
	defer mu.RUnlock()
	for _, item := range items {
		if item.ID == id {
			c.JSON(http.StatusOK, item)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
}

func UpdateItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var input Item
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	mu.Lock()
	defer mu.Unlock()
	for i, item := range items {
		if item.ID == id {
			items[i].Name = input.Name
			items[i].Description = input.Description
			c.JSON(http.StatusOK, items[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
}

func DeleteItem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	mu.Lock()
	defer mu.Unlock()
	for i, item := range items {
		if item.ID == id {
			items = append(items[:i], items[i+1:]...)
			c.Status(http.StatusNoContent)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
}
`);

    // handler/metrics.go
    this.addFile(files, "internal/handler/metrics.go", `package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func MetricsHandler() gin.HandlerFunc {
	h := promhttp.Handler()
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
`);

    // middleware
    this.addFile(files, "internal/middleware/middleware.go", `package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Logger(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Info("request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", time.Since(start)),
		)
	}
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
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

A high-performance Go API service using Gin, generated by IDP CLI.

## Features

- Gin HTTP framework
- Structured logging with Zap
- Prometheus metrics
- CORS middleware
- Graceful shutdown
- CRUD REST API

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
| GET | /ready | Readiness probe |
| GET | /metrics | Prometheus metrics |
| GET | /api/v1/items | List items |
| POST | /api/v1/items | Create item |
| GET | /api/v1/items/:id | Get item |
| PUT | /api/v1/items/:id | Update item |
| DELETE | /api/v1/items/:id | Delete item |

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
