"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";
import { Search, Filter, ArrowRight } from "lucide-react";
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
import { templates, type Template } from "@/lib/data";

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
    label: "Tools",
    count: templates.filter((t) => t.category === "tools").length,
  },
];

const languages = [...new Set(templates.map((t) => t.language))];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.framework.toLowerCase().includes(search.toLowerCase()) ||
      t.language.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    const matchesLang = !selectedLang || t.language === selectedLang;
    return matchesSearch && matchesCategory && matchesLang;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Compact Header */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Templates
        </h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-2xl">
          Browse all available service templates with production-ready code
        </p>
      </div>

      {/* Compact Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.id)}
              className="gap-1 text-xs h-7"
            >
              {cat.label}
              <Badge
                variant={category === cat.id ? "secondary" : "outline"}
                className="ml-1 text-[9px] h-4 min-w-4 justify-center"
              >
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Compact Language filter pills */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
        <Button
          variant={!selectedLang ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setSelectedLang(null)}
          className="text-xs h-7"
        >
          All
        </Button>
        {languages.map((lang) => (
          <Button
            key={lang}
            variant={selectedLang === lang ? "secondary" : "ghost"}
            size="sm"
            onClick={() =>
              setSelectedLang(selectedLang === lang ? null : lang)
            }
            className="text-xs h-7"
          >
            {lang}
          </Button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-sm font-semibold mb-1">No templates found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 text-xs h-8"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSelectedLang(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Link href={`/create?template=${template.id}`}>
      <Card className="group h-full cursor-pointer transition-all hover:border-primary/50">
        <CardHeader className="pb-2 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl">{React.createElement(template.icon, { className: "w-5 h-5" })}</div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                {template.language}
              </Badge>
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                {template.framework}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-sm group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-2 mt-1">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 p-3">
          <div className="flex flex-wrap gap-1 mb-2">
            {template.features.slice(0, 3).map((f) => (
              <Badge
                key={f}
                variant="outline"
                className="text-[9px] font-normal px-1 py-0"
              >
                {f}
              </Badge>
            ))}
          </div>
          <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Use this template
            <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
