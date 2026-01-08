// components/ImageCollage.tsx
"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";

interface CollageImage {
  key: string;
  orientation: "landscape" | "portrait";
  contentType?: string;
  size?: number;
  updated?: string;
}

/**
 * Generates a random pattern for a column with 3 landscape and 1 portrait
 * The portrait position is randomized based on seed
 */
function generateRandomPattern(seed: number): ("landscape" | "portrait")[] {
  const pattern: ("landscape" | "portrait")[] = ["landscape", "landscape", "landscape", "portrait"];
  
  // Use seed to deterministically shuffle the portrait position
  let random = seed;
  random = (random * 9301 + 49297) % 233280;
  const portraitPosition = Math.floor((random / 233280) * 4);
  
  // Move portrait to random position
  const portrait = pattern.splice(3, 1)[0]; // Remove portrait from position 3
  pattern.splice(portraitPosition, 0, portrait); // Insert at random position
  
  return pattern;
}

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

  // For click-to-enlarge
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  // Fixed to 4 columns as per requirements
  const columnCount = 4;
  const imagesPerColumn = 4; // 3 landscape + 1 portrait

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

  // Build a global shuffled pool of images for no-duplicate selection
  // Note: Images from landscape/ folder are landscape, images from vertical/ folder are portrait
  // This is determined by the manifest API based on folder structure
  const shuffledLandscapes = useMemo(() => {
    return seededShuffle(landscapes, 12345);
  }, [landscapes]);

  const shuffledPortraits = useMemo(() => {
    return seededShuffle(portraits, 67890);
  }, [portraits]);


  // Track indices across rotations to progress through images
  const landscapeIdxRef = useRef(0);
  const portraitIdxRef = useRef(0);
  const rotationCountRef = useRef(0); // Track rotation count for pattern variety

  // Function to select unique images for all columns (no duplicates across columns)
  const selectUniqueImages = useCallback((): CollageImage[][] => {
    const columns: CollageImage[][] = [];
    const usedKeys = new Set<string>();
    let landscapeIdx = landscapeIdxRef.current;
    let portraitIdx = portraitIdxRef.current;

    for (let col = 0; col < columnCount; col++) {
      const column: CollageImage[] = [];
      
      // Generate a random pattern for this column (portrait can be in any position)
      // Use column index + rotation count as seed for variety across columns and rotations
      // Each column gets a different pattern, and patterns change with each rotation
      const pattern = generateRandomPattern(col * 1000 + rotationCountRef.current * 100);
      
      // Each column needs 3 landscape + 1 portrait in random order
      for (let i = 0; i < imagesPerColumn; i++) {
        const requiredOrientation = pattern[i];
        let selected: CollageImage | null = null;
        let attempts = 0;
        const maxAttempts = Math.max(shuffledLandscapes.length, shuffledPortraits.length) * 2;

        while (!selected && attempts < maxAttempts) {
          if (requiredOrientation === "landscape") {
            if (shuffledLandscapes.length === 0) break;
            const candidate = shuffledLandscapes[landscapeIdx % shuffledLandscapes.length];
            landscapeIdx++;
            
            if (!usedKeys.has(candidate.key)) {
              selected = candidate;
              usedKeys.add(candidate.key);
            }
          } else {
            if (shuffledPortraits.length === 0) break;
            const candidate = shuffledPortraits[portraitIdx % shuffledPortraits.length];
            portraitIdx++;
            
            if (!usedKeys.has(candidate.key)) {
              selected = candidate;
              usedKeys.add(candidate.key);
            }
          }
          attempts++;
        }

        // Fallback: if we can't find a unique image, use any available
        if (!selected) {
          if (requiredOrientation === "landscape" && shuffledLandscapes.length > 0) {
            selected = shuffledLandscapes[landscapeIdx % shuffledLandscapes.length];
            landscapeIdx++;
          } else if (requiredOrientation === "portrait" && shuffledPortraits.length > 0) {
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

    // Update refs for next rotation
    landscapeIdxRef.current = landscapeIdx;
    portraitIdxRef.current = portraitIdx;
    rotationCountRef.current += 1; // Increment rotation counter for pattern variety

    return columns;
  }, [shuffledLandscapes, shuffledPortraits, columnCount, imagesPerColumn]);

  // Current column images state
  const [columnImages, setColumnImages] = useState<CollageImage[][]>([]);

  // Initialize and rotate images
  useEffect(() => {
    if (shuffledLandscapes.length === 0 && shuffledPortraits.length === 0) {
      return;
    }

    // Initial selection
    const initialColumns = selectUniqueImages();
    setColumnImages(initialColumns);

    // Rotate every 30 seconds
    const id = setInterval(() => {
      const newColumns = selectUniqueImages();
      setColumnImages(newColumns);
    }, 30000); // 30 seconds

    return () => clearInterval(id);
  }, [selectUniqueImages, shuffledLandscapes.length, shuffledPortraits.length]);

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
              const imagesToShow = columnImages[colIdx] || [];

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
