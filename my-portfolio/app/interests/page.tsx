// app/interests/page.tsx

export default function InterestsPage() {
    return (
      <main className="min-h-screen bg-background text-foreground pt-32 px-4 md:px-6">
        <section className="max-w-4xl mx-auto space-y-8">
  
          <header>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Interests
            </h1>
            <p className="mt-3 text-foreground/70 text-sm md:text-base">
              Things I’m passionate about, curious about, or enjoy learning outside of work.
            </p>
          </header>
  
          {/* Interest Categories */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">Technology</h2>
              <p className="mt-2 text-sm text-foreground/70">
                AI, ML, agents, full-stack development, UI design, systems programming.
              </p>
            </div>
  
            <div className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">Sports & Fitness</h2>
              <p className="mt-2 text-sm text-foreground/70">
                Running, fantasy football, performance training.
              </p>
            </div>
  
            <div className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">Creative</h2>
              <p className="mt-2 text-sm text-foreground/70">
                Cooking, writing, visual design, photography, music.
              </p>
            </div>
  
            <div className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">Lifestyle</h2>
              <p className="mt-2 text-sm text-foreground/70">
                Travel, fashion, watching good films, collecting interesting items.
              </p>
            </div>
          </div>
  
        </section>
      </main>
    );
  }