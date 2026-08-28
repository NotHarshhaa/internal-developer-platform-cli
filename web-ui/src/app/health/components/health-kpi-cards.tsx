"use client";

import React from "react";
import { CheckCircle2, Zap, Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HealthKpiProps {
  healthyCount: number;
  totalServices: number;
  avgLatency: string;
  openIncidentsCount: number;
}

export function HealthKpiCards({
  healthyCount,
  totalServices,
  avgLatency,
  openIncidentsCount,
}: HealthKpiProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Operational Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {healthyCount}/{totalServices}
            </span>
            <span className="text-[10px] text-muted-foreground">Services Healthy</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Average Latency</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold">{avgLatency} ms</span>
            <span className="text-[10px] text-emerald-500">p95: 48ms</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">System Uptime</span>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold">99.96%</span>
            <span className="text-[10px] text-muted-foreground">Last 30 days</span>
          </div>
        </CardContent>
      </Card>

      <Card className={openIncidentsCount > 0 ? "border-amber-500/30 bg-amber-500/5" : "border-border/70"}>
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Active Incidents</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
              {openIncidentsCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Open alerts</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
