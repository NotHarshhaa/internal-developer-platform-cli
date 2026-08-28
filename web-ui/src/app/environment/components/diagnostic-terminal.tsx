"use client";

import React from "react";
import { Terminal, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DiagnosticTerminalProps {
  environment: string;
  running: boolean;
  onRunDiagnostics: () => void;
  logs: string[] | null;
}

export function DiagnosticTerminal({
  environment,
  running,
  onRunDiagnostics,
  logs,
}: DiagnosticTerminalProps) {
  return (
    <Card className="border-border/80">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            Cluster Diagnostic Runner
          </CardTitle>
          <Button
            size="sm"
            onClick={onRunDiagnostics}
            disabled={running}
            className="h-7 text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="h-3 w-3" />
            {running ? "Running Check..." : "Run Diagnostics"}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Execute live health and configuration audit across the {environment} cluster
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[10px] min-h-[160px] max-h-[190px] overflow-y-auto space-y-1 text-neutral-200">
          {logs && logs.length > 0 ? (
            logs.map((line, idx) => (
              <div
                key={idx}
                className="leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: line
                    .replace(/\x1b\[32m/g, '<span class="text-emerald-400 font-semibold">')
                    .replace(/\x1b\[36m/g, '<span class="text-cyan-400">')
                    .replace(/\x1b\[1;32m/g, '<span class="text-emerald-300 font-bold">')
                    .replace(/\x1b\[0m/g, "</span>"),
                }}
              />
            ))
          ) : (
            <div className="text-neutral-500 italic py-6 text-center">
              Click &quot;Run Diagnostics&quot; to inspect network policies, DNS, ingress, and cluster nodes.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
