"use client";

import { useState } from "react";
import {
  DollarSign,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CostKpiCards } from "./components/cost-kpis";
import { SizingControls } from "./components/sizing-controls";
import { CloudBreakdown } from "./components/cloud-breakdown";

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
            className="gap-1.5 h-8 text-xs cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => handleExportCost("json")}
            className="gap-1.5 h-8 text-xs shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <CostKpiCards
        displayTotal={displayTotal}
        billingPeriod={billingPeriod}
        totalPods={totalPods}
        serviceCount={serviceCount}
        replicasPerService={replicasPerService}
        totalCores={totalCores}
        totalMemoryGb={totalMemoryGb}
        useSpotInstances={useSpotInstances}
      />

      {/* Interactive Controls & Cost Breakdown */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <SizingControls
          serviceCount={serviceCount}
          setServiceCount={setServiceCount}
          replicasPerService={replicasPerService}
          setReplicasPerService={setReplicasPerService}
          cpuCores={cpuCores}
          setCpuCores={setCpuCores}
          memoryGb={memoryGb}
          setMemoryGb={setMemoryGb}
          databaseTier={databaseTier}
          setDatabaseTier={setDatabaseTier}
          redisEnabled={redisEnabled}
          setRedisEnabled={setRedisEnabled}
          useSpotInstances={useSpotInstances}
          setUseSpotInstances={setUseSpotInstances}
        />

        <CloudBreakdown
          awsCost={awsCost}
          gcpCost={gcpCost}
          azureCost={azureCost}
          billingPeriod={billingPeriod}
          computeCost={computeCost}
          clusterManagementFee={clusterManagementFee}
          databaseTier={databaseTier}
          dbCost={dbCost}
          redisCost={redisCost}
          egressGb={egressGb}
          networkCost={networkCost}
        />
      </div>
    </div>
  );
}
