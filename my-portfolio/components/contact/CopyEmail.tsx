"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { MailIcon } from "@/components/ui/icons";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand-strong">
          <MailIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Email
          </h2>
          <p className="mt-1 text-sm text-ink-subtle">
            The best way to reach me — I read everything.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${site.email}`}
              className="font-mono text-sm text-brand-strong hover:underline break-all"
            >
              {site.email}
            </a>
            <button
              type="button"
              onClick={copy}
              className="
                rounded-full border border-border-strong px-3 py-1 text-xs
                text-ink-subtle hover:text-foreground hover:border-brand/40 transition
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
              "
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
