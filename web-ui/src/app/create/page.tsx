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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Create a Service</h1>
        <p className="mt-2 text-muted-foreground">
          Generate a production-ready service in three simple steps.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-all w-full",
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
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0",
                    step > s.id
                      ? "bg-primary text-primary-foreground"
                      : step === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-8 mx-2 shrink-0",
                    step > s.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
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

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : !generated ? (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Generate Service
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" className="gap-2" disabled>
            <CheckCircle2 className="h-4 w-4" />
            Generated!
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
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["all", "backend", "frontend", "tools"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card
            key={t.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
              selected === t.id
                ? "ring-2 ring-primary border-primary shadow-lg"
                : "hover:border-primary/30"
            )}
            onClick={() => onSelect(t.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <t.icon className="h-8 w-8" />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {t.framework}
                  </Badge>
                  {selected === t.id && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <CardTitle className="text-base mt-1">{t.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {t.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        {/* Service Name */}
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold">
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
            className={cn("h-11", nameError && "border-destructive")}
          />
          {nameError ? (
            <p className="text-xs text-destructive">{nameError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens. Must start with a letter.
            </p>
          )}
        </div>

        <Separator />

        {/* CI/CD */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">CI/CD Provider</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {ciProviders.map((ci) => (
              <Card
                key={ci.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow",
                  config.ci === ci.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/30"
                )}
                onClick={() => setConfig({ ...config, ci: ci.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ci.icon className="h-6 w-6" />
                    <div>
                      <p className="text-sm font-medium">{ci.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
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
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Deploy Target</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {deployTargets.map((dt) => (
              <Card
                key={dt.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow",
                  config.deploy === dt.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/30"
                )}
                onClick={() => setConfig({ ...config, deploy: dt.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <dt.icon className="h-6 w-6" />
                    <div>
                      <p className="text-sm font-medium">{dt.name}</p>
                      <p className="text-[10px] text-muted-foreground">
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
        <div className="space-y-3">
          <Label className="text-sm font-semibold">GitOps Tool</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {gitOpsTools.map((gt) => (
              <Card
                key={gt.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow",
                  config.gitops === gt.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/30"
                )}
                onClick={() => setConfig({ ...config, gitops: gt.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <gt.icon className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">{gt.name}</p>
                      <p className="text-[10px] text-muted-foreground">
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
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Service Configuration</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="port" className="text-xs flex items-center gap-2">
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
                className="h-9"
              />
            </div>

            {/* Output Directory */}
            <div className="space-y-2">
              <Label htmlFor="outputDir" className="text-xs flex items-center gap-2">
                <FolderOpen className="h-3 w-3" />
                Output Directory
              </Label>
              <Input
                id="outputDir"
                value={config.outputDir}
                onChange={(e) => setConfig({ ...config, outputDir: e.target.value })}
                className="h-9"
                placeholder="./output"
              />
            </div>
          </div>
        </div>

        {/* Kubernetes Resources (only show if k8s is enabled) */}
        {config.k8s && (
          <div className="space-y-4">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Kubernetes Resources
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="replicas" className="text-xs">Replicas</Label>
                <Input
                  id="replicas"
                  type="number"
                  min="1"
                  max="10"
                  value={config.replicas}
                  onChange={(e) => setConfig({ ...config, replicas: parseInt(e.target.value) || 1 })}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpuRequest" className="text-xs">CPU Request</Label>
                <Input
                  id="cpuRequest"
                  value={config.resources.cpuRequest}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuRequest: e.target.value } })}
                  className="h-9"
                  placeholder="100m"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpuLimit" className="text-xs">CPU Limit</Label>
                <Input
                  id="cpuLimit"
                  value={config.resources.cpuLimit}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, cpuLimit: e.target.value } })}
                  className="h-9"
                  placeholder="500m"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memoryRequest" className="text-xs">Memory Request</Label>
                <Input
                  id="memoryRequest"
                  value={config.resources.memoryRequest}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, memoryRequest: e.target.value } })}
                  className="h-9"
                  placeholder="128Mi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memoryLimit" className="text-xs">Memory Limit</Label>
                <Input
                  id="memoryLimit"
                  value={config.resources.memoryLimit}
                  onChange={(e) => setConfig({ ...config, resources: { ...config.resources, memoryLimit: e.target.value } })}
                  className="h-9"
                  placeholder="512Mi"
                />
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Environment Variables</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfig({ ...config, envVars: [...config.envVars, { key: "", value: "" }] })}
              className="gap-1.5 h-8"
            >
              <Plus className="h-3 w-3" />
              Add Variable
            </Button>
          </div>
          {config.envVars.length > 0 ? (
            <div className="space-y-2">
              {config.envVars.map((env, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="KEY"
                    value={env.key}
                    onChange={(e) => {
                      const newEnvVars = [...config.envVars];
                      newEnvVars[idx].key = e.target.value;
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                    className="h-9 font-mono text-xs"
                  />
                  <Input
                    placeholder="value"
                    value={env.value}
                    onChange={(e) => {
                      const newEnvVars = [...config.envVars];
                      newEnvVars[idx].value = e.target.value;
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                    className="h-9 font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newEnvVars = config.envVars.filter((_, i) => i !== idx);
                      setConfig({ ...config, envVars: newEnvVars });
                    }}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No environment variables configured</p>
          )}
        </div>

        <Separator />

        {/* Optional Features */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Optional Features</Label>
          <div className="grid gap-4 sm:grid-cols-2">
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
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <feat.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{feat.label}</p>
                    <p className="text-[10px] text-muted-foreground">
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
        <div className="sticky top-24 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Selected Template</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <selectedTemplate.icon className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">{selectedTemplate.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedTemplate.language} • {selectedTemplate.framework}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {selectedTemplate.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No template selected
                </p>
              )}
            </CardContent>
          </Card>

          {config.name && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
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
                <div className="flex flex-wrap gap-1.5">
                  {config.docker && <Badge variant="secondary" className="text-[10px]">Docker</Badge>}
                  {config.k8s && <Badge variant="secondary" className="text-[10px]">K8s</Badge>}
                  {config.monitoring && <Badge variant="secondary" className="text-[10px]">Monitoring</Badge>}
                  {config.docs && <Badge variant="secondary" className="text-[10px]">Docs</Badge>}
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
    <div className="space-y-8">
      {/* Review summary */}
      <Card>
        <CardHeader>
          <CardTitle>Service Configuration Review</CardTitle>
          <CardDescription>
            Review your settings before generating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {React.createElement(template.icon, { className: "h-8 w-8" })}
                <div>
                  <p className="font-semibold text-lg">{config.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.name} • {template.language}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
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
            <div className="space-y-3">
              <p className="text-sm font-semibold mb-2">Included Features</p>
              <div className="grid grid-cols-2 gap-2">
                <FeatureCheck label="Docker" enabled={config.docker} />
                <FeatureCheck label="Kubernetes" enabled={config.k8s} />
                <FeatureCheck label="Monitoring" enabled={config.monitoring} />
                <FeatureCheck label="Docs" enabled={config.docs} />
              </div>
              <Separator className="my-3" />
              <p className="text-sm font-semibold mb-2">Template Features</p>
              <div className="flex flex-wrap gap-1.5">
                {template.features.map((f) => (
                  <Badge key={f} variant="outline" className="text-[10px]">
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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              CLI Command
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyCommand} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg bg-neutral-950 p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <span className="text-neutral-500">$ </span>
            {cliCommand}
          </div>
        </CardContent>
      </Card>

      {/* Generation Output */}
      {(generating || generationOutput) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              {generating ? "Generating Service..." : "Generation Output"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg bg-neutral-950 p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-64 overflow-y-auto">
              {generating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating service files...</span>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Generated Files ({generatedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {generatedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-3 w-3" />
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
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    Service generated successfully!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your service <code className="font-mono bg-muted px-1 rounded">{config.name}</code> has
                    been created in <code className="font-mono bg-muted px-1 rounded">{config.outputDir}</code>
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-semibold mb-2">Next Steps:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Navigate to the output directory: <code className="font-mono bg-muted px-1 rounded text-xs">{config.outputDir}/{config.name}</code></li>
                  <li>Install dependencies (check README.md for instructions)</li>
                  {config.docker && <li>Build Docker image: <code className="font-mono bg-muted px-1 rounded text-xs">docker build -t {config.name} .</code></li>}
                  {config.k8s && <li>Deploy to Kubernetes: <code className="font-mono bg-muted px-1 rounded text-xs">kubectl apply -k k8s/overlays/dev</code></li>}
                  <li>Review and customize the generated configuration files</li>
                  {config.ci !== "none" && <li>Push to your Git repository to trigger CI/CD pipeline</li>}
                </ol>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = "/create"}>
                  <Rocket className="h-3.5 w-3.5" />
                  Create Another Service
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = "/"}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Home
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
    <div className="flex items-center justify-between text-sm">
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
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/40" />
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
