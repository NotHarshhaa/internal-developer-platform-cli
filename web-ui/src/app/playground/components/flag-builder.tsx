"use client";

import React from "react";
import { Sliders, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface FlagBuilderProps {
  builderService: string;
  setBuilderService: (s: string) => void;
  builderTemplate: string;
  setBuilderTemplate: (t: string) => void;
  builderCi: string;
  setBuilderCi: (ci: string) => void;
  builderDeploy: string;
  setBuilderDeploy: (d: string) => void;
  builderDocker: boolean;
  setBuilderDocker: (d: boolean) => void;
  builderK8s: boolean;
  setBuilderK8s: (k: boolean) => void;
  builderMonitoring: boolean;
  setBuilderMonitoring: (m: boolean) => void;
  customBuiltCommand: string;
  onCopyCommand: (cmd: string) => void;
}

export function FlagBuilder({
  builderService,
  setBuilderService,
  builderTemplate,
  setBuilderTemplate,
  builderCi,
  setBuilderCi,
  builderDocker,
  setBuilderDocker,
  builderK8s,
  setBuilderK8s,
  builderMonitoring,
  setBuilderMonitoring,
  customBuiltCommand,
  onCopyCommand,
}: FlagBuilderProps) {
  return (
    <Card className="border-border/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-primary" />
          Interactive Flag Builder
        </CardTitle>
        <CardDescription className="text-[11px]">
          Tweak flags to generate custom CLI commands
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Service Name</Label>
          <Input
            value={builderService}
            onChange={(e) => setBuilderService(e.target.value)}
            className="h-7.5 text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Template</Label>
          <select
            value={builderTemplate}
            onChange={(e) => setBuilderTemplate(e.target.value)}
            className="w-full h-7.5 rounded-md border border-input bg-background px-2 text-xs font-mono"
          >
            <option value="python-api">python-api (FastAPI)</option>
            <option value="node-api">node-api (Express)</option>
            <option value="go-api">go-api (Gin)</option>
            <option value="rust-api">rust-api (Axum)</option>
            <option value="nextjs-fullstack">nextjs-fullstack</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">CI/CD Provider</Label>
          <select
            value={builderCi}
            onChange={(e) => setBuilderCi(e.target.value)}
            className="w-full h-7.5 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="github-actions">github-actions</option>
            <option value="gitlab-ci">gitlab-ci</option>
            <option value="jenkins">jenkins</option>
          </select>
        </div>

        <Separator />

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>--docker</span>
            <Switch checked={builderDocker} onCheckedChange={setBuilderDocker} className="scale-75" />
          </div>
          <div className="flex items-center justify-between">
            <span>--k8s</span>
            <Switch checked={builderK8s} onCheckedChange={setBuilderK8s} className="scale-75" />
          </div>
          <div className="flex items-center justify-between">
            <span>--monitoring</span>
            <Switch checked={builderMonitoring} onCheckedChange={setBuilderMonitoring} className="scale-75" />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onCopyCommand(customBuiltCommand)}
          className="w-full text-xs h-7.5 gap-1.5 mt-2 cursor-pointer"
        >
          <Copy className="h-3 w-3" />
          Copy Built Command
        </Button>
      </CardContent>
    </Card>
  );
}
