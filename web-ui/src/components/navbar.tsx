"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  Layers,
  Plus,
  Github,
  Heart,
  Network,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Service", icon: Plus },
  { href: "/templates", label: "Templates", icon: Layers },
];

const observabilityItems = [
  { href: "/health", label: "Health Monitor", icon: Heart, desc: "Probes & uptime" },
  { href: "/dependencies", label: "Dependencies", icon: Network, desc: "Topology & blast radius" },
  { href: "/environment", label: "Environment", icon: CheckCircle2, desc: "K8s & cloud cluster check" },
];

const toolsItems = [
  { href: "/cost", label: "Cost Estimator", icon: DollarSign, desc: "Multi-cloud infrastructure billing" },
  { href: "/security", label: "Security Scanner", icon: ShieldCheck, desc: "Vulnerability & CIS audits" },
  { href: "/playground", label: "CLI Playground", icon: Terminal, desc: "Visual command builder" },
];

export function Navbar() {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isObsActive = observabilityItems.some((item) => pathname === item.href);
  const isToolsActive = toolsItems.some((item) => pathname === item.href);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold leading-none tracking-tight">
                    IDP CLI
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono bg-primary/5 text-primary border-primary/20">
                    v2.0.0
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Developer Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Observability Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("obs")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    isObsActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Heart className="h-3.5 w-3.5" />
                  Observability
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </button>
                {activeDropdown === "obs" && (
                  <div className="absolute left-0 top-full pt-1 z-50 w-56 animate-in fade-in-50 zoom-in-95">
                    <div className="rounded-lg border bg-popover p-1.5 shadow-xl text-popover-foreground">
                      {observabilityItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            "flex items-start gap-2.5 rounded-md p-2 text-xs transition-colors hover:bg-accent",
                            pathname === item.href && "bg-accent/80 font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown("tools")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    isToolsActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Platform Tools
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </button>
                {activeDropdown === "tools" && (
                  <div className="absolute left-0 top-full pt-1 z-50 w-58 animate-in fade-in-50 zoom-in-95">
                    <div className="rounded-lg border bg-popover p-1.5 shadow-xl text-popover-foreground">
                      {toolsItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            "flex items-start gap-2.5 rounded-md p-2 text-xs transition-colors hover:bg-accent",
                            pathname === item.href && "bg-accent/80 font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search shortcut button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="h-8 gap-2 px-2.5 text-xs text-muted-foreground bg-muted/30 hover:bg-accent hover:text-foreground hidden sm:flex border-border/70"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Quick search...</span>
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
                Ctrl K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="h-8 w-8 p-0 sm:hidden"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Link
              href="https://github.com/NotHarshhaa/internal-developer-platform-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
            >
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-border/70">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </Button>
            </Link>

            <ThemeToggle />

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 p-0 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Full Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background px-4 py-3 space-y-3 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-3 gap-1 pb-2 border-b">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-[11px] font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-1 mb-1">
                Observability
              </p>
              <div className="grid grid-cols-1 gap-1">
                {observabilityItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md text-xs transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-1 mb-1">
                Platform Tools
              </p>
              <div className="grid grid-cols-1 gap-1">
                {toolsItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md text-xs transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
