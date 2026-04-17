import { BaseTemplate, GeneratedFile, ServiceConfig } from "./base";

export class DotnetAPITemplate extends BaseTemplate {
  get templateName(): string {
    return "dotnet-api";
  }

  get language(): string {
    return "csharp";
  }

  get framework(): string {
    return "aspnet-core";
  }

  generateFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const svc = this.getServiceName();
    const svcPascal = svc.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

    // .csproj
    this.addFile(files, `${svcPascal}.csproj`, `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
`);

    // Program.cs
    this.addFile(files, "Program.cs", `using ${svcPascal}.Models;
using ${svcPascal}.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<ItemService>();
builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
`);

    // Models/Item.cs
    this.addFile(files, "Models/Item.cs", `using System.ComponentModel.DataAnnotations;

namespace ${svcPascal}.Models;

public class Item
{
    public long Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class CreateItemRequest
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
`);

    // Services/ItemService.cs
    this.addFile(files, "Services/ItemService.cs", `using ${svcPascal}.Models;

namespace ${svcPascal}.Services;

public class ItemService
{
    private readonly List<Item> _items = new();
    private long _counter = 0;

    public List<Item> GetAll() => _items.ToList();

    public Item? GetById(long id) => _items.FirstOrDefault(i => i.Id == id);

    public Item Create(CreateItemRequest request)
    {
        var item = new Item
        {
            Id = Interlocked.Increment(ref _counter),
            Name = request.Name,
            Description = request.Description
        };
        _items.Add(item);
        return item;
    }

    public bool Delete(long id) => _items.RemoveAll(i => i.Id == id) > 0;
}
`);

    // Controllers/ItemsController.cs
    this.addFile(files, "Controllers/ItemsController.cs", `using Microsoft.AspNetCore.Mvc;
using ${svcPascal}.Models;
using ${svcPascal}.Services;

namespace ${svcPascal}.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ItemService _service;

    public ItemsController(ItemService service) => _service = service;

    [HttpGet]
    public ActionResult<List<Item>> GetAll() => Ok(_service.GetAll());

    [HttpGet("{id}")]
    public ActionResult<Item> GetById(long id)
    {
        var item = _service.GetById(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public ActionResult<Item> Create([FromBody] CreateItemRequest request)
    {
        var item = _service.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(long id)
    {
        return _service.Delete(id) ? NoContent() : NotFound();
    }
}
`);

    // appsettings.json
    this.addFile(files, "appsettings.json", `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Urls": "http://0.0.0.0:${this.config.port}"
}
`);

    // Properties/launchSettings.json
    this.addFile(files, "Properties/launchSettings.json", `{
  "profiles": {
    "${svc}": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:${this.config.port}",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
`);

    this.addFile(files, ".gitignore", `bin/
obj/
*.user
*.suo
.vs/
.env
*.log
`);

    // Docker
    if (this.config.docker) {
      this.addFile(files, "Dockerfile", `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE ${this.config.port}
ENTRYPOINT ["dotnet", "${svcPascal}.dll"]
`);

      this.addFile(files, ".dockerignore", `bin/
obj/
.vs/
.git
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
            path: /health
            port: ${this.config.port}
          initialDelaySeconds: 10
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

A production-ready ASP.NET Core API generated by IDP CLI.

## Features

- .NET 8 with ASP.NET Core
- RESTful API with validation
- Swagger/OpenAPI documentation
- Health checks
- Docker multi-stage build
- Kubernetes manifests

## Getting Started

\`\`\`bash
dotnet restore
dotnet run
\`\`\`

API: http://localhost:${this.config.port}
Swagger: http://localhost:${this.config.port}/swagger

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
