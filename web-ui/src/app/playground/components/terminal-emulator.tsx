"use client";

import React from "react";
import { Terminal, Copy, CheckCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type CommandPreset } from "./preset-card";

interface TerminalEmulatorProps {
  selectedPreset: CommandPreset;
  copied: boolean;
  running: boolean;
  terminalLines: string[];
  onCopyCommand: (cmd: string) => void;
  onRunCommand: (output: string[]) => void;
}

export function TerminalEmulator({
  selectedPreset,
  copied,
  running,
  terminalLines,
  onCopyCommand,
  onRunCommand,
}: TerminalEmulatorProps) {
  return (
    <div className="space-y-3">
      <Card className="border-border/80">
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              Active CLI Command
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyCommand(selectedPreset.command)}
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                {copied ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                size="sm"
                onClick={() => onRunCommand(selectedPreset.simulatedOutput)}
                disabled={running}
                className="h-7 text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                <Play className="h-3 w-3" />
                {running ? "Executing..." : "Simulate Run"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="rounded-lg bg-muted/40 p-2.5 font-mono text-xs text-foreground border overflow-x-auto select-all">
            <span className="text-primary font-bold">$ </span>
            {selectedPreset.command}
          </div>
        </CardContent>
      </Card>

      {/* Live Terminal Output Emulator */}
      <Card className="overflow-hidden border-neutral-800 shadow-xl bg-neutral-950 text-neutral-100">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[11px] font-mono text-neutral-400">
              idp-terminal — bash
            </span>
          </div>
          <Badge variant="outline" className="text-[9px] font-mono text-neutral-400 border-neutral-700">
            Rich TUI
          </Badge>
        </div>

        <div className="p-4 font-mono text-xs min-h-[220px] max-h-[300px] overflow-y-auto space-y-1.5 leading-relaxed">
          {terminalLines.map((line, idx) => (
            <div
              key={idx}
              className="text-neutral-200"
              dangerouslySetInnerHTML={{
                __html: line
                  .replace(/\x1b\[32m/g, '<span class="text-emerald-400 font-semibold">')
                  .replace(/\x1b\[36m/g, '<span class="text-cyan-400">')
                  .replace(/\x1b\[33m/g, '<span class="text-amber-400">')
                  .replace(/\x1b\[34m/g, '<span class="text-sky-400 font-medium">')
                  .replace(/\x1b\[35m/g, '<span class="text-purple-400 font-medium">')
                  .replace(/\x1b\[1;32m/g, '<span class="text-emerald-300 font-bold">')
                  .replace(/\x1b\[0m/g, "</span>"),
              }}
            />
          ))}
          {running && (
            <div className="flex items-center gap-2 text-neutral-400 animate-pulse">
              <span className="inline-block h-3.5 w-2 bg-emerald-400" />
              <span>Executing idp pipeline...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
