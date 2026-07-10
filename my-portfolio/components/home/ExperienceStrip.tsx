import { experience, education } from "@/data/experience";
import { Container, Eyebrow } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

export default function ExperienceStrip() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal className="space-y-3 mb-10">
          <Eyebrow>Experience</Eyebrow>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Where I&apos;ve been building.
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {experience.map((role, i) => (
            <Reveal
              key={role.company}
              as="article"
              delay={i * 0.08}
              className="
                rounded-[var(--radius-card)] border border-border
                bg-surface p-6 shadow-soft
                hover:shadow-lift hover:-translate-y-1 transition-all
              "
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {role.company}
                </h3>
                <span className="font-mono text-[11px] text-ink-subtle whitespace-nowrap">
                  {role.period}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-brand-strong">
                {role.title}
              </p>
              <p className="mt-3 text-sm text-ink-subtle leading-relaxed">
                {role.summary}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Education line */}
        <Reveal
          delay={0.1}
          className="
            mt-4 rounded-[var(--radius-card)] border border-border
            bg-surface/60 p-6 shadow-soft
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>Education</Eyebrow>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
              {education.map((ed) => (
                <div key={ed.degree} className="sm:text-right">
                  <p className="text-sm font-medium text-foreground">
                    {ed.degree}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {ed.school} · {ed.detail} · {ed.period}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
