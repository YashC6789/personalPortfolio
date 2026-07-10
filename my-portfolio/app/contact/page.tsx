import type { Metadata } from "next";
import { site } from "@/data/site";
import { Container, PageHeader } from "@/components/ui/Section";
import CopyEmail from "@/components/contact/CopyEmail";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Yashkaran Chauhan.",
};

const socialCards = [
  {
    label: "GitHub",
    handle: "@YashC6789",
    href: site.socials.github,
    Icon: GitHubIcon,
    blurb: "Code, projects, and experiments.",
  },
  {
    label: "LinkedIn",
    handle: "in/yashc1",
    href: site.socials.linkedin,
    Icon: LinkedInIcon,
    blurb: "Experience and professional updates.",
  },
];

export default function ContactPage() {
  return (
    <main className="pt-32 md:pt-40 pb-8">
      <Container size="narrow">
        <PageHeader
          eyebrow="Get in touch"
          title="Say hello."
          subtitle="Whether it's about a role, a project, or just to chat about AI and security — I'd love to hear from you."
        />

        <div className="mt-12 space-y-4">
          <CopyEmail />

          <div className="grid gap-4 sm:grid-cols-2">
            {socialCards.map(({ label, handle, href, Icon, blurb }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group rounded-[var(--radius-card)] border border-border
                  bg-surface p-6 shadow-soft
                  hover:-translate-y-1 hover:shadow-lift hover:border-brand/30
                  transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
                "
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand-strong group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {label}
                    </h2>
                    <p className="font-mono text-xs text-ink-subtle">{handle}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink-subtle">{blurb}</p>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
