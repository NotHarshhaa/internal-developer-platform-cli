"use client";

import React from "react";
import {
  Rocket,
  Terminal,
  Copy,
  CheckCheck,
  FileCode,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Template, type ServiceConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StepReviewProps {
  config: ServiceConfig;
  template?: Template;
  generating: boolean;
  generationStep: string;
  generated: boolean;
  generatedFiles: { path: string; content: string }[];
  activeFile: string;
  setActiveFile: (p: string) => void;
  onGenerate: () => void;
  cliCommand: string;
  onCopyCli: () => void;
  copiedCli: boolean;
}

export function StepReviewAndGenerate({
  config,
  template,
  generating,
  generationStep,
  generated,
  generatedFiles,
  activeFile,
  setActiveFile,
  onGenerate,
  cliCommand,
  onCopyCli,
  copiedCli,
}: StepReviewProps) {
  const currentFile = generatedFiles.find((f) => f.path === activeFile) || generatedFiles[0];

  return (
    <div className="space-y-5">
      {/* Generated Summary Card */}
      <Card className="border-border/80">
        <CardHeader className="p-4 pb-2 bg-muted/20 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {template?.icon ? (
                React.createElement(template.icon, { className: "h-5 w-5 text-primary" })
              ) : (
                <Rocket className="h-5 w-5 text-primary" />
              )}
              <div>
                <CardTitle className="text-sm font-bold">{config.name}</CardTitle>
                <CardDescription className="text-xs">
                  {template?.name || config.template} • {template?.framework}
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono">
              {generatedFiles.length} Source Files Ready
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* CLI Reproduce Command */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Equivalent IDP CLI Command
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyCli}
                className="h-6 text-[10px] gap-1"
              >
                {copiedCli ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copiedCli ? "Copied" : "Copy Command"}
              </Button>
            </div>
            <div className="rounded-md bg-neutral-950 p-2 font-mono text-[11px] text-green-400 border border-neutral-800 select-all overflow-x-auto">
              $ {cliCommand}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Code Explorer */}
      {generatedFiles.length > 0 && (
        <Card className="overflow-hidden border-border/80">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-primary" />
              Live Generated Code Explorer
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {currentFile?.path} ({currentFile?.content.split("\n").length} lines)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[300px] max-h-[420px]">
            {/* File Tree */}
            <div className="border-r bg-muted/10 p-2 overflow-y-auto space-y-0.5 text-xs">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-1">
                Project Files
              </p>
              {generatedFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFile(file.path)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[11px] font-mono transition-colors cursor-pointer truncate",
                    activeFile === file.path
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200 overflow-auto">
              <pre className="text-[11px] leading-relaxed">
                {currentFile?.content}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {/* Generating Progress State */}
      {generating && (
        <Card className="border-primary/30 bg-primary/5 p-4 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{generationStep || "Packaging microservice assets..."}</span>
          </div>
        </Card>
      )}

      {/* Success Download Card */}
      {generated && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Service Ready & Downloaded!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Saved as <code className="font-mono font-semibold">{config.name}.zip</code> containing {generatedFiles.length} microservice files.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Quick Start in 3 Steps:</p>
              <div className="rounded-md bg-neutral-950 p-3 font-mono text-[11px] text-green-400 space-y-1 border border-neutral-800">
                <div>1. unzip {config.name}.zip</div>
                <div>2. cd {config.name}</div>
                <div>3. docker compose up --build</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
