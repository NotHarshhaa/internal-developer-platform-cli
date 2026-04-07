"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, LayoutDashboard, Layers, Plus, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Service", icon: Plus },
  { href: "/templates", label: "Templates", icon: Layers },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none tracking-tight">
                IDP CLI
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Developer Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/NotHarshhaa/internal-developer-platform-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex"
          >
            <Button variant="default" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </Link>
          <Badge className="flex items-center gap-1 px-2 py-1">
            <span className="h-2 w-2 rounded-full bg-background animate-pulse" />
            <span className="text-[10px] font-medium">
              v1.0.0
            </span>
          </Badge>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden border-t">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
