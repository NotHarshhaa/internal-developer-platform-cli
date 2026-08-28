"use client";

import React from "react";
import { Sliders, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface SizingControlsProps {
  serviceCount: number;
  setServiceCount: (n: number) => void;
  replicasPerService: number;
  setReplicasPerService: (n: number) => void;
  cpuCores: number;
  setCpuCores: (n: number) => void;
  memoryGb: number;
  setMemoryGb: (n: number) => void;
  databaseTier: "none" | "basic" | "ha";
  setDatabaseTier: (t: "none" | "basic" | "ha") => void;
  redisEnabled: boolean;
  setRedisEnabled: (b: boolean) => void;
  useSpotInstances: boolean;
  setUseSpotInstances: (b: boolean) => void;
}

export function SizingControls({
  serviceCount,
  setServiceCount,
  replicasPerService,
  setReplicasPerService,
  cpuCores,
  setCpuCores,
  memoryGb,
  setMemoryGb,
  databaseTier,
  setDatabaseTier,
  redisEnabled,
  setRedisEnabled,
  useSpotInstances,
  setUseSpotInstances,
}: SizingControlsProps) {
  return (
    <Card className="border-border/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          Service & Pod Sizing Parameters
        </CardTitle>
        <CardDescription className="text-xs">
          Configure your application topology to dynamically estimate resource pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        {/* Service Count & Replicas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label htmlFor="services" className="font-medium">Number of Microservices</Label>
              <span className="font-semibold">{serviceCount}</span>
            </div>
            <Input
              id="services"
              type="range"
              min="1"
              max="20"
              value={serviceCount}
              onChange={(e) => setServiceCount(parseInt(e.target.value) || 1)}
              className="h-6 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label htmlFor="replicas" className="font-medium">Replicas per Service</Label>
              <span className="font-semibold">{replicasPerService}</span>
            </div>
            <Input
              id="replicas"
              type="range"
              min="1"
              max="10"
              value={replicasPerService}
              onChange={(e) => setReplicasPerService(parseInt(e.target.value) || 1)}
              className="h-6 cursor-pointer"
            />
          </div>
        </div>

        {/* CPU & Memory per Pod */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label htmlFor="cpu" className="font-medium">CPU Cores per Pod</Label>
              <span className="font-semibold">{cpuCores} vCPU</span>
            </div>
            <select
              id="cpu"
              value={cpuCores}
              onChange={(e) => setCpuCores(parseFloat(e.target.value))}
              className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs font-mono"
            >
              <option value="0.25">0.25 vCPU (250m - Lightweight)</option>
              <option value="0.5">0.5 vCPU (500m - Standard API)</option>
              <option value="1">1.0 vCPU (1000m - High Traffic)</option>
              <option value="2">2.0 vCPU (2000m - Heavy Workload)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label htmlFor="memory" className="font-medium">RAM per Pod</Label>
              <span className="font-semibold">{memoryGb} GB</span>
            </div>
            <select
              id="memory"
              value={memoryGb}
              onChange={(e) => setMemoryGb(parseFloat(e.target.value))}
              className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs font-mono"
            >
              <option value="0.5">512 MB (Minimal)</option>
              <option value="1">1.0 GB (Standard)</option>
              <option value="2">2.0 GB (Spring/Java/ML)</option>
              <option value="4">4.0 GB (High Memory)</option>
            </select>
          </div>
        </div>

        <Separator />

        {/* Database and Cache options */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Managed Database & Cache</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "none", label: "No Managed DB", desc: "$0 / mo" },
              { id: "basic", label: "PostgreSQL Basic", desc: "~$45 / mo (Single AZ)" },
              { id: "ha", label: "PostgreSQL HA Cluster", desc: "~$190 / mo (Multi-AZ)" },
            ].map((tier) => (
              <Button
                key={tier.id}
                type="button"
                variant={databaseTier === tier.id ? "default" : "outline"}
                size="sm"
                onClick={() => setDatabaseTier(tier.id as any)}
                className="flex flex-col items-start h-auto p-2.5 text-left hover:border-primary/50 cursor-pointer"
              >
                <span className="font-semibold text-xs">{tier.label}</span>
                <span className="text-[10px] opacity-80">{tier.desc}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-xs font-semibold">Managed Redis Cache</p>
              <p className="text-[10px] text-muted-foreground">High-performance memory cache (~$32/mo)</p>
            </div>
            <Switch checked={redisEnabled} onCheckedChange={setRedisEnabled} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Use Spot / Preemptible Worker Nodes
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">Save 55% on Kubernetes compute instances</p>
            </div>
            <Switch checked={useSpotInstances} onCheckedChange={setUseSpotInstances} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
