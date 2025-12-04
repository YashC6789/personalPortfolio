// components/StyledImage.tsx
import Image from "next/image";

type StyledImageProps = {
  src: string;
  alt: string;
};

export default function StyledImage({ src, alt }: StyledImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={600}      // 3:4 portrait-ish, good for iPhone photos
      height={800}
      className="
        w-full h-auto
        rounded-2xl
        object-cover
        border border-[--foreground]/20
        shadow-sm
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
      "
    />
  );
}