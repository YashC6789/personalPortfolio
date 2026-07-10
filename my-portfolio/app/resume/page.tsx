import type { Metadata } from "next";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Resume",
  description: "View and download Yashkaran Chauhan's resume.",
};

export default function ResumePage() {
  return (
    <main className="pt-32 md:pt-40 pb-8">
      <Container>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Eyebrow>Resume</Eyebrow>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              A quick look at my experience.
            </h1>
            <p className="max-w-xl text-sm text-ink-subtle">
              Scroll or zoom the preview below, or open the full PDF in a new
              tab.
            </p>
          </div>

          <a
            href={site.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex shrink-0 items-center justify-center gap-2
              rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white
              shadow-soft hover:bg-brand-dark hover:scale-[1.02] transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
            "
          >
            Open PDF
          </a>
        </div>

        {/* Desktop / tablet: embedded preview */}
        <div className="hidden sm:block">
          <div
            className="w-full overflow-hidden rounded-[var(--radius-feature)] border border-border-strong bg-surface shadow-soft"
            style={{ minHeight: "75vh" }}
          >
            <iframe
              src={site.resumePath}
              className="h-full w-full"
              style={{ minHeight: "75vh" }}
              title="Resume PDF"
            />
          </div>
        </div>

        {/* Mobile: iframed PDFs are unreliable on iOS, so show a clear card */}
        <div className="sm:hidden">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-soft">
            <p className="text-4xl" aria-hidden="true">
              📄
            </p>
            <p className="mt-4 text-sm text-ink-subtle">
              PDF previews don&apos;t render reliably on mobile. Tap below to
              open or download my resume.
            </p>
            <a
              href={site.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-soft"
            >
              View resume
            </a>
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-subtle">
          If the preview doesn&apos;t load,{" "}
          <a
            href={site.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-strong hover:underline"
          >
            click here to open or download the PDF
          </a>
          .
        </p>
      </Container>
    </main>
  );
}
