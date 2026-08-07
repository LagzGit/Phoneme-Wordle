"use client";

import { useState } from "react";
import { getCookie, setCookie, THEME_COOKIE } from "@/lib/theme";

export default function SettingsPage() {
  const [theme, setTheme] = useState(
    () => (typeof window !== "undefined" && getCookie(THEME_COOKIE)) || "light"
  );
  const [saved, setSaved] = useState(false);

  function applyTheme(next) {
    setTheme(next);
    setCookie(THEME_COOKIE, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
        Preferences
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Settings
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Interface preferences are stored in a cookie on this device, so they
        persist between visits without needing an account.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">
          Theme
        </h2>
        <div className="mt-3 flex gap-3" role="radiogroup" aria-label="Theme">
          <ThemeOption
            label="Light"
            active={theme === "light"}
            onClick={() => applyTheme("light")}
          />
          <ThemeOption
            label="Dark"
            active={theme === "dark"}
            onClick={() => applyTheme("dark")}
          />
        </div>
      </section>

      <p
        className={`mt-8 text-sm font-medium text-primary transition-opacity ${
          saved ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        Saved
      </p>
    </div>
  );
}

function ThemeOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary-soft text-primary-dark"
          : "border-border bg-surface text-ink-soft hover:bg-paper-alt"
      }`}
    >
      {label}
    </button>
  );
}
