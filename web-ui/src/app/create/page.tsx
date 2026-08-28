"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import React from "react";
import Link from "next/link";
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
  Search,
  CheckCheck,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  Code,
  FileCode,
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
import {
  templates,
  type Template,
  defaultConfig,
  type ServiceConfig,
  ciProviders,
  deployTargets,
  gitOpsTools,
  configPresets,
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
      // Pre-generate files for live code preview in Step 3
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

  // Keyboard shortcuts
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
        setShowPreviewModal(false);
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

/* ────────── Step 1: Template Selection ────────── */

function StepTemplate({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) => {
    const matchesCategory = filter === "all" || t.category === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.framework.toLowerCase().includes(search.toLowerCase()) ||
      t.language.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "backend", "frontend", "tools"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize h-7 text-xs px-3"
            >
              {f === "all" ? "All Boilerplates (18)" : f}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search FastAPI, Next.js, Go..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7.5 text-xs pl-8"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const isSelected = selected === t.id;
          return (
            <Card
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden",
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
                  : "hover:shadow-xs"
              )}
            >
              <CardHeader className="p-3.5 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground group-hover:scale-105 transition-transform">
                    {React.createElement(t.icon, { className: "h-5 w-5 text-primary" })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      {t.language}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                      {t.framework}
                    </Badge>
                    {isSelected && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                </div>

                <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors">
                  {t.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                  {t.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3.5 pt-0 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {t.features.slice(0, 3).map((f) => (
                    <Badge key={f} variant="outline" className="text-[8px] px-1 py-0 font-normal">
                      {f}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-[10px]">
                  <span className="text-muted-foreground capitalize">{t.category} component</span>
                  <span className={cn("font-medium", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary")}>
                    {isSelected ? "Selected ✓" : "Click to select &rarr;"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── Step 2: Configure Architecture ────────── */

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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left Column: Form Controls */}
      <div className="space-y-5">
        {/* Service Identity */}
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center justify-between">
              <span>Service Identity</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateSuggestions}
                className="h-6 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
              >
                <Lightbulb className="h-3 w-3" />
                Smart Name Generator
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div className="relative">
              <Input
                id="name"
                placeholder="e.g. order-processing-api"
                value={config.name}
                onChange={(e) => {
                  setConfig({ ...config, name: e.target.value });
                  if (nameError) setNameError(validateName(e.target.value));
                }}
                className={cn("h-8.5 text-xs font-medium", nameError && "border-destructive")}
              />
              {showSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-xl border-border/80">
                  <CardContent className="p-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground px-2 py-0.5 font-medium">
                      Select a suggested service name:
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {nameSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectSuggestion(s)}
                          className="px-2 py-1 text-xs text-left rounded-md hover:bg-primary/10 hover:text-primary transition-colors font-mono"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {nameError && <p className="text-[10px] text-destructive">{nameError}</p>}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="port" className="text-[10px] text-muted-foreground">
                  Service Port
                </Label>
                <Input
                  id="port"
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 8080 })}
                  className="h-7.5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="outputDir" className="text-[10px] text-muted-foreground">
                  Output Directory
                </Label>
                <Input
                  id="outputDir"
                  value={config.outputDir}
                  onChange={(e) => setConfig({ ...config, outputDir: e.target.value })}
                  className="h-7.5 text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1-Click Architecture Presets */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Architecture Presets
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {configPresets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center h-auto py-2.5 text-center hover:border-primary/50"
              >
                <span className="font-semibold text-xs">{preset.name}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                  {preset.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* CI/CD & Deploy Target Selection */}
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold">CI/CD & Deployment Target</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-4">
            {/* CI Provider */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">CI/CD Automation</Label>
              <div className="grid grid-cols-3 gap-2">
                {ciProviders.map((ci) => (
                  <Button
                    key={ci.id}
                    type="button"
                    variant={config.ci === ci.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig({ ...config, ci: ci.id })}
                    className="flex flex-col items-center h-auto py-2"
                  >
                    <span className="font-medium text-xs">{ci.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Deploy & GitOps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Deployment Target</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {deployTargets.map((dt) => (
                    <Button
                      key={dt.id}
                      type="button"
                      variant={config.deploy === dt.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, deploy: dt.id })}
                      className="h-8 text-xs font-medium"
                    >
                      {dt.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">GitOps Operator</Label>
                <div className="grid grid-cols-3 gap-1">
                  {gitOpsTools.map((gt) => (
                    <Button
                      key={gt.id}
                      type="button"
                      variant={config.gitops === gt.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, gitops: gt.id })}
                      className="h-8 text-xs font-medium"
                    >
                      {gt.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kubernetes Resource Limits (if k8s enabled) */}
        {config.k8s && (
          <Card className="border-border/80">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Kubernetes Pod Resource Allocations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="replicas" className="text-[10px] text-muted-foreground">Replicas</Label>
                  <Input
                    id="replicas"
                    type="number"
                    min="1"
                    max="10"
                    value={config.replicas}
                    onChange={(e) => setConfig({ ...config, replicas: parseInt(e.target.value) || 1 })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpuReq" className="text-[10px] text-muted-foreground">CPU Request</Label>
                  <Input
                    id="cpuReq"
                    value={config.resources.cpuRequest}
                    onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuRequest: e.target.value } })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpuLim" className="text-[10px] text-muted-foreground">CPU Limit</Label>
                  <Input
                    id="cpuLim"
                    value={config.resources.cpuLimit}
                    onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuLimit: e.target.value } })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="memLim" className="text-[10px] text-muted-foreground">Memory Limit</Label>
                  <Input
                    id="memLim"
                    value={config.resources.memoryLimit}
                    onChange={(e) => setConfig({ ...config, resources: { ...config.resources, memoryLimit: e.target.value } })}
                    className="h-7.5 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables */}
        <Card className="border-border/80">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold">Environment Variables & Config</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig({ ...config, envVars: [...config.envVars, { key: "", value: "" }] })}
                className="gap-1 h-6 text-[10px]"
              >
                <Plus className="h-3 w-3" />
                Add Variable
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {config.envVars.length > 0 ? (
              <div className="space-y-1.5">
                {config.envVars.map((env, idx) => (
                  <div key={idx} className="flex gap-1.5">
                    <Input
                      placeholder="KEY (e.g. REDIS_HOST)"
                      value={env.key}
                      onChange={(e) => {
                        const newVars = [...config.envVars];
                        newVars[idx].key = e.target.value;
                        setConfig({ ...config, envVars: newVars });
                      }}
                      className="h-7.5 font-mono text-[10px]"
                    />
                    <Input
                      placeholder="value"
                      value={env.value}
                      onChange={(e) => {
                        const newVars = [...config.envVars];
                        newVars[idx].value = e.target.value;
                        setConfig({ ...config, envVars: newVars });
                      }}
                      className="h-7.5 font-mono text-[10px]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newVars = config.envVars.filter((_, i) => i !== idx);
                        setConfig({ ...config, envVars: newVars });
                      }}
                      className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">
                No environment variables configured. Default settings will be applied.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feature Switches */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "docker" as const, label: "Docker Multi-Stage", desc: "Optimized non-root container" },
            { key: "k8s" as const, label: "Kubernetes Manifests", desc: "Kustomize overlays & HPA" },
            { key: "monitoring" as const, label: "Prometheus Metrics", desc: "Scrape rules & healthz" },
            { key: "docs" as const, label: "Developer Docs", desc: "Architecture & OpenAPI README" },
          ].map((feat) => (
            <div
              key={feat.key}
              className="flex items-center justify-between rounded-lg border p-3 bg-muted/10"
            >
              <div>
                <p className="text-xs font-semibold">{feat.label}</p>
                <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
              </div>
              <Switch
                checked={config[feat.key]}
                onCheckedChange={(val) => setConfig({ ...config, [feat.key]: val })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Live Architecture Blueprint Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-20 space-y-3">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="p-3.5 pb-2 bg-muted/20 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Live Architecture Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              {selectedTemplate ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {React.createElement(selectedTemplate.icon, { className: "h-4 w-4" })}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{selectedTemplate.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedTemplate.language} • {selectedTemplate.framework}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No template selected</p>
              )}

              <Separator />

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Name:</span>
                  <span className="font-mono font-medium">{config.name || "unnamed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CI/CD:</span>
                  <span className="font-medium">{config.ci}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deploy Target:</span>
                  <span className="font-medium">{config.deploy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GitOps:</span>
                  <span className="font-medium">{config.gitops}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Port:</span>
                  <span className="font-mono font-medium">{config.port}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                  Active Capabilities
                </p>
                <div className="flex flex-wrap gap-1">
                  {config.docker && <Badge variant="secondary" className="text-[8px] px-1 py-0">Docker</Badge>}
                  {config.k8s && <Badge variant="secondary" className="text-[8px] px-1 py-0">K8s</Badge>}
                  {config.monitoring && <Badge variant="secondary" className="text-[8px] px-1 py-0">Metrics</Badge>}
                  {config.docs && <Badge variant="secondary" className="text-[8px] px-1 py-0">Docs</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ────────── Step 3: Review & Generate / Code Explorer ────────── */

function StepReviewAndGenerate({
  config,
  template,
  generating,
  generationStep,
  generated,
  generatedFiles,
  activeFile,
  setActiveFile,
  onGenerate,
  cliCommand,
  onCopyCli,
  copiedCli,
}: {
  config: ServiceConfig;
  template?: Template;
  generating: boolean;
  generationStep: string;
  generated: boolean;
  generatedFiles: { path: string; content: string }[];
  activeFile: string;
  setActiveFile: (p: string) => void;
  onGenerate: () => void;
  cliCommand: string;
  onCopyCli: () => void;
  copiedCli: boolean;
}) {
  const currentFile = generatedFiles.find((f) => f.path === activeFile) || generatedFiles[0];

  return (
    <div className="space-y-5">
      {/* Generated Summary Card */}
      <Card className="border-border/80">
        <CardHeader className="p-4 pb-2 bg-muted/20 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {template?.icon ? (
                React.createElement(template.icon, { className: "h-5 w-5 text-primary" })
              ) : (
                <Rocket className="h-5 w-5 text-primary" />
              )}
              <div>
                <CardTitle className="text-sm font-bold">{config.name}</CardTitle>
                <CardDescription className="text-xs">
                  {template?.name || config.template} • {template?.framework}
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono">
              {generatedFiles.length} Source Files Ready
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* CLI Reproduce Command */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Equivalent IDP CLI Command
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyCli}
                className="h-6 text-[10px] gap-1"
              >
                {copiedCli ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copiedCli ? "Copied" : "Copy Command"}
              </Button>
            </div>
            <div className="rounded-md bg-neutral-950 p-2 font-mono text-[11px] text-green-400 border border-neutral-800 select-all overflow-x-auto">
              $ {cliCommand}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Code Explorer */}
      {generatedFiles.length > 0 && (
        <Card className="overflow-hidden border-border/80">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-primary" />
              Live Generated Code Explorer
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {currentFile?.path} ({currentFile?.content.split("\n").length} lines)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[300px] max-h-[420px]">
            {/* File Tree */}
            <div className="border-r bg-muted/10 p-2 overflow-y-auto space-y-0.5 text-xs">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-1">
                Project Files
              </p>
              {generatedFiles.map((file) => (
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
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200 overflow-auto">
              <pre className="text-[11px] leading-relaxed">
                {currentFile?.content}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {/* Generating Progress State */}
      {generating && (
        <Card className="border-primary/30 bg-primary/5 p-4 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{generationStep || "Packaging microservice assets..."}</span>
          </div>
        </Card>
      )}

      {/* Success Download Card */}
      {generated && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Service Ready & Downloaded!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Saved as <code className="font-mono font-semibold">{config.name}.zip</code> containing {generatedFiles.length} microservice files.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Quick Start in 3 Steps:</p>
              <div className="rounded-md bg-neutral-950 p-3 font-mono text-[11px] text-green-400 space-y-1 border border-neutral-800">
                <div>1. unzip {config.name}.zip</div>
                <div>2. cd {config.name}</div>
                <div>3. docker compose up --build</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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
