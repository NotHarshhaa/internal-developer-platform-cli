"""Go API template using Gin framework."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import create_directory, write_file, render_template


class GoAPITemplate(BaseTemplate):
    """Template for Go API services using Gin framework."""

    @property
    def template_name(self) -> str:
        return "go-api"

    @property
    def language(self) -> str:
        return "go"

    @property
    def framework(self) -> str:
        return "gin"

    def generate_app_code(self) -> None:
        """Generate Go application code."""
        # Create directories
        create_directory(self.service_dir / "cmd" / "api")
        create_directory(self.service_dir / "internal" / "handlers")
        create_directory(self.service_dir / "internal" / "models")
        create_directory(self.service_dir / "internal" / "middleware")
        create_directory(self.service_dir / "pkg" / "config")
        create_directory(self.service_dir / "docs")

        # Generate main.go
        main_go = '''package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "{{{{service_name_underscore}}}}/internal/handlers"
    "{{{{service_name_underscore}}}}/internal/middleware"
    "{{{{service_name_underscore}}}}/pkg/config"

    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
    // Load configuration
    cfg := config.Load()

    // Set Gin mode
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    // Create router
    r := gin.New()

    // Middleware
    r.Use(middleware.Logger())
    r.Use(middleware.Recovery())
    r.Use(middleware.CORS())

    // Health check endpoint
    r.GET("/health", handlers.HealthCheck)

    // Metrics endpoint
    r.GET("/metrics", gin.WrapH(promhttp.Handler()))

    // API routes
    v1 := r.Group("/api/v1")
    {
        v1.GET("/hello", handlers.Hello)
        v1.GET("/users", handlers.GetUsers)
        v1.POST("/users", handlers.CreateUser)
        v1.GET("/users/:id", handlers.GetUser)
        v1.PUT("/users/:id", handlers.UpdateUser)
        v1.DELETE("/users/:id", handlers.DeleteUser)
    }

    // Create server
    srv := &http.Server{
        Addr:         ":" + cfg.Port,
        Handler:      r,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Start server in a goroutine
    go func() {
        log.Printf("Server starting on port %s", cfg.Port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Failed to start server: %v", err)
        }
    }()

    // Wait for interrupt signal to gracefully shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    // Shutdown server with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exited")
}
'''
        rendered_content = render_template(main_go, self.get_template_vars())
        write_file(self.service_dir / "cmd" / "api" / "main.go", rendered_content)

        # Generate config package
        config_go = '''package config

import (
    "os"
)

type Config struct {
    Environment string
    Port        string
    DatabaseURL string
    RedisURL    string
}

func Load() *Config {
    return &Config{
        Environment: getEnv("ENVIRONMENT", "development"),
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost/{{{{service_name_underscore}}}}?sslmode=disable"),
        RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
'''
        rendered_content = render_template(config_go, self.get_template_vars())
        write_file(self.service_dir / "pkg" / "config" / "config.go", rendered_content)

        # Generate handlers
        health_go = '''package handlers

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

type HealthResponse struct {
    Status    string    `json:"status"`
    Timestamp time.Time `json:"timestamp"`
    Version   string    `json:"version"`
}

func HealthCheck(c *gin.Context) {
    c.JSON(http.StatusOK, HealthResponse{
        Status:    "healthy",
        Timestamp: time.Now(),
        Version:   "1.0.0",
    })
}

func Hello(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "message": "Hello from {{{{service_name}}}}!",
        "version": "1.0.0",
    })
}
'''
        rendered_content = render_template(health_go, self.get_template_vars())
        write_file(self.service_dir / "internal" / "handlers" / "health.go", rendered_content)

        users_go = '''package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
)

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

var users = []User{
    {ID: 1, Name: "John Doe", Email: "john@example.com"},
    {ID: 2, Name: "Jane Smith", Email: "jane@example.com"},
}

func GetUsers(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "users": users,
        "count": len(users),
    })
}

func GetUser(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    for _, user := range users {
        if user.ID == id {
            c.JSON(http.StatusOK, user)
            return
        }
    }

    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

type CreateUserRequest struct {
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
}

func CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user := User{
        ID:    len(users) + 1,
        Name:  req.Name,
        Email: req.Email,
    }

    users = append(users, user)

    c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    for i, user := range users {
        if user.ID == id {
            users[i].Name = req.Name
            users[i].Email = req.Email
            c.JSON(http.StatusOK, users[i])
            return
        }
    }

    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

func DeleteUser(c *gin.Context) {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    for i, user := range users {
        if user.ID == id {
            users = append(users[:i], users[i+1:]...)
            c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
            return
        }
    }

    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}
'''
        rendered_content = render_template(users_go, self.get_template_vars())
        write_file(self.service_dir / "internal" / "handlers" / "users.go", rendered_content)

        # Generate middleware
        middleware_go = '''package middleware

import (
    "log"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
            param.ClientIP,
            param.TimeStamp.Format(time.RFC1123),
            param.Method,
            param.Path,
            param.Request.Proto,
            param.StatusCode,
            param.Latency,
            param.Request.UserAgent(),
            param.ErrorMessage,
        )
    })
}

func Recovery() gin.HandlerFunc {
    return gin.Recovery()
}

func CORS() gin.HandlerFunc {
    config := cors.DefaultConfig()
    config.AllowAllOrigins = true
    config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
    config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
    return cors.New(config)
}
'''
        rendered_content = render_template(middleware_go, self.get_template_vars())
        write_file(self.service_dir / "internal" / "middleware" / "middleware.go", rendered_content)

        # Generate models
        models_go = '''package models

import "time"

type User struct {
    ID        int       `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"not null"`
    Email     string    `json:"email" gorm:"uniqueIndex;not null"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Health struct {
    Status    string    `json:"status"`
    Timestamp time.Time `json:"timestamp"`
    Version   string    `json:"version"`
}
'''
        rendered_content = render_template(models_go, self.get_template_vars())
        write_file(self.service_dir / "internal" / "models" / "models.go", rendered_content)

    def generate_config_files(self) -> None:
        """Generate Go configuration files."""
        # go.mod
        go_mod = f'''module {self.service_name}

go 1.21

require (
    github.com/gin-contrib/cors v1.4.0
    github.com/gin-gonic/gin v1.9.1
    github.com/prometheus/client_golang v1.17.0
    gorm.io/driver/postgres v1.5.2
    gorm.io/gorm v1.25.4
)
'''
        write_file(self.service_dir / "go.mod", go_mod)

        # go.sum placeholder
        write_file(self.service_dir / "go.sum", "# This file is generated by 'go mod tidy'")

        # .env.example
        env_example = '''# Environment Configuration
ENVIRONMENT=development
PORT=8080
DATABASE_URL=postgres://localhost/{{{{service_name_underscore}}}}?sslmode=disable
REDIS_URL=redis://localhost:6379
'''
        rendered_content = render_template(env_example, self.get_template_vars())
        write_file(self.service_dir / ".env.example", rendered_content)

    def generate_tests(self) -> None:
        """Generate test files."""
        create_directory(self.service_dir / "tests")

        # Main test file
        main_test = '''package main

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "{{.service_name_underscore}}/internal/handlers"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestHealthCheck(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.GET("/health", handlers.HealthCheck)

    req, _ := http.NewRequest("GET", "/health", nil)
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
}

func TestHello(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.GET("/hello", handlers.Hello)

    req, _ := http.NewRequest("GET", "/hello", nil)
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
}
'''
        rendered_content = render_template(main_test, self.get_template_vars())
        write_file(self.service_dir / "cmd" / "api" / "main_test.go", rendered_content)

        # Handler tests
        handlers_test = '''package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestGetUsers(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.GET("/users", GetUsers)

    req, _ := http.NewRequest("GET", "/users", nil)
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
}

func TestCreateUser(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.Default()
    r.POST("/users", CreateUser)

    user := map[string]string{
        "name":  "Test User",
        "email": "test@example.com",
    }

    jsonData, _ := json.Marshal(user)
    req, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusCreated, w.Code)
}
'''
        rendered_content = render_template(handlers_test, self.get_template_vars())
        write_file(self.service_dir / "internal" / "handlers" / "handlers_test.go", rendered_content)
