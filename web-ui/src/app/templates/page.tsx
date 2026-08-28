"use client";

import { useState, useMemo } from "react";
import React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowRight,
  Eye,
  Rocket,
  Code,
  CheckCircle2,
  FileCode,
  Sparkles,
  Layers,
  Check,
  Server,
  Globe,
  Sliders,
  Terminal,
  Cpu,
  Zap,
  Star,
  Download,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { templates, type Template, defaultConfig } from "@/lib/data";
import { getTemplate } from "@/lib/generators/registry";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Boilerplates", count: templates.length },
  {
    id: "backend",
    label: "Backend APIs",
    count: templates.filter((t) => t.category === "backend").length,
  },
  {
    id: "frontend",
    label: "Frontend Apps",
    count: templates.filter((t) => t.category === "frontend").length,
  },
  {
    id: "tools",
    label: "Tools & Workers",
    count: templates.filter((t) => t.category === "tools").length,
  },
];

const languages = ["All", ...Array.from(new Set(templates.map((t) => t.language)))];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedLang, setSelectedLang] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "language">("featured");
  const [inspectingTemplate, setInspectingTemplate] = useState<Template | null>(null);
  const [inspectFiles, setInspectFiles] = useState<{ path: string; content: string }[]>([]);
  const [activeInspectFile, setActiveInspectFile] = useState<string>("");
  const [copiedFile, setCopiedFile] = useState(false);

  const handleInspect = (t: Template) => {
    try {
      const generator = getTemplate(t.id, {
        ...defaultConfig,
        name: `sample-${t.id}`,
        template: t.id,
      });
      const files = generator.generateFiles();
      setInspectFiles(files);
      if (files.length > 0) {
        setActiveInspectFile(files[0].path);
      }
      setInspectingTemplate(t);
    } catch {
      setInspectFiles([]);
      setInspectingTemplate(t);
    }
  };

  const filtered = useMemo(() => {
    let list = templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.framework.toLowerCase().includes(search.toLowerCase()) ||
        t.language.toLowerCase().includes(search.toLowerCase()) ||
        t.features.some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || t.category === category;
      const matchesLang = selectedLang === "All" || t.language === selectedLang;
      return matchesSearch && matchesCategory && matchesLang;
    });

    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "language") {
      list.sort((a, b) => a.language.localeCompare(b.language));
    }

    return list;
  }, [search, category, selectedLang, sortBy]);

  const currentFileContent = inspectFiles.find((f) => f.path === activeInspectFile) || inspectFiles[0];

  const handleCopyCurrentFile = () => {
    if (currentFileContent) {
      navigator.clipboard.writeText(currentFileContent.content);
      setCopiedFile(true);
      toast.success("File content copied to clipboard");
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Production Template Catalog
            </h1>
            <Badge variant="outline" className="text-[10px] text-primary bg-primary/5 border-primary/20">
              {templates.length} Enterprise Boilerplates
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-2xl">
            Battle-tested microservice boilerplates configured with multi-stage Dockerfiles, K8s Kustomize manifests, CI/CD, and metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/create">
            <Button size="sm" className="gap-1.5 h-8 text-xs shadow-xs">
              <Rocket className="h-3.5 w-3.5" />
              Launch Generator Wizard
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/5 to-card border-border/70">
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Boilerplates</span>
            <div className="text-lg font-bold text-foreground mt-0.5">{templates.length} Services</div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Backend APIs</span>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {templates.filter((t) => t.category === "backend").length} Architectures
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Frontend & Fullstack</span>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {templates.filter((t) => t.category === "frontend").length} Stacks
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Tools & Workers</span>
            <div className="text-lg font-bold text-foreground mt-0.5">
              {templates.filter((t) => t.category === "tools").length} Utilities
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.id)}
              className="gap-1.5 text-xs h-7.5"
            >
              {cat.label}
              <Badge
                variant={category === cat.id ? "secondary" : "outline"}
                className="text-[9px] h-4 px-1 justify-center"
              >
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search language, framework, features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-7.5 text-xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-7.5 rounded-md border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="featured">Sort: Featured</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="language">Sort: Language</option>
          </select>
        </div>
      </div>

      {/* Language Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          Language:
        </span>
        {languages.map((lang) => (
          <Button
            key={lang}
            variant={selectedLang === lang ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedLang(lang)}
            className="text-xs h-6.5 px-2.5 font-normal"
          >
            {lang}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-dashed">
          <div className="text-3xl">🔍</div>
          <h3 className="text-sm font-semibold">No matching templates found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or reset your language & category filters
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSelectedLang("All");
            }}
            className="text-xs h-8"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card
              key={t.id}
              className="group flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md border-border/80 relative overflow-hidden"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground group-hover:scale-105 transition-transform">
                    {React.createElement(t.icon, { className: "w-5 h-5 text-primary" })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      {t.language}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                      {t.framework}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors">
                  {t.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                  {t.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-3">
                <div className="flex flex-wrap gap-1">
                  {t.features.map((f) => (
                    <Badge key={f} variant="outline" className="text-[9px] font-normal px-1.5 py-0">
                      {f}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInspect(t)}
                    className="flex-1 text-xs h-7.5 gap-1.5 hover:bg-accent"
                  >
                    <Eye className="h-3 w-3" />
                    Inspect Files
                  </Button>
                  <Link href={`/create?template=${t.id}`} className="flex-1">
                    <Button size="sm" className="w-full text-xs h-7.5 gap-1.5 shadow-xs">
                      <Rocket className="h-3 w-3" />
                      Scaffold
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Architecture & Files Preview Dialog */}
      <Dialog open={!!inspectingTemplate} onOpenChange={(open) => !open && setInspectingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-5">
          {inspectingTemplate && (
            <>
              <DialogHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(inspectingTemplate.icon, { className: "w-5 h-5 text-primary" })}
                    <DialogTitle className="text-base font-bold">
                      {inspectingTemplate.name} Architecture
                    </DialogTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {inspectingTemplate.framework}
                    </Badge>
                  </div>
                  <Link href={`/create?template=${inspectingTemplate.id}`}>
                    <Button size="sm" className="h-7 text-xs gap-1.5">
                      <Rocket className="h-3 w-3" />
                      Use Template
                    </Button>
                  </Link>
                </div>
                <DialogDescription className="text-xs">
                  {inspectingTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <Separator />

              {/* Multi-Tab Interactive Code Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] border rounded-lg overflow-hidden min-h-[340px] max-h-[460px]">
                {/* File Sidebar */}
                <div className="border-r bg-muted/20 p-2 overflow-y-auto space-y-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-1.5">
                    Generated Files ({inspectFiles.length})
                  </p>
                  {inspectFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setActiveInspectFile(file.path)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[11px] font-mono transition-colors cursor-pointer truncate",
                        activeInspectFile === file.path
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <FileCode className="h-3 w-3 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>

                {/* File Code Editor View */}
                <div className="flex flex-col bg-neutral-950 text-neutral-200">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/60">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {currentFileContent?.path} ({currentFileContent?.content.split("\n").length} lines)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCurrentFile}
                      className="h-6 text-[10px] gap-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                    >
                      {copiedFile ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedFile ? "Copied" : "Copy File"}
                    </Button>
                  </div>

                  <pre className="p-3.5 font-mono text-xs overflow-auto flex-1 leading-relaxed text-neutral-200">
                    {currentFileContent?.content}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span>Includes Docker, Kubernetes Kustomize, and CI/CD automation</span>
                <Link href={`/create?template=${inspectingTemplate.id}`}>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Rocket className="h-3.5 w-3.5" />
                    Configure in Wizard &rarr;
                  </Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
