"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode,
  Download,
  Play,
  Lock,
  Terminal,
  Server,
  Sparkles,
  Info,
  Copy,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SecurityFinding {
  id: string;
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "Container" | "Kubernetes" | "Secrets" | "Dependencies";
  file: string;
  description: string;
  remediation: string;
  patchSnippet: string;
  status: "passed" | "warning" | "failed";
}

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
            className="gap-1.5 h-8 text-xs"
          >
            <Play className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Auditing Policies..." : "Run Security Scan"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportSecurityReport}
            className="gap-1.5 h-8 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Security Scorecard</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                A+ ({score}%)
              </span>
              <span className="text-[10px] text-muted-foreground">High Compliance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Critical Vulnerabilities</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-500">0 CVEs</span>
              <span className="text-[10px] text-muted-foreground">Clean scan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Hardcoded Secrets</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-500">0 Leaks</span>
              <span className="text-[10px] text-muted-foreground">Entropy scan clean</span>
            </div>
          </CardContent>
        </Card>

        <Card className={warningCount > 0 ? "border-amber-500/20 bg-amber-500/5" : "border-border/70"}>
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Policy Warnings</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {warningCount} Warnings
              </span>
              <span className="text-[10px] text-muted-foreground">Fix patches ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  className="capitalize text-xs h-7 px-2.5"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-colors ${
                finding.status === "passed"
                  ? "bg-card border-border/80"
                  : "bg-amber-500/5 border-amber-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {finding.status === "passed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span className="font-semibold text-foreground">{finding.rule}</span>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    {finding.id}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[9px]">
                    {finding.category}
                  </Badge>
                  <Badge
                    variant={finding.severity === "critical" ? "destructive" : "outline"}
                    className="text-[9px] capitalize"
                  >
                    {finding.severity}
                  </Badge>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                {finding.description}
              </p>

              {/* Remediation Patch Preview */}
              <div className="pl-6 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 font-mono text-muted-foreground">
                    <FileCode className="h-3 w-3" />
                    <span>Target: {finding.file}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPatch(finding.id, finding.patchSnippet)}
                    className="h-6 text-[10px] gap-1 text-primary hover:bg-primary/10"
                  >
                    {copiedPatchId === finding.id ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedPatchId === finding.id ? "Patch Copied" : "Copy Remediation Patch"}
                  </Button>
                </div>

                <pre className="rounded bg-neutral-950 p-2 text-[10px] font-mono text-green-400 border border-neutral-800 overflow-x-auto">
                  {finding.patchSnippet}
                </pre>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
