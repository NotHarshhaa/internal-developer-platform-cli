import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class JavaSpringTemplate extends BaseTemplate {
  get templateName(): string {
    return "java-spring";
  }

  get language(): string {
    return "java";
  }

  get framework(): string {
    return "spring-boot";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcPascal = svc.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
    const pkg = svc.replace(/-/g, ".");

    // pom.xml
    this.addFile(files, "pom.xml", `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
    </parent>
    <groupId>com.idp</groupId>
    <artifactId>${svc}</artifactId>
    <version>0.1.0</version>
    <name>${svc}</name>
    <description>Auto-generated Spring Boot service by IDP CLI</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`);

    // Main Application
    this.addFile(files, `src/main/java/com/idp/${svcPascal}Application.java`, `package com.idp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${svcPascal}Application {
    public static void main(String[] args) {
        SpringApplication.run(${svcPascal}Application.class, args);
    }
}
`);

    // Controller
    this.addFile(files, `src/main/java/com/idp/controller/ItemController.java`, `package com.idp.controller;

import com.idp.model.Item;
import com.idp.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<Item> listItems() {
        return itemService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item createItem(@Valid @RequestBody Item item) {
        return itemService.create(item);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        return itemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        itemService.delete(id);
    }
}
`);

    // Model
    this.addFile(files, `src/main/java/com/idp/model/Item.java`, `package com.idp.model;

import jakarta.validation.constraints.NotBlank;

public class Item {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    public Item() {}

    public Item(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
`);

    // Service
    this.addFile(files, `src/main/java/com/idp/service/ItemService.java`, `package com.idp.service;

import com.idp.model.Item;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ItemService {

    private final List<Item> items = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong counter = new AtomicLong(0);

    public List<Item> findAll() {
        return new ArrayList<>(items);
    }

    public Optional<Item> findById(Long id) {
        return items.stream().filter(i -> i.getId().equals(id)).findFirst();
    }

    public Item create(Item item) {
        item.setId(counter.incrementAndGet());
        items.add(item);
        return item;
    }

    public void delete(Long id) {
        items.removeIf(i -> i.getId().equals(id));
    }
}
`);

    // application.yml
    this.addFile(files, "src/main/resources/application.yml", `spring:
  application:
    name: ${svc}

server:
  port: ${this.config.port}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
`);

    // Test
    this.addFile(files, `src/test/java/com/idp/${svcPascal}ApplicationTests.java`, `package com.idp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ${svcPascal}ApplicationTests {
    @Test
    void contextLoads() {
    }
}
`);

    this.addFile(files, ".gitignore", `target/
*.class
*.jar
*.war
.idea/
*.iml
.settings/
.project
.classpath
.env
*.log
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE ${this.config.port}
ENTRYPOINT ["java", "-jar", "app.jar"]
`);

      this.addFile(files, ".dockerignore", `target/
.idea/
*.iml
.git
.gitignore
README.md
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
            path: /actuator/health
            port: ${this.config.port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: ${this.config.port}
          initialDelaySeconds: 15
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

A production-ready Spring Boot service generated by IDP CLI.

## Features

- Spring Boot 3.2 with Java 17
- RESTful API with validation
- Spring Actuator for health checks and metrics
- Multi-stage Docker build
- Kubernetes manifests

## Getting Started

\`\`\`bash
# Build
mvn clean package

# Run
mvn spring-boot:run
\`\`\`

API available at http://localhost:${this.config.port}

## Docker

\`\`\`bash
docker build -t ${svc} .
docker run -p ${this.config.port}:${this.config.port} ${svc}
\`\`\`

## Endpoints

- Health: http://localhost:${this.config.port}/actuator/health
- API: http://localhost:${this.config.port}/api/v1/items
`);
    }

    return files;
  }
}
