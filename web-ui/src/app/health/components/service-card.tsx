"use client";

import React from "react";
import { Server, Database, Radio, Globe, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface ServiceHealth {
  id: string;
  name: string;
  type: "api" | "database" | "queue" | "gateway";
  status: "healthy" | "degraded" | "unhealthy";
  uptime: string;
  latencyMs: number;
  cpuPercent: number;
  memoryMb: number;
  endpoint: string;
  lastChecked: string;
  details?: {
    version: string;
    connections: number;
    threadPool: string;
    p95Latency: string;
  };
}

interface ServiceCardProps {
  service: ServiceHealth;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function ServiceCard({ service, isExpanded, onToggleExpand }: ServiceCardProps) {
  return (
    <Card className="hover:border-primary/40 transition-colors border-border/80 flex flex-col justify-between">
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {service.type === "database" ? (
              <Database className="h-4 w-4 text-sky-500 shrink-0" />
            ) : service.type === "queue" ? (
              <Radio className="h-4 w-4 text-purple-500 shrink-0" />
            ) : service.type === "gateway" ? (
              <Globe className="h-4 w-4 text-indigo-500 shrink-0" />
            ) : (
              <Server className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
            <CardTitle className="text-xs font-semibold">{service.name}</CardTitle>
          </div>
          <Badge
            variant={service.status === "healthy" ? "default" : "destructive"}
            className="text-[9px] px-1.5 py-0 capitalize"
          >
            {service.status}
          </Badge>
        </div>
        <CardDescription className="font-mono text-[10px] text-muted-foreground mt-1">
          {service.endpoint}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3.5 pt-0 space-y-2.5">
        <Separator />
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div>
            <span className="text-muted-foreground block">Latency</span>
            <span className="font-semibold text-foreground">{service.latencyMs} ms</span>
          </div>
          <div>
            <span className="text-muted-foreground block">CPU Usage</span>
            <span className="font-semibold text-foreground">{service.cpuPercent}%</span>
          </div>
          <div>
            <span className="text-muted-foreground block">RAM Usage</span>
            <span className="font-semibold text-foreground">{service.memoryMb} MB</span>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && service.details && (
          <div className="rounded-md bg-muted/40 p-2 text-[10px] space-y-1 font-mono border animate-in fade-in-50">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Runtime:</span>
              <span>{service.details.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Conn:</span>
              <span>{service.details.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thread Model:</span>
              <span>{service.details.threadPool}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">p95 Latency:</span>
              <span>{service.details.p95Latency}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Uptime {service.uptime}
          </span>
          <button
            onClick={onToggleExpand}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            {isExpanded ? "Less ▲" : "Telemetry ▼"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
