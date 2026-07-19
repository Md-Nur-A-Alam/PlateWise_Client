"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "theme-recipe";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference on mount
    const storedTheme = localStorage.getItem("platewise-theme") as Theme;
    if (storedTheme && ["light", "dark", "theme-recipe"].includes(storedTheme)) {
      setThemeState(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Remove previous themes
    document.documentElement.classList.remove("light", "dark", "theme-recipe");
    
    // Add current theme class
    if (theme !== "light") {
      document.documentElement.classList.add(theme);
    }
    
    // Persist
    localStorage.setItem("platewise-theme", theme);
    // Setting cookie for basic SSR awareness if needed later
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch by not rendering theme-dependent UI until mounted
  // We render children anyway but avoid using theme context in them before hydration
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
