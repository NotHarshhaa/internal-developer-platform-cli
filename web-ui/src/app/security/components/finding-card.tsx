"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, FileCode, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SecurityFinding {
  id: string;
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "Container" | "Kubernetes" | "Secrets" | "Dependencies";
  file: string;
  description: string;
  remediation: string;
  patchSnippet: string;
  status: "passed" | "warning" | "failed";
}

interface FindingCardProps {
  finding: SecurityFinding;
  copiedPatchId: string | null;
  onCopyPatch: (id: string, snippet: string) => void;
}

export function FindingCard({ finding, copiedPatchId, onCopyPatch }: FindingCardProps) {
  return (
    <div
      className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-colors ${
        finding.status === "passed"
          ? "bg-card border-border/80"
          : "bg-amber-500/5 border-amber-500/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {finding.status === "passed" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span className="font-semibold text-foreground">{finding.rule}</span>
          <Badge variant="outline" className="text-[9px] font-mono">
            {finding.id}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[9px]">
            {finding.category}
          </Badge>
          <Badge
            variant={finding.severity === "critical" ? "destructive" : "outline"}
            className="text-[9px] capitalize"
          >
            {finding.severity}
          </Badge>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
        {finding.description}
      </p>

      {/* Remediation Patch Preview */}
      <div className="pl-6 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 font-mono text-muted-foreground">
            <FileCode className="h-3 w-3" />
            <span>Target: {finding.file}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopyPatch(finding.id, finding.patchSnippet)}
            className="h-6 text-[10px] gap-1 text-primary hover:bg-primary/10 cursor-pointer"
          >
            {copiedPatchId === finding.id ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copiedPatchId === finding.id ? "Patch Copied" : "Copy Remediation Patch"}
          </Button>
        </div>

        <pre className="rounded bg-neutral-950 p-2 text-[10px] font-mono text-green-400 border border-neutral-800 overflow-x-auto">
          {finding.patchSnippet}
        </pre>
      </div>
    </div>
  );
}
