import { BaseTemplate, ServiceConfig, GeneratedFile } from "./base";
import { PythonAPITemplate } from "./python-api";
import { NodeAPITemplate } from "./node-api";

export function getTemplate(templateId: string, config: ServiceConfig): BaseTemplate {
  switch (templateId) {
    case "python-api":
      return new PythonAPITemplate(config);
    case "node-api":
      return new NodeAPITemplate(config);
    // Add more templates here as they are implemented
    default:
      throw new Error(`Template ${templateId} not implemented yet`);
  }
}

export function getAvailableTemplates(): string[] {
  return ["python-api", "node-api"];
}
