"use client";

import React from "react";
import Link from "next/link";
import { Eye, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Template } from "@/lib/data";

interface TemplateCardProps {
  template: Template;
  onInspect: (t: Template) => void;
}

export function TemplateCard({ template: t, onInspect }: TemplateCardProps) {
  return (
    <Card className="group flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md border-border/80 relative overflow-hidden">
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
            onClick={() => onInspect(t)}
            className="flex-1 text-xs h-7.5 gap-1.5 hover:bg-accent cursor-pointer"
          >
            <Eye className="h-3 w-3" />
            Inspect Files
          </Button>
          <Link href={`/create?template=${t.id}`} className="flex-1">
            <Button size="sm" className="w-full text-xs h-7.5 gap-1.5 shadow-xs cursor-pointer">
              <Rocket className="h-3 w-3" />
              Scaffold
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
