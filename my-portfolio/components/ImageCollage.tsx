// components/ImageCollage.tsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react";

interface CollageImage {
  key: string;
  orientation: "landscape" | "portrait";
  contentType?: string;
  size?: number;
  updated?: string;
}

// Pattern: 3 landscape, 1 portrait, repeating
const PATTERN = ["landscape", "landscape", "landscape", "portrait"] as const;

/**
 * Shuffles array deterministically based on seed
 */
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

/**
 * Builds a column queue following 3:1 landscape-to-portrait pattern
 */
function buildColumnQueue(
  landscapes: CollageImage[],
  portraits: CollageImage[],
  columnIndex: number
): CollageImage[] {
  // Use column index as seed for deterministic shuffling
  const seededLandscapes = seededShuffle(landscapes, columnIndex * 1000);
  const seededPortraits = seededShuffle(portraits, columnIndex * 2000);

  const queue: CollageImage[] = [];
  let landscapeIdx = 0;
  let portraitIdx = 0;

  // If one orientation is missing, we'll use only the available one
  const hasLandscapes = seededLandscapes.length > 0;
  const hasPortraits = seededPortraits.length > 0;

  // If both are missing, return empty queue
  if (!hasLandscapes && !hasPortraits) {
    return queue;
  }

  // If only one orientation is available, fill queue with that
  if (!hasPortraits) {
    // Only landscapes available - fill queue with landscapes
    for (let i = 0; i < Math.min(100, seededLandscapes.length * 3); i++) {
      queue.push(seededLandscapes[landscapeIdx % seededLandscapes.length]);
      landscapeIdx++;
    }
    return queue;
  }

  if (!hasLandscapes) {
    // Only portraits available - fill queue with portraits
    for (let i = 0; i < Math.min(100, seededPortraits.length * 3); i++) {
      queue.push(seededPortraits[portraitIdx % seededPortraits.length]);
      portraitIdx++;
    }
    return queue;
  }

  // Both orientations available - follow 3:1 pattern
  for (let i = 0; i < 100; i++) {
    // Cycle through pattern
    const requiredOrientation = PATTERN[i % PATTERN.length];

    if (requiredOrientation === "landscape") {
      queue.push(seededLandscapes[landscapeIdx % seededLandscapes.length]);
      landscapeIdx++;
    } else {
      queue.push(seededPortraits[portraitIdx % seededPortraits.length]);
      portraitIdx++;
    }
  }

  return queue;
}

export default function ImageCollage() {
  const [manifest, setManifest] = useState<CollageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotationOffsets, setRotationOffsets] = useState<number[]>([]);

  // For click-to-enlarge
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  // Number of columns based on viewport (responsive)
  const [columnCount, setColumnCount] = useState(4);

  // Fetch manifest on mount
  useEffect(() => {
    async function fetchManifest() {
      try {
        const response = await fetch("/api/collage/manifest");
        const data = await response.json();
        
        if (!response.ok) {
          // API returned an error response
          const errorMsg = data.error || data.message || "Failed to fetch manifest";
          console.error("Manifest API error:", data);
          setError(errorMsg);
          setManifest([]);
          return;
        }
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error("Manifest API returned non-array:", data);
          setError("Invalid manifest format");
          setManifest([]);
          return;
        }
        
        console.log(`Loaded ${data.length} images from manifest`);
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

  // Update column count based on viewport
  useEffect(() => {
    function updateColumnCount() {
      const width = window.innerWidth;
      let newCount = 4;
      if (width < 640) {
        newCount = 1;
      } else if (width < 1024) {
        newCount = 2;
      } else if (width < 1280) {
        newCount = 3;
      }
      
      setColumnCount(newCount);
      // Reset rotation offsets to match new column count
      setRotationOffsets(Array(newCount).fill(0));
    }

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Separate images by orientation
  const { landscapes, portraits } = useMemo(() => {
    const lands: CollageImage[] = [];
    const ports: CollageImage[] = [];

    for (const img of manifest) {
      if (img.orientation === "landscape") {
        lands.push(img);
      } else {
        ports.push(img);
      }
    }

    return { landscapes: lands, portraits: ports };
  }, [manifest]);

  // Build column queues with 3:1 pattern
  const columnQueues = useMemo(() => {
    const queues: CollageImage[][] = [];
    for (let i = 0; i < columnCount; i++) {
      queues.push(buildColumnQueue(landscapes, portraits, i));
    }
    return queues;
  }, [landscapes, portraits, columnCount]);

  // Use ref to always access latest columnQueues in interval callback
  const columnQueuesRef = useRef(columnQueues);
  useEffect(() => {
    columnQueuesRef.current = columnQueues;
  }, [columnQueues]);

  // Sync rotationOffsets with columnQueues length when it changes
  useEffect(() => {
    if (columnQueues.length > 0 && rotationOffsets.length !== columnQueues.length) {
      setRotationOffsets(Array(columnQueues.length).fill(0));
    }
  }, [columnQueues.length, rotationOffsets.length]);

  // Rotate images every 20 seconds
  useEffect(() => {
    if (columnQueues.length === 0) return;

    const id = setInterval(() => {
      setRotationOffsets((prev) => {
        // Always use latest columnQueues from ref to avoid stale closure
        const currentQueues = columnQueuesRef.current;
        if (currentQueues.length === 0) return prev;
        
        // Ensure prev array matches current column count
        const adjustedPrev = prev.length >= currentQueues.length 
          ? prev.slice(0, currentQueues.length)
          : [...prev, ...Array(currentQueues.length - prev.length).fill(0)];
        
        return adjustedPrev.map((offset, idx) => {
          const queue = currentQueues[idx];
          if (!queue || queue.length === 0) return offset;
          // Advance by 1 image, maintaining pattern
          return (offset + 1) % queue.length;
        });
      });
    }, 20000);

    return () => clearInterval(id);
  }, [columnQueues.length]); // Only depend on length to recreate interval when structure changes

  // Get image URL from API
  function getImageUrl(key: string): string {
    return `/api/collage/image?key=${encodeURIComponent(key)}`;
  }

  if (loading) {
    return (
      <section className="mt-10">
        <div className="mx-auto text-center" style={{ maxWidth: 1200 }}>
          <p className="text-ink/subtle">Loading images...</p>
        </div>
      </section>
    );
  }

  if (error || manifest.length === 0) {
    return (
      <section className="mt-10">
        <div className="mx-auto text-center" style={{ maxWidth: 1200 }}>
          <p className="text-ink/subtle">
            {error || "No images available"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-10">
        {/* Outer container centered on the page */}
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              gap: "16px",
            }}
          >
            {Array.from({ length: columnCount }).map((_, colIdx) => {
              const queue = columnQueues[colIdx] || [];
              const offset = rotationOffsets[colIdx] || 0;

              // Get images for this column based on current offset
              // Display enough images to fill the column (typically 8-12 images)
              // Use modulo arithmetic to wrap around without duplicates
              const imagesToShow: CollageImage[] = [];
              const imagesNeeded = 12;
              
              if (queue.length > 0) {
                for (let i = 0; i < imagesNeeded; i++) {
                  const index = (offset + i) % queue.length;
                  imagesToShow.push(queue[index]);
                }
              }

              return (
                <div
                  key={colIdx}
                  style={{ display: "grid", gap: "16px" }}
                >
                  {imagesToShow.map((img, imgIdx) => {
                    const imageUrl = getImageUrl(img.key);
                    const isPortrait = img.orientation === "portrait";
                    // Use stable key based on image identity to prevent unnecessary remounting
                    // This allows React to track images across rotations and preserve DOM state
                    // Handle rare duplicates by appending index
                    const keyCount = imagesToShow.slice(0, imgIdx).filter(i => i.key === img.key).length;
                    const stableKey = keyCount > 0 
                      ? `${colIdx}-${img.key}-${keyCount}` 
                      : `${colIdx}-${img.key}`;
                    
                    return (
                      <button
                        key={stableKey}
                        type="button"
                        onClick={() => setActiveSrc(imageUrl)}
                        className="
                          group relative overflow-hidden rounded-lg
                          transition-transform duration-300
                          hover:-translate-y-1
                          hover:shadow-xl
                        "
                        style={{
                          aspectRatio: isPortrait ? "2/3" : "3/2",
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt=""
                          className="
                            w-full h-full rounded-lg
                            object-cover
                            transition-transform duration-300
                            group-hover:scale-110
                            cursor-pointer
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
        </div>
      </section>

      {/* Click-to-enlarge modal */}
      {activeSrc && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70 backdrop-blur-sm
            px-4
          "
          onClick={() => setActiveSrc(null)}
        >
          <div
            className="
              relative
              max-w-3xl w-full
              max-h-[80vh]
              rounded-2xl
              bg-[--background]
              overflow-hidden
              border border-[--foreground]/20
              shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              pop-in
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center bg-black max-h-[80vh]">
              <img
                src={activeSrc}
                alt=""
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveSrc(null)}
              className="
                absolute top-3 right-3
                rounded-full px-3 py-1
                text-xs font-medium
                bg-black/80 text-white
                hover:bg-black
                transition
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
