"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Container, Eyebrow } from "@/components/ui/Section";

interface CollageImage {
  key: string;
  orientation: "landscape" | "portrait";
  contentType?: string;
  size?: number;
  updated?: string;
}

/** Random pattern for a column: 3 landscape + 1 portrait, portrait position seeded. */
function generateRandomPattern(seed: number): ("landscape" | "portrait")[] {
  const pattern: ("landscape" | "portrait")[] = [
    "landscape",
    "landscape",
    "landscape",
    "portrait",
  ];
  let random = seed;
  random = (random * 9301 + 49297) % 233280;
  const portraitPosition = Math.floor((random / 233280) * 4);
  const portrait = pattern.splice(3, 1)[0];
  pattern.splice(portraitPosition, 0, portrait);
  return pattern;
}

/** Deterministic shuffle based on seed. */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let random = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    random = (random * 9301 + 49297) % 233280;
    const j = Math.floor((random / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ImageCollage() {
  const [manifest, setManifest] = useState<CollageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const columnCount = 4;
  const imagesPerColumn = 4; // 3 landscape + 1 portrait

  useEffect(() => {
    async function fetchManifest() {
      try {
        const response = await fetch("/api/collage/manifest");
        const data = await response.json();

        if (!response.ok) {
          const errorMsg =
            data.error || data.message || "Failed to fetch manifest";
          console.error("Manifest API error:", data);
          setError(errorMsg);
          setManifest([]);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Manifest API returned non-array:", data);
          setError("Invalid manifest format");
          setManifest([]);
          return;
        }

        setManifest(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching manifest:", err);
        setError(err instanceof Error ? err.message : "Failed to load images");
        setManifest([]);
      } finally {
        setLoading(false);
      }
    }

    fetchManifest();
  }, []);

  const { landscapes, portraits } = useMemo(() => {
    const lands: CollageImage[] = [];
    const ports: CollageImage[] = [];
    for (const img of manifest) {
      if (img.orientation === "landscape") lands.push(img);
      else ports.push(img);
    }
    return { landscapes: lands, portraits: ports };
  }, [manifest]);

  const shuffledLandscapes = useMemo(
    () => seededShuffle(landscapes, 12345),
    [landscapes]
  );
  const shuffledPortraits = useMemo(
    () => seededShuffle(portraits, 67890),
    [portraits]
  );

  const landscapeIdxRef = useRef(0);
  const portraitIdxRef = useRef(0);
  const rotationCountRef = useRef(0);

  const selectUniqueImages = useCallback((): CollageImage[][] => {
    const columns: CollageImage[][] = [];
    const usedKeys = new Set<string>();
    let landscapeIdx = landscapeIdxRef.current;
    let portraitIdx = portraitIdxRef.current;

    for (let col = 0; col < columnCount; col++) {
      const column: CollageImage[] = [];
      const pattern = generateRandomPattern(
        col * 1000 + rotationCountRef.current * 100
      );

      for (let i = 0; i < imagesPerColumn; i++) {
        const requiredOrientation = pattern[i];
        let selected: CollageImage | null = null;
        let attempts = 0;
        const maxAttempts =
          Math.max(shuffledLandscapes.length, shuffledPortraits.length) * 2;

        while (!selected && attempts < maxAttempts) {
          if (requiredOrientation === "landscape") {
            if (shuffledLandscapes.length === 0) break;
            const candidate =
              shuffledLandscapes[landscapeIdx % shuffledLandscapes.length];
            landscapeIdx++;
            if (!usedKeys.has(candidate.key)) {
              selected = candidate;
              usedKeys.add(candidate.key);
            }
          } else {
            if (shuffledPortraits.length === 0) break;
            const candidate =
              shuffledPortraits[portraitIdx % shuffledPortraits.length];
            portraitIdx++;
            if (!usedKeys.has(candidate.key)) {
              selected = candidate;
              usedKeys.add(candidate.key);
            }
          }
          attempts++;
        }

        if (!selected) {
          if (requiredOrientation === "landscape" && shuffledLandscapes.length > 0) {
            selected = shuffledLandscapes[landscapeIdx % shuffledLandscapes.length];
            landscapeIdx++;
          } else if (
            requiredOrientation === "portrait" &&
            shuffledPortraits.length > 0
          ) {
            selected = shuffledPortraits[portraitIdx % shuffledPortraits.length];
            portraitIdx++;
          }
        }

        if (selected) {
          column.push(selected);
          usedKeys.add(selected.key);
        }
      }

      columns.push(column);
    }

    landscapeIdxRef.current = landscapeIdx;
    portraitIdxRef.current = portraitIdx;
    rotationCountRef.current += 1;

    return columns;
  }, [shuffledLandscapes, shuffledPortraits, columnCount, imagesPerColumn]);

  const [columnImages, setColumnImages] = useState<CollageImage[][]>([]);

  useEffect(() => {
    if (shuffledLandscapes.length === 0 && shuffledPortraits.length === 0) {
      return;
    }
    setColumnImages(selectUniqueImages());
    const id = setInterval(() => {
      setColumnImages(selectUniqueImages());
    }, 30000);
    return () => clearInterval(id);
  }, [selectUniqueImages, shuffledLandscapes.length, shuffledPortraits.length]);

  function getImageUrl(key: string): string {
    return `/api/collage/image?key=${encodeURIComponent(key)}`;
  }

  // Graceful failure: if the collage can't load, render nothing rather than an
  // error string in the middle of the homepage.
  if (loading) {
    return null;
  }
  if (error || manifest.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <Container size="wide">
        <div className="mb-10 space-y-3">
          <Eyebrow>Life outside the terminal</Eyebrow>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            A rotating collage of moments.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            gap: "16px",
          }}
        >
          {Array.from({ length: columnCount }).map((_, colIdx) => {
            const imagesToShow = columnImages[colIdx] || [];
            return (
              <div key={colIdx} style={{ display: "grid", gap: "16px" }}>
                {imagesToShow.map((img, imgIdx) => {
                  const imageUrl = getImageUrl(img.key);
                  const isPortrait = img.orientation === "portrait";
                  const keyCount = imagesToShow
                    .slice(0, imgIdx)
                    .filter((i) => i.key === img.key).length;
                  const stableKey =
                    keyCount > 0
                      ? `${colIdx}-${img.key}-${keyCount}`
                      : `${colIdx}-${img.key}`;

                  return (
                    <button
                      key={stableKey}
                      type="button"
                      onClick={() => setActiveSrc(imageUrl)}
                      aria-label="View photo"
                      className="
                        group relative overflow-hidden rounded-[var(--radius-card)]
                        border border-border shadow-soft
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-lift
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
                      "
                      style={{ aspectRatio: isPortrait ? "2/3" : "3/2" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={imageUrl}
                        src={imageUrl}
                        alt=""
                        className="
                          fade-in h-full w-full object-cover
                          transition-transform duration-500
                          group-hover:scale-105 cursor-pointer
                        "
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Container>

      {/* Lightbox */}
      {activeSrc && (
        <Lightbox src={activeSrc} onClose={() => setActiveSrc(null)} />
      )}
    </section>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm" />
      <div
        className="
          pop-in relative max-w-3xl w-full max-h-[80vh]
          overflow-hidden rounded-[var(--radius-feature)]
          border border-border-strong bg-background shadow-lift
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex max-h-[80vh] items-center justify-center bg-foreground/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="max-h-[80vh] w-auto object-contain" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="
            absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-medium
            bg-background/90 text-foreground border border-border-strong
            hover:bg-surface transition
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
          "
        >
          Close
        </button>
      </div>
    </div>
  );
}
