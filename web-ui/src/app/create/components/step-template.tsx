"use client";

import { useState } from "react";
import React from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { templates } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StepTemplateProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function StepTemplate({ selected, onSelect }: StepTemplateProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) => {
    const matchesCategory = filter === "all" || t.category === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.framework.toLowerCase().includes(search.toLowerCase()) ||
      t.language.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "backend", "frontend", "tools"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize h-7 text-xs px-3"
            >
              {f === "all" ? "All Boilerplates (18)" : f}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search FastAPI, Next.js, Go..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7.5 text-xs pl-8"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const isSelected = selected === t.id;
          return (
            <Card
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden",
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
                  : "hover:shadow-xs"
              )}
            >
              <CardHeader className="p-3.5 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground group-hover:scale-105 transition-transform">
                    {React.createElement(t.icon, { className: "h-5 w-5 text-primary" })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      {t.language}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                      {t.framework}
                    </Badge>
                    {isSelected && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                </div>

                <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors">
                  {t.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                  {t.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3.5 pt-0 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {t.features.slice(0, 3).map((f) => (
                    <Badge key={f} variant="outline" className="text-[8px] px-1 py-0 font-normal">
                      {f}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-[10px]">
                  <span className="text-muted-foreground capitalize">{t.category} component</span>
                  <span className={cn("font-medium", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary")}>
                    {isSelected ? "Selected ✓" : "Click to select &rarr;"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
