import Hero from "@/components/home/Hero";
import ExperienceStrip from "@/components/home/ExperienceStrip";
import ProjectGrid from "@/components/home/ProjectGrid";
import ImageCollage from "@/components/home/ImageCollage";

export default function Home() {
  return (
    <main>
      <Hero />
      <ExperienceStrip />
      <ProjectGrid />
      <ImageCollage />
    </main>
  );
}
