"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SecurityKpisProps {
  score: number;
  warningCount: number;
}

export function SecurityKpiCards({ score, warningCount }: SecurityKpisProps) {
  return (
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
  );
}
