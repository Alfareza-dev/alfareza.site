import { HeroSection } from "@/components/hero-section";
import { AboutAndSkills } from "@/components/about-and-skills";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 md:pb-32 pt-16 md:pt-0">
      <HeroSection />
      
      {/* About & Skills */}
      <div id="about">
        <AboutAndSkills />
      </div>
    </div>
  );
}
