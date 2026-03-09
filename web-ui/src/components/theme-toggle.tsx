"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="rounded-full"
    >
      <div className="relative">
        <Sun className={`h-5 w-5 transition-all ${theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
        <Moon className={`absolute top-0 left-0 h-5 w-5 transition-all ${theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
        <Monitor className={`absolute top-0 left-0 h-5 w-5 transition-all ${theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"}`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
