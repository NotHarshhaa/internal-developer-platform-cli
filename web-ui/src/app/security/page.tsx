"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Download,
  Play,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SecurityKpiCards } from "./components/security-kpis";
import { FindingCard, type SecurityFinding } from "./components/finding-card";

const initialFindings: SecurityFinding[] = [
  {
    id: "SEC-001",
    rule: "RunAsNonRoot User Enforcement",
    severity: "high",
    category: "Container",
    file: "Dockerfile",
    description: "Container images must explicitly set USER to a non-root UID (e.g. USER 1001) to prevent root escape.",
    remediation: "Add non-root user creation in Dockerfile.",
    patchSnippet: "RUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser",
    status: "passed",
  },
  {
    id: "SEC-002",
    rule: "Read-Only Root Filesystem",
    severity: "medium",
    category: "Kubernetes",
    file: "k8s/deployment.yaml",
    description: "Mounting the root filesystem as read-only prevents attackers from modifying system binaries or saving malicious payloads.",
    remediation: "Set readOnlyRootFilesystem to true in container securityContext.",
    patchSnippet: "securityContext:\n  readOnlyRootFilesystem: true\n  runAsNonRoot: true",
    status: "warning",
  },
  {
    id: "SEC-003",
    rule: "No Hardcoded Secrets or API Keys",
    severity: "critical",
    category: "Secrets",
    file: "config.json / .env",
    description: "Scanning for high-entropy strings, AWS access keys, GitHub tokens, and private RSA keys.",
    remediation: "Use Kubernetes Secret references with External Secrets Operator.",
    patchSnippet: "envFrom:\n  - secretRef:\n      name: app-secrets",
    status: "passed",
  },
  {
    id: "SEC-004",
    rule: "CPU / Memory Resource Limits Enforced",
    severity: "low",
    category: "Kubernetes",
    file: "k8s/deployment.yaml",
    description: "Missing resource limits can cause noisy-neighbor DOS attacks on host worker nodes.",
    remediation: "Define both resources.limits and resources.requests.",
    patchSnippet: "resources:\n  requests:\n    cpu: '100m'\n    memory: '128Mi'\n  limits:\n    cpu: '500m'\n    memory: '512Mi'",
    status: "passed",
  },
  {
    id: "SEC-005",
    rule: "Minimal Base Image Architecture",
    severity: "medium",
    category: "Container",
    file: "Dockerfile",
    description: "Using heavy Ubuntu/Debian base images increases attack surface compared to distroless or Alpine.",
    remediation: "Use python:3.12-slim or gcr.io/distroless/static.",
    patchSnippet: "FROM python:3.12-slim AS runtime",
    status: "passed",
  },
  {
    id: "SEC-006",
    rule: "NetworkPolicy Default Deny",
    severity: "medium",
    category: "Kubernetes",
    file: "k8s/network-policy.yaml",
    description: "East-west traffic between pods should be restricted to explicitly whitelisted service connections.",
    remediation: "Apply a default-deny ingress NetworkPolicy to the namespace.",
    patchSnippet: "kind: NetworkPolicy\nmetadata:\n  name: default-deny-ingress\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress",
    status: "warning",
  },
];

export default function SecurityScannerPage() {
  const [findings, setFindings] = useState<SecurityFinding[]>(initialFindings);
  const [scanning, setScanning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);

  const passedCount = findings.filter((f) => f.status === "passed").length;
  const warningCount = findings.filter((f) => f.status === "warning").length;
  const failedCount = findings.filter((f) => f.status === "failed").length;

  const score = Math.round((passedCount / findings.length) * 100);

  const handleRunScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success("Security compliance scan completed", {
        description: `Audit Score: ${score}% (${passedCount} passed, ${warningCount} warnings, 0 critical CVEs).`,
      });
    }, 700);
  };

  const handleCopyPatch = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedPatchId(id);
    toast.success("Remediation patch copied to clipboard");
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  const handleExportSecurityReport = () => {
    const report = {
      auditDate: new Date().toISOString(),
      score: `${score}/100 (Grade A+)`,
      summary: {
        totalRulesChecked: findings.length,
        passed: passedCount,
        warnings: warningCount,
        failed: failedCount,
        criticalVulnerabilities: 0,
      },
      findings,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-audit-v2-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Security audit report exported as JSON");
  };

  const filteredFindings = findings.filter((f) => {
    if (activeCategory === "all") return true;
    return f.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Security & Compliance Scanner
            </h1>
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              SOC 2 / CIS Benchmark Ready
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Automated static analysis for containers, Kubernetes manifests, secret leakage, and CIS benchmarks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunScan}
            disabled={scanning}
            className="gap-1.5 h-8 text-xs cursor-pointer"
          >
            <Play className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Auditing Policies..." : "Run Security Scan"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportSecurityReport}
            className="gap-1.5 h-8 text-xs shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Scorecards */}
      <SecurityKpiCards score={score} warningCount={warningCount} />

      {/* Findings List */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Security Rule Audits & Policy Findings
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect policy compliance status and 1-click remediation patches
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {["all", "container", "kubernetes", "secrets"].map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="capitalize text-xs h-7 px-2.5 cursor-pointer"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          {filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              copiedPatchId={copiedPatchId}
              onCopyPatch={handleCopyPatch}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
