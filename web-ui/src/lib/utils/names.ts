const prefixes = ["my", "app", "service", "api", "web", "backend", "frontend", "user", "order", "payment", "product", "inventory", "notification", "auth", "analytics", "reporting"];
const suffixes = ["service", "api", "app", "platform", "system", "hub", "gateway", "manager", "processor", "handler", "worker", "agent"];

export function generateServiceNameSuggestions(template?: string, count = 5): string[] {
  const suggestions: string[] = [];
  const used = new Set<string>();

  while (suggestions.length < count && suggestions.length < 20) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${prefix}-${suffix}`;

    if (!used.has(name)) {
      used.add(name);
      suggestions.push(name);
    }
  }

  // Template-specific suggestions
  if (template?.includes("python")) {
    suggestions.push("django-service", "fastapi-backend", "python-processor");
  } else if (template?.includes("node")) {
    suggestions.push("node-api", "express-service", "nestjs-backend");
  } else if (template?.includes("go")) {
    suggestions.push("go-service", "golang-api", "go-microservice");
  }

  return suggestions.slice(0, count);
}
