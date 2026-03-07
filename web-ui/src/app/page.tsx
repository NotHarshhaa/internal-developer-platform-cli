import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Layers,
  GitBranch,
  Container,
  Shield,
  BarChart3,
  Zap,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/data";

const stats = [
  { label: "Templates", value: "11", icon: Layers, color: "text-blue-500" },
  { label: "CI/CD Providers", value: "3", icon: GitBranch, color: "text-green-500" },
  { label: "Deploy Targets", value: "2", icon: Container, color: "text-purple-500" },
  { label: "Languages", value: "6", icon: Terminal, color: "text-orange-500" },
];

const capabilities = [
  {
    title: "Service Scaffolding",
    description: "Generate production-ready microservices from 11 battle-tested templates",
    icon: Rocket,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "CI/CD Automation",
    description: "Auto-generate pipelines for GitHub Actions, GitLab CI, or Jenkins",
    icon: GitBranch,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Container Ready",
    description: "Multi-stage Docker builds with security best practices baked in",
    icon: Container,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Kubernetes Native",
    description: "Kustomize overlays for dev, staging, and production environments",
    icon: Shield,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Observability",
    description: "Prometheus rules, Grafana dashboards, and ServiceMonitor configs",
    icon: BarChart3,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "GitOps Ready",
    description: "ArgoCD or Flux CD manifests for declarative deployments",
    icon: Zap,
    color: "bg-amber-500/10 text-amber-500",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 relative">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              v0.2.0 — 11 Templates Available
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Internal Developer
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Platform CLI
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Self-service infrastructure for developers. Generate production-ready
              services with CI/CD, Docker, Kubernetes, and monitoring — all from a
              beautiful web interface.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create">
                <Button size="lg" className="gap-2 text-base px-8 h-12 rounded-xl">
                  <Rocket className="h-4 w-4" />
                  Create a Service
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-base px-8 h-12 rounded-xl"
                >
                  <Layers className="h-4 w-4" />
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 py-8">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to ship faster
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              From code scaffolding to production deployment, the IDP CLI handles it all.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <Card
                key={cap.title}
                className="group transition-all hover:shadow-lg hover:border-primary/20"
              >
                <CardHeader>
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cap.color}`}
                  >
                    <cap.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{cap.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {cap.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="border-t py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Popular Templates
              </h2>
              <p className="mt-2 text-muted-foreground">
                Get started in seconds with battle-tested templates
              </p>
            </div>
            <Link href="/templates">
              <Button variant="outline" className="gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.slice(0, 8).map((t) => (
              <Link key={t.id} href={`/create?template=${t.id}`}>
                <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{t.icon}</span>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {t.framework}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                      {t.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {t.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {t.features.slice(0, 3).map((f) => (
                        <Badge
                          key={f}
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to accelerate your development?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Stop spending hours on boilerplate. Create production-ready services in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/create">
              <Button size="lg" className="gap-2 rounded-xl h-12 px-8">
                <Terminal className="h-4 w-4" />
                Get Started Now
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>or install via CLI:</span>
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
              pip install idp-cli
            </code>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                IDP CLI — Internal Developer Platform
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with Next.js, shadcn/ui, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
