import Link from "next/link";
import Tag from "@/components/ui/Tag";

export type PostCardProps = {
  title: string;
  slug: string;
  date: string;
  description?: string;
  tags?: string[];
  readingTime?: number;
};

export default function PostCard({
  title,
  slug,
  date,
  description,
  tags = [],
  readingTime,
}: PostCardProps) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className="
        group block rounded-[var(--radius-card)]
        border border-border bg-surface p-6 md:p-8 shadow-soft
        hover:-translate-y-1 hover:shadow-lift hover:border-brand/30
        transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
      "
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
        {formattedDate}
        {readingTime ? ` · ${readingTime} min read` : ""}
      </p>
      <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-brand-strong transition-colors">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm md:text-base text-ink-subtle leading-relaxed">
          {description}
        </p>
      )}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}
    </Link>
  );
}
