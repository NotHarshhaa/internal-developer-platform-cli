"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  HardDrive,
  Download,
  Play,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ServiceHealth {
  id: string;
  name: string;
  type: "api" | "database" | "queue" | "gateway";
  status: "healthy" | "degraded" | "unhealthy";
  uptime: string;
  latencyMs: number;
  cpuPercent: number;
  memoryMb: number;
  endpoint: string;
  lastChecked: string;
  details?: {
    version: string;
    connections: number;
    threadPool: string;
    p95Latency: string;
  };
}

const initialServices: ServiceHealth[] = [
  {
    id: "auth-service",
    name: "Auth & Identity Gateway",
    type: "gateway",
    status: "healthy",
    uptime: "99.98%",
    latencyMs: 18,
    cpuPercent: 24,
    memoryMb: 184,
    endpoint: "/api/v1/auth/health",
    lastChecked: "Just now",
    details: { version: "v2.4.1", connections: 142, threadPool: "Active (8/16)", p95Latency: "24ms" },
  },
  {
    id: "core-api",
    name: "Python FastAPI Core",
    type: "api",
    status: "healthy",
    uptime: "99.95%",
    latencyMs: 32,
    cpuPercent: 42,
    memoryMb: 340,
    endpoint: "/healthz",
    lastChecked: "Just now",
    details: { version: "v3.12.0", connections: 98, threadPool: "Asyncio Event Loop", p95Latency: "44ms" },
  },
  {
    id: "node-worker",
    name: "Node.js Job Worker",
    type: "api",
    status: "healthy",
    uptime: "99.90%",
    latencyMs: 45,
    cpuPercent: 38,
    memoryMb: 210,
    endpoint: "/health",
    lastChecked: "1m ago",
    details: { version: "v20.11.0", connections: 34, threadPool: "Libuv Worker Threads", p95Latency: "62ms" },
  },
  {
    id: "postgres-db",
    name: "PostgreSQL Primary Cluster",
    type: "database",
    status: "healthy",
    uptime: "99.99%",
    latencyMs: 4,
    cpuPercent: 19,
    memoryMb: 1420,
    endpoint: "postgres:5432",
    lastChecked: "Just now",
    details: { version: "PostgreSQL 16.3", connections: 28, threadPool: "Connection Pool (28/100)", p95Latency: "7ms" },
  },
  {
    id: "redis-cache",
    name: "Redis High-Speed Cache",
    type: "database",
    status: "healthy",
    uptime: "100.0%",
    latencyMs: 1.2,
    cpuPercent: 12,
    memoryMb: 480,
    endpoint: "redis:6379",
    lastChecked: "Just now",
    details: { version: "Redis 7.2.4", connections: 840, threadPool: "Single Thread Event Loop", p95Latency: "2ms" },
  },
  {
    id: "kafka-broker",
    name: "Kafka Event Broker",
    type: "queue",
    status: "degraded",
    uptime: "98.84%",
    latencyMs: 84,
    cpuPercent: 68,
    memoryMb: 2150,
    endpoint: "kafka:9092",
    lastChecked: "Just now",
    details: { version: "Apache Kafka 3.7", connections: 45, threadPool: "Netty IO Processors", p95Latency: "128ms" },
  },
];

interface Incident {
  id: string;
  service: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

const initialIncidents: Incident[] = [
  {
    id: "inc-1",
    service: "Kafka Event Broker",
    severity: "warning",
    message: "Consumer lag spike detected on topic 'orders.processed' (> 1500 msgs)",
    timestamp: "12m ago",
    resolved: false,
  },
  {
    id: "inc-2",
    service: "PostgreSQL Primary Cluster",
    severity: "info",
    message: "Automated vacuum and index defragmentation completed successfully",
    timestamp: "1h ago",
    resolved: true,
  },
];

export default function HealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>(initialServices);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [probing, setProbing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [customUrl, setCustomUrl] = useState("https://api.github.com/zen");
  const [customMethod, setCustomMethod] = useState("GET");
  const [customProbeResult, setCustomProbeResult] = useState<{
    status?: number;
    latency?: number;
    body?: string;
    loading?: boolean;
  } | null>(null);

  // Auto-refresh ticker simulation
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs: Math.max(1, Math.round(s.latencyMs + (Math.random() * 6 - 3))),
          cpuPercent: Math.min(95, Math.max(10, Math.round(s.cpuPercent + (Math.random() * 8 - 4)))),
          lastChecked: "Just now",
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefreshAll = () => {
    setProbing(true);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs: Math.max(1, Math.round(s.latencyMs + (Math.random() * 8 - 4))),
          cpuPercent: Math.min(95, Math.max(10, Math.round(s.cpuPercent + (Math.random() * 10 - 5)))),
          lastChecked: "Just now",
        }))
      );
      setProbing(false);
      toast.success("Health probes refreshed", {
        description: "All registered microservices reported active telemetry status.",
      });
    }, 600);
  };

  const handleRunCustomProbe = async () => {
    if (!customUrl) return;
    setCustomProbeResult({ loading: true });
    const startTime = performance.now();
    try {
      const res = await fetch(customUrl, { method: customMethod });
      const elapsed = Math.round(performance.now() - startTime);
      const text = await res.text();
      setCustomProbeResult({
        status: res.status,
        latency: elapsed,
        body: text.slice(0, 400),
        loading: false,
      });
      toast.success(`Probe complete: HTTP ${res.status} in ${elapsed}ms`);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setCustomProbeResult({
        status: 0,
        latency: elapsed,
        body: `Probe connection error: ${err.message || "Failed to reach host (CORS or network error)"}`,
        loading: false,
      });
      toast.error("Probe connection failed");
    }
  };

  const handleToggleIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, resolved: !inc.resolved } : inc))
    );
    toast.info("Incident status updated");
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalServices: services.length,
        healthy: services.filter((s) => s.status === "healthy").length,
        degraded: services.filter((s) => s.status === "degraded").length,
        averageLatencyMs: (
          services.reduce((acc, s) => acc + s.latencyMs, 0) / services.length
        ).toFixed(1),
      },
      services,
      incidents,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Health report exported as JSON");
  };

  const filteredServices = services.filter((s) => {
    if (filterType === "all") return true;
    return s.type === filterType;
  });

  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const avgLatency = (
    services.reduce((sum, s) => sum + s.latencyMs, 0) / services.length
  ).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Heart className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Service Health & Monitoring
            </h1>
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              Live Probing Active
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Real-time health checks, endpoint latencies, resource telemetry, and incident alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs border rounded-md px-2.5 py-1 bg-card">
            <span className="text-muted-foreground text-[11px]">Auto-Probe:</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} className="scale-75" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={probing}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${probing ? "animate-spin" : ""}`} />
            {probing ? "Probing..." : "Trigger Probes"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExportReport}
            className="gap-1.5 h-8 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Operational Status</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {healthyCount}/{services.length}
              </span>
              <span className="text-[10px] text-muted-foreground">Services Healthy</span>
            </div>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
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

        <Card className={degradedCount > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Incidents</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {incidents.filter((i) => !i.resolved).length}
              </span>
              <span className="text-[10px] text-muted-foreground">Open alerts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List & Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", "api", "database", "queue", "gateway"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize text-xs h-7 px-2.5"
              >
                {type === "all" ? "All Components" : type}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredServices.length} registered microservices
          </span>
        </div>

        <div className="grid gap-3.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const isExpanded = expandedService === service.id;
            return (
              <Card key={service.id} className="hover:border-primary/40 transition-colors border-border/80 flex flex-col justify-between">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {service.type === "database" ? (
                        <Database className="h-4 w-4 text-sky-500 shrink-0" />
                      ) : service.type === "queue" ? (
                        <Radio className="h-4 w-4 text-purple-500 shrink-0" />
                      ) : service.type === "gateway" ? (
                        <Globe className="h-4 w-4 text-indigo-500 shrink-0" />
                      ) : (
                        <Server className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <CardTitle className="text-xs font-semibold">{service.name}</CardTitle>
                    </div>
                    <Badge
                      variant={service.status === "healthy" ? "default" : "destructive"}
                      className="text-[9px] px-1.5 py-0 capitalize"
                    >
                      {service.status}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-[10px] text-muted-foreground mt-1">
                    {service.endpoint}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-3.5 pt-0 space-y-2.5">
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground block">Latency</span>
                      <span className="font-semibold text-foreground">{service.latencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">CPU Usage</span>
                      <span className="font-semibold text-foreground">{service.cpuPercent}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">RAM Usage</span>
                      <span className="font-semibold text-foreground">{service.memoryMb} MB</span>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && service.details && (
                    <div className="rounded-md bg-muted/40 p-2 text-[10px] space-y-1 font-mono border animate-in fade-in-50">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runtime:</span>
                        <span>{service.details.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Conn:</span>
                        <span>{service.details.connections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thread Model:</span>
                        <span>{service.details.threadPool}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">p95 Latency:</span>
                        <span>{service.details.p95Latency}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Uptime {service.uptime}
                    </span>
                    <button
                      onClick={() => setExpandedService(isExpanded ? null : service.id)}
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      {isExpanded ? "Less ▲" : "Telemetry ▼"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Live Probe Tool */}
      <Card className="border-border/80">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Custom Endpoint Probe Simulator
          </CardTitle>
          <CardDescription className="text-xs">
            Send an instant test HTTP probe to any internal or external service endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-bold font-mono"
            >
              <option value="GET">GET</option>
              <option value="HEAD">HEAD</option>
              <option value="POST">POST</option>
            </select>
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-service.internal/healthz"
              className="h-8 text-xs font-mono flex-1"
            />
            <Button
              size="sm"
              onClick={handleRunCustomProbe}
              disabled={customProbeResult?.loading}
              className="gap-1.5 h-8 text-xs shrink-0"
            >
              <Play className="h-3.5 w-3.5" />
              {customProbeResult?.loading ? "Probing..." : "Send Probe"}
            </Button>
          </div>

          {customProbeResult && (
            <div className="rounded-lg border bg-neutral-950 p-3 text-xs font-mono space-y-1.5 text-neutral-200">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-1">
                <span>Probe Response Diagnostics</span>
                <span>Latency: {customProbeResult.latency} ms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Status:</span>
                <Badge
                  variant={
                    customProbeResult.status && customProbeResult.status < 400
                      ? "default"
                      : "destructive"
                  }
                  className="text-[10px]"
                >
                  {customProbeResult.status ? `HTTP ${customProbeResult.status}` : "Network Error"}
                </Badge>
              </div>
              {customProbeResult.body && (
                <div className="text-[11px] text-green-400 bg-neutral-900/80 p-2 rounded max-h-24 overflow-y-auto">
                  {customProbeResult.body}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident Management */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Alerts & Incident Log
          </CardTitle>
          <CardDescription className="text-xs">
            Review and acknowledge active platform alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border text-xs transition-colors ${
                incident.resolved ? "bg-muted/20 opacity-60" : "bg-card"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {incident.severity === "critical" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : incident.severity === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{incident.service}</span>
                    <span className="text-[10px] text-muted-foreground">{incident.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{incident.message}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleIncident(incident.id)}
                className="h-7 text-[10px] shrink-0 self-start sm:self-center"
              >
                {incident.resolved ? "Reopen Alert" : "Acknowledge & Resolve"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
