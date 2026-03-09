"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const currentTheme = theme || resolvedTheme || "system";
    if (currentTheme === "light") {
      setTheme("dark");
    } else if (currentTheme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const currentTheme = mounted ? (theme || resolvedTheme || "system") : "system";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="rounded-full"
      suppressHydrationWarning
    >
      <div className="relative" suppressHydrationWarning>
        <Sun 
          suppressHydrationWarning
          className={`h-5 w-5 transition-all ${
            currentTheme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`} 
        />
        <Moon 
          suppressHydrationWarning
          className={`absolute top-0 left-0 h-5 w-5 transition-all ${
            currentTheme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`} 
        />
        <Monitor 
          suppressHydrationWarning
          className={`absolute top-0 left-0 h-5 w-5 transition-all ${
            currentTheme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
