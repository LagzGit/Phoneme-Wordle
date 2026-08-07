"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/wordle", label: "Wordle" },
  { href: "/wordsearch", label: "Word Search" },
];

const MENU_LINKS = [
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md border border-primary bg-primary-soft font-mono text-sm font-bold text-primary-dark"
          >
            /ə/
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold sm:text-lg">
              Phoneme Activity Builder
            </span>
            <span className="text-[0.65rem] font-medium text-ink-soft">
              Assessment 1 · Frontend design and usability
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {PRIMARY_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-soft text-primary-dark"
                    : "text-ink-soft hover:bg-paper-alt hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-md border border-border bg-surface hover:bg-paper-alt"
          >
            <span className="block h-[2px] w-5 bg-ink" />
            <span className="block h-[2px] w-5 bg-ink" />
            <span className="block h-[2px] w-5 bg-ink" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-surface p-1.5 shadow-lg"
            >
              <div className="flex flex-col gap-1 sm:hidden">
                {PRIMARY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper-alt hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-1 h-px bg-border" />
              </div>
              {MENU_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper-alt hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
