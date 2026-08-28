"use client";

import React from "react";
import { ZoomIn, ZoomOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export interface TopologyNode {
  id: string;
  name: string;
  tier: "gateway" | "api" | "worker" | "data";
  protocol: string;
  qps: number;
  avgLatency: string;
  errorRate: string;
  dependencies: string[];
  status: "healthy" | "degraded";
  x: number;
  y: number;
}

interface TopologyGraphProps {
  nodes: TopologyNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  filterTier: string;
  setFilterTier: (t: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

export function TopologyGraph({
  nodes,
  selectedNodeId,
  onSelectNode,
  filterTier,
  setFilterTier,
  searchQuery,
  setSearchQuery,
  zoomLevel,
  setZoomLevel,
}: TopologyGraphProps) {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <Card className="flex flex-col min-h-[460px] overflow-hidden border-border/80 shadow-xs">
      <div className="flex items-center justify-between border-b p-3 bg-muted/20">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "gateway", "api", "worker", "data"].map((tier) => (
            <Button
              key={tier}
              variant={filterTier === tier ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTier(tier)}
              className="capitalize text-xs h-7 px-2.5 cursor-pointer"
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
              className="h-6 w-6 p-0 cursor-pointer"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(1)}
              className="h-6 px-1.5 text-[10px] font-mono cursor-pointer"
            >
              {Math.round(zoomLevel * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="h-6 w-6 p-0 cursor-pointer"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 bg-muted/5 relative overflow-auto">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
          className="transition-transform duration-150"
        >
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
                  onClick={() => onSelectNode(node.id)}
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
  );
}
