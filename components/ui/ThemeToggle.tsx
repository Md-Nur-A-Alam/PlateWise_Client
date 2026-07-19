"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Utensils } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />; // Placeholder to prevent layout shift
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("theme-recipe");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full hover:bg-neutral transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={`Current theme is ${theme}. Click to change.`}
      title="Toggle Theme"
    >
      {theme === "light" && <Sun className="w-5 h-5 text-foreground" />}
      {theme === "dark" && <Moon className="w-5 h-5 text-foreground" />}
      {theme === "theme-recipe" && <Utensils className="w-5 h-5 text-foreground" />}
    </button>
  );
}
