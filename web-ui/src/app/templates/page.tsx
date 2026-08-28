"use client";

import { useState } from "react";
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

const categories = [
  { id: "all", label: "All Templates", count: templates.length },
  {
    id: "backend",
    label: "Backend APIs",
    count: templates.filter((t) => t.category === "backend").length,
  },
  {
    id: "frontend",
    label: "Frontend",
    count: templates.filter((t) => t.category === "frontend").length,
  },
  {
    id: "tools",
    label: "Tools & Workers",
    count: templates.filter((t) => t.category === "tools").length,
  },
];

const languages = Array.from(new Set(templates.map((t) => t.language)));

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [inspectingTemplate, setInspectingTemplate] = useState<Template | null>(null);
  const [inspectFiles, setInspectFiles] = useState<{ path: string; content: string }[]>([]);

  const handleInspect = (t: Template) => {
    try {
      const generator = getTemplate(t.id, {
        ...defaultConfig,
        name: `sample-${t.id}`,
        template: t.id,
      });
      const files = generator.generateFiles();
      setInspectFiles(files);
      setInspectingTemplate(t);
    } catch {
      setInspectFiles([]);
      setInspectingTemplate(t);
    }
  };

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.framework.toLowerCase().includes(search.toLowerCase()) ||
      t.language.toLowerCase().includes(search.toLowerCase()) ||
      t.features.some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "all" || t.category === category;
    const matchesLang = !selectedLang || t.language === selectedLang;
    return matchesSearch && matchesCategory && matchesLang;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Production Template Catalog
            </h1>
            <Badge variant="outline" className="text-[10px]">
              {templates.length} Ready-to-Use Templates
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-2xl">
            Browse and inspect enterprise boilerplates configured with Docker, Kubernetes, CI/CD, and metrics
          </p>
        </div>

        <Link href="/create">
          <Button size="sm" className="gap-1.5 h-8 text-xs shadow-xs">
            <Rocket className="h-3.5 w-3.5" />
            Create Custom Service
          </Button>
        </Link>
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
              className="gap-1.5 text-xs h-8"
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
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search language, framework, features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Language Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          Language:
        </span>
        <Button
          variant={!selectedLang ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setSelectedLang(null)}
          className="text-xs h-7 px-2.5"
        >
          All
        </Button>
        {languages.map((lang) => (
          <Button
            key={lang}
            variant={selectedLang === lang ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedLang(selectedLang === lang ? null : lang)}
            className="text-xs h-7 px-2.5"
          >
            {lang}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-sm font-semibold">No matching templates found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search keywords or clearing your filters
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSelectedLang(null);
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
              className="group flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-sm"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                    {React.createElement(t.icon, { className: "w-5 h-5" })}
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
                    className="flex-1 text-xs h-7 gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Inspect Files
                  </Button>
                  <Link href={`/create?template=${t.id}`} className="flex-1">
                    <Button size="sm" className="w-full text-xs h-7 gap-1">
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-5">
          {inspectingTemplate && (
            <>
              <DialogHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {React.createElement(inspectingTemplate.icon, { className: "w-5 h-5 text-primary" })}
                  <DialogTitle className="text-base font-bold">
                    {inspectingTemplate.name} Architecture
                  </DialogTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {inspectingTemplate.framework}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  {inspectingTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Included Architecture Files ({inspectFiles.length})
                  </p>
                  <div className="space-y-1.5">
                    {inspectFiles.map((file, idx) => (
                      <div key={idx} className="border rounded-md overflow-hidden">
                        <div className="bg-muted/50 px-3 py-1.5 text-xs font-mono flex items-center justify-between border-b">
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <FileCode className="h-3.5 w-3.5 text-primary" />
                            {file.path}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {file.content.split("\n").length} lines
                          </span>
                        </div>
                        <pre className="p-2.5 text-[11px] font-mono bg-neutral-950 text-neutral-200 max-h-36 overflow-y-auto">
                          {file.content.slice(0, 600)}
                          {file.content.length > 600 && "\n..."}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  Ready to configure and generate this service?
                </span>
                <Link href={`/create?template=${inspectingTemplate.id}`}>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Rocket className="h-3.5 w-3.5" />
                    Launch Generator
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
