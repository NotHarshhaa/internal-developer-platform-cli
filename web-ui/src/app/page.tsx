import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Layers,
  GitBranch,
  Container,
  Heart,
  Network,
  CheckCircle2,
  Rocket,
  Zap,
  Smartphone,
  Eye,
  ShieldCheck,
  DollarSign,
  Sparkles,
  History,
  Copy,
  UploadCloud,
  Download,
  Keyboard,
  Shield,
  Activity,
  Server,
  Cloud,
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
  { label: "Production Templates", value: templates.length.toString(), icon: Layers, href: "/templates" },
  { label: "CI/CD Automations", value: "3", icon: GitBranch, href: "/create" },
  { label: "Cloud & K8s Targets", value: "3", icon: Container, href: "/environment" },
  { label: "Security & FinOps Tools", value: "6", icon: ShieldCheck, href: "/security" },
];

const platformModules = [
  {
    title: "Service Scaffolding",
    description: "Generate production-grade microservices with Docker, K8s, and CI/CD pipelines in seconds",
    icon: Rocket,
    href: "/create",
    badge: "Core",
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-500",
  },
  {
    title: "Health & Uptime Probes",
    description: "Real-time health checking, endpoint latencies, resource telemetry, and alert management",
    icon: Heart,
    href: "/health",
    badge: "Observability",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-500",
  },
  {
    title: "Dependency Topology",
    description: "Interactive DAG architecture visualizer, circular loop detection, and blast radius simulator",
    icon: Network,
    href: "/dependencies",
    badge: "Architecture",
    color: "from-purple-500/10 to-pink-500/10 text-purple-500",
  },
  {
    title: "Environment Inspector",
    description: "Multi-cluster status, Kubernetes nodes & pods health, Docker runtimes, and cloud ping",
    icon: CheckCircle2,
    href: "/environment",
    badge: "Infrastructure",
    color: "from-sky-500/10 to-cyan-500/10 text-sky-500",
  },
  {
    title: "Cloud Cost Estimator",
    description: "Multi-cloud infrastructure cost projection (AWS/GCP/Azure) with FinOps right-sizing advice",
    icon: DollarSign,
    href: "/cost",
    badge: "FinOps",
    color: "from-amber-500/10 to-orange-500/10 text-amber-500",
  },
  {
    title: "Security & CIS Audits",
    description: "Static policy analysis for non-root containers, read-only filesystems, and secret leak prevention",
    icon: ShieldCheck,
    href: "/security",
    badge: "Security",
    color: "from-emerald-500/10 to-green-500/10 text-emerald-500",
  },
];

const quickActions = [
  { icon: Heart, label: "Health Monitor", href: "/health" },
  { icon: Network, label: "Dependencies", href: "/dependencies" },
  { icon: CheckCircle2, label: "Cluster Status", href: "/environment" },
  { icon: DollarSign, label: "Cost Estimator", href: "/cost" },
  { icon: ShieldCheck, label: "Security Scan", href: "/security" },
  { icon: Terminal, label: "CLI Playground", href: "/playground" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-background via-muted/10 to-muted/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs">
                  v2.0.0 Production Ready
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Multi-Cloud & Kubernetes
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Internal Developer
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Platform Platform
                </span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                Self-service infrastructure toolkit for modern engineering teams. Generate production microservices, visualize dependencies, monitor health, and audit security with one click.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/create">
                  <Button size="lg" className="gap-2 shadow-md">
                    <Rocket className="h-4 w-4" />
                    Create Service
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Browse 18 Templates
                  </Button>
                </Link>
                <Link href="/playground">
                  <Button variant="ghost" size="lg" className="gap-2 text-xs">
                    <Terminal className="h-4 w-4 text-primary" />
                    CLI Playground
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Live Health / Action Panel */}
            <div className="lg:w-80 space-y-3">
              <Card className="border-border/80 shadow-lg bg-card/80 backdrop-blur-md">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-emerald-500" />
                      Live Platform Pulse
                    </CardTitle>
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-emerald-500 text-white">
                      Healthy
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs border-b pb-2">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Avg Latency</span>
                      <span className="font-semibold text-foreground">27.9 ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Active Uptime</span>
                      <span className="font-semibold text-foreground">99.98%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Security Grade</span>
                      <span className="font-semibold text-emerald-500">A+ (96%)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">FinOps Index</span>
                      <span className="font-semibold text-foreground">55% Spot</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-semibold text-muted-foreground uppercase pt-1">
                    Quick Observability Tools
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickActions.slice(0, 4).map((action) => (
                      <Link key={action.label} href={action.href}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-1.5 text-[11px] h-7 px-2 border-border/70 hover:bg-accent"
                        >
                          <action.icon className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{action.label}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/40 py-4">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="group">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                    <stat.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Toolkit Grid */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <div>
            <Badge variant="outline" className="text-[10px] text-primary bg-primary/5 border-primary/20 mb-2">
              Full Spectrum Platform
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Enterprise Developer Capabilities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              From scaffolding production microservices to interactive observability and compliance auditing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformModules.map((module) => (
              <Link key={module.title} href={module.href} className="group">
                <Card className="h-full border-border/80 hover:border-primary/50 transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${module.color}`}>
                        <module.icon className="h-4.5 w-4.5" />
                      </div>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                        {module.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors flex items-center justify-between">
                      {module.title}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Templates Showcase */}
      <section className="py-10 md:py-14 bg-muted/20 border-y">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Featured Templates
              </h2>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                Get started with curated templates containing ready-to-run code, Docker, and CI/CD
              </p>
            </div>
            <Link href="/templates">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                Explore all 18 templates
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {templates.slice(0, 4).map((t) => (
              <Link key={t.id} href={`/create?template=${t.id}`} className="group">
                <Card className="h-full cursor-pointer hover:border-primary/50 transition-all hover:shadow-sm">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <t.icon className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {t.framework}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {t.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] line-clamp-2 mt-1">
                      {t.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {t.features.slice(0, 2).map((f) => (
                        <Badge key={f} variant="outline" className="text-[8px] px-1 py-0">
                          {f}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Scaffold now &rarr;
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Installation CTA Banner */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-card border-primary/20 shadow-xl overflow-hidden">
            <CardContent className="p-6 md:p-10 text-center space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto shadow-md">
                <Terminal className="h-5 w-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Developer Productivity, Unlocked.
              </h2>
              <p className="mx-auto max-w-lg text-xs md:text-sm text-muted-foreground">
                Install the official Python CLI or use our self-service Web UI to bootstrap production services in seconds.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/create">
                  <Button size="default" className="gap-2 shadow-sm">
                    <Rocket className="h-4 w-4" />
                    Launch Web Generator
                  </Button>
                </Link>
                <code className="rounded-md bg-neutral-950 text-green-400 px-3.5 py-2 font-mono text-xs border border-neutral-800 shadow-inner">
                  pip install idp-cli
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Author Card */}
      <section className="py-8 border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-4">
          <Card className="border-border/60">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src="https://github.com/notharshhaa.png"
                    alt="H A R S H H A A"
                    className="h-14 w-14 rounded-full border-2 border-background shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <span className="text-[8px] font-bold text-primary-foreground">HA</span>
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-base font-bold">H A R S H H A A</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Platform Engineering & Cloud Architecture Enthusiast
                  </p>
                </div>
                <a
                  href="https://github.com/notharshhaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border px-3 py-1.5 rounded-md"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  github.com/notharshhaa
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-4 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>IDP CLI — Internal Developer Platform Toolkit</span>
          </div>
          <span>Next.js 16 &bull; Tailwind CSS &bull; shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
