"use client";

import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { Container, Eyebrow } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Tag from "@/components/ui/Tag";

export default function ProjectGrid() {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal className="mb-10 space-y-3">
          <Eyebrow>Selected work</Eyebrow>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Projects I&apos;ve enjoyed building.
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.06} className="h-full">
              <button
                onClick={() => setActive(project)}
                className="
                  group flex h-full w-full flex-col justify-between gap-6
                  rounded-[var(--radius-card)] border border-border
                  bg-surface p-6 text-left shadow-soft
                  hover:-translate-y-1 hover:shadow-lift hover:border-brand/30
                  transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
                "
              >
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-strong">
                    {project.year}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-sm text-ink-subtle leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-subtle">
                    {project.tagline}
                  </span>
                  <span
                    className="
                      inline-flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-full bg-brand/10 text-brand-strong
                      group-hover:bg-brand group-hover:text-white
                      transition-colors
                    "
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      {active && (
        <ProjectModal project={active} onClose={() => setActive(null)} />
      )}
    </section>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="
          pop-in relative w-full max-w-lg
          rounded-[var(--radius-feature)] border border-border-strong
          bg-background p-6 md:p-8 shadow-lift
        "
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-strong">
          {project.role} · {project.year}
        </p>
        <h3
          id="project-modal-title"
          className="mt-2 font-display text-xl md:text-2xl font-semibold text-foreground"
        >
          {project.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-foreground">
          {project.headline}
        </p>
        <p className="mt-4 text-sm text-ink-subtle leading-relaxed">
          {project.details}
        </p>

        {project.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {project.links?.map((link) => (
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
          <button
            ref={closeRef}
            onClick={onClose}
            className="
              rounded-full border border-border-strong px-4 py-2 text-xs
              text-ink-subtle hover:text-foreground hover:border-brand/40 transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
