import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Layers,
  GitBranch,
  Container,
  Heart,
  Network,
  CheckCircle,
  Rocket,
  Zap,
  Smartphone,
  Eye,
  Shield,
  History,
  Copy,
  Lightbulb,
  Keyboard,
  Download,
  UploadCloud,
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
  { label: "Templates", value: "16", icon: Layers },
  { label: "CI/CD", value: "3", icon: GitBranch },
  { label: "Targets", value: "2", icon: Container },
  { label: "Commands", value: "5", icon: Terminal },
];

const capabilities = [
  {
    title: "Service Scaffolding",
    description: "Generate production-ready microservices from templates",
    icon: Rocket,
  },
  {
    title: "Health Monitoring",
    description: "Real-time health checks with monitoring",
    icon: Heart,
  },
  {
    title: "Dependency Visualization",
    description: "Visualize service relationships",
    icon: Network,
  },
  {
    title: "Environment Status",
    description: "Verify infrastructure readiness",
    icon: CheckCircle,
  },
  {
    title: "CI/CD Automation",
    description: "Auto-generate pipelines",
    icon: GitBranch,
  },
  {
    title: "Container Ready",
    description: "Multi-stage Docker builds",
    icon: Container,
  },
];

const quickActions = [
  { icon: Heart, label: "Health Monitor", href: "#" },
  { icon: Network, label: "Dependencies", href: "#" },
  { icon: CheckCircle, label: "Environment Check", href: "#" },
];

const newFeatures = [
  {
    icon: History,
    title: "Recent History",
    description: "Track and quickly regenerate previous services",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description: "AI-powered service name suggestions",
  },
  {
    icon: Copy,
    title: "Config Sharing",
    description: "Copy or export configurations for team sharing",
  },
  {
    icon: UploadCloud,
    title: "Import Configs",
    description: "Load saved configurations from JSON files",
  },
  {
    icon: Download,
    title: "Quick Presets",
    description: "Pre-configured setups for common scenarios",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description: "Power user shortcuts for faster navigation",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Compact Hero */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <Badge className="mb-3 px-2 py-0.5 text-[10px] font-medium">
                v1.5.0 Production Ready
              </Badge>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Internal Developer
                <br />
                <span className="text-primary">Platform CLI</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg">
                Self-service infrastructure for developers. Generate production-ready services with CI/CD, Docker, and monitoring.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/create">
                  <Button size="default" className="gap-2">
                    <Rocket className="h-4 w-4" />
                    Create Service
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button variant="outline" size="default" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Templates
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex md:flex-col gap-2">
              {quickActions.map((action) => (
                <Button key={action.label} variant="ghost" size="sm" className="gap-2 text-xs h-8">
                  <action.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">{action.label.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compact Stats Bar */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-4 py-3 overflow-x-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 shrink-0">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Capabilities */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Platform Toolkit
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              From service creation to operational observability
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {capabilities.map((cap) => (
              <Card key={cap.title} className="hover:border-primary/50 transition-colors">
                <CardHeader className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <cap.icon className="h-3.5 w-3.5" />
                    </div>
                    <CardTitle className="text-sm">{cap.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs leading-relaxed">
                    {cap.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compact UI Features */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Modern Interface
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Beautiful, fast, and intuitive web experience
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Zap, label: "Fast", desc: "Next.js 16" },
              { icon: Smartphone, label: "Responsive", desc: "All devices" },
              { icon: Eye, label: "Live Preview", desc: "Real-time" },
              { icon: Shield, label: "Secure", desc: "Best practices" },
            ].map((feature) => (
              <Card key={feature.label} className="text-center">
                <CardContent className="p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-2">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-xs mb-1">{feature.label}</h4>
                  <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="py-6 md:py-8 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-center gap-2">
            <Badge className="px-1.5 py-0 text-[9px] font-medium bg-primary/10 text-primary">
              NEW
            </Badge>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">
              Developer-First Features
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {newFeatures.map((feature) => (
              <Card key={feature.title} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-3 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-2">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-xs mb-1">{feature.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Templates */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Popular Templates
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started in seconds
              </p>
            </div>
            <Link href="/templates">
              <Button variant="ghost" size="sm" className="gap-2">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
            {templates.slice(0, 4).map((t) => (
              <Link key={t.id} href={`/create?template=${t.id}`} className="shrink-0 w-64 md:w-auto">
                <Card className="group h-full cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <t.icon className="h-5 w-5" />
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {t.framework}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">
                      {t.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] line-clamp-2 mt-1">
                      {t.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {t.features.slice(0, 2).map((f) => (
                        <Badge
                          key={f}
                          variant="outline"
                          className="text-[9px] px-1.5 py-0"
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

      {/* Compact CTA */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 md:p-8 text-center">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Ready to accelerate development?
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Stop spending hours on boilerplate. Create production-ready services with ease.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Link href="/create" className="w-full sm:w-auto">
                  <Button size="default" className="gap-2 w-full sm:w-auto">
                    <Terminal className="h-4 w-4" />
                    Get Started
                  </Button>
                </Link>
                <code className="rounded-md bg-background px-3 py-1.5 font-mono text-xs border">
                  pip install idp-cli
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Compact Author */}
      <section className="py-8 md:py-12 border-t">
        <div className="mx-auto max-w-6xl px-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src="https://github.com/notharshhaa.png"
                    alt="H A R S H H A A"
                    className="h-14 w-14 rounded-full border-2 border-background shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <span className="text-[8px] font-bold text-primary-foreground">HA</span>
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-base font-bold">H A R S H H A A</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Platform Engineering & Automation Enthusiast
                  </p>
                </div>
                <a
                  href="https://github.com/notharshhaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Compact Footer */}
      <footer className="border-t py-4 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3" />
              <span>IDP CLI — Internal Developer Platform</span>
            </div>
            <span>Built with Next.js, shadcn/ui, and Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
