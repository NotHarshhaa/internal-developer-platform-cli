"use client";

import React from "react";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type TopologyNode } from "./topology-graph";

interface NodeDrawerProps {
  selectedNode: TopologyNode | undefined;
  nodes: TopologyNode[];
  onSelectNode: (id: string) => void;
}

export function NodeDrawer({ selectedNode, nodes, onSelectNode }: NodeDrawerProps) {
  if (!selectedNode) {
    return (
      <Card className="flex items-center justify-center p-6 text-center text-muted-foreground text-xs">
        Select a service to inspect its connections
      </Card>
    );
  }

  const upstreamCallers = nodes.filter((n) => n.dependencies.includes(selectedNode.id));
  const downstreamTargets = nodes.filter((n) => selectedNode.dependencies.includes(n.id));

  return (
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
                  onClick={() => onSelectNode(dep.id)}
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
                  onClick={() => onSelectNode(caller.id)}
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
  );
}
