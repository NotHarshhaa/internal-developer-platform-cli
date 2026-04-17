"use client";

import { useState, useEffect, Suspense } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Terminal,
  Layers,
  Settings,
  Rocket,
  Copy,
  Download,
  CheckCircle2,
  Loader2,
  GitBranch,
  Container,
  BarChart3,
  FileText,
  X,
  Plus,
  Trash2,
  FolderOpen,
  Server,
  Cpu,
  HardDrive,
  Activity,
  History,
  Eye,
  Sparkles,
  UploadCloud,
  Keyboard as Kbd,
  Lightbulb,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { templates, type Template, defaultConfig, type ServiceConfig, ciProviders, deployTargets, gitOpsTools, configPresets, type ConfigPreset, type RecentService } from "@/lib/data";
import { getTemplate } from "@/lib/generators/registry";
import { createZip, downloadZip } from "@/lib/utils/zip";
import { saveRecentService, getRecentServices, deleteRecentService, exportConfig, importConfig, copyToClipboard } from "@/lib/utils/storage";
import { generateServiceNameSuggestions } from "@/lib/utils/names";

const steps = [
  { id: 1, title: "Template", icon: Layers, description: "Choose a template" },
  { id: 2, title: "Configure", icon: Settings, description: "Service settings" },
  { id: 3, title: "Generate", icon: Rocket, description: "Review & download" },
];

function CreateServiceContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ServiceConfig>({
    ...defaultConfig,
    template: searchParams.get("template") || "",
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [nameError, setNameError] = useState("");
  const [generationOutput, setGenerationOutput] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<{ path: string; content: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const recentRef = React.useRef<HTMLDivElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tpl = searchParams.get("template");
    if (tpl && templates.find((t) => t.id === tpl)) {
      setConfig((c) => ({ ...c, template: tpl }));
    }
    setRecentServices(getRecentServices());
  }, [searchParams]);

  // Click outside to close dropdowns
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
    if (step === 2) {
      const error = validateName(config.name);
      if (error) {
        setNameError(error);
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationOutput("");
    setGeneratedFiles([]);
    
    try {
      // Get the template generator
      const template = getTemplate(config.template, config);
      
      // Generate files
      const files = template.generateFiles();
      setGeneratedFiles(files.map(f => f.path));
      
      // Create ZIP
      const zipBlob = await createZip(files, config.name);
      
      // Download ZIP
      downloadZip(zipBlob, `${config.name}.zip`);
      
      // Save to recent services
      saveRecentService(config, selectedTemplate?.name || config.template);
      setRecentServices(getRecentServices());
      
      setGenerated(true);
      setGenerationOutput(`Successfully generated ${files.length} files for ${config.name}`);
      toast.success("Service generated successfully!", {
        description: `Downloaded ${config.name}.zip with ${files.length} files.`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to generate service";
      toast.error("Generation failed", {
        description: errorMsg,
      });
      setGenerationOutput(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handlePreviewFiles = () => {
    try {
      const template = getTemplate(config.template, config);
      const files = template.generateFiles();
      setPreviewFiles(files);
      setShowPreview(true);
    } catch (error) {
      toast.error("Preview failed", {
        description: error instanceof Error ? error.message : "Failed to generate preview",
      });
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
    toast.success("Configuration exported", {
      description: "Downloaded configuration as JSON",
    });
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
        toast.success("Configuration imported", {
          description: "Loaded configuration from file",
        });
      } else {
        toast.error("Import failed", {
          description: "Invalid configuration file",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleCopyConfig = async () => {
    const json = exportConfig(config);
    const success = await copyToClipboard(json);
    if (success) {
      toast.success("Configuration copied", {
        description: "Copied to clipboard",
      });
    } else {
      toast.error("Copy failed", {
        description: "Could not copy to clipboard",
      });
    }
  };

  const handleGenerateSuggestions = () => {
    const suggestions = generateServiceNameSuggestions(config.template);
    setNameSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (name: string) => {
    setConfig({ ...config, name });
    setShowSuggestions(false);
    setNameError("");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "k") {
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
        }
        if (e.key === "Enter" && step < 3 && canProceed()) {
          e.preventDefault();
          handleNext();
        }
      }
      if (e.key === "Escape") {
        setShowRecent(false);
        setShowPreview(false);
        setShowSuggestions(false);
        setShowKeyboardShortcuts(false);
        setShowActionsMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, showKeyboardShortcuts, config]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Compact Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Create a Service</h1>
            <Badge variant="outline" className="text-[9px] px-2 py-0.5">
              v1.5.0
            </Badge>
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Configure your service and download the generated code as a ZIP file
          </p>
        </div>
        <div className="flex items-center gap-2">
          {recentServices.length > 0 && (
            <div className="relative" ref={recentRef}>
              <Button variant="outline" size="sm" onClick={() => {
                setShowRecent(!showRecent);
                setShowActionsMenu(false);
              }} className="gap-1.5 h-8 text-xs">
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recent</span>
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                  {recentServices.length}
                </Badge>
              </Button>
              {showRecent && (
                <Card className="absolute right-0 top-full z-50 mt-2 w-72 shadow-lg">
                  <CardHeader className="pb-2 px-3">
                    <CardTitle className="text-xs">Recent Services</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-64 overflow-y-auto">
                      {recentServices.map((recent) => (
                        <div
                          key={recent.id}
                          className="flex items-center justify-between border-b px-3 py-2 last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <button
                            onClick={() => loadRecentService(recent)}
                            className="flex-1 text-left"
                          >
                            <p className="text-xs font-medium">{recent.config.name}</p>
                            <p className="text-[9px] text-muted-foreground">{recent.templateName}</p>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecentService(recent.id);
                              setRecentServices(getRecentServices());
                            }}
                            className="h-5 w-5 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <div className="relative" ref={actionsRef}>
            <Button variant="ghost" size="sm" onClick={() => {
              setShowActionsMenu(!showActionsMenu);
              setShowRecent(false);
            }} className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showActionsMenu && (
              <Card className="absolute right-0 top-full z-50 mt-2 w-48 shadow-lg">
                <CardContent className="p-1">
                  <button
                    onClick={() => {
                      handleCopyConfig();
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded transition-colors text-left"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Config
                  </button>
                  <button
                    onClick={() => {
                      handleExportConfig();
                      setShowActionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded transition-colors text-left"
                  >
                    <Download className="h-3 w-3" />
                    Export Config
                  </button>
                  <label className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded transition-colors cursor-pointer">
                    <UploadCloud className="h-3 w-3" />
                    Import Config
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted rounded transition-colors text-left"
                  >
                    <Kbd className="h-3 w-3" />
                    Keyboard Shortcuts
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compact Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 transition-all w-full",
                  step === s.id
                    ? "bg-primary/10 border border-primary/20"
                    : step > s.id
                    ? "opacity-80 hover:bg-muted cursor-pointer"
                    : "opacity-40"
                )}
                disabled={s.id > step}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                    step > s.id
                      ? "bg-primary text-primary-foreground"
                      : step === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold">{s.title}</p>
                </div>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-4 mx-1 shrink-0",
                    step > s.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[200px]">
        {step === 1 && (
          <StepTemplate
            selected={config.template}
            onSelect={(id) => setConfig({ ...config, template: config.template === id ? "" : id })}
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
          <StepGenerate
            config={config}
            template={selectedTemplate!}
            generating={generating}
            generated={generated}
            onGenerate={handleGenerate}
            generationOutput={generationOutput}
            generatedFiles={generatedFiles}
            onPreview={handlePreviewFiles}
          />
        )}
      </div>

      {/* Compact Navigation */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          size="sm"
          className="gap-1.5 text-xs h-8"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            size="sm"
            className="gap-1.5 text-xs h-8"
          >
            Continue
            <ArrowRight className="h-3 w-3" />
          </Button>
        ) : !generated ? (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="sm"
            className="gap-1.5 text-xs h-8"
          >
            {generating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Download</span>
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" disabled>
            <CheckCircle2 className="h-3 w-3" />
            <span className="hidden sm:inline">Downloaded!</span>
          </Button>
        )}
      </div>

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Preview Generated Files</DialogTitle>
            <DialogDescription>
              Review the files that will be generated for {config.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-y-auto max-h-[60vh] space-y-2">
            {previewFiles.map((file, idx) => (
              <div key={idx} className="border rounded-lg">
                <div className="bg-muted px-3 py-2 border-b flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{file.path}</span>
                </div>
                <pre className="p-3 text-xs font-mono overflow-x-auto bg-neutral-950 text-green-400 max-h-48 overflow-y-auto">
                  {file.content}
                </pre>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Power user shortcuts to navigate faster
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Continue to next step</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + Enter</kbd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Show keyboard shortcuts</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Close dialogs/popups</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
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

/* ────────── Step 1: Template Selection ────────── */

function StepTemplate({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", "backend", "frontend", "tools"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize h-7 text-xs"
          >
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card
            key={t.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selected === t.id
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/30"
            )}
            onClick={() => onSelect(t.id)}
          >
            <CardHeader className="pb-2 p-3">
              <div className="flex items-center justify-between mb-2">
                <t.icon className="h-5 w-5" />
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {t.framework}
                  </Badge>
                  {selected === t.id && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <CardTitle className="text-sm">{t.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {t.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{t.language}</span>
                <span>•</span>
                <span className="capitalize">{t.category}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ────────── Step 2: Configure ────────── */

function StepConfigure({
  config,
  setConfig,
  nameError,
  setNameError,
  validateName,
  applyPreset,
  onGenerateSuggestions,
  showSuggestions,
  nameSuggestions,
  onSelectSuggestion,
}: {
  config: ServiceConfig;
  setConfig: (c: ServiceConfig) => void;
  nameError: string;
  setNameError: (e: string) => void;
  validateName: (n: string) => string;
  applyPreset: (preset: ConfigPreset) => void;
  onGenerateSuggestions: () => void;
  showSuggestions: boolean;
  nameSuggestions: string[];
  onSelectSuggestion: (name: string) => void;
}) {
  const selectedTemplate = templates.find((t) => t.id === config.template);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        {/* Service Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-semibold flex items-center justify-between">
            Service Name
            <Button
              variant="ghost"
              size="sm"
              onClick={onGenerateSuggestions}
              className="h-6 text-[10px] gap-1"
            >
              <Lightbulb className="h-3 w-3" />
              Suggest
            </Button>
          </Label>
          <div className="relative">
            <Input
              id="name"
              placeholder="my-awesome-service"
              value={config.name}
              onChange={(e) => {
                setConfig({ ...config, name: e.target.value });
                if (nameError) setNameError(validateName(e.target.value));
              }}
              className={cn("h-9 text-sm", nameError && "border-destructive")}
            />
            {showSuggestions && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                <CardContent className="p-2">
                  <p className="text-[10px] text-muted-foreground mb-2">Click to use a suggestion:</p>
                  <div className="space-y-1">
                    {nameSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectSuggestion(suggestion)}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {nameError ? (
            <p className="text-[10px] text-destructive">{nameError}</p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Lowercase letters, numbers, and hyphens. Must start with a letter.
            </p>
          )}
        </div>

        {/* Configuration Presets */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Quick Presets
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {configPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center gap-1 h-auto py-2.5"
              >
                <span className="text-xs font-medium">{preset.name}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* CI/CD */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">CI/CD Provider</Label>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {ciProviders.map((ci) => (
              <Card
                key={ci.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  config.ci === ci.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/30"
                )}
                onClick={() => setConfig({ ...config, ci: ci.id })}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <ci.icon className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-medium">{ci.name}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">
                        {ci.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Deploy Target */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Deploy Target</Label>
          <div className="grid gap-2 grid-cols-2">
            {deployTargets.map((dt) => (
              <Card
                key={dt.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  config.deploy === dt.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/30"
                )}
                onClick={() => setConfig({ ...config, deploy: dt.id })}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <dt.icon className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-medium">{dt.name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {dt.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* GitOps */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">GitOps Tool</Label>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {gitOpsTools.map((gt) => (
              <Card
                key={gt.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  config.gitops === gt.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/30"
                )}
                onClick={() => setConfig({ ...config, gitops: gt.id })}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <gt.icon className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-medium">{gt.name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {gt.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Service Configuration */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Service Configuration</Label>
          <div className="grid gap-3 grid-cols-2">
            {/* Port */}
            <div className="space-y-1.5">
              <Label htmlFor="port" className="text-[10px] flex items-center gap-1.5">
                <Server className="h-3 w-3" />
                Service Port
              </Label>
              <Input
                id="port"
                type="number"
                min="1024"
                max="65535"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 8080 })}
                className="h-8 text-sm"
              />
            </div>

            {/* Output Directory */}
            <div className="space-y-1.5">
              <Label htmlFor="outputDir" className="text-[10px] flex items-center gap-1.5">
                <FolderOpen className="h-3 w-3" />
                Output Directory
              </Label>
              <Input
                id="outputDir"
                value={config.outputDir}
                onChange={(e) => setConfig({ ...config, outputDir: e.target.value })}
                className="h-8 text-sm"
                placeholder="./output"
              />
            </div>
          </div>
        </div>

        {/* Kubernetes Resources (only show if k8s is enabled) */}
        {config.k8s && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5" />
              Kubernetes Resources
            </Label>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="replicas" className="text-[10px]">Replicas</Label>
                <Input
                  id="replicas"
                  type="number"
                  min="1"
                  max="10"
                  value={config.replicas}
                  onChange={(e) => setConfig({ ...config, replicas: parseInt(e.target.value) || 1 })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpuRequest" className="text-[10px]">CPU Request</Label>
                <Input
                  id="cpuRequest"
                  value={config.resources.cpuRequest}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuRequest: e.target.value } })}
                  className="h-8 text-sm"
                  placeholder="100m"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpuLimit" className="text-[10px]">CPU Limit</Label>
                <Input
                  id="cpuLimit"
                  value={config.resources.cpuLimit}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuLimit: e.target.value } })}
                  className="h-8 text-sm"
                  placeholder="500m"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="memoryRequest" className="text-[10px]">Memory Request</Label>
                <Input
                  id="memoryRequest"
                  value={config.resources.memoryRequest}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, memoryRequest: e.target.value } })}
                  className="h-8 text-sm"
                  placeholder="128Mi"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="memoryLimit" className="text-[10px]">Memory Limit</Label>
                <Input
                  id="memoryLimit"
                  value={config.resources.memoryLimit}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, memoryLimit: e.target.value } })}
                  className="h-8 text-sm"
                  placeholder="512Mi"
                />
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Environment Variables</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfig({ ...config, envVars: [...config.envVars, { key: "", value: "" }] })}
              className="gap-1 h-7 text-xs"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
          {config.envVars.length > 0 ? (
            <div className="space-y-1.5">
              {config.envVars.map((env, idx) => (
                <div key={idx} className="flex gap-1.5">
                  <Input
                    placeholder="KEY"
                    value={env.key}
                    onChange={(e) => {
                      const newEnvVars = [...config.envVars];
                      newEnvVars[idx].key = e.target.value;
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                    className="h-8 font-mono text-[10px]"
                  />
                  <Input
                    placeholder="value"
                    value={env.value}
                    onChange={(e) => {
                      const newEnvVars = [...config.envVars];
                      newEnvVars[idx].value = e.target.value;
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                    className="h-8 font-mono text-[10px]"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newEnvVars = config.envVars.filter((_, i) => i !== idx);
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">No environment variables configured</p>
          )}
        </div>

        <Separator />

        {/* Optional Features */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Optional Features</Label>
          <div className="grid gap-3 grid-cols-2">
            {[
              {
                key: "docker" as const,
                label: "Docker",
                desc: "Multi-stage Dockerfile with .dockerignore",
                icon: Container,
              },
              {
                key: "k8s" as const,
                label: "Kubernetes",
                desc: "Manifests with Kustomize overlays",
                icon: Container,
              },
              {
                key: "monitoring" as const,
                label: "Monitoring",
                desc: "Prometheus rules & Grafana dashboards",
                icon: BarChart3,
              },
              {
                key: "docs" as const,
                label: "Documentation",
                desc: "README, deployment & architecture docs",
                icon: FileText,
              },
            ].map((feat) => (
              <div
                key={feat.key}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <feat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">{feat.label}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {feat.desc}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config[feat.key]}
                  onCheckedChange={(v) =>
                    setConfig({ ...config, [feat.key]: v })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar preview */}
      <div className="hidden lg:block">
        <div className="sticky top-20 space-y-3">
          <Card>
            <CardHeader className="pb-2 p-3">
              <CardTitle className="text-xs">Selected Template</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {selectedTemplate ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <selectedTemplate.icon className="h-5 w-5" />
                    <div>
                      <p className="font-semibold text-xs">{selectedTemplate.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedTemplate.language} • {selectedTemplate.framework}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {selectedTemplate.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-[10px]">
                        <Check className="h-2.5 w-2.5 text-green-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No template selected
                </p>
              )}
            </CardContent>
          </Card>

          {config.name && (
            <Card>
              <CardHeader className="pb-2 p-3">
                <CardTitle className="text-xs">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-0 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium font-mono">{config.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CI/CD</span>
                  <span className="font-medium">
                    {ciProviders.find((c) => c.id === config.ci)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deploy</span>
                  <span className="font-medium">
                    {deployTargets.find((d) => d.id === config.deploy)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GitOps</span>
                  <span className="font-medium">
                    {gitOpsTools.find((g) => g.id === config.gitops)?.name}
                  </span>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-1">
                  {config.docker && <Badge variant="secondary" className="text-[9px] px-1 py-0">Docker</Badge>}
                  {config.k8s && <Badge variant="secondary" className="text-[9px] px-1 py-0">K8s</Badge>}
                  {config.monitoring && <Badge variant="secondary" className="text-[9px] px-1 py-0">Monitoring</Badge>}
                  {config.docs && <Badge variant="secondary" className="text-[9px] px-1 py-0">Docs</Badge>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────── Step 3: Generate ────────── */

function StepGenerate({
  config,
  template,
  generating,
  generated,
  onGenerate,
  generationOutput,
  generatedFiles,
  onPreview,
}: {
  config: ServiceConfig;
  template: { id: string; name: string; icon: string; language: string; framework: string; features: string[] };
  generating: boolean;
  generated: boolean;
  onGenerate: () => void;
  generationOutput: string;
  generatedFiles: string[];
  onPreview: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Preview Button */}
      {!generated && (
        <Button
          variant="outline"
          onClick={onPreview}
          className="w-full gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview Generated Files
        </Button>
      )}

      {/* Compact Review summary */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Configuration Review</CardTitle>
          <CardDescription className="text-xs">
            Review your settings before generating
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {React.createElement(template.icon, { className: "h-5 w-5" })}
                <div>
                  <p className="font-semibold text-sm">{config.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.name} • {template.language}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <ConfigRow
                  icon={<GitBranch className="h-4 w-4" />}
                  label="CI/CD"
                  value={ciProviders.find((c) => c.id === config.ci)?.name || ""}
                />
                <ConfigRow
                  icon={<Container className="h-4 w-4" />}
                  label="Deploy"
                  value={deployTargets.find((d) => d.id === config.deploy)?.name || ""}
                />
                <ConfigRow
                  icon={<Rocket className="h-4 w-4" />}
                  label="GitOps"
                  value={gitOpsTools.find((g) => g.id === config.gitops)?.name || ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold mb-1">Included Features</p>
              <div className="grid grid-cols-2 gap-1">
                <FeatureCheck label="Docker" enabled={config.docker} />
                <FeatureCheck label="Kubernetes" enabled={config.k8s} />
                <FeatureCheck label="Monitoring" enabled={config.monitoring} />
                <FeatureCheck label="Docs" enabled={config.docs} />
              </div>
              <Separator className="my-2" />
              <p className="text-xs font-semibold mb-1">Template Features</p>
              <div className="flex flex-wrap gap-1">
                {template.features.map((f) => (
                  <Badge key={f} variant="outline" className="text-[9px] px-1.5 py-0">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Output */}
      {(generating || generationOutput) && (
        <Card>
          <CardHeader className="pb-1.5 p-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Terminal className="h-3 w-3" />
            {generating ? "Generating..." : "Output"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="relative rounded-lg bg-neutral-950 p-2 font-mono text-[10px] text-green-400 overflow-x-auto max-h-40 overflow-y-auto">
              {generating ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Generating files...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">{generationOutput}</pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Files Tree */}
      {generated && generatedFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-2 p-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Generated Files ({generatedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {generatedFiles.slice(0, 50).map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-2.5 w-2.5" />
                  {file}
                </div>
              ))}
              {generatedFiles.length > 50 && (
                <p className="text-[9px] text-muted-foreground mt-2">
                  ... and {generatedFiles.length - 50} more files
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Status with Next Steps */}
      {generated && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                    Service Generated Successfully!
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Downloaded <code className="font-mono bg-muted px-1 rounded">{config.name}.zip</code> with {generatedFiles.length} files
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-xs font-semibold mb-1.5">Next Steps:</p>
                <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Extract the downloaded ZIP file</li>
                  <li>Navigate to the extracted directory</li>
                  <li>Install dependencies (check README.md for instructions)</li>
                  <li>Run the service locally</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ────────── Helpers ────────── */

function ConfigRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function FeatureCheck({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {enabled ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground/40" />
      )}
      <span className={cn(!enabled && "text-muted-foreground/50")}>{label}</span>
    </div>
  );
}
