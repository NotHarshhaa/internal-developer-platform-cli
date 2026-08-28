"use client";

import React from "react";
import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Template, type ServiceConfig } from "@/lib/data";

interface BlueprintSidebarProps {
  config: ServiceConfig;
  selectedTemplate?: Template;
}

export function BlueprintSidebar({ config, selectedTemplate }: BlueprintSidebarProps) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-20 space-y-3">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="p-3.5 pb-2 bg-muted/20 border-b">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Live Architecture Blueprint
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 space-y-3">
            {selectedTemplate ? (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {React.createElement(selectedTemplate.icon, { className: "h-4 w-4" })}
                </div>
                <div>
                  <p className="text-xs font-bold">{selectedTemplate.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedTemplate.language} • {selectedTemplate.framework}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No template selected</p>
            )}

            <Separator />

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Name:</span>
                <span className="font-mono font-medium">{config.name || "unnamed"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CI/CD:</span>
                <span className="font-medium">{config.ci}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deploy Target:</span>
                <span className="font-medium">{config.deploy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GitOps:</span>
                <span className="font-medium">{config.gitops}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono font-medium">{config.port}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Active Capabilities
              </p>
              <div className="flex flex-wrap gap-1">
                {config.docker && <Badge variant="secondary" className="text-[8px] px-1 py-0">Docker</Badge>}
                {config.k8s && <Badge variant="secondary" className="text-[8px] px-1 py-0">K8s</Badge>}
                {config.monitoring && <Badge variant="secondary" className="text-[8px] px-1 py-0">Metrics</Badge>}
                {config.docs && <Badge variant="secondary" className="text-[8px] px-1 py-0">Docs</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
