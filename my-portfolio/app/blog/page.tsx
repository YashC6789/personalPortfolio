import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import { getAllPosts } from "@/lib/blog";
import { Container, PageHeader } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing by Yashkaran Chauhan on building, learning, and machine learning.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="pt-32 md:pt-40 pb-8">
      <Container size="narrow">
        <PageHeader
          eyebrow="Writing"
          title="Notes on building & learning."
          subtitle="Occasional posts about projects, machine learning, and what I'm currently exploring."
        />

        <div className="mt-12 space-y-5">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.05}>
              <PostCard
                title={post.title}
                slug={post.slug}
                date={post.date}
                description={post.description}
                tags={post.tags}
                readingTime={post.readingTime}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </main>
  );
}
