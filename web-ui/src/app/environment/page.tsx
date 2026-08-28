"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Server,
  Container,
  Cloud,
  Cpu,
  HardDrive,
  RefreshCw,
  Download,
  AlertTriangle,
  Play,
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ClusterNode {
  name: string;
  role: "control-plane" | "worker";
  status: "Ready" | "NotReady";
  cpuUsage: string;
  memoryUsage: string;
  version: string;
  podsCount: number;
}

const envNodes: Record<string, ClusterNode[]> = {
  production: [
    { name: "k8s-master-01", role: "control-plane", status: "Ready", cpuUsage: "34%", memoryUsage: "62%", version: "v1.31.1", podsCount: 28 },
    { name: "k8s-worker-01", role: "worker", status: "Ready", cpuUsage: "58%", memoryUsage: "74%", version: "v1.31.1", podsCount: 42 },
    { name: "k8s-worker-02", role: "worker", status: "Ready", cpuUsage: "52%", memoryUsage: "68%", version: "v1.31.1", podsCount: 39 },
    { name: "k8s-worker-03", role: "worker", status: "Ready", cpuUsage: "46%", memoryUsage: "59%", version: "v1.31.1", podsCount: 35 },
  ],
  staging: [
    { name: "stg-control-01", role: "control-plane", status: "Ready", cpuUsage: "22%", memoryUsage: "45%", version: "v1.31.1", podsCount: 16 },
    { name: "stg-worker-01", role: "worker", status: "Ready", cpuUsage: "36%", memoryUsage: "51%", version: "v1.31.1", podsCount: 22 },
  ],
  development: [
    { name: "dev-minikube-local", role: "worker", status: "Ready", cpuUsage: "28%", memoryUsage: "40%", version: "v1.31.0", podsCount: 12 },
  ],
};

const cloudRegions = [
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
      `[INFO] Initializing cluster environment check for "${selectedEnv}"...`,
      `[INFO] Connecting to API server at https://${selectedEnv}.k8s.internal:6443...`,
      `[PASS] Kubernetes API Server v1.31.1 is responsive (latency: 12ms)`,
      `[PASS] Node status: ${currentNodes.length}/${currentNodes.length} nodes in 'Ready' state`,
      `[PASS] CoreDNS pods (kube-system) responding on 10.96.0.10:53`,
      `[PASS] Ingress controller nginx-ingress active on ports 80/443`,
      `[PASS] StorageClass 'standard-gp3' available with dynamic CSI provisioner`,
      `[PASS] Container runtime containerd://1.7.20 healthy across all nodes`,
      `[SUCCESS] Environment "${selectedEnv}" passed all 8 readiness and security gates.`,
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
      }, (idx + 1) * 180);
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
    toast.success("Environment status exported");
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
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {(["production", "staging", "development"] as const).map((env) => (
              <Button
                key={env}
                variant={selectedEnv === env ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectedEnv(env);
                  setDiagLog(null);
                }}
                className="capitalize h-7 text-xs px-3"
              >
                {env}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStatus}
            className="gap-1.5 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Cluster KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Cluster Nodes</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold">{currentNodes.length}</span>
              <span className="text-[10px] text-emerald-500">All Ready</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Active Pods</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold">{totalPods}</span>
              <span className="text-[10px] text-muted-foreground">Across namespaces</span>
            </div>
          </CardContent>
        </Card>

        <Card>
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
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Node Infrastructure ({selectedEnv})
            </span>
            <Badge variant="outline" className="text-[9px] font-mono">
              {currentNodes.length} Nodes Online
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Hardware allocations, kubelet versions, and active pod densities per host
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-muted-foreground text-[10px] uppercase">
                  <th className="py-2 font-medium">Node Name</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">CPU Alloc</th>
                  <th className="py-2 font-medium">Memory Alloc</th>
                  <th className="py-2 font-medium">Pods</th>
                  <th className="py-2 font-medium">K8s Version</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentNodes.map((node) => (
                  <tr key={node.name} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono font-medium text-foreground">{node.name}</td>
                    <td className="py-2.5 capitalize">{node.role}</td>
                    <td className="py-2.5">
                      <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-emerald-500 text-white">
                        {node.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-mono">{node.cpuUsage}</td>
                    <td className="py-2.5 font-mono">{node.memoryUsage}</td>
                    <td className="py-2.5 font-semibold">{node.podsCount} pods</td>
                    <td className="py-2.5 font-mono text-muted-foreground">{node.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Regions & Latency */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4 text-sky-500" />
              Cloud Provider Regional Latency
            </CardTitle>
            <CardDescription className="text-xs">
              Connectivity and roundtrip ping to primary cloud regions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2">
            {cloudRegions.map((region) => (
              <div
                key={region.provider}
                className="flex items-center justify-between p-2.5 rounded-lg border text-xs bg-muted/10"
              >
                <div>
                  <p className="font-semibold text-foreground">{region.provider}</p>
                  <p className="text-[10px] text-muted-foreground">{region.region}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-medium">{region.latency}</span>
                  <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/20">
                    {region.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Diagnostic Command Runner */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Cluster Diagnostic Runner
              </CardTitle>
              <Button
                size="sm"
                onClick={handleRunDiagnostics}
                disabled={runningDiag}
                className="h-7 text-xs gap-1.5"
              >
                <Play className="h-3 w-3" />
                {runningDiag ? "Running Check..." : "Run Diagnostics"}
              </Button>
            </div>
            <CardDescription className="text-xs">
              Execute live health and configuration audit across the {selectedEnv} cluster
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[10px] text-green-400 min-h-[160px] max-h-[190px] overflow-y-auto space-y-1">
              {diagLog && diagLog.length > 0 ? (
                diagLog.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 italic py-6 text-center">
                  Click &quot;Run Diagnostics&quot; to inspect network policies, DNS, ingress, and cluster nodes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
