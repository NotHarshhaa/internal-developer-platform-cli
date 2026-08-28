"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";
import { Rocket, FileCode, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Template } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ArchitectureModalProps {
  template: Template | null;
  files: { path: string; content: string }[];
  activeFile: string;
  setActiveFile: (p: string) => void;
  onClose: () => void;
}

export function ArchitectureModal({
  template,
  files,
  activeFile,
  setActiveFile,
  onClose,
}: ArchitectureModalProps) {
  const [copiedFile, setCopiedFile] = useState(false);

  if (!template) return null;

  const currentFileContent = files.find((f) => f.path === activeFile) || files[0];

  const handleCopyCurrentFile = () => {
    if (currentFileContent) {
      navigator.clipboard.writeText(currentFileContent.content);
      setCopiedFile(true);
      toast.success("File content copied to clipboard");
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  return (
    <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {React.createElement(template.icon, { className: "w-5 h-5 text-primary" })}
              <DialogTitle className="text-base font-bold">
                {template.name} Architecture
              </DialogTitle>
              <Badge variant="secondary" className="text-[10px]">
                {template.framework}
              </Badge>
            </div>
            <Link href={`/create?template=${template.id}`}>
              <Button size="sm" className="h-7 text-xs gap-1.5 cursor-pointer">
                <Rocket className="h-3 w-3" />
                Use Template
              </Button>
            </Link>
          </div>
          <DialogDescription className="text-xs">
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Multi-Tab Interactive Code Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] border rounded-lg overflow-hidden min-h-[340px] max-h-[460px]">
          {/* File Sidebar */}
          <div className="border-r bg-muted/20 p-2 overflow-y-auto space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-1.5">
              Generated Files ({files.length})
            </p>
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setActiveFile(file.path)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[11px] font-mono transition-colors cursor-pointer truncate",
                  activeFile === file.path
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <FileCode className="h-3 w-3 shrink-0" />
                <span className="truncate">{file.path}</span>
              </button>
            ))}
          </div>

          {/* File Code Editor View */}
          <div className="flex flex-col bg-neutral-950 text-neutral-200">
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/60">
              <span className="text-[11px] font-mono text-neutral-400">
                {currentFileContent?.path} ({currentFileContent?.content.split("\n").length} lines)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCurrentFile}
                className="h-6 text-[10px] gap-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 cursor-pointer"
              >
                {copiedFile ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedFile ? "Copied" : "Copy File"}
              </Button>
            </div>

            <pre className="p-3.5 font-mono text-xs overflow-auto flex-1 leading-relaxed text-neutral-200">
              {currentFileContent?.content}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>Includes Docker, Kubernetes Kustomize, and CI/CD automation</span>
          <Link href={`/create?template=${template.id}`}>
            <Button size="sm" className="gap-1.5 text-xs cursor-pointer">
              <Rocket className="h-3.5 w-3.5" />
              Configure in Wizard &rarr;
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
