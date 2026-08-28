"use client";

import React from "react";
import { Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ClusterNode {
  name: string;
  role: "control-plane" | "worker";
  status: "Ready" | "NotReady";
  cpuPercent: number;
  memoryPercent: number;
  version: string;
  podsCount: number;
}

interface NodeTableProps {
  nodes: ClusterNode[];
  environment: string;
}

export function NodeTable({ nodes, environment }: NodeTableProps) {
  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Node Infrastructure ({environment})
          </span>
          <Badge variant="outline" className="text-[9px] font-mono">
            {nodes.length} Nodes Online
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
                <th className="py-2 font-medium">CPU Utilization</th>
                <th className="py-2 font-medium">Memory Allocation</th>
                <th className="py-2 font-medium">Pods</th>
                <th className="py-2 font-medium">K8s Version</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nodes.map((node) => (
                <tr key={node.name} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-mono font-medium text-foreground">{node.name}</td>
                  <td className="py-2.5 capitalize">{node.role}</td>
                  <td className="py-2.5">
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-emerald-500 text-white">
                      {node.status}
                    </Badge>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${node.cpuPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px]">{node.cpuPercent}%</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${node.memoryPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px]">{node.memoryPercent}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 font-semibold">{node.podsCount} pods</td>
                  <td className="py-2.5 font-mono text-muted-foreground">{node.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
