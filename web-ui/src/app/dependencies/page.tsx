"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Network,
  Download,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TopologyGraph, type TopologyNode } from "./components/topology-graph";
import { NodeDrawer } from "./components/node-drawer";

const initialNodes: TopologyNode[] = [
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
  const [nodes, setNodes] = useState<TopologyNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("order-api");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

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
            className="gap-1.5 h-8 text-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Blueprint
          </Button>
          <Link href="/create">
            <Button size="sm" className="gap-1.5 h-8 text-xs shadow-xs cursor-pointer">
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
        <TopologyGraph
          nodes={filteredNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          filterTier={filterTier}
          setFilterTier={setFilterTier}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />

        <NodeDrawer
          selectedNode={selectedNode}
          nodes={nodes}
          onSelectNode={setSelectedNodeId}
        />
      </div>
    </div>
  );
}
