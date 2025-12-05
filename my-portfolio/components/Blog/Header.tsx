// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div
        className="
          w-full
          shadow-sm
          border-b border-ink-subtle/30
          bg-brand
          text-foreground
        "
      >
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center">

          <div className="flex items-center gap-4 text-[15px] leading-tight font-semibold tracking-tight">
            <Link href="/blog" className="hover:opacity-80 transition">
              Yash News
            </Link>

            <span className="text-[--background]/70">|</span>

            <span className="text-[14px] font-normal hover:opacity-80 transition cursor-pointer">
              Personal Posts and Links
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}