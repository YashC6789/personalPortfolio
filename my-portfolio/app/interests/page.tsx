import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Interests",
  description:
    "Things Yashkaran Chauhan is passionate about outside of work — technology, sports, creative pursuits, and lifestyle.",
};

type Interest = {
  title: string;
  body: string;
  icon: string;
  tint: string;
};

const interests: Interest[] = [
  {
    title: "Technology",
    body: "AI, machine learning, agents, full-stack development, UI design, and systems programming.",
    icon: "🤖",
    tint: "from-brand/15 to-brand/5",
  },
  {
    title: "Sports & Fitness",
    body: "Running, fantasy football, and performance training — always chasing a new PR.",
    icon: "🏃",
    tint: "from-accent-soft/25 to-accent-soft/5",
  },
  {
    title: "Creative",
    body: "Cooking, writing, visual design, photography, and music.",
    icon: "🎨",
    tint: "from-brand/10 to-accent-soft/10",
  },
  {
    title: "Lifestyle",
    body: "Travel, fashion, good films, and collecting interesting things.",
    icon: "✈️",
    tint: "from-surface-2 to-surface",
  },
];

export default function InterestsPage() {
  return (
    <main className="pt-32 md:pt-40 pb-8">
      <Container>
        <PageHeader
          eyebrow="Beyond the code"
          title="Things I'm curious about."
          subtitle="What I'm passionate about, curious about, or enjoy learning outside of work."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {interests.map((interest, i) => (
            <Reveal key={interest.title} delay={(i % 2) * 0.08}>
              <div
                className={`
                  h-full rounded-[var(--radius-card)] border border-border
                  bg-gradient-to-br ${interest.tint}
                  p-7 shadow-soft
                  hover:-translate-y-1 hover:shadow-lift transition-all
                `}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-2xl shadow-soft">
                  <span aria-hidden="true">{interest.icon}</span>
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {interest.title}
                </h2>
                <p className="mt-2 text-sm text-ink-subtle leading-relaxed">
                  {interest.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </main>
  );
}
