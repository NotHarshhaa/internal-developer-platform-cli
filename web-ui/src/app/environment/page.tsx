"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NodeTable, type ClusterNode } from "./components/node-table";
import { CloudRegionsCard, type CloudRegion } from "./components/cloud-regions";
import { DiagnosticTerminal } from "./components/diagnostic-terminal";

const envNodes: Record<string, ClusterNode[]> = {
  production: [
    { name: "k8s-master-01", role: "control-plane", status: "Ready", cpuPercent: 34, memoryPercent: 62, version: "v1.31.1", podsCount: 28 },
    { name: "k8s-worker-01", role: "worker", status: "Ready", cpuPercent: 58, memoryPercent: 74, version: "v1.31.1", podsCount: 42 },
    { name: "k8s-worker-02", role: "worker", status: "Ready", cpuPercent: 52, memoryPercent: 68, version: "v1.31.1", podsCount: 39 },
    { name: "k8s-worker-03", role: "worker", status: "Ready", cpuPercent: 46, memoryPercent: 59, version: "v1.31.1", podsCount: 35 },
  ],
  staging: [
    { name: "stg-control-01", role: "control-plane", status: "Ready", cpuPercent: 22, memoryPercent: 45, version: "v1.31.1", podsCount: 16 },
    { name: "stg-worker-01", role: "worker", status: "Ready", cpuPercent: 36, memoryPercent: 51, version: "v1.31.1", podsCount: 22 },
  ],
  development: [
    { name: "dev-minikube-local", role: "worker", status: "Ready", cpuPercent: 28, memoryPercent: 40, version: "v1.31.0", podsCount: 12 },
  ],
};

const cloudRegions: CloudRegion[] = [
  { provider: "AWS (us-east-1)", region: "N. Virginia", latency: "14ms", status: "Operational", healthy: true },
  { provider: "AWS (eu-central-1)", region: "Frankfurt", latency: "92ms", status: "Operational", healthy: true },
  { provider: "GCP (us-central1)", region: "Iowa", latency: "28ms", status: "Operational", healthy: true },
  { provider: "Azure (eastus)", region: "Virginia", latency: "19ms", status: "Operational", healthy: true },
];

export default function EnvironmentPage() {
  const [selectedEnv, setSelectedEnv] = useState<"production" | "staging" | "development">("production");
  const [runningDiag, setRunningDiag] = useState(false);
  const [diagLog, setDiagLog] = useState<string[] | null>(null);

  const currentNodes = envNodes[selectedEnv] || [];
  const totalPods = currentNodes.reduce((acc, n) => acc + n.podsCount, 0);

  const handleRunDiagnostics = () => {
    setRunningDiag(true);
    setDiagLog([]);
    const logs = [
      `[12:00:01] \x1b[36mℹ Initializing cluster environment check for "${selectedEnv}"...\x1b[0m`,
      `[12:00:01] \x1b[36mℹ Connecting to API server at https://${selectedEnv}.k8s.internal:6443...\x1b[0m`,
      `[12:00:02] \x1b[32m✔ [PASS]\x1b[0m Kubernetes API Server v1.31.1 is responsive (latency: 12ms)`,
      `[12:00:02] \x1b[32m✔ [PASS]\x1b[0m Node status: ${currentNodes.length}/${currentNodes.length} nodes in 'Ready' state`,
      `[12:00:03] \x1b[32m✔ [PASS]\x1b[0m CoreDNS pods (kube-system) responding on 10.96.0.10:53`,
      `[12:00:03] \x1b[32m✔ [PASS]\x1b[0m Ingress controller nginx-ingress active on ports 80/443`,
      `[12:00:04] \x1b[32m✔ [PASS]\x1b[0m StorageClass 'standard-gp3' available with dynamic CSI provisioner`,
      `[12:00:04] \x1b[32m✔ [PASS]\x1b[0m Container runtime containerd://1.7.20 healthy across all nodes`,
      `[12:00:05] \x1b[1;32m🎉 Success!\x1b[0m Environment "${selectedEnv}" passed all 8 readiness and security gates.`,
    ];

    logs.forEach((line, idx) => {
      setTimeout(() => {
        setDiagLog((prev) => [...(prev || []), line]);
        if (idx === logs.length - 1) {
          setRunningDiag(false);
          toast.success("Environment diagnostics completed", {
            description: `All ${currentNodes.length} cluster nodes and components passed health checks.`,
          });
        }
      }, (idx + 1) * 160);
    });
  };

  const handleExportStatus = () => {
    const data = {
      environment: selectedEnv,
      timestamp: new Date().toISOString(),
      nodes: currentNodes,
      cloudRegions,
      clusterHealth: "100% Operational",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `env-status-${selectedEnv}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Environment status exported as JSON");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Cluster & Environment Status
            </h1>
            <Badge variant="outline" className="text-[10px] text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20">
              Multi-Cluster
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Inspect infrastructure readiness, Kubernetes nodes, container runtimes, and cloud provider regions
          </p>
        </div>

        {/* Environment Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted/30 p-0.5 shadow-xs">
            {(["production", "staging", "development"] as const).map((env) => (
              <Button
                key={env}
                variant={selectedEnv === env ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectedEnv(env);
                  setDiagLog(null);
                }}
                className="capitalize h-7 text-xs px-3 cursor-pointer"
              >
                {env}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatus}
            className="gap-1.5 h-8 text-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Cluster KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Cluster Nodes</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold">{currentNodes.length} Nodes</span>
              <span className="text-[10px] text-emerald-500">All Ready</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Active Pods</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold">{totalPods} Pods</span>
              <span className="text-[10px] text-muted-foreground">Across namespaces</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Kubernetes Version</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold">v1.31.1</span>
              <span className="text-[10px] text-sky-500">Latest Stable</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Ingress & DNS</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">100%</span>
              <span className="text-[10px] text-muted-foreground">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kubernetes Node Table */}
      <NodeTable nodes={currentNodes} environment={selectedEnv} />

      {/* Cloud Regions & Latency + Diagnostic Terminal */}
      <div className="grid gap-4 md:grid-cols-2">
        <CloudRegionsCard regions={cloudRegions} />
        <DiagnosticTerminal
          environment={selectedEnv}
          running={runningDiag}
          onRunDiagnostics={handleRunDiagnostics}
          logs={diagLog}
        />
      </div>
    </div>
  );
}
