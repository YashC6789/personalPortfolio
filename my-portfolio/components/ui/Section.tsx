import type { ReactNode } from "react";

/** A section eyebrow — wide-tracked small caps used across pages. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs md:text-sm font-medium uppercase tracking-[0.25em] text-brand-strong">
      {children}
    </p>
  );
}

/** A page header block: eyebrow + display heading + optional subline. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`space-y-4 ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="max-w-2xl text-base text-ink-subtle leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
}

/** Centered content column with consistent horizontal padding. */
export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const max =
    size === "wide"
      ? "max-w-6xl"
      : size === "narrow"
        ? "max-w-3xl"
        : "max-w-5xl";
  return (
    <div className={`${max} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
