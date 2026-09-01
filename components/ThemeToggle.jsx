"use client";

import { useEffect, useState } from "react";

function readTheme() {
  try {
    const saved = localStorage.getItem("priceter-theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch (error) {
    // Ignore storage access errors.
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function applyTheme(next) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("priceter-theme", next);
    } catch (error) {
      // Ignore storage access errors.
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
