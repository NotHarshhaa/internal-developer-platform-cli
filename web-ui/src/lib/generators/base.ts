export interface ServiceConfig {
  name: string;
  template: string;
  ci: string;
  deploy: string;
  gitops: string;
  docker: boolean;
  k8s: boolean;
  monitoring: boolean;
  docs: boolean;
  outputDir: string;
  port: number;
  envVars: Array<{ key: string; value: string }>;
  resources: {
    cpuRequest: string;
    cpuLimit: string;
    memoryRequest: string;
    memoryLimit: string;
  };
  replicas: number;
  healthCheck?: any;
  dependencies?: any;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export abstract class BaseTemplate {
  protected config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
  }

  abstract get templateName(): string;
  abstract get language(): string;
  abstract get framework(): string;

  getServiceName(): string {
    return this.config.name;
  }

  getServiceNameUnderscore(): string {
    return this.config.name.replace(/-/g, "_");
  }

  abstract generateFiles(): GeneratedFile[];

  protected addFile(files: GeneratedFile[], path: string, content: string): void {
    files.push({ path, content });
  }
}
