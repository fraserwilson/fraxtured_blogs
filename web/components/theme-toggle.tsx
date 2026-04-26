"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("theme-dark", isDark);
  root.classList.toggle("theme-light", !isDark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial: Theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-outline rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10"
      aria-label="Toggle dark mode"
    >
      {mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
    </button>
  );
}
