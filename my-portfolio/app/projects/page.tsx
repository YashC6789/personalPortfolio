// app/projects/page.tsx
import Image from "next/image";

type Project = {
  id: string;
  title: string;
  headline: string;
  role: string;
  year: string;
  description: string;
  tags: string[];
  image?: string; // e.g. "/projects/adversarial.png"
  heroBg: string; // tailwind bg class, e.g. "bg-accent" or "bg-brand"
  layout: "image-left" | "image-right";
};

const projects: Project[] = [
  {
    id: "adversarial-finetuning",
    title: "Fine-tuning on Adversarial Images",
    headline: "Recovering robust accuracy with GPU-accelerated adversarial training.",
    role: "ML Research · Python · PyTorch",
    year: "2025",
    description:
      "Designed and implemented a benchmarking system for adversarial image fine-tuning, running PGD-style attacks and fine-tuning ResNet models to recover robustness on ImageNet-like distributions.",
    tags: ["PyTorch", "Adversarial ML", "Experiment design"],
    image: "/projects/fine-tuning.png", // put this in public/projects/adversarial.png
    heroBg: "bg-accent",
    layout: "image-left",
  },
  {
    id: "personal-portfolio",
    title: "Personal Portfolio & Blog",
    headline: "A soft, glassy interface for sharing my work and writing.",
    role: "Product design · Frontend",
    year: "2025",
    description:
      "A Next.js and Tailwind-powered portfolio focused on smooth layouts, dark-mode aware color palettes, and dynamic sections for projects, a blog, and personal interests.",
    tags: ["Next.js", "Tailwind CSS", "Design systems"],
    image: "/projects/portfolio.png",
    heroBg: "bg-brand/90",
    layout: "image-right",
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Push content below your fixed nav */}
      <div className="pt-40 px-4 md:px-6 lg:px-10">
        <section className="max-w-6xl mx-auto space-y-10">
          {/* Top intro */}
          <header className="space-y-3">
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-ink-subtle">
              Selected Work
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              Projects that blend design and{" "}
              <span className="text-brand">engineering</span>.
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-ink-subtle">
              A small collection of interfaces, tools, and experiments I’ve
              enjoyed crafting. Each one focuses on thoughtful details, fast
              performance, and a bit of personality.
            </p>
          </header>

          {/* Project cards */}
          <div className="space-y-10">
            {projects.map((project) => {
              const isImageLeft = project.layout === "image-left";

              return (
                <article
                  key={project.id}
                  className="
                    mx-auto
                    max-w-6xl
                    rounded-[2.5rem]
                    border border-ink-subtle/20
                    bg-foreground/5
                    shadow-sm
                    overflow-hidden
                  "
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Visual side */}
                    <div
                      className={`
                        ${project.heroBg}
                        flex
                        items-center
                        justify-center
                        px-6 md:px-10
                        py-10
                        ${isImageLeft ? "order-1" : "order-2 md:order-1"}
                      `}
                    >
                      <div className="relative w-full max-w-xl aspect-[16/9] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-md">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 480px, 100vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/10">
                            <span className="text-sm text-foreground/70">
                              Visual for <span className="font-semibold">{project.title}</span> goes here
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text side */}
                    <div
                      className={`
                        bg-background
                        px-6 py-8
                        md:px-10 md:py-10
                        flex items-center
                        ${isImageLeft ? "order-2" : "order-1 md:order-2"}
                      `}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            {project.title}
                          </h2>
                          <span className="text-xs uppercase tracking-[0.2em] text-ink-subtle">
                            {project.year}
                          </span>
                        </div>

                        <p className="text-sm md:text-base font-medium text-foreground">
                          {project.headline}
                        </p>

                        <p className="text-sm md:text-base text-ink-subtle">
                          {project.description}
                        </p>

                        <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-ink-subtle">
                          {project.role}
                        </p>

                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="
                                  inline-flex items-center
                                  rounded-full
                                  border border-ink-subtle/30
                                  bg-foreground/5
                                  px-3 py-1
                                  text-xs text-ink-subtle
                                "
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}