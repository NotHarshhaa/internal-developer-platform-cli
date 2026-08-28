"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { HealthKpiCards } from "./components/health-kpi-cards";
import { ServiceCard, type ServiceHealth } from "./components/service-card";
import { CustomProbe } from "./components/custom-probe";
import { IncidentLog, type Incident } from "./components/incident-log";

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
            className="gap-1.5 h-8 text-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${probing ? "animate-spin" : ""}`} />
            {probing ? "Probing..." : "Trigger Probes"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExportReport}
            className="gap-1.5 h-8 text-xs shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <HealthKpiCards
        healthyCount={healthyCount}
        totalServices={services.length}
        avgLatency={avgLatency}
        openIncidentsCount={incidents.filter((i) => !i.resolved).length}
      />

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
                className="capitalize text-xs h-7 px-2.5 cursor-pointer"
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
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isExpanded={expandedService === service.id}
              onToggleExpand={() =>
                setExpandedService(expandedService === service.id ? null : service.id)
              }
            />
          ))}
        </div>
      </div>

      {/* Custom Live Probe Tool */}
      <CustomProbe
        customMethod={customMethod}
        setCustomMethod={setCustomMethod}
        customUrl={customUrl}
        setCustomUrl={setCustomUrl}
        onRunProbe={handleRunCustomProbe}
        result={customProbeResult}
      />

      {/* Incident Management */}
      <IncidentLog incidents={incidents} onToggleIncident={handleToggleIncident} />
    </div>
  );
}
