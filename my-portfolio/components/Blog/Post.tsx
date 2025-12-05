// components/Blog/Post.tsx
import Link from "next/link";

export type PostProps = {
  title: string;
  slug: string;
  date: string;
  description?: string;
  tags?: string[];
};

export default function Post({
  title,
  slug,
  date,
  description,
  tags = [],
}: PostProps) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="
        w-full
        rounded-2xl
        border border-ink-subtle/25
        bg-background/90
        backdrop-blur-sm
        shadow-sm
        hover:shadow-md
        hover:-translate-y-[2px]
        transition
        p-6 md:p-8        /* ⬅️ Added more padding */
      "
    >
      <div>
        <Link
          href={`/blog/${slug}`}
          className="text-xl font-semibold tracking-tight text-foreground hover:underline"
        >
          {title}
        </Link>

        <p className="mt-2 text-[14px] text-ink-subtle">
          {formattedDate}
          {description && <> — {description}</>}
        </p>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  px-2 py-0.5
                  rounded-full
                  bg-ink-subtle/10
                  text-ink-subtle
                  text-[12px] font-medium
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}