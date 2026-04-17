import { RecentService, ServiceConfig } from "@/lib/data";

const RECENT_SERVICES_KEY = "idp_recent_services";
const MAX_RECENT_SERVICES = 10;

export function saveRecentService(config: ServiceConfig, templateName: string): void {
  const recentServices = getRecentServices();
  
  const newRecent: RecentService = {
    id: Date.now().toString(),
    config,
    generatedAt: new Date().toISOString(),
    templateName,
  };
  
  // Remove duplicates with same name
  const filtered = recentServices.filter(s => s.config.name !== config.name);
  
  // Add new service at the beginning
  const updated = [newRecent, ...filtered].slice(0, MAX_RECENT_SERVICES);
  
  localStorage.setItem(RECENT_SERVICES_KEY, JSON.stringify(updated));
}

export function getRecentServices(): RecentService[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(RECENT_SERVICES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearRecentServices(): void {
  localStorage.removeItem(RECENT_SERVICES_KEY);
}

export function deleteRecentService(id: string): void {
  const recentServices = getRecentServices();
  const filtered = recentServices.filter(s => s.id !== id);
  localStorage.setItem(RECENT_SERVICES_KEY, JSON.stringify(filtered));
}
