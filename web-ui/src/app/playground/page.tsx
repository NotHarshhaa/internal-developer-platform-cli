"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Play,
  Copy,
  Check,
  Sparkles,
  Layers,
  Heart,
  Network,
  DollarSign,
  ShieldCheck,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CommandPreset {
  id: string;
  name: string;
  command: string;
  description: string;
  category: "Create" | "Health" | "Topology" | "Cost" | "Security";
  simulatedOutput: string[];
}

const presets: CommandPreset[] = [
  {
    id: "create-fastapi",
    name: "Scaffold Production FastAPI Service",
    command: "idp create order-service --template python-api --ci github-actions --deploy kubernetes --gitops argocd --monitoring --docs",
    description: "Generate complete Python FastAPI microservice with Docker, K8s manifests, and ArgoCD sync",
    category: "Create",
    simulatedOutput: [
      "[12:00:01] \x1b[36mℹ Initializing IDP service generator for 'order-service'...\x1b[0m",
      "[12:00:02] \x1b[32m✔ Template loaded:\x1b[0m Python FastAPI (v3.12-slim)",
      "[12:00:02] \x1b[32m✔ Scaffolded:\x1b[0m src/main.py, src/api/routes.py, src/models/schema.py",
      "[12:00:03] \x1b[32m✔ Generated:\x1b[0m Dockerfile (multi-stage non-root build)",
      "[12:00:03] \x1b[32m✔ Generated:\x1b[0m k8s/base/deployment.yaml, k8s/base/service.yaml, k8s/base/hpa.yaml",
      "[12:00:04] \x1b[32m✔ Generated:\x1b[0m .github/workflows/ci.yaml (lint, test, docker, deploy)",
      "[12:00:04] \x1b[32m✔ Generated:\x1b[0m GitOps ArgoCD application manifest: argocd/order-service-app.yaml",
      "[12:00:05] \x1b[1;32m🎉 Success!\x1b[0m 24 files created in ./order-service",
    ],
  },
  {
    id: "health-enhanced",
    name: "Run Enhanced Real-Time Health Probes",
    command: "idp health --enhanced --probe-all --timeout 5s",
    description: "Execute deep health checks across all microservices, databases, and message brokers",
    category: "Health",
    simulatedOutput: [
      "[12:00:01] \x1b[36mℹ Probing 6 registered microservices across cluster...\x1b[0m",
      "[12:00:02] \x1b[32m✔ [200 OK]\x1b[0m Auth & Identity Gateway -> 18ms latency (CPU: 24%, Mem: 184MB)",
      "[12:00:02] \x1b[32m✔ [200 OK]\x1b[0m Python FastAPI Core -> 32ms latency (CPU: 42%, Mem: 340MB)",
      "[12:00:03] \x1b[32m✔ [200 OK]\x1b[0m PostgreSQL Primary Cluster -> 4.2ms latency (Pool: 18/50 conn)",
      "[12:00:03] \x1b[32m✔ [200 OK]\x1b[0m Redis High-Speed Cache -> 1.2ms latency (Hit rate: 98.4%)",
      "[12:00:04] \x1b[33m⚠ [DEGRADED]\x1b[0m Kafka Event Broker -> 84ms latency (Lag: 1540 msgs)",
      "[12:00:04] \x1b[1;32m✔ Health Probe Summary:\x1b[0m 5 Healthy, 1 Degraded, 0 Down. Average Latency: 27.9ms",
    ],
  },
  {
    id: "deps-blast",
    name: "Service Dependency Topology & Blast Radius",
    command: "idp deps --format graph --analyze-blast-radius --target order-api",
    description: "Compute dependency matrix and simulate cascading failure blast radius",
    category: "Topology",
    simulatedOutput: [
      "[12:00:01] \x1b[36mℹ Parsing service dependency DAG...\x1b[0m",
      "[12:00:02] \x1b[32m✔ Target Service:\x1b[0m order-api (Tier: Backend API, QPS: 1,250)",
      "[12:00:02] \x1b[34m→ Upstream Consumers (1):\x1b[0m api-gw (API Gateway)",
      "[12:00:03] \x1b[35m→ Downstream Dependencies (3):\x1b[0m order-db, kafka-broker, payment-worker",
      "[12:00:03] \x1b[33m⚠ Blast Radius Impact Index:\x1b[0m Level 3 (Direct: 4 services, Transitive: 2 services)",
      "[12:00:04] \x1b[32m✔ Circular Dependency Check:\x1b[0m Passed (No circular cycles detected)",
    ],
  },
  {
    id: "cost-estimate",
    name: "Multi-Cloud Infrastructure Cost Estimation",
    command: "idp cost estimate --services 6 --replicas 2 --cloud all --spot-instances",
    description: "Calculate infrastructure bills across AWS, GCP, and Azure with FinOps savings",
    category: "Cost",
    simulatedOutput: [
      "[12:00:01] \x1b[36mℹ Calculating cloud sizing for 12 Pods (6 services x 2 replicas)...\x1b[0m",
      "[12:00:02] \x1b[32m☁ AWS (EKS + Spot EC2 + Aurora + ElastiCache):\x1b[0m $248.00 / month",
      "[12:00:02] \x1b[32m☁ GCP (GKE + Spot VM + Cloud SQL + Memorystore):\x1b[0m $233.12 / month",
      "[12:00:03] \x1b[32m☁ Azure (AKS + Spot VM + Azure DB + Redis):\x1b[0m $252.96 / month",
      "[12:00:03] \x1b[1;32m💡 FinOps Tip:\x1b[0m Spot instances reduce baseline compute spend by 55% (~$140/mo savings)",
    ],
  },
  {
    id: "security-audit",
    name: "Security & CIS Benchmark Compliance Scan",
    command: "idp security scan --all --severity high --cis-k8s --output json",
    description: "Audit containers, Kubernetes manifests, secrets leakage, and network policies",
    category: "Security",
    simulatedOutput: [
      "[12:00:01] \x1b[36mℹ Initiating static security & policy analysis...\x1b[0m",
      "[12:00:02] \x1b[32m✔ [PASS]\x1b[0m RunAsNonRoot enforcement (UID 1001)",
      "[12:00:02] \x1b[32m✔ [PASS]\x1b[0m No hardcoded API keys or high-entropy secrets",
      "[12:00:03] \x1b[33m⚠ [WARN]\x1b[0m readOnlyRootFilesystem is disabled in deployment.yaml",
      "[12:00:03] \x1b[32m✔ [PASS]\x1b[0m Distroless/Alpine minimal base image verified",
      "[12:00:04] \x1b[1;32m🏆 Overall Security Score:\x1b[0m 96/100 (Grade A+). 0 Critical CVEs.",
    ],
  },
];

export default function PlaygroundPage() {
  const [selectedPreset, setSelectedPreset] = useState<CommandPreset>(presets[0]);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>(presets[0].simulatedOutput);

  const handleSelectPreset = (preset: CommandPreset) => {
    setSelectedPreset(preset);
    setTerminalLines(preset.simulatedOutput);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(selectedPreset.command);
    setCopied(true);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCommand = () => {
    setRunning(true);
    setTerminalLines([`$ ${selectedPreset.command}`]);

    selectedPreset.simulatedOutput.forEach((line, idx) => {
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, line]);
        if (idx === selectedPreset.simulatedOutput.length - 1) {
          setRunning(false);
        }
      }, (idx + 1) * 200);
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Interactive CLI Command Playground
            </h1>
            <Badge variant="outline" className="text-[10px]">
              Terminal Emulator
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Explore and execute IDP CLI command patterns with interactive flags and rich terminal previews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <code className="text-xs font-mono bg-muted px-2.5 py-1 rounded border">
            pip install idp-cli
          </code>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Command Presets & Scenarios
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {presets.map((preset) => (
            <Card
              key={preset.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedPreset.id === preset.id
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => handleSelectPreset(preset)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary" className="text-[9px]">
                    {preset.category}
                  </Badge>
                  {selectedPreset.id === preset.id && (
                    <Badge variant="default" className="text-[8px] px-1 py-0">
                      Active
                    </Badge>
                  )}
                </div>
                <h4 className="text-xs font-bold text-foreground">{preset.name}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                  {preset.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Command Builder & Terminal Output */}
      <div className="space-y-4">
        {/* Command Display Bar */}
        <Card className="border-border/80">
          <CardHeader className="p-3.5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Generated CLI Command
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCommand}
                  className="h-7 text-xs gap-1.5"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy Command"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunCommand}
                  disabled={running}
                  className="h-7 text-xs gap-1.5"
                >
                  <Play className="h-3 w-3" />
                  {running ? "Simulating..." : "Simulate Run"}
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

          <div className="p-4 font-mono text-xs min-h-[220px] max-h-[340px] overflow-y-auto space-y-1.5 leading-relaxed">
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
    </div>
  );
}
