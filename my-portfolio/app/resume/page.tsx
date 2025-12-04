// app/resume/page.tsx

export default function ResumePage() {
    return (
      <main className="min-h-screen bg-background text-foreground pt-28 px-4 md:px-8">
        <section className="max-w-5xl mx-auto mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Resume</h1>
            <p className="text-sm text-ink-subtle">
              View a PDF version of my resume. You can scroll, zoom, or download it below.
            </p>
          </div>
  
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center
              rounded-full px-4 py-2 text-xs md:text-sm font-medium
              bg-brand text-white
              hover:bg-brand-dark
              transition
            "
          >
            Open in new tab
          </a>
        </section>
  
        <section className="max-w-5xl mx-auto">
          <div
            className="
              w-full
              rounded-2xl
              border border-[--foreground]/10
              bg-[--background]/60
              shadow-lg
              overflow-hidden
            "
            style={{ minHeight: "70vh" }}
          >
            {/* Embedded PDF */}
            <iframe
              src="/resume.pdf"
              className="w-full h-full"
              style={{ minHeight: "70vh" }}
              title="Resume PDF"
            />
          </div>
  
          <p className="mt-3 text-xs text-ink-subtle">
            If the preview doesn&apos;t load,{" "}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              click here to open or download the PDF
            </a>.
          </p>
        </section>
      </main>
    );
  }