"use client";

import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  isSystem: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_COOKIE = "theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Always start from the SSR-safe default ("light") so the client's first
  // hydration pass matches the server-rendered markup exactly. The blocking
  // inline script in LayoutContainer already applies the real theme to the
  // DOM before paint, so this only affects React-driven UI (e.g. the toggle
  // icon), which the effect below corrects immediately after mount.
  const [theme, setThemeState] = useState<Theme>("light");
  const [isSystem, setIsSystem] = useState(true);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- syncing from cookie/matchMedia, unavailable during SSR */
    const stored = Cookies.get(THEME_COOKIE) as Theme | undefined;

    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      setIsSystem(false);
    } else {
      setThemeState(getSystemTheme());
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!isSystem) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setThemeState(media.matches ? "dark" : "light");

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [isSystem]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    setIsSystem(false);
    Cookies.set(THEME_COOKIE, next, { expires: 365 });
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, isSystem, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
