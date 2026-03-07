export type Template = {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  category: "backend" | "frontend" | "tools";
  icon: string;
  color: string;
  features: string[];
};

export type CIProvider = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type DeployTarget = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type GitOpsTool = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const templates: Template[] = [
  {
    id: "python-api",
    name: "Python API",
    description: "Production-ready Python API service with FastAPI, async support, and auto-generated docs",
    language: "Python",
    framework: "FastAPI",
    category: "backend",
    icon: "🐍",
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
    icon: "🟢",
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
    icon: "🔵",
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
    icon: "🦀",
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
    icon: "🔮",
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
    icon: "🧠",
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
    icon: "⚛️",
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
    icon: "▲",
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
    icon: "🌐",
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
    icon: "🖥️",
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
    icon: "⚙️",
    color: "from-slate-500 to-slate-700",
    features: ["Task queue", "Scheduling", "Redis", "Retry logic", "Monitoring"],
  },
];

export const ciProviders: CIProvider[] = [
  {
    id: "github-actions",
    name: "GitHub Actions",
    description: "Build, Test, Security scan, Docker build, Deploy",
    icon: "🐙",
  },
  {
    id: "gitlab-ci",
    name: "GitLab CI",
    description: "Lint, Test, Security, Build, Deploy (staging + production)",
    icon: "🦊",
  },
  {
    id: "jenkins",
    name: "Jenkins",
    description: "Checkout, Lint, Test, Security, Docker build/push, Deploy",
    icon: "🔧",
  },
];

export const deployTargets: DeployTarget[] = [
  {
    id: "kubernetes",
    name: "Kubernetes",
    description: "Deploy using Kubernetes manifests with Kustomize overlays",
    icon: "☸️",
  },
  {
    id: "helm",
    name: "Helm",
    description: "Deploy using Helm charts with values per environment",
    icon: "⎈",
  },
];

export const gitOpsTools: GitOpsTool[] = [
  {
    id: "none",
    name: "None",
    description: "No GitOps integration",
    icon: "⊘",
  },
  {
    id: "argocd",
    name: "ArgoCD",
    description: "GitOps with ArgoCD Application manifests",
    icon: "🔄",
  },
  {
    id: "flux",
    name: "Flux CD",
    description: "GitOps with Flux GitRepository and Kustomization",
    icon: "🔁",
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
};
