"use client";

import React from "react";
import { DollarSign, Cpu, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CostKpisProps {
  displayTotal: number;
  billingPeriod: "monthly" | "annual";
  totalPods: number;
  serviceCount: number;
  replicasPerService: number;
  totalCores: number;
  totalMemoryGb: number;
  useSpotInstances: boolean;
}

export function CostKpiCards({
  displayTotal,
  billingPeriod,
  totalPods,
  serviceCount,
  replicasPerService,
  totalCores,
  totalMemoryGb,
  useSpotInstances,
}: CostKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {billingPeriod === "annual" ? "Annual Projected Spend" : "Estimated Monthly Spend"}
            </span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-primary">
              ${displayTotal.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              / {billingPeriod === "annual" ? "year" : "month"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Baseline compute &bull; Databases &bull; Control plane &bull; Networking
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Cluster Pod Density</span>
            <Cpu className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalPods} Pods</span>
            <span className="text-xs text-muted-foreground">
              ({serviceCount} services &times; {replicasPerService} repl)
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Total: {totalCores.toFixed(1)} vCPU &bull; {totalMemoryGb} GB RAM
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">FinOps Savings</span>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {useSpotInstances ? "55% Saved" : "Up to 55%"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {useSpotInstances ? "Spot pricing active" : "Enable spot instances below to save"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
