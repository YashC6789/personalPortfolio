import Link from "next/link";
import { navItems, site } from "@/data/site";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Identity */}
          <div className="max-w-sm space-y-3">
            <Link
              href="/"
              className="font-display text-lg font-semibold text-foreground"
            >
              {site.name}
            </Link>
            <p className="text-sm text-ink-subtle leading-relaxed">
              {site.role} · {site.location}. Building AI systems and studying how
              they break.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={site.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-ink-subtle hover:text-brand-strong transition-colors"
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
              <a
                href={site.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-ink-subtle hover:text-brand-strong transition-colors"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${site.email}`}
                aria-label="Email"
                className="text-ink-subtle hover:text-brand-strong transition-colors"
              >
                <MailIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Nav */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-subtle hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-subtle">
          <p>
            © {year} {site.name}. Built with Next.js &amp; Tailwind.
          </p>
          <p>Made in {site.location}.</p>
        </div>
      </div>
    </footer>
  );
}
