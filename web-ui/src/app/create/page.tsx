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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  ciProviders,
  deployTargets,
  gitOpsTools,
  type ServiceConfig,
  defaultConfig,
} from "@/lib/data";

const steps = [
  { id: 1, title: "Template", icon: Layers, description: "Choose a template" },
  { id: 2, title: "Configure", icon: Settings, description: "Service settings" },
  { id: 3, title: "Generate", icon: Rocket, description: "Review & generate" },
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

  useEffect(() => {
    const tpl = searchParams.get("template");
    if (tpl && templates.find((t) => t.id === tpl)) {
      setConfig((c) => ({ ...c, template: tpl }));
    }
  }, [searchParams]);

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
    if (step === 2) return !!config.name && !validateName(config.name);
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
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      
      if (data.success) {
        setGenerated(true);
        setGenerationOutput(data.output || "");
        setGeneratedFiles(data.files || []);
        toast.success("Service generated successfully!", {
          description: `${config.name} has been created with the ${selectedTemplate?.name} template.`,
        });
      } else {
        toast.error("Generation failed", { description: data.error });
        setGenerationOutput(data.error || "Unknown error occurred");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Could not connect to the server. Make sure the API is running.";
      toast.error("Generation failed", {
        description: errorMsg,
      });
      setGenerationOutput(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const cliCommand = buildCliCommand(config);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Compact Header */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Create a Service</h1>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">
          Generate a production-ready service in three steps
        </p>
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
          />
        )}
        {step === 3 && (
          <StepGenerate
            config={config}
            template={selectedTemplate!}
            cliCommand={cliCommand}
            generating={generating}
            generated={generated}
            onGenerate={handleGenerate}
            generationOutput={generationOutput}
            generatedFiles={generatedFiles}
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
                <Rocket className="h-3 w-3" />
                <span className="hidden sm:inline">Generate</span>
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" disabled>
            <CheckCircle2 className="h-3 w-3" />
            <span className="hidden sm:inline">Generated!</span>
          </Button>
        )}
      </div>
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
}: {
  config: ServiceConfig;
  setConfig: (c: ServiceConfig) => void;
  nameError: string;
  setNameError: (e: string) => void;
  validateName: (n: string) => string;
}) {
  const selectedTemplate = templates.find((t) => t.id === config.template);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        {/* Service Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-semibold">
            Service Name
          </Label>
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
          {nameError ? (
            <p className="text-[10px] text-destructive">{nameError}</p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Lowercase letters, numbers, and hyphens. Must start with a letter.
            </p>
          )}
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
  cliCommand,
  generating,
  generated,
  onGenerate,
  generationOutput,
  generatedFiles,
}: {
  config: ServiceConfig;
  template: { id: string; name: string; icon: string; language: string; framework: string; features: string[] };
  cliCommand: string;
  generating: boolean;
  generated: boolean;
  onGenerate: () => void;
  generationOutput: string;
  generatedFiles: string[];
}) {
  const copyCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      {/* Compact Review summary */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Service Configuration Review</CardTitle>
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

      {/* CLI Command */}
      <Card>
        <CardHeader className="pb-1.5 p-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Terminal className="h-3 w-3" />
              CLI Command
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyCommand} className="gap-1 h-6 text-[10px]">
              <Copy className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="relative rounded-lg bg-neutral-950 p-2 font-mono text-[10px] text-green-400 overflow-x-auto">
            <span className="text-neutral-500">$ </span>
            {cliCommand}
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
                  <span>Generating...</span>
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
              Files ({generatedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {generatedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-2.5 w-2.5" />
                  {file}
                </div>
              ))}
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
                    Service generated successfully!
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Your service <code className="font-mono bg-muted px-1 rounded">{config.name}</code> has
                    been created in <code className="font-mono bg-muted px-1 rounded">{config.outputDir}</code>
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-xs font-semibold mb-1.5">Next Steps:</p>
                <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Navigate to the output directory: <code className="font-mono bg-muted px-1 rounded text-[9px]">{config.outputDir}/{config.name}</code></li>
                  <li>Install dependencies (check README.md for instructions)</li>
                  {config.docker && <li>Build Docker image: <code className="font-mono bg-muted px-1 rounded text-[9px]">docker build -t {config.name} .</code></li>}
                  {config.k8s && (config.port !== 8080 || config.replicas !== 2 || config.envVars.length > 0) && (
                    <li className="text-amber-600 dark:text-amber-400">
                      <strong>Manual Configuration Required:</strong> Update the generated Kubernetes manifests with your custom settings:
                      {config.port !== 8080 && ` port: ${config.port}`}
                      {config.replicas !== 2 && `, replicas: ${config.replicas}`}
                      {config.envVars.length > 0 && `, ${config.envVars.length} environment variable(s)`}
                      {(config.resources.cpuRequest !== "100m" || config.resources.memoryRequest !== "128Mi") && `, resource limits`}
                    </li>
                  )}
                  {config.k8s && <li>Deploy to Kubernetes: <code className="font-mono bg-muted px-1 rounded text-[9px]">kubectl apply -k k8s/overlays/dev</code></li>}
                  <li>Review and customize the generated configuration files</li>
                  {config.ci !== "none" && <li>Push to your Git repository to trigger CI/CD pipeline</li>}
                </ol>
              </div>
              
              <div className="flex gap-1.5 pt-1 flex-wrap">
                <Button variant="outline" size="sm" className="gap-1.5 text-[10px] h-7" onClick={() => window.location.href = "/create"}>
                  <Rocket className="h-3 w-3" />
                  <span className="hidden sm:inline">Create Another</span>
                  <span className="sm:hidden">New</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-[10px] h-7" onClick={() => window.location.href = "/"}>
                  <ArrowLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </Button>
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

function buildCliCommand(config: ServiceConfig): string {
  const parts = [`idp-cli create-service ${config.name || "<service-name>"}`];
  parts.push(`--template ${config.template || "<template>"}`);
  if (config.ci !== "github-actions") parts.push(`--ci ${config.ci}`);
  if (config.deploy !== "kubernetes") parts.push(`--deploy ${config.deploy}`);
  if (config.gitops !== "none") parts.push(`--gitops ${config.gitops}`);
  if (!config.docker) parts.push("--no-docker");
  if (!config.k8s) parts.push("--no-k8s");
  if (!config.monitoring) parts.push("--no-monitoring");
  if (!config.docs) parts.push("--no-docs");
  return parts.join(" \\\n  ");
}
