"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems, site } from "@/data/site";
import ThemeToggle from "./ThemeToggle";

function isActive(href: string, pathname: string): boolean {
  if (href === "/#about") return pathname === "/";
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <nav
          className="
            flex w-full max-w-3xl items-center justify-between gap-4
            rounded-full
            border border-border-strong
            bg-background/70 backdrop-blur-xl
            px-4 sm:px-5 py-2.5
            shadow-soft
          "
        >
          {/* Brand / home link */}
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-tight text-foreground hover:text-brand-strong transition-colors shrink-0"
          >
            {site.shortName}
            <span className="text-brand">.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navItems.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${
                    active
                      ? "text-brand-strong"
                      : "text-ink-subtle hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="
                md:hidden inline-flex h-9 w-9 items-center justify-center
                rounded-full border border-border-strong text-foreground/80
                hover:text-brand-strong hover:border-brand/40 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" aria-hidden={!open}>
          <div
            className="absolute inset-0 bg-background/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-20 inset-x-4 rounded-3xl border border-border-strong bg-surface shadow-lift p-4 pop-in">
            <nav className="flex flex-col">
              {navItems.map((item) => {
                const active = isActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      active
                        ? "bg-brand/10 text-brand-strong"
                        : "text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
