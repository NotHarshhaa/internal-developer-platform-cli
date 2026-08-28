"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Network,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Download,
  Info,
  Server,
  Database,
  Radio,
  Globe,
  ArrowRight,
  ShieldAlert,
  Search,
  Zap,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  name: string;
  tier: "gateway" | "api" | "worker" | "data";
  protocol: string;
  qps: number;
  avgLatency: string;
  errorRate: string;
  dependencies: string[]; // downstream service ids
  status: "healthy" | "degraded";
  x: number;
  y: number;
}

const initialNodes: Node[] = [
  {
    id: "api-gw",
    name: "API Gateway",
    tier: "gateway",
    protocol: "HTTPS / REST",
    qps: 4200,
    avgLatency: "12ms",
    errorRate: "0.01%",
    dependencies: ["auth-svc", "order-api", "user-api"],
    status: "healthy",
    x: 80,
    y: 180,
  },
  {
    id: "auth-svc",
    name: "Auth Service",
    tier: "api",
    protocol: "gRPC",
    qps: 1800,
    avgLatency: "8ms",
    errorRate: "0.00%",
    dependencies: ["user-db", "redis-cache"],
    status: "healthy",
    x: 280,
    y: 80,
  },
  {
    id: "order-api",
    name: "Order Processing API",
    tier: "api",
    protocol: "gRPC / HTTP",
    qps: 1250,
    avgLatency: "24ms",
    errorRate: "0.02%",
    dependencies: ["order-db", "kafka-broker", "payment-worker"],
    status: "healthy",
    x: 280,
    y: 200,
  },
  {
    id: "user-api",
    name: "User & Profiles API",
    tier: "api",
    protocol: "REST",
    qps: 950,
    avgLatency: "15ms",
    errorRate: "0.00%",
    dependencies: ["user-db", "redis-cache"],
    status: "healthy",
    x: 280,
    y: 320,
  },
  {
    id: "payment-worker",
    name: "Payment Worker",
    tier: "worker",
    protocol: "Kafka Consumer",
    qps: 450,
    avgLatency: "85ms",
    errorRate: "0.05%",
    dependencies: ["order-db", "kafka-broker"],
    status: "healthy",
    x: 480,
    y: 220,
  },
  {
    id: "kafka-broker",
    name: "Kafka Event Bus",
    tier: "data",
    protocol: "Kafka Protocol",
    qps: 8900,
    avgLatency: "4ms",
    errorRate: "0.12%",
    dependencies: [],
    status: "degraded",
    x: 680,
    y: 140,
  },
  {
    id: "order-db",
    name: "PostgreSQL Orders DB",
    tier: "data",
    protocol: "PostgreSQL Wire",
    qps: 3200,
    avgLatency: "3ms",
    errorRate: "0.00%",
    dependencies: [],
    status: "healthy",
    x: 680,
    y: 260,
  },
  {
    id: "user-db",
    name: "PostgreSQL Users DB",
    tier: "data",
    protocol: "PostgreSQL Wire",
    qps: 1800,
    avgLatency: "2.8ms",
    errorRate: "0.00%",
    dependencies: [],
    status: "healthy",
    x: 680,
    y: 360,
  },
  {
    id: "redis-cache",
    name: "Redis Session Cache",
    tier: "data",
    protocol: "RESP3",
    qps: 12400,
    avgLatency: "0.8ms",
    errorRate: "0.00%",
    dependencies: [],
    status: "healthy",
    x: 680,
    y: 40,
  },
];

export default function DependenciesPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("order-api");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Find upstream dependents (who calls this node)
  const upstreamCallers = selectedNode
    ? nodes.filter((n) => n.dependencies.includes(selectedNode.id))
    : [];

  // Find downstream targets (who this node calls)
  const downstreamTargets = selectedNode
    ? nodes.filter((n) => selectedNode.dependencies.includes(n.id))
    : [];

  const handleExportTopology = () => {
    const topology = {
      version: "2.0",
      generatedAt: new Date().toISOString(),
      nodes: nodes.map((n) => ({
        id: n.id,
        name: n.name,
        tier: n.tier,
        dependencies: n.dependencies,
        qps: n.qps,
        latency: n.avgLatency,
        errorRate: n.errorRate,
      })),
      circularDependencies: false,
      blastRadiusMaxTier: 3,
    };
    const blob = new Blob([JSON.stringify(topology, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dependency-topology-v2-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Dependency topology exported as JSON");
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesTier = filterTier === "all" || n.tier === filterTier;
    const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Network className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Service Dependency Visualizer
            </h1>
            <Badge variant="outline" className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20">
              {nodes.length} Nodes Mapped
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Explore service-to-service topology, dependency matrices, and cascading blast radius impacts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTopology}
            className="gap-1.5 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Blueprint
          </Button>
          <Link href="/create">
            <Button size="sm" className="gap-1.5 h-8 text-xs shadow-xs">
              <Server className="h-3.5 w-3.5" />
              Register Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Total Microservices</span>
            <div className="mt-1 text-xl font-bold">{nodes.length} Services</div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Total Connections</span>
            <div className="mt-1 text-xl font-bold">
              {nodes.reduce((acc, n) => acc + n.dependencies.length, 0)} Active Edges
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Circular Loops</span>
            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              0 Cycles (Clean DAG)
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3.5">
            <span className="text-xs text-muted-foreground">Maximum Depth</span>
            <div className="mt-1 text-xl font-bold">3 Tiers</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactive Diagram & Inspection Panel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Visual Map */}
        <Card className="flex flex-col min-h-[460px] overflow-hidden border-border/80 shadow-xs">
          <div className="flex items-center justify-between border-b p-3 bg-muted/20">
            <div className="flex items-center gap-2 flex-wrap">
              {["all", "gateway", "api", "worker", "data"].map((tier) => (
                <Button
                  key={tier}
                  variant={filterTier === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterTier(tier)}
                  className="capitalize text-xs h-7 px-2.5"
                >
                  {tier}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-36 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter node..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 text-xs pl-8"
                />
              </div>

              <div className="flex items-center border rounded-md bg-background p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                  className="h-6 w-6 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                  className="h-6 px-1.5 text-[10px] font-mono"
                >
                  {Math.round(zoomLevel * 100)}%
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className="h-6 w-6 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 bg-muted/5 relative overflow-auto">
            {/* SVG Diagram Rendering */}
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }} className="transition-transform duration-150">
              <svg className="w-full min-w-[700px] h-[400px]" viewBox="0 0 820 420">
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="18"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground/60" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="18"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-primary" />
                  </marker>
                </defs>

                {/* Render Lines */}
                {nodes.map((source) =>
                  source.dependencies.map((targetId) => {
                    const target = nodes.find((n) => n.id === targetId);
                    if (!target) return null;
                    const isHighlighted =
                      selectedNodeId === source.id || selectedNodeId === target.id;
                    return (
                      <line
                        key={`${source.id}->${target.id}`}
                        x1={source.x + 60}
                        y1={source.y + 20}
                        x2={target.x + 60}
                        y2={target.y + 20}
                        stroke="currentColor"
                        strokeWidth={isHighlighted ? 2.5 : 1.2}
                        strokeDasharray={source.tier === "worker" ? "4,4" : undefined}
                        className={
                          isHighlighted
                            ? "text-primary transition-all duration-300"
                            : "text-muted-foreground/30"
                        }
                        markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow)"}
                      />
                    );
                  })
                )}

                {/* Render Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isUpstream = selectedNode?.dependencies.includes(node.id);
                  const isDownstream = node.dependencies.includes(selectedNodeId || "");

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        width="130"
                        height="46"
                        rx="8"
                        className={`transition-all duration-200 ${
                          isSelected
                            ? "fill-primary text-primary-foreground stroke-2 stroke-primary shadow-lg"
                            : isUpstream || isDownstream
                            ? "fill-primary/10 stroke-primary stroke-1"
                            : "fill-card stroke-border hover:stroke-primary/50"
                        }`}
                      />
                      <text
                        x="10"
                        y="20"
                        className={`text-[11px] font-semibold select-none ${
                          isSelected ? "fill-primary-foreground" : "fill-foreground"
                        }`}
                      >
                        {node.name.length > 15 ? node.name.slice(0, 14) + "…" : node.name}
                      </text>
                      <text
                        x="10"
                        y="35"
                        className={`text-[9px] select-none capitalize ${
                          isSelected ? "fill-primary-foreground/80" : "fill-muted-foreground"
                        }`}
                      >
                        {node.tier} • {node.protocol.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="p-2.5 border-t bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Click any node in the topology to inspect its connections and blast radius</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary inline-block" /> Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary/40 inline-block" /> Connected
              </span>
            </div>
          </div>
        </Card>

        {/* Node Inspection & Blast Radius Drawer */}
        {selectedNode ? (
          <Card className="border-border/80">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase">
                  {selectedNode.tier}
                </Badge>
                <Badge
                  variant={selectedNode.status === "healthy" ? "default" : "destructive"}
                  className="text-[9px]"
                >
                  {selectedNode.status}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold mt-2">{selectedNode.name}</CardTitle>
              <CardDescription className="text-xs font-mono">{selectedNode.id}</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-4">
              <Separator />

              {/* Service Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Traffic (QPS)</span>
                  <span className="font-semibold">{selectedNode.qps.toLocaleString()} req/s</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Avg Latency</span>
                  <span className="font-semibold">{selectedNode.avgLatency}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Error Rate</span>
                  <span className="font-semibold font-mono text-emerald-500">{selectedNode.errorRate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Protocol</span>
                  <span className="font-semibold font-mono text-[10px] truncate">{selectedNode.protocol}</span>
                </div>
              </div>

              <Separator />

              {/* Blast Radius Impact Analysis */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                  Blast Radius Analysis
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  If <strong>{selectedNode.name}</strong> experiences failure,{" "}
                  <strong>{upstreamCallers.length} upstream caller(s)</strong> and{" "}
                  <strong>{downstreamTargets.length} downstream service(s)</strong> will be impacted.
                </p>
              </div>

              {/* Downstream Dependencies */}
              <div>
                <p className="text-[11px] font-semibold mb-1.5">
                  Downstream Dependencies ({downstreamTargets.length})
                </p>
                {downstreamTargets.length > 0 ? (
                  <div className="space-y-1">
                    {downstreamTargets.map((dep) => (
                      <button
                        key={dep.id}
                        onClick={() => setSelectedNodeId(dep.id)}
                        className="w-full flex items-center justify-between p-1.5 rounded-md border text-left text-xs hover:bg-accent transition-colors cursor-pointer"
                      >
                        <span className="font-medium truncate">{dep.name}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic">No downstream dependencies (Leaf node)</p>
                )}
              </div>

              {/* Upstream Callers */}
              <div>
                <p className="text-[11px] font-semibold mb-1.5">
                  Upstream Callers ({upstreamCallers.length})
                </p>
                {upstreamCallers.length > 0 ? (
                  <div className="space-y-1">
                    {upstreamCallers.map((caller) => (
                      <button
                        key={caller.id}
                        onClick={() => setSelectedNodeId(caller.id)}
                        className="w-full flex items-center justify-between p-1.5 rounded-md border text-left text-xs hover:bg-accent transition-colors cursor-pointer"
                      >
                        <span className="font-medium truncate">{caller.name}</span>
                        <Badge variant="outline" className="text-[8px] font-mono">
                          {caller.protocol.split(" ")[0]}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic">Root Gateway (Ingress entrypoint)</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center p-6 text-center text-muted-foreground text-xs">
            Select a service to inspect its connections
          </Card>
        )}
      </div>
    </div>
  );
}
