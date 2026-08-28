"use client";

import { useState, useMemo } from "react";
import React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Rocket,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { templates, type Template, defaultConfig } from "@/lib/data";
import { getTemplate } from "@/lib/generators/registry";
import { TemplateCard } from "./components/template-card";
import { ArchitectureModal } from "./components/architecture-modal";

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
            <TemplateCard key={t.id} template={t} onInspect={handleInspect} />
          ))}
        </div>
      )}

      {/* Architecture & Files Preview Dialog */}
      <ArchitectureModal
        template={inspectingTemplate}
        files={inspectFiles}
        activeFile={activeInspectFile}
        setActiveFile={setActiveInspectFile}
        onClose={() => setInspectingTemplate(null)}
      />
    </div>
  );
}
