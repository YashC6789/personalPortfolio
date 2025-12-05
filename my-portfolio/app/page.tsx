import ProjectGrid from "@/components/ProjectGrid/ProjectGrid";
import BioBox from "@/components/BioBox";
import Image from "next/image";
import ImageCollage from "@/components/ImageCollage";

export default function Home() {
  return (
        <div>
            <main>
                <section>
                    <h1 className="text-center text-7xl font-bold text-brand">
                        Yashkaran Chauhan
                    </h1>
                </section>
                <section className="mt-12 flex justify-center">
                    <BioBox />
                </section>
                <section className="mt-20">
                    <ProjectGrid />
                    <ImageCollage />
                </section>
            </main>
        </div>
  );
}
