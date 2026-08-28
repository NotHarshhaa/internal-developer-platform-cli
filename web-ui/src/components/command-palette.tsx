"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Plus,
  Heart,
  Network,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Terminal,
  Search,
  ExternalLink,
  Github,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/data";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  const navActions = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, category: "Navigation" },
    { label: "Create Service Wizard", href: "/create", icon: Plus, category: "Navigation" },
    { label: "Template Catalog", href: "/templates", icon: Layers, category: "Navigation" },
    { label: "Health Monitor & Probes", href: "/health", icon: Heart, category: "Observability" },
    { label: "Service Dependency Graph", href: "/dependencies", icon: Network, category: "Observability" },
    { label: "Environment & Cluster Status", href: "/environment", icon: CheckCircle2, category: "Observability" },
    { label: "Cloud Cost Estimator", href: "/cost", icon: DollarSign, category: "Platform Tools" },
    { label: "Security & Vulnerability Scanner", href: "/security", icon: ShieldCheck, category: "Platform Tools" },
    { label: "CLI Command Playground", href: "/playground", icon: Terminal, category: "Platform Tools" },
    { label: "GitHub Repository", href: "https://github.com/NotHarshhaa/internal-developer-platform-cli", icon: Github, category: "External" },
  ];

  const filteredNav = navActions.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.framework.toLowerCase().includes(query.toLowerCase()) ||
      t.language.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border shadow-2xl bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b px-3.5 py-2.5 bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            placeholder="Search tools, templates, or CLI commands... (e.g. 'health', 'fastapi', 'cost')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-7 px-0 shadow-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
          {/* Tools & Pages */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground px-2 mb-1.5 uppercase tracking-wider">
              Navigation & Tools
            </div>
            <div className="space-y-0.5">
              {filteredNav.map((action) => (
                <button
                  key={action.href}
                  onClick={() => handleSelect(action.href)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <action.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-normal opacity-70 group-hover:opacity-100">
                    {action.category}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          {filteredTemplates.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground px-2 mb-1.5 uppercase tracking-wider">
                Templates ({filteredTemplates.length})
              </div>
              <div className="space-y-0.5">
                {filteredTemplates.slice(0, 8).map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelect(`/create?template=${tpl.id}`)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                      <span className="font-medium">{tpl.name}</span>
                      <span className="text-[10px] text-muted-foreground">({tpl.framework})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 font-normal">
                        {tpl.language}
                      </Badge>
                      <span className="text-[10px] text-primary group-hover:translate-x-0.5 transition-transform">
                        Launch &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredTemplates.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-xs">
              No matching commands or templates found.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 bg-muted/30 text-[10px] text-muted-foreground">
          <span>Navigate quickly across the Internal Developer Platform</span>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="font-mono bg-background px-1 py-0.5 rounded border">Ctrl</kbd> + <kbd className="font-mono bg-background px-1 py-0.5 rounded border">K</kbd> anywhere</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
