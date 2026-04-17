import { BaseTemplate, ServiceConfig, GeneratedFile } from "./base";
import { PythonAPITemplate } from "./python-api";
import { NodeAPITemplate } from "./node-api";
import { JavaSpringTemplate } from "./java-spring";
import { DotnetAPITemplate } from "./dotnet-api";
import { VueFrontendTemplate } from "./vue-frontend";
import { CronJobTemplate } from "./cron-job";
import { MicroserviceTemplate } from "./microservice";
import { EventDrivenTemplate } from "./event-driven";
import { DatabaseServiceTemplate } from "./database-service";
import { GoAPITemplate } from "./go-api";
import { RustAPITemplate } from "./rust-api";
import { PythonGraphQLTemplate } from "./python-graphql";
import { MLInferenceTemplate } from "./ml-inference";
import { ReactFrontendTemplate } from "./react-frontend";
import { NextjsFullstackTemplate } from "./nextjs-fullstack";
import { StaticSiteTemplate } from "./static-site";
import { PythonCLITemplate } from "./python-cli";
import { WorkerServiceTemplate } from "./worker";

export function getTemplate(templateId: string, config: ServiceConfig): BaseTemplate {
  switch (templateId) {
    case "python-api":
      return new PythonAPITemplate(config);
    case "node-api":
      return new NodeAPITemplate(config);
    case "go-api":
      return new GoAPITemplate(config);
    case "rust-api":
      return new RustAPITemplate(config);
    case "python-graphql":
      return new PythonGraphQLTemplate(config);
    case "ml-inference":
      return new MLInferenceTemplate(config);
    case "react-frontend":
      return new ReactFrontendTemplate(config);
    case "nextjs-fullstack":
      return new NextjsFullstackTemplate(config);
    case "static-site":
      return new StaticSiteTemplate(config);
    case "python-cli":
      return new PythonCLITemplate(config);
    case "worker":
      return new WorkerServiceTemplate(config);
    case "java-spring":
      return new JavaSpringTemplate(config);
    case "dotnet-api":
      return new DotnetAPITemplate(config);
    case "vue-frontend":
      return new VueFrontendTemplate(config);
    case "cron-job":
      return new CronJobTemplate(config);
    case "microservice":
      return new MicroserviceTemplate(config);
    case "event-driven":
      return new EventDrivenTemplate(config);
    case "database-service":
      return new DatabaseServiceTemplate(config);
    default:
      throw new Error(`Template "${templateId}" is not implemented yet.`);
  }
}

export function getAvailableTemplates(): string[] {
  return [
    "python-api",
    "node-api",
    "go-api",
    "rust-api",
    "python-graphql",
    "ml-inference",
    "react-frontend",
    "nextjs-fullstack",
    "static-site",
    "python-cli",
    "worker",
    "java-spring",
    "dotnet-api",
    "vue-frontend",
    "cron-job",
    "microservice",
    "event-driven",
    "database-service",
  ];
}
