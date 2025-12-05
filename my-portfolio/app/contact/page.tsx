// app/contact/page.tsx

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-32 px-4 md:px-6">
      <section className="max-w-4xl mx-auto space-y-8">

        <header>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Contact
          </h1>
          <p className="mt-3 text-foreground/70 text-sm md:text-base">
            Want to reach out? Here are the best ways to get in touch.
          </p>
        </header>

        <div className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur-md p-8 shadow-md space-y-6">

          <div>
            <h2 className="text-lg font-medium">Email</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Feel free to reach out anytime.
            </p>
            <Link
              href="mailto:your-email@example.com"
              className="inline-block mt-2 text-sm text-foreground/80 hover:text-foreground underline"
            >
              your-email@example.com
            </Link>
          </div>

          <div>
            <h2 className="text-lg font-medium">Social</h2>
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="https://github.com/your-username"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                GitHub
              </Link>

              <Link
                href="https://linkedin.com/in/your-link"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                LinkedIn
              </Link>

              <Link
                href="/"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                Twitter / X (if applicable)
              </Link>
            </div>
          </div>

        </div>

      </section>
    </main>
  );
}