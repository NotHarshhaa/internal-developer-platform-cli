"use client";

import React from "react";
import { Cloud, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CloudBreakdownProps {
  awsCost: number;
  gcpCost: number;
  azureCost: number;
  billingPeriod: "monthly" | "annual";
  computeCost: number;
  clusterManagementFee: number;
  databaseTier: string;
  dbCost: number;
  redisCost: number;
  egressGb: number;
  networkCost: number;
}

export function CloudBreakdown({
  awsCost,
  gcpCost,
  azureCost,
  billingPeriod,
  computeCost,
  clusterManagementFee,
  databaseTier,
  dbCost,
  redisCost,
  egressGb,
  networkCost,
}: CloudBreakdownProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border/80">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cloud className="h-4 w-4 text-sky-500" />
            Cloud Provider Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2.5">
          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Amazon Web Services</span>
              <Badge variant="outline" className="text-[9px]">EKS</Badge>
            </div>
            <span className="font-bold text-sm text-foreground">
              ${awsCost.toLocaleString()} / {billingPeriod === "annual" ? "yr" : "mo"}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Google Cloud Platform</span>
              <Badge variant="outline" className="text-[9px]">GKE</Badge>
            </div>
            <span className="font-bold text-sm text-foreground">
              ${gcpCost.toLocaleString()} / {billingPeriod === "annual" ? "yr" : "mo"}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Microsoft Azure</span>
              <Badge variant="outline" className="text-[9px]">AKS</Badge>
            </div>
            <span className="font-bold text-sm text-foreground">
              ${azureCost.toLocaleString()} / {billingPeriod === "annual" ? "yr" : "mo"}
            </span>
          </div>

          <Separator />

          {/* Line items breakdown */}
          <div className="space-y-1.5 text-xs">
            <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
              Cost Breakdown ({billingPeriod})
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Kubernetes Compute</span>
              <span className="font-mono font-medium">
                ${(billingPeriod === "annual" ? Math.round(computeCost * 12) : Math.round(computeCost)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cluster Management Fee</span>
              <span className="font-mono font-medium">
                ${(billingPeriod === "annual" ? clusterManagementFee * 12 : clusterManagementFee).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Database ({databaseTier})</span>
              <span className="font-mono font-medium">
                ${(billingPeriod === "annual" ? dbCost * 12 : dbCost).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Redis Cache</span>
              <span className="font-mono font-medium">
                ${(billingPeriod === "annual" ? redisCost * 12 : redisCost).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Network Egress ({egressGb} GB)</span>
              <span className="font-mono font-medium">
                ${(billingPeriod === "annual" ? Math.round(networkCost * 12) : Math.round(networkCost)).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FinOps Advice */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            IDP Right-Sizing Advice
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Applying Horizontal Pod Autoscaling (HPA) with 50% CPU threshold will allow the cluster to scale down during low-traffic windows, saving an additional 20-30%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
