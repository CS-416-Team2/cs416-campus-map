"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[88px] h-[34px] bg-surface-container rounded-lg" aria-hidden="true" />;
  }

  return (
    <div className="flex bg-surface-container border border-outline-variant rounded-lg p-1 shrink-0">
      <button
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={`flex items-center justify-center w-9 h-6 rounded-md transition-colors ${
          theme === "light"
            ? "bg-surface-container-lowest text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={`flex items-center justify-center w-9 h-6 rounded-md transition-colors ${
          theme === "dark"
            ? "bg-surface-container-lowest text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
