import type { Metadata } from "next";
import Image from "next/image";
import { featuredProjects } from "@/data/projects";
import { Container, PageHeader } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Tag from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected AI/ML and engineering projects by Yashkaran Chauhan — LLM security benchmarking, adversarial ML, evaluation pipelines, and more.",
};

export default function ProjectsPage() {
  return (
    <main className="pt-32 md:pt-40 pb-8">
      <Container size="wide">
        <PageHeader
          eyebrow="Selected work"
          title={
            <>
              Projects that blend research and{" "}
              <span className="text-brand-strong italic">engineering</span>.
            </>
          }
          subtitle="A collection of AI/ML systems, security research, and tools I've built — each focused on measurable results and thoughtful details."
        />

        <div className="mt-14 space-y-8">
          {featuredProjects.map((project, index) => {
            const imageLeft = index % 2 === 0;
            return (
              <Reveal
                key={project.id}
                as="article"
                className="
                  overflow-hidden rounded-[var(--radius-feature)]
                  border border-border bg-surface shadow-soft
                  hover:shadow-lift transition-shadow
                "
              >
                <div className="grid md:grid-cols-2">
                  {/* Visual side */}
                  <div
                    className={`
                      relative flex items-center justify-center p-8 md:p-10
                      bg-gradient-to-br from-brand/10 via-surface-2 to-accent-soft/20
                      ${imageLeft ? "md:order-1" : "md:order-2"}
                    `}
                  >
                    <div className="relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] border border-border-strong shadow-soft">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 480px, 100vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface p-6 text-center">
                          <span className="font-display text-xl font-semibold text-brand-strong/80">
                            {project.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text side */}
                  <div
                    className={`
                      flex items-center bg-background px-6 py-8 md:px-10 md:py-12
                      ${imageLeft ? "md:order-2" : "md:order-1"}
                    `}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                          {project.title}
                        </h2>
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle whitespace-nowrap">
                          {project.year}
                        </span>
                      </div>

                      <p className="text-base font-medium text-brand-strong">
                        {project.headline}
                      </p>
                      <p className="text-sm md:text-base text-ink-subtle leading-relaxed">
                        {project.details}
                      </p>
                      <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-subtle">
                        {project.role}
                      </p>

                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {project.tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      )}

                      {project.links && project.links.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {project.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-dark transition"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
