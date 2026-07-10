import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Container } from "@/components/ui/Section";
import PostBody from "@/components/blog/PostBody";
import Tag from "@/components/ui/Tag";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="pt-32 md:pt-40 pb-8">
      <Container size="narrow">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-ink-subtle hover:text-brand-strong transition-colors"
        >
          ← Back to blog
        </Link>

        <article className="mt-8">
          <header className="space-y-4 border-b border-border pb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-subtle">
              {formattedDate} · {post.readingTime} min read
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-lg text-ink-subtle leading-relaxed">
                {post.description}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </header>

          <div className="mt-8">
            <PostBody content={post.content} />
          </div>
        </article>
      </Container>
    </main>
  );
}
