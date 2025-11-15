import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("crm_theme") || "light";
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("crm_theme", next);
  };

  if (!mounted) return null;
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} mode</span>
    </button>
  );
}
