import { site } from "@/data/site";

/**
 * Hero photo slot. The photo is layered as a CSS background over a designed
 * placeholder: if a file exists at site.avatar (public/me/avatar.jpg) it covers
 * the placeholder; until then the placeholder shows through. Swapping in a real
 * photo requires no code change and no JavaScript.
 */
export default function Avatar() {
  return (
    <div
      className="
        relative aspect-[4/5] w-full max-w-sm mx-auto
        overflow-hidden rounded-[var(--radius-feature)]
        border border-border-strong
        bg-gradient-to-br from-surface to-surface-2
        shadow-lift
      "
    >
      {/* Placeholder base layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/15 border border-brand/30">
          <span className="font-display text-4xl font-semibold text-brand-strong">
            Y
          </span>
        </div>
        <p className="text-sm text-ink-subtle max-w-[14rem]">
          A photo of {site.shortName} goes here — drop one at{" "}
          <span className="font-mono text-xs">public/me/avatar.jpg</span>.
        </p>
      </div>

      {/* Photo layer — covers the placeholder when the file exists. */}
      <div
        role="img"
        aria-label={site.name}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${site.avatar})` }}
      />
    </div>
  );
}
