"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Settings,
  Rocket,
  Copy,
  Download,
  Loader2,
  Trash2,
  History,
  UploadCloud,
  Keyboard as Kbd,
  MoreHorizontal,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  templates,
  defaultConfig,
  type ServiceConfig,
  type ConfigPreset,
  type RecentService,
} from "@/lib/data";
import { getTemplate } from "@/lib/generators/registry";
import { createZip, downloadZip } from "@/lib/utils/zip";
import {
  saveRecentService,
  getRecentServices,
  deleteRecentService,
  exportConfig,
  importConfig,
  copyToClipboard,
} from "@/lib/utils/storage";
import { generateServiceNameSuggestions } from "@/lib/utils/names";
import { StepTemplate } from "./components/step-template";
import { StepConfigure } from "./components/step-configure";
import { StepReviewAndGenerate } from "./components/step-review";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Select Template", icon: Layers, description: "Choose language & framework" },
  { id: 2, title: "Configure Architecture", icon: Settings, description: "CI/CD, K8s, environment" },
  { id: 3, title: "Review & Generate", icon: Rocket, description: "Preview files & download ZIP" },
];

function CreateServiceContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ServiceConfig>({
    ...defaultConfig,
    template: searchParams.get("template") || "",
  });
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generated, setGenerated] = useState(false);
  const [nameError, setNameError] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState<{ path: string; content: string }[]>([]);
  const [activePreviewFile, setActivePreviewFile] = useState<string>("");
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const recentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tpl = searchParams.get("template");
    if (tpl && templates.find((t) => t.id === tpl)) {
      setConfig((c) => ({ ...c, template: tpl }));
    }
    setRecentServices(getRecentServices());
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recentRef.current && !recentRef.current.contains(event.target as Node)) {
        setShowRecent(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTemplate = templates.find((t) => t.id === config.template);

  const validateName = (name: string) => {
    if (!name) return "Service name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name))
      return "Use lowercase letters, numbers, and hyphens (must start with letter)";
    return "";
  };

  const canProceed = () => {
    if (step === 1) return !!config.template;
    if (step === 2) return !!config.name && !nameError;
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!config.name && config.template) {
        setConfig((c) => ({ ...c, name: `${config.template}-service` }));
      }
    }
    if (step === 2) {
      const error = validateName(config.name);
      if (error) {
        setNameError(error);
        return;
      }
      try {
        const template = getTemplate(config.template, config);
        const files = template.generateFiles();
        setGeneratedFiles(files);
        if (files.length > 0) {
          setActivePreviewFile(files[0].path);
        }
      } catch (err) {
        console.error("Preview generation error:", err);
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationStep("Compiling microservice boilerplate...");
    
    try {
      const template = getTemplate(config.template, config);
      
      await new Promise((r) => setTimeout(r, 250));
      setGenerationStep("Generating multi-stage Dockerfile & K8s overlays...");
      const files = template.generateFiles();
      setGeneratedFiles(files);
      if (files.length > 0) {
        setActivePreviewFile(files[0].path);
      }

      await new Promise((r) => setTimeout(r, 300));
      setGenerationStep("Compressing production package ZIP...");
      const zipBlob = await createZip(files, config.name);
      
      downloadZip(zipBlob, `${config.name}.zip`);
      saveRecentService(config, selectedTemplate?.name || config.template);
      setRecentServices(getRecentServices());
      
      setGenerated(true);
      toast.success("Service generated successfully!", {
        description: `Downloaded ${config.name}.zip with ${files.length} production files.`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to generate service";
      toast.error("Generation failed", {
        description: errorMsg,
      });
    } finally {
      setGenerating(false);
      setGenerationStep("");
    }
  };

  const applyPreset = (preset: ConfigPreset) => {
    setConfig((c) => ({
      ...c,
      ...preset.config,
    }));
    toast.success("Preset applied", {
      description: `Applied ${preset.name} configuration`,
    });
  };

  const loadRecentService = (recent: RecentService) => {
    setConfig(recent.config);
    setShowRecent(false);
    setShowActionsMenu(false);
    toast.success("Configuration loaded", {
      description: `Loaded ${recent.config.name} configuration`,
    });
  };

  const handleExportConfig = () => {
    const json = exportConfig(config);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name || "service"}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Configuration exported as JSON");
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const importedConfig = importConfig(content);
      if (importedConfig) {
        setConfig(importedConfig);
        toast.success("Configuration imported successfully");
      } else {
        toast.error("Invalid configuration file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleCopyConfig = async () => {
    const json = exportConfig(config);
    const success = await copyToClipboard(json);
    if (success) {
      toast.success("Configuration copied to clipboard");
    }
  };

  const handleGenerateSuggestions = () => {
    const suggestions = generateServiceNameSuggestions(config.template || "api");
    setNameSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (name: string) => {
    setConfig({ ...config, name });
    setShowSuggestions(false);
    setNameError("");
  };

  const cliCommand = `idp create ${config.name || "my-service"} --template ${config.template || "python-api"} --ci ${config.ci} --deploy ${config.deploy} ${config.gitops !== "none" ? `--gitops ${config.gitops}` : ""} ${config.docker ? "--docker" : ""} ${config.k8s ? "--k8s" : ""} ${config.monitoring ? "--monitoring" : ""} ${config.docs ? "--docs" : ""}`.replace(/\s+/g, " ").trim();

  const handleCopyCliCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    toast.success("CLI command copied to clipboard");
    setTimeout(() => setCopiedCli(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "Enter" && step < 3 && canProceed()) {
          e.preventDefault();
          handleNext();
        }
        if (e.key === "k") {
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
        }
      }
      if (e.key === "Escape") {
        setShowRecent(false);
        setShowSuggestions(false);
        setShowKeyboardShortcuts(false);
        setShowActionsMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, showKeyboardShortcuts, config]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Rocket className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Create Production Service
            </h1>
            <Badge variant="outline" className="text-[10px] text-primary bg-primary/5 border-primary/20">
              v2.0.0 Self-Service
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Bootstrap complete microservices with multi-stage Dockerfiles, K8s manifests, and CI/CD pipelines
          </p>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {recentServices.length > 0 && (
            <div className="relative" ref={recentRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRecent(!showRecent);
                  setShowActionsMenu(false);
                }}
                className="gap-1.5 h-8 text-xs"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recent</span>
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                  {recentServices.length}
                </Badge>
              </Button>

              {showRecent && (
                <Card className="absolute right-0 top-full z-50 mt-2 w-72 shadow-xl border-border/80">
                  <CardHeader className="p-3 pb-2 border-b bg-muted/20">
                    <CardTitle className="text-xs font-semibold flex items-center justify-between">
                      <span>Recent Services</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Click to restore
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-60 overflow-y-auto">
                    {recentServices.map((recent) => (
                      <div
                        key={recent.id}
                        className="flex items-center justify-between border-b px-3 py-2 last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <button
                          onClick={() => loadRecentService(recent)}
                          className="flex-1 text-left cursor-pointer"
                        >
                          <p className="text-xs font-medium text-foreground">{recent.config.name}</p>
                          <p className="text-[10px] text-muted-foreground">{recent.templateName}</p>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecentService(recent.id);
                            setRecentServices(getRecentServices());
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="relative" ref={actionsRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowActionsMenu(!showActionsMenu);
                setShowRecent(false);
              }}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Options</span>
            </Button>

            {showActionsMenu && (
              <Card className="absolute right-0 top-full z-50 mt-2 w-52 shadow-xl border-border/80">
                <CardContent className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      handleCopyConfig();
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent rounded-md text-left transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    Copy Config (JSON)
                  </button>
                  <button
                    onClick={() => {
                      handleExportConfig();
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent rounded-md text-left transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    Export Config File
                  </button>
                  <label className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent rounded-md text-left transition-colors cursor-pointer">
                    <UploadCloud className="h-3.5 w-3.5 text-muted-foreground" />
                    Import Config File
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        handleImportConfig(e);
                        setShowActionsMenu(false);
                      }}
                      className="hidden"
                    />
                  </label>
                  <Separator className="my-1" />
                  <button
                    onClick={() => {
                      setShowKeyboardShortcuts(true);
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent rounded-md text-left transition-colors cursor-pointer"
                  >
                    <Kbd className="h-3.5 w-3.5 text-muted-foreground" />
                    Shortcuts & Tips
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="rounded-xl border bg-card/60 p-2 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {steps.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
                disabled={s.id > step}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg text-left transition-all cursor-pointer",
                  isCurrent
                    ? "bg-primary/10 border border-primary/30 shadow-xs"
                    : isCompleted
                    ? "hover:bg-muted/50 opacity-90"
                    : "opacity-40 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.id}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {s.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div>
        {step === 1 && (
          <StepTemplate
            selected={config.template}
            onSelect={(id) => setConfig({ ...config, template: id })}
          />
        )}

        {step === 2 && (
          <StepConfigure
            config={config}
            setConfig={setConfig}
            nameError={nameError}
            setNameError={setNameError}
            validateName={validateName}
            applyPreset={applyPreset}
            onGenerateSuggestions={handleGenerateSuggestions}
            showSuggestions={showSuggestions}
            nameSuggestions={nameSuggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        )}

        {step === 3 && (
          <StepReviewAndGenerate
            config={config}
            template={selectedTemplate}
            generating={generating}
            generationStep={generationStep}
            generated={generated}
            generatedFiles={generatedFiles}
            activeFile={activePreviewFile}
            setActiveFile={setActivePreviewFile}
            onGenerate={handleGenerate}
            cliCommand={cliCommand}
            onCopyCli={handleCopyCliCommand}
            copiedCli={copiedCli}
          />
        )}
      </div>

      {/* Sticky Bottom Navigation Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || generating}
          size="sm"
          className="gap-1.5 text-xs h-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              size="sm"
              className="gap-1.5 text-xs h-8 shadow-xs"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : !generated ? (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              size="sm"
              className="gap-1.5 text-xs h-8 shadow-md"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Generate & Download ZIP
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerate}
              className="gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="h-3.5 w-3.5" />
              Download Again (.zip)
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Kbd className="h-4 w-4 text-primary" />
              Keyboard Shortcuts & Productivity
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fast navigation shortcuts for power users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-md border">
              <span>Next step / Proceed</span>
              <kbd className="px-2 py-0.5 bg-muted rounded border text-[11px] font-mono">
                Ctrl + Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md border">
              <span>Quick command search</span>
              <kbd className="px-2 py-0.5 bg-muted rounded border text-[11px] font-mono">
                Ctrl + K
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md border">
              <span>Dismiss dialogs / dropdowns</span>
              <kbd className="px-2 py-0.5 bg-muted rounded border text-[11px] font-mono">
                Escape
              </kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CreateServiceContent />
    </Suspense>
  );
}
