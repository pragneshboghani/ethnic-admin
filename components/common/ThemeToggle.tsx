"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      suppressHydrationWarning
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-full border border-[var(--border)] bg-[var(--bg-inset)] p-1 transition hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
    >
      {/* Track icons — the inactive side stays visible as a hint */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[7px]">
        <Sun
          size={13}
          suppressHydrationWarning
          className={`transition-opacity duration-200 ${
            isDark ? "text-[var(--text-faint)] opacity-100" : "opacity-0"
          }`}
        />
        <Moon
          size={13}
          suppressHydrationWarning
          className={`transition-opacity duration-200 ${
            isDark ? "opacity-0" : "text-[var(--text-faint)] opacity-100"
          }`}
        />
      </span>

      {/* Sliding knob carrying the active icon */}
      <span
        suppressHydrationWarning
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-surface)] shadow-[0_1px_3px_rgba(15,23,42,0.24)] transition-transform duration-200 ease-out ${
          isDark ? "translate-x-[28px]" : "translate-x-0"
        }`}
      >
        <Sun
          size={13}
          suppressHydrationWarning
          className={`absolute text-[var(--status-amber-text)] transition-all duration-200 ${
            isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <Moon
          size={13}
          suppressHydrationWarning
          className={`absolute text-[var(--accent)] transition-all duration-200 ${
            isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
