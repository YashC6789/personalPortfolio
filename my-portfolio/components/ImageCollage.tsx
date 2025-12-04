// components/ImageCollage.tsx
export default function ImageCollage() {
    return (
      <section className="mt-10">
        {/* Outer container centered on the page */}
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <div
            // Use inline grid styles so we bypass Tailwind for the layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {/* Column 1 */}
            <div style={{ display: "grid", gap: "16px" }}>
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo1.jpeg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo2.jpeg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo3.jpeg"
                alt=""
              />
            </div>
  
            {/* Column 2 */}
            <div style={{ display: "grid", gap: "16px" }}>
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo.JPG"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo4.jpeg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo6.jpg"
                alt=""
              />
            </div>
  
            {/* Column 3 */}
            <div style={{ display: "grid", gap: "16px" }}>
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo7.jpg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo9.jpg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo8.jpg"
                alt=""
              />
            </div>
  
            {/* Column 4 */}
            <div style={{ display: "grid", gap: "16px" }}>
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo10.jpg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo11.jpg"
                alt=""
              />
              <img
                className="h-auto max-w-full rounded-lg"
                src="me/photo12.jpg"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
    );
  }