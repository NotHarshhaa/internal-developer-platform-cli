"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingDown,
  Cpu,
  HardDrive,
  Database,
  Cloud,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  Server,
  Zap,
  Radio,
  Sliders,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function CostEstimatorPage() {
  const [serviceCount, setServiceCount] = useState(4);
  const [replicasPerService, setReplicasPerService] = useState(2);
  const [cpuCores, setCpuCores] = useState(0.5); // 500m
  const [memoryGb, setMemoryGb] = useState(1); // 1GB
  const [databaseTier, setDatabaseTier] = useState<"none" | "basic" | "ha">("basic");
  const [redisEnabled, setRedisEnabled] = useState(true);
  const [egressGb, setEgressGb] = useState(250);
  const [useSpotInstances, setUseSpotInstances] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  // Total Pods & Sizing
  const totalPods = serviceCount * replicasPerService;
  const totalCores = totalPods * cpuCores;
  const totalMemoryGb = totalPods * memoryGb;

  // Monthly compute calculation
  let computeCost = totalCores * 28 + totalMemoryGb * 3.5;
  if (useSpotInstances) {
    computeCost = computeCost * 0.45; // 55% discount
  }

  // Database Cost
  const dbCost =
    databaseTier === "none" ? 0 : databaseTier === "basic" ? 45 : 190;

  // Cache Cost
  const redisCost = redisEnabled ? 32 : 0;

  // Networking Egress: ~$0.08 per GB
  const networkCost = egressGb * 0.08;

  // EKS / GKE Control plane management fee: $73 / month
  const clusterManagementFee = 73;

  // Total Monthly Cost
  const totalMonthlyCost = Math.round(
    computeCost + dbCost + redisCost + networkCost + clusterManagementFee
  );

  const displayTotal =
    billingPeriod === "annual" ? totalMonthlyCost * 12 : totalMonthlyCost;

  // Cloud comparison
  const awsCost = displayTotal;
  const gcpCost = Math.round(displayTotal * 0.94);
  const azureCost = Math.round(displayTotal * 1.02);

  const handleExportCost = (format: "json" | "csv") => {
    if (format === "json") {
      const costReport = {
        timestamp: new Date().toISOString(),
        parameters: {
          serviceCount,
          replicasPerService,
          totalPods,
          cpuCoresPerPod: cpuCores,
          memoryGbPerPod: memoryGb,
          databaseTier,
          redisEnabled,
          egressGb,
          useSpotInstances,
        },
        estimates: {
          monthlyTotalUsd: totalMonthlyCost,
          annualTotalUsd: totalMonthlyCost * 12,
          breakdown: {
            computeUsd: Math.round(computeCost),
            databaseUsd: dbCost,
            redisUsd: redisCost,
            networkEgressUsd: Math.round(networkCost),
            clusterManagementUsd: clusterManagementFee,
          },
          cloudComparison: {
            awsUsd: awsCost,
            gcpUsd: gcpCost,
            azureUsd: azureCost,
          },
        },
      };
      const blob = new Blob([JSON.stringify(costReport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cloud-cost-estimate-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Cost estimate exported as JSON");
    } else {
      const csv = `Item,Monthly Cost (USD),Annual Cost (USD)\nCompute (Kubernetes),${Math.round(computeCost)},${Math.round(computeCost * 12)}\nControl Plane Fee,${clusterManagementFee},${clusterManagementFee * 12}\nManaged Database,${dbCost},${dbCost * 12}\nRedis Cache,${redisCost},${redisCost * 12}\nNetwork Egress,${Math.round(networkCost)},${Math.round(networkCost * 12)}\nTotal,${totalMonthlyCost},${totalMonthlyCost * 12}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cloud-cost-estimate-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Cost estimate exported as CSV");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Cloud Cost & Resource Estimator
            </h1>
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              FinOps Calculator
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Estimate infrastructure spending across AWS, GCP, and Azure with live spot instance discounts and right-sizing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border bg-muted/30 p-0.5 text-xs">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                billingPeriod === "monthly" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                billingPeriod === "annual" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              Annual
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCost("csv")}
            className="gap-1.5 h-8 text-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => handleExportCost("json")}
            className="gap-1.5 h-8 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Primary KPI Highlights */}
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
              <span className="text-xs text-muted-foreground">({serviceCount} services &times; {replicasPerService} repl)</span>
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

      {/* Interactive Controls & Cost Breakdown */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Interactive Sliders & Inputs */}
        <div className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Service & Pod Sizing Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your application topology to dynamically estimate resource pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              {/* Service Count & Replicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label htmlFor="services" className="font-medium">Number of Microservices</Label>
                    <span className="font-semibold">{serviceCount}</span>
                  </div>
                  <Input
                    id="services"
                    type="range"
                    min="1"
                    max="20"
                    value={serviceCount}
                    onChange={(e) => setServiceCount(parseInt(e.target.value) || 1)}
                    className="h-6 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label htmlFor="replicas" className="font-medium">Replicas per Service</Label>
                    <span className="font-semibold">{replicasPerService}</span>
                  </div>
                  <Input
                    id="replicas"
                    type="range"
                    min="1"
                    max="10"
                    value={replicasPerService}
                    onChange={(e) => setReplicasPerService(parseInt(e.target.value) || 1)}
                    className="h-6 cursor-pointer"
                  />
                </div>
              </div>

              {/* CPU & Memory per Pod */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label htmlFor="cpu" className="font-medium">CPU Cores per Pod</Label>
                    <span className="font-semibold">{cpuCores} vCPU</span>
                  </div>
                  <select
                    id="cpu"
                    value={cpuCores}
                    onChange={(e) => setCpuCores(parseFloat(e.target.value))}
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs font-mono"
                  >
                    <option value="0.25">0.25 vCPU (250m - Lightweight)</option>
                    <option value="0.5">0.5 vCPU (500m - Standard API)</option>
                    <option value="1">1.0 vCPU (1000m - High Traffic)</option>
                    <option value="2">2.0 vCPU (2000m - Heavy Workload)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label htmlFor="memory" className="font-medium">RAM per Pod</Label>
                    <span className="font-semibold">{memoryGb} GB</span>
                  </div>
                  <select
                    id="memory"
                    value={memoryGb}
                    onChange={(e) => setMemoryGb(parseFloat(e.target.value))}
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs font-mono"
                  >
                    <option value="0.5">512 MB (Minimal)</option>
                    <option value="1">1.0 GB (Standard)</option>
                    <option value="2">2.0 GB (Spring/Java/ML)</option>
                    <option value="4">4.0 GB (High Memory)</option>
                  </select>
                </div>
              </div>

              <Separator />

              {/* Database and Cache options */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Managed Database & Cache</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "none", label: "No Managed DB", desc: "$0 / mo" },
                    { id: "basic", label: "PostgreSQL Basic", desc: "~$45 / mo (Single AZ)" },
                    { id: "ha", label: "PostgreSQL HA Cluster", desc: "~$190 / mo (Multi-AZ)" },
                  ].map((tier) => (
                    <Button
                      key={tier.id}
                      type="button"
                      variant={databaseTier === tier.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDatabaseTier(tier.id as any)}
                      className="flex flex-col items-start h-auto p-2.5 text-left hover:border-primary/50 cursor-pointer"
                    >
                      <span className="font-semibold text-xs">{tier.label}</span>
                      <span className="text-[10px] opacity-80">{tier.desc}</span>
                    </Button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-xs font-semibold">Managed Redis Cache</p>
                    <p className="text-[10px] text-muted-foreground">High-performance memory cache (~$32/mo)</p>
                  </div>
                  <Switch checked={redisEnabled} onCheckedChange={setRedisEnabled} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Use Spot / Preemptible Worker Nodes
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Save 55% on Kubernetes compute instances</p>
                  </div>
                  <Switch checked={useSpotInstances} onCheckedChange={setUseSpotInstances} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Cloud Comparison & Breakdown */}
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
      </div>
    </div>
  );
}
