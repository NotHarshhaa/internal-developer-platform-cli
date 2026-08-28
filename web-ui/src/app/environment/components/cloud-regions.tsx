"use client";

import React from "react";
import { Cloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CloudRegion {
  provider: string;
  region: string;
  latency: string;
  status: string;
  healthy: boolean;
}

interface CloudRegionsProps {
  regions: CloudRegion[];
}

export function CloudRegionsCard({ regions }: CloudRegionsProps) {
  return (
    <Card className="border-border/80">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cloud className="h-4 w-4 text-sky-500" />
          Cloud Provider Regional Latency
        </CardTitle>
        <CardDescription className="text-xs">
          Connectivity and roundtrip ping to primary cloud regions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {regions.map((region) => (
          <div
            key={region.provider}
            className="flex items-center justify-between p-2.5 rounded-lg border text-xs bg-muted/10"
          >
            <div>
              <p className="font-semibold text-foreground">{region.provider}</p>
              <p className="text-[10px] text-muted-foreground">{region.region}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-medium">{region.latency}</span>
              <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/20">
                {region.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
