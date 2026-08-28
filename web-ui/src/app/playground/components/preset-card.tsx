"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CommandPreset {
  id: string;
  name: string;
  command: string;
  description: string;
  category: "Create" | "Health" | "Topology" | "Cost" | "Security";
  simulatedOutput: string[];
}

interface PresetCardProps {
  preset: CommandPreset;
  isActive: boolean;
  onSelect: (preset: CommandPreset) => void;
}

export function PresetCard({ preset, isActive, onSelect }: PresetCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        isActive
          ? "ring-2 ring-primary border-primary bg-primary/5 shadow-xs"
          : "border-border/70"
      }`}
      onClick={() => onSelect(preset)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="secondary" className="text-[9px]">
            {preset.category}
          </Badge>
          {isActive && (
            <Badge variant="default" className="text-[8px] px-1 py-0">
              Active
            </Badge>
          )}
        </div>
        <h4 className="text-xs font-bold text-foreground">{preset.name}</h4>
        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
          {preset.description}
        </p>
      </CardContent>
    </Card>
  );
}
