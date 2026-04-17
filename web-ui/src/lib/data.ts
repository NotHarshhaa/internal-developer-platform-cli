import {
  IconBrandPython,
  IconBrandJavascript,
  IconBrandGolang,
  IconBrandRust,
  IconDeviceDesktop,
  IconBrain,
  IconBrandReact,
  IconBrandNextjs,
  IconWorld,
  IconTerminal,
  IconSettings,
  IconBrandGithub,
  IconBrandGitlab,
  IconTools,
  IconContainer,
  IconGitMerge,
  IconGitPullRequest,
  IconX,
  IconBrandTypescript,
  IconClock,
  IconServer,
  IconCloud,
  IconDatabase,
  IconCoffee,
} from "@tabler/icons-react";

export type Template = {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  category: "backend" | "frontend" | "tools";
  icon: any; // Tabler icon component
  color: string;
  features: string[];
};

export type CIProvider = {
  id: string;
  name: string;
  description: string;
  icon: any; // Tabler icon component
};

export type DeployTarget = {
  id: string;
  name: string;
  description: string;
  icon: any; // Tabler icon component
};

export type GitOpsTool = {
  id: string;
  name: string;
  description: string;
  icon: any; // Tabler icon component
};

export const templates: Template[] = [
  {
    id: "python-api",
    name: "Python API",
    description: "Production-ready Python API service with FastAPI, async support, and auto-generated docs",
    language: "Python",
    framework: "FastAPI",
    category: "backend",
    icon: IconBrandPython,
    color: "from-yellow-500 to-green-500",
    features: ["REST API", "OpenAPI docs", "Async", "Pydantic models", "Health checks"],
  },
  {
    id: "node-api",
    name: "Node.js API",
    description: "Production-ready Node.js API service with Express, middleware, and structured routing",
    language: "JavaScript",
    framework: "Express",
    category: "backend",
    icon: IconBrandJavascript,
    color: "from-green-500 to-emerald-600",
    features: ["REST API", "Middleware", "Routing", "Error handling", "Validation"],
  },
  {
    id: "go-api",
    name: "Go API",
    description: "High-performance Go API service using Gin with graceful shutdown and middleware",
    language: "Go",
    framework: "Gin",
    category: "backend",
    icon: IconBrandGolang,
    color: "from-cyan-500 to-blue-600",
    features: ["REST API", "Middleware", "Graceful shutdown", "CORS", "Prometheus"],
  },
  {
    id: "rust-api",
    name: "Rust API",
    description: "Blazing-fast Rust API service using Axum with type-safe routing and async runtime",
    language: "Rust",
    framework: "Axum",
    category: "backend",
    icon: IconBrandRust,
    color: "from-orange-500 to-red-600",
    features: ["REST API", "Type-safe", "Async", "Tower middleware", "Tracing"],
  },
  {
    id: "python-graphql",
    name: "GraphQL API",
    description: "Python GraphQL API using Strawberry with FastAPI integration and type safety",
    language: "Python",
    framework: "Strawberry",
    category: "backend",
    icon: IconDeviceDesktop,
    color: "from-pink-500 to-purple-600",
    features: ["GraphQL", "Type-safe", "Subscriptions", "DataLoaders", "Playground"],
  },
  {
    id: "ml-inference",
    name: "ML Inference",
    description: "Machine learning model inference API with model versioning and batch prediction",
    language: "Python",
    framework: "FastAPI",
    category: "backend",
    icon: IconBrain,
    color: "from-violet-500 to-purple-700",
    features: ["ML Serving", "Model versioning", "Batch predict", "Health checks", "Metrics"],
  },
  {
    id: "react-frontend",
    name: "React Frontend",
    description: "Modern React application with TypeScript, Vite, React Router, and state management",
    language: "TypeScript",
    framework: "React",
    category: "frontend",
    icon: IconBrandReact,
    color: "from-sky-400 to-blue-600",
    features: ["TypeScript", "Vite", "React Router", "Zustand", "React Query"],
  },
  {
    id: "nextjs-fullstack",
    name: "Next.js Full-stack",
    description: "Full-stack Next.js 14 application with App Router, API routes, and Tailwind CSS",
    language: "TypeScript",
    framework: "Next.js",
    category: "frontend",
    icon: IconBrandNextjs,
    color: "from-neutral-600 to-neutral-900",
    features: ["App Router", "API routes", "Tailwind CSS", "Server components", "TypeScript"],
  },
  {
    id: "static-site",
    name: "Static Site",
    description: "Modern static site with HTML5, CSS3, vanilla JavaScript, and responsive design",
    language: "JavaScript",
    framework: "Vanilla",
    category: "frontend",
    icon: IconWorld,
    color: "from-amber-400 to-orange-500",
    features: ["Responsive", "SEO", "Accessible", "Animations", "Contact form"],
  },
  {
    id: "python-cli",
    name: "Python CLI Tool",
    description: "Command-line tool with Click framework, Rich terminal UI, and config management",
    language: "Python",
    framework: "Click",
    category: "tools",
    icon: IconTerminal,
    color: "from-emerald-500 to-teal-600",
    features: ["CLI", "Rich UI", "Config mgmt", "Sub-commands", "Testing"],
  },
  {
    id: "worker",
    name: "Worker Service",
    description: "Background worker/job processing service with Celery, Redis, and task scheduling",
    language: "Python",
    framework: "Celery",
    category: "tools",
    icon: IconSettings,
    color: "from-slate-500 to-slate-700",
    features: ["Task queue", "Scheduling", "Redis", "Retry logic", "Monitoring"],
  },
  {
    id: "java-spring",
    name: "Java Spring Boot",
    description: "Enterprise-grade Java API with Spring Boot, Spring Data, and comprehensive tooling",
    language: "Java",
    framework: "Spring Boot",
    category: "backend",
    icon: IconCoffee,
    color: "from-red-500 to-orange-600",
    features: ["Spring Boot", "REST API", "Spring Data", "Security", "Actuator"],
  },
  {
    id: "dotnet-api",
    name: ".NET Core API",
    description: "Modern .NET Core API with Entity Framework, dependency injection, and async support",
    language: "C#",
    framework: "ASP.NET Core",
    category: "backend",
    icon: IconBrandTypescript,
    color: "from-purple-500 to-indigo-600",
    features: ["ASP.NET Core", "EF Core", "REST API", "DI", "Async"],
  },
  {
    id: "vue-frontend",
    name: "Vue.js Frontend",
    description: "Modern Vue 3 application with TypeScript, Pinia state, and Vue Router",
    language: "TypeScript",
    framework: "Vue.js",
    category: "frontend",
    icon: IconBrandReact,
    color: "from-emerald-400 to-green-600",
    features: ["Vue 3", "TypeScript", "Pinia", "Vue Router", "Vite"],
  },
  {
    id: "cron-job",
    name: "Cron Job Scheduler",
    description: "Scheduled task runner with cron syntax, logging, and failure notifications",
    language: "Python",
    framework: "APScheduler",
    category: "tools",
    icon: IconClock,
    color: "from-amber-500 to-yellow-600",
    features: ["Cron scheduling", "Logging", "Retry", "Notifications", "Monitoring"],
  },
  {
    id: "microservice",
    name: "Microservice",
    description: "Production-ready microservice with service discovery, circuit breaker, and observability",
    language: "Go",
    framework: "Micro",
    category: "backend",
    icon: IconServer,
    color: "from-blue-500 to-indigo-600",
    features: ["Service discovery", "Circuit breaker", "Observability", "gRPC", "Config"],
  },
  {
    id: "event-driven",
    name: "Event-Driven Service",
    description: "Event-driven microservice with Kafka, event sourcing, and CQRS pattern",
    language: "Python",
    framework: "FastAPI",
    category: "backend",
    icon: IconCloud,
    color: "from-indigo-500 to-purple-600",
    features: ["Kafka", "Event sourcing", "CQRS", "Async", "Reactive"],
  },
  {
    id: "database-service",
    name: "Database Service",
    description: "Database migration and management service with schema versioning",
    language: "Python",
    framework: "Alembic",
    category: "tools",
    icon: IconDatabase,
    color: "from-cyan-500 to-blue-600",
    features: ["Migrations", "Schema mgmt", "Versioning", "Rollback", "Seeding"],
  },
];

export const ciProviders: CIProvider[] = [
  {
    id: "github-actions",
    name: "GitHub Actions",
    description: "Build, Test, Security scan, Docker build, Deploy",
    icon: IconBrandGithub,
  },
  {
    id: "gitlab-ci",
    name: "GitLab CI",
    description: "Lint, Test, Security, Build, Deploy (staging + production)",
    icon: IconBrandGitlab,
  },
  {
    id: "jenkins",
    name: "Jenkins",
    description: "Checkout, Lint, Test, Security, Docker build/push, Deploy",
    icon: IconTools,
  },
];

export const deployTargets: DeployTarget[] = [
  {
    id: "kubernetes",
    name: "Kubernetes",
    description: "Deploy using Kubernetes manifests with Kustomize overlays",
    icon: IconContainer,
  },
  {
    id: "helm",
    name: "Helm",
    description: "Deploy using Helm charts with values per environment",
    icon: IconSettings,
  },
];

export const gitOpsTools: GitOpsTool[] = [
  {
    id: "none",
    name: "None",
    description: "No GitOps integration",
    icon: IconX,
  },
  {
    id: "argocd",
    name: "ArgoCD",
    description: "GitOps with ArgoCD Application manifests",
    icon: IconGitMerge,
  },
  {
    id: "flux",
    name: "Flux CD",
    description: "GitOps with Flux GitRepository and Kustomization",
    icon: IconGitPullRequest,
  },
];

export type ServiceConfig = {
  name: string;
  template: string;
  ci: string;
  deploy: string;
  gitops: string;
  docker: boolean;
  k8s: boolean;
  monitoring: boolean;
  docs: boolean;
  outputDir: string;
  port: number;
  envVars: { key: string; value: string; }[];
  resources: {
    cpuRequest: string;
    cpuLimit: string;
    memoryRequest: string;
    memoryLimit: string;
  };
  replicas: number;
  healthCheck: boolean;
  dependencies: string[];
};

export type RecentService = {
  id: string;
  config: ServiceConfig;
  generatedAt: string;
  templateName: string;
};

export type ConfigPreset = {
  id: string;
  name: string;
  description: string;
  config: Partial<ServiceConfig>;
};

export const defaultConfig: ServiceConfig = {
  name: "",
  template: "",
  ci: "github-actions",
  deploy: "kubernetes",
  gitops: "none",
  docker: true,
  k8s: true,
  monitoring: true,
  docs: true,
  outputDir: "./output",
  port: 8080,
  envVars: [],
  resources: {
    cpuRequest: "100m",
    cpuLimit: "500m",
    memoryRequest: "128Mi",
    memoryLimit: "512Mi",
  },
  replicas: 2,
  healthCheck: true,
  dependencies: [],
};

export const configPresets: ConfigPreset[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Basic service with only essential features",
    config: {
      ci: "github-actions",
      deploy: "kubernetes",
      gitops: "none",
      docker: true,
      k8s: true,
      monitoring: false,
      docs: false,
      healthCheck: false,
      replicas: 1,
    },
  },
  {
    id: "production",
    name: "Production Ready",
    description: "Full-featured service for production",
    config: {
      ci: "github-actions",
      deploy: "kubernetes",
      gitops: "argocd",
      docker: true,
      k8s: true,
      monitoring: true,
      docs: true,
      healthCheck: true,
      replicas: 3,
      resources: {
        cpuRequest: "200m",
        cpuLimit: "1000m",
        memoryRequest: "256Mi",
        memoryLimit: "1Gi",
      },
    },
  },
  {
    id: "dev",
    name: "Development",
    description: "Simple setup for local development",
    config: {
      ci: "github-actions",
      deploy: "docker",
      gitops: "none",
      docker: true,
      k8s: false,
      monitoring: false,
      docs: true,
      healthCheck: false,
      replicas: 1,
      resources: {
        cpuRequest: "100m",
        cpuLimit: "500m",
        memoryRequest: "128Mi",
        memoryLimit: "256Mi",
      },
    },
  },
];
