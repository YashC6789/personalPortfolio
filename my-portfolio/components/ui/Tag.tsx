import type { ReactNode } from "react";

/** A small monospace tech/topic chip. */
export default function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        inline-flex items-center
        rounded-full
        border border-border
        bg-surface
        px-3 py-1
        font-mono text-xs text-ink-subtle
      "
    >
      {children}
    </span>
  );
}
