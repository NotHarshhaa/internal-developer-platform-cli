"use client";

import React from "react";
import {
  Sparkles,
  Lightbulb,
  Cpu,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  type ServiceConfig,
  type ConfigPreset,
  templates,
  ciProviders,
  deployTargets,
  gitOpsTools,
  configPresets,
} from "@/lib/data";
import { BlueprintSidebar } from "./blueprint-sidebar";
import { cn } from "@/lib/utils";

interface StepConfigureProps {
  config: ServiceConfig;
  setConfig: (c: ServiceConfig) => void;
  nameError: string;
  setNameError: (e: string) => void;
  validateName: (n: string) => string;
  applyPreset: (preset: ConfigPreset) => void;
  onGenerateSuggestions: () => void;
  showSuggestions: boolean;
  nameSuggestions: string[];
  onSelectSuggestion: (name: string) => void;
}

export function StepConfigure({
  config,
  setConfig,
  nameError,
  setNameError,
  validateName,
  applyPreset,
  onGenerateSuggestions,
  showSuggestions,
  nameSuggestions,
  onSelectSuggestion,
}: StepConfigureProps) {
  const selectedTemplate = templates.find((t) => t.id === config.template);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left Column: Form Controls */}
      <div className="space-y-5">
        {/* Service Identity */}
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center justify-between">
              <span>Service Identity</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateSuggestions}
                className="h-6 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Lightbulb className="h-3 w-3" />
                Smart Name Generator
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div className="relative">
              <Input
                id="name"
                placeholder="e.g. order-processing-api"
                value={config.name}
                onChange={(e) => {
                  setConfig({ ...config, name: e.target.value });
                  if (nameError) setNameError(validateName(e.target.value));
                }}
                className={cn("h-8.5 text-xs font-medium", nameError && "border-destructive")}
              />
              {showSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-xl border-border/80">
                  <CardContent className="p-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground px-2 py-0.5 font-medium">
                      Select a suggested service name:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {nameSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectSuggestion(s)}
                          className="px-2 py-1 text-xs text-left rounded-md hover:bg-primary/10 hover:text-primary transition-colors font-mono"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {nameError && <p className="text-[10px] text-destructive">{nameError}</p>}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="port" className="text-[10px] text-muted-foreground">
                  Service Port
                </Label>
                <Input
                  id="port"
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 8080 })}
                  className="h-7.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="outputDir" className="text-[10px] text-muted-foreground">
                  Output Directory
                </Label>
                <Input
                  id="outputDir"
                  value={config.outputDir}
                  onChange={(e) => setConfig({ ...config, outputDir: e.target.value })}
                  className="h-7.5 text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1-Click Architecture Presets */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Architecture Presets
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {configPresets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center h-auto py-2.5 text-center hover:border-primary/50"
              >
                <span className="font-semibold text-xs">{preset.name}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* CI/CD & Deploy Target Selection */}
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">CI/CD & Deployment Target</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-4">
            {/* CI Provider */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">CI/CD Automation</Label>
              <div className="grid grid-cols-3 gap-2">
                {ciProviders.map((ci) => (
                  <Button
                    key={ci.id}
                    type="button"
                    variant={config.ci === ci.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig({ ...config, ci: ci.id })}
                    className="flex flex-col items-center h-auto py-2"
                  >
                    <span className="font-medium text-xs">{ci.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Deploy & GitOps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Deployment Target</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {deployTargets.map((dt) => (
                    <Button
                      key={dt.id}
                      type="button"
                      variant={config.deploy === dt.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, deploy: dt.id })}
                      className="h-8 text-xs font-medium"
                    >
                      {dt.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">GitOps Operator</Label>
                <div className="grid grid-cols-3 gap-1">
                  {gitOpsTools.map((gt) => (
                    <Button
                      key={gt.id}
                      type="button"
                      variant={config.gitops === gt.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, gitops: gt.id })}
                      className="h-8 text-xs font-medium"
                    >
                      {gt.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kubernetes Resource Limits */}
        {config.k8s && (
          <Card className="border-border/80">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Kubernetes Pod Resource Allocations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="replicas" className="text-[10px] text-muted-foreground">Replicas</Label>
                  <Input
                    id="replicas"
                    type="number"
                    min="1"
                    max="10"
                    value={config.replicas}
                    onChange={(e) => setConfig({ ...config, replicas: parseInt(e.target.value) || 1 })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpuReq" className="text-[10px] text-muted-foreground">CPU Request</Label>
                  <Input
                    id="cpuReq"
                    value={config.resources.cpuRequest}
                    onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuRequest: e.target.value } })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpuLim" className="text-[10px] text-muted-foreground">CPU Limit</Label>
                  <Input
                    id="cpuLim"
                    value={config.resources.cpuLimit}
                    onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuLimit: e.target.value } })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="memLim" className="text-[10px] text-muted-foreground">Memory Limit</Label>
                  <Input
                    id="memLim"
                    value={config.resources.memoryLimit}
                    onChange={(e) => setConfig({ ...config, resources: { ...config.resources, memoryLimit: e.target.value } })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables */}
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold">Environment Variables & Config</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig({ ...config, envVars: [...config.envVars, { key: "", value: "" }] })}
                className="gap-1 h-6 text-[10px]"
              >
                <Plus className="h-3 w-3" />
                Add Variable
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {config.envVars.length > 0 ? (
              <div className="space-y-1.5">
                {config.envVars.map((env, idx) => (
                  <div key={idx} className="flex gap-1.5">
                    <Input
                      placeholder="KEY (e.g. REDIS_HOST)"
                      value={env.key}
                      onChange={(e) => {
                        const newVars = [...config.envVars];
                        newVars[idx].key = e.target.value;
                        setConfig({ ...config, envVars: newVars });
                      }}
                      className="h-7.5 font-mono text-[10px]"
                    />
                    <Input
                      placeholder="value"
                      value={env.value}
                      onChange={(e) => {
                        const newVars = [...config.envVars];
                        newVars[idx].value = e.target.value;
                        setConfig({ ...config, envVars: newVars });
                      }}
                      className="h-7.5 font-mono text-[10px]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newVars = config.envVars.filter((_, i) => i !== idx);
                        setConfig({ ...config, envVars: newVars });
                      }}
                      className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">
                No environment variables configured. Default settings will be applied.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feature Switches */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "docker" as const, label: "Docker Multi-Stage", desc: "Optimized non-root container" },
            { key: "k8s" as const, label: "Kubernetes Manifests", desc: "Kustomize overlays & HPA" },
            { key: "monitoring" as const, label: "Prometheus Metrics", desc: "Scrape rules & healthz" },
            { key: "docs" as const, label: "Developer Docs", desc: "Architecture & OpenAPI README" },
          ].map((feat) => (
            <div
              key={feat.key}
              className="flex items-center justify-between rounded-lg border p-3 bg-muted/10"
            >
              <div>
                <p className="text-xs font-semibold">{feat.label}</p>
                <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
              </div>
              <Switch
                checked={config[feat.key]}
                onCheckedChange={(val) => setConfig({ ...config, [feat.key]: val })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Live Architecture Blueprint Sidebar */}
      <BlueprintSidebar config={config} selectedTemplate={selectedTemplate} />
    </div>
  );
}
