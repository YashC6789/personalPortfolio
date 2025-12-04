// components/BioBox.tsx
export default function BioBox() {
    return (
      <div
        className="
          group relative w-full max-w-3xl
          rounded-2xl
          p-6 md:p-8
          bg-[--background]/60
          dark:bg-[--background]/40
          backdrop-blur-xl
          border border-[--foreground]/10
          shadow-[0_4px_20px_rgba(0,0,0,0.12)]
          dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)]
          transition-all duration-300
  
          hover:-translate-y-1
          hover:shadow-[0_8px_28px_rgba(0,0,0,0.18)]
          dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
          hover:bg-[--background]/70
          dark:hover:bg-[--background]/50
        "
      >
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
          About Me
        </h2>
  
        {/* Body text */}
        <p className="text-base leading-relaxed text-ink-subtle">
          I’m a software engineer focused on building modern web applications,
          polished UI experiences, and meaningful technology projects. I enjoy
          working with Next.js, Tailwind, and machine learning — always exploring
          ways to blend great design with technical depth.
        </p>
      </div>
    );
  }