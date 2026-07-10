"use client";

import { useCallback, useRef, useState, type ReactNode, type ElementType } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds */
  delay?: number;
  /** Slide distance in px (default 16) */
  y?: number;
  as?: ElementType;
};

/**
 * Fades + rises content into view once, using an IntersectionObserver and CSS
 * transitions (no animation library). Fails open: content is revealed
 * immediately if it is already in/above the viewport or if IntersectionObserver
 * is unavailable, so it can never get stuck hidden. Reduced-motion is handled by
 * the global CSS rule that neutralizes transitions.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  as,
}: RevealProps) {
  const Tag = (as || "div") as ElementType;
  const [shown, setShown] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // A ref callback (not an effect) sets up the observer and can reveal
  // synchronously when appropriate.
  const setRef = useCallback((el: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.05 }
    );
    observer.observe(el);
    cleanupRef.current = () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={setRef}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
