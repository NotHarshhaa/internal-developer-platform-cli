"use client";

import React from "react";
import { Globe, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomProbeProps {
  customMethod: string;
  setCustomMethod: (m: string) => void;
  customUrl: string;
  setCustomUrl: (u: string) => void;
  onRunProbe: () => void;
  result: {
    status?: number;
    latency?: number;
    body?: string;
    loading?: boolean;
  } | null;
}

export function CustomProbe({
  customMethod,
  setCustomMethod,
  customUrl,
  setCustomUrl,
  onRunProbe,
  result,
}: CustomProbeProps) {
  return (
    <Card className="border-border/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Custom Endpoint Probe Simulator
        </CardTitle>
        <CardDescription className="text-xs">
          Send an instant test HTTP probe to any internal or external service endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-1 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={customMethod}
            onChange={(e) => setCustomMethod(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-bold font-mono"
          >
            <option value="GET">GET</option>
            <option value="HEAD">HEAD</option>
            <option value="POST">POST</option>
          </select>
          <Input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://your-service.internal/healthz"
            className="h-8 text-xs font-mono flex-1"
          />
          <Button
            size="sm"
            onClick={onRunProbe}
            disabled={result?.loading}
            className="gap-1.5 h-8 text-xs shrink-0 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            {result?.loading ? "Probing..." : "Send Probe"}
          </Button>
        </div>

        {result && (
          <div className="rounded-lg border bg-neutral-950 p-3 text-xs font-mono space-y-1.5 text-neutral-200">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-1">
              <span>Probe Response Diagnostics</span>
              <span>Latency: {result.latency} ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Status:</span>
              <Badge
                variant={
                  result.status && result.status < 400
                    ? "default"
                    : "destructive"
                }
                className="text-[10px]"
              >
                {result.status ? `HTTP ${result.status}` : "Network Error"}
              </Badge>
            </div>
            {result.body && (
              <div className="text-[11px] text-green-400 bg-neutral-900/80 p-2 rounded max-h-24 overflow-y-auto">
                {result.body}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
