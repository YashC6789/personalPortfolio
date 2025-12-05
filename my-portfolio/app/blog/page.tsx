// app/blog/page.tsx
import Header from "@/components/Blog/Header";
import Post from "@/components/Blog/Post";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Page content */}
      <div className="pt-40 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {posts.map((p, i) => (
            <div key={p.slug}>
                <div style={{ height: '15px' }} aria-hidden="true" />
                <Post
                    title={p.title}
                    slug={p.slug}
                    date={p.date}
                    description={p.description}
                    tags={p.tags}
                />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}