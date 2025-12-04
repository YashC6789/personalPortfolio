// components/ProjectGrid.tsx
"use client";

import { useState } from "react";
import { projects } from "./projectsData";

type Project = (typeof projects)[number];

export default function ProjectGrid() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Projects
          </h2>
        </header>

        {/* 3 x 2 grid of evenly spaced squares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(project)}
              className="
                group relative aspect-square w-full
                rounded-2xl border border-[--foreground]/10
                bg-[--background]/80
                shadow-sm
                overflow-hidden
                transition-all duration-300
                hover:shadow-lg hover:-translate-y-1 hover:border-brand/50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60
                text-left
              "
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[--background]/40 to-[--background]/90 group-hover:from-[--background]/20 group-hover:to-[--background]/80 transition-colors" />

              <div className="relative h-full flex flex-col justify-between p-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-subtle">
                    Project
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-xs text-ink-subtle line-clamp-2">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs mt-2">
                  <p className="text-ink-subtle line-clamp-2 mr-2">
                    {project.summary}
                  </p>
                  <span
                    className="
                      inline-flex shrink-0 items-center justify-center
                      h-7 w-7 rounded-full
                      bg-brand text-white text-xs
                      group-hover:scale-105 group-hover:bg-brand-dark
                      transition-transform
                    "
                  >
                    +
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </>
  );
}

type ProjectModalProps = {
  project: Project;
  onClose: () => void;
};

function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          max-w-lg w-full
          rounded-2xl
          bg-[--background]
          border border-[--foreground]/15
          shadow-xl
          p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-subtle mb-1">
            Project
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            {project.title}
          </h3>
          <p className="text-sm text-ink-subtle">{project.tagline}</p>
        </header>

        <p className="text-sm text-foreground mb-4">{project.details}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              text-xs px-4 py-2 rounded-full
              border border-[--foreground]/20
              text-ink-subtle
              hover:bg-[--accent]/30
              transition
            "
          >
            Close
          </button>
          {/* Optional: link button */}
          {/* <a href="#" className="text-xs px-4 py-2 rounded-full bg-brand text-white hover:bg-brand-dark transition">
            View Code
          </a> */}
        </div>
      </div>
    </div>
  );
}