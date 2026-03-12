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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Templates
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Browse all available service templates. Each template includes
          production-ready code, tests, Docker config, and CI/CD pipelines.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.id)}
              className="gap-1.5"
            >
              {cat.label}
              <Badge
                variant={category === cat.id ? "secondary" : "outline"}
                className="ml-1 text-[10px] h-5 min-w-5 justify-center"
              >
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Language filter pills */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground mr-1" />
        <Button
          variant={!selectedLang ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setSelectedLang(null)}
        >
          All Languages
        </Button>
        {languages.map((lang) => (
          <Button
            key={lang}
            variant={selectedLang === lang ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              setSelectedLang(selectedLang === lang ? null : lang)
            }
          >
            {lang}
          </Button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your search or filters to find what you&apos;re
            looking for.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">{React.createElement(template.icon, { className: "w-8 h-8" })}</div>
            <div className="flex gap-1.5">
              <Badge variant="secondary" className="text-[10px]">
                {template.language}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {template.framework}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {template.features.map((f) => (
              <Badge
                key={f}
                variant="outline"
                className="text-[10px] font-normal"
              >
                {f}
              </Badge>
            ))}
          </div>
          <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Use this template
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
