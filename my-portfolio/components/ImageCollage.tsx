// components/ImageCollage.tsx
"use client";

import { useEffect, useState } from "react";

// 👇 Put your actual filenames here
const LANDSCAPES = [
  "me/landscape/land1.jpg",
  "me/landscape/land2.jpg",
  "me/landscape/land3.jpg",
  "me/landscape/land4.jpg",
  "me/landscape/land5.jpg",
  "me/landscape/land6.jpg",
  "me/landscape/land7.jpg",
  "me/landscape/land8.jpg",
  "me/landscape/land9.jpg",
  "me/landscape/land10.jpg",
  "me/landscape/land11.jpg",
];

const VERTICALS = [
  "me/vertical/vert1.jpg",
  "me/vertical/vert2.jpg",
  "me/vertical/vert3.jpg",
  "me/vertical/vert4.jpg",
  "me/vertical/vert5.jpg",
  "me/vertical/vert6.jpg",
  "me/vertical/vert7.jpg",
  "me/vertical/vert8.jpg",
  "me/vertical/vert9.jpg",
  "me/vertical/vert10.jpg",
  "me/vertical/vert11.jpg",
  "me/vertical/vert12.jpg",
  "me/vertical/vert13.jpg",
];

// 4 columns
const COLUMN_INDICES = [0, 1, 2, 3];

export default function ImageCollage() {
  // starting offsets for rotation
  const [landStart, setLandStart] = useState(0);
  const [vertStart, setVertStart] = useState(0);

  // for click-to-enlarge
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  // rotate images every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setLandStart((prev) =>
        LANDSCAPES.length > 0 ? (prev + 1) % LANDSCAPES.length : prev
      );
      setVertStart((prev) =>
        VERTICALS.length > 0 ? (prev + 2) % VERTICALS.length : prev
      );
    }, 20000);

    return () => clearInterval(id);
  }, []);

  return (
    <>
      <section className="mt-10">
        {/* Outer container centered on the page */}
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {COLUMN_INDICES.map((colIdx) => {
              // pick 1 landscape + 2 verticals for this column
              const landscapeSrc =
                LANDSCAPES.length > 0
                  ? LANDSCAPES[(landStart + colIdx) % LANDSCAPES.length]
                  : null;

              const verticalSrc1 =
                VERTICALS.length > 0
                  ? VERTICALS[(vertStart + colIdx * 2) % VERTICALS.length]
                  : null;

              const verticalSrc2 =
                VERTICALS.length > 0
                  ? VERTICALS[
                      (vertStart + colIdx * 2 + 1) % VERTICALS.length
                    ]
                  : null;

              // order inside the column: vertical – landscape – vertical
              const columnImages = [
                verticalSrc1,
                landscapeSrc,
                verticalSrc2,
              ].filter(Boolean) as string[];

              return (
                <div
                  key={colIdx}
                  style={{ display: "grid", gap: "16px" }}
                >
                  {columnImages.map((src) => (
                    <button
                    key={src}
                    type="button"
                    onClick={() => setActiveSrc(src)}
                    className="
                      group relative overflow-hidden rounded-lg
                      transition-transform duration-300
                      hover:-translate-y-1
                      hover:shadow-xl
                    "
                  >
                    <img
                      src={src}
                      alt=""
                      className="
                        h-auto max-w-full rounded-lg
                        transition-transform duration-300
                        group-hover:scale-110
                        cursor-pointer
                      "
                    />
                  </button>
                  ))}
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