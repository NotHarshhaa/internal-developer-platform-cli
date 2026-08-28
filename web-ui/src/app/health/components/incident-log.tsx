"use client";

import React from "react";
import { AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface Incident {
  id: string;
  service: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface IncidentLogProps {
  incidents: Incident[];
  onToggleIncident: (id: string) => void;
}

export function IncidentLog({ incidents, onToggleIncident }: IncidentLogProps) {
  return (
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
              onClick={() => onToggleIncident(incident.id)}
              className="h-7 text-[10px] shrink-0 self-start sm:self-center cursor-pointer"
            >
              {incident.resolved ? "Reopen Alert" : "Acknowledge & Resolve"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
