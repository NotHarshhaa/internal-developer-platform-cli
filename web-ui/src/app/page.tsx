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
  Palette,
  Smartphone,
  Target,
  Settings,
  Eye,
  Heart,
  Network,
  CheckCircle,
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
  { label: "Commands", value: "5", icon: Terminal, color: "text-orange-500" },
];

const capabilities = [
  {
    title: "Service Scaffolding",
    description: "Generate production-ready microservices from 11 battle-tested templates",
    icon: Rocket,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Health Monitoring",
    description: "Real-time service health checks with continuous monitoring and alerts",
    icon: Heart,
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Dependency Visualization",
    description: "Visualize service relationships and detect circular dependencies",
    icon: Network,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Environment Status",
    description: "Verify infrastructure readiness before deployments",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "CI/CD Automation",
    description: "Auto-generate pipelines for GitHub Actions, GitLab CI, or Jenkins",
    icon: GitBranch,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Container Ready",
    description: "Multi-stage Docker builds with security best practices baked in",
    icon: Container,
    color: "bg-orange-500/10 text-orange-500",
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
              v0.3.0 — Health Monitoring & Observability
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
              services with CI/CD, Docker, Kubernetes, monitoring, and observability — 
              all from a beautiful web interface.
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <Heart className="h-3 w-3" />
                Health Monitor
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <Network className="h-3 w-3" />
                Dependencies
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <CheckCircle className="h-3 w-3" />
                Environment Check
              </Button>
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
              Complete Platform Engineering Toolkit
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              From service creation to operational observability, the IDP CLI handles it all.
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

      {/* Great UI Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Beautiful & Intuitive Interface
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A modern web experience that makes service creation effortless and enjoyable
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: UI Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Modern Design System</h3>
                  <p className="text-sm text-muted-foreground">
                    Built with shadcn/ui components, featuring smooth animations, dark mode support, and responsive layouts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Lightning Fast Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Powered by Next.js 16 with App Router, optimized for instant loading and smooth interactions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Intuitive Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    3-step wizard with real-time preview, smart validation, and helpful guidance at every step
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Dark Mode First</h3>
                  <p className="text-sm text-muted-foreground">
                    Beautiful dark theme by default with seamless light mode switching for any environment
                  </p>
                </div>
              </div>
            </div>

            {/* Right: UI Preview Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl"></div>
              <div className="relative bg-background border rounded-2xl overflow-hidden shadow-2xl">
                <div className="border-b bg-muted/30 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="h-4 bg-muted rounded mx-auto w-32"></div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted/50 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-20 bg-muted/30 rounded-lg"></div>
                    <div className="h-20 bg-muted/30 rounded-lg"></div>
                    <div className="h-20 bg-muted/30 rounded-lg"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-primary/20 rounded flex-1"></div>
                    <div className="h-8 bg-muted rounded w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UI Features Grid */}
          <div className="mt-16 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Palette, label: "Beautiful UI", desc: "Modern, clean interface" },
              { icon: Zap, label: "Fast Loading", desc: "Optimized performance" },
              { icon: Terminal, label: "Dark Mode", desc: "Easy on the eyes" },
              { icon: Smartphone, label: "Responsive", desc: "Works everywhere" },
              { icon: Target, label: "Intuitive", desc: "User-friendly design" },
              { icon: Settings, label: "Customizable", desc: "Flexible configuration" },
              { icon: Eye, label: "Live Preview", desc: "See changes instantly" },
              { icon: Rocket, label: "Production Ready", desc: "Built for scale" },
            ].map((feature) => (
              <div key={feature.label} className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-3">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{feature.label}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
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
            Stop spending hours on boilerplate and operational overhead. Create production-ready services and monitor them with ease.
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

      {/* Author Section */}
      <section className="border-t py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight">About the Author</h2>
            <p className="mt-2 text-muted-foreground">
              Built by a passionate platform engineering enthusiast
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <img
                src="https://github.com/notharshhaa.png"
                alt="H A R S H H A A"
                className="h-24 w-24 rounded-full border-4 border-background shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                <span className="text-xs font-bold text-primary-foreground">HA</span>
              </div>
            </div>
            <div className="text-center max-w-2xl">
              <h3 className="text-xl font-bold mb-2">H A R S H H A A</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Development Platform & Automation Enthusiast | Cloud, DevOps & MLOps Engineer | Platform Engineering
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://github.com/notharshhaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  github.com/notharshhaa
                </a>
              </div>
            </div>
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
