import Link from "next/link";
import { site } from "@/data/site";
import Avatar from "./Avatar";
import { Container } from "@/components/ui/Section";
import { GitHubIcon, LinkedInIcon, MailIcon, ArrowIcon } from "@/components/ui/icons";

export default function Hero() {
  return (
    <section id="about" className="pt-32 md:pt-40 pb-8 fade-in">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr] md:gap-14">
          {/* Text */}
          <div className="space-y-6">
            <p className="text-sm font-medium text-ink-subtle">
              Hey, I&apos;m Yash <span className="inline-block">👋</span>
            </p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
              I build AI systems and study{" "}
              <span className="text-brand-strong italic">how they break</span>.
            </h1>

            <p className="max-w-xl text-lg text-ink-subtle leading-relaxed">
              {site.tagline} Currently an M.S. Computer Science student at
              Georgia Tech (AI concentration), researching ML security and
              building production LLM systems.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/projects"
                className="
                  inline-flex items-center gap-2 rounded-full
                  bg-brand px-5 py-2.5 text-sm font-medium text-white
                  shadow-soft hover:bg-brand-dark hover:scale-[1.02]
                  transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
                "
              >
                View my work
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="
                  inline-flex items-center gap-2 rounded-full
                  border border-border-strong px-5 py-2.5 text-sm font-medium
                  text-foreground hover:border-brand/40 hover:text-brand-strong
                  transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
                "
              >
                Get in touch
              </Link>

              <div className="flex items-center gap-1 pl-1">
                <a
                  href={site.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 text-ink-subtle hover:text-brand-strong transition-colors"
                >
                  <GitHubIcon className="h-5 w-5" />
                </a>
                <a
                  href={site.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 text-ink-subtle hover:text-brand-strong transition-colors"
                >
                  <LinkedInIcon className="h-5 w-5" />
                </a>
                <a
                  href={`mailto:${site.email}`}
                  aria-label="Email"
                  className="p-2 text-ink-subtle hover:text-brand-strong transition-colors"
                >
                  <MailIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="order-first md:order-last">
            <Avatar />
          </div>
        </div>
      </Container>
    </section>
  );
}
