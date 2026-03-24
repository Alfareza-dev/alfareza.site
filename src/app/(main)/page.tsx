import { HeroSection } from "@/components/hero-section";
import { AboutAndSkills } from "@/components/about-and-skills";

export default function Home() {
  return (
    <>
      {/* Hero spans full viewport width — no max-w constraint */}
      <HeroSection />
      
      {/* About & Skills in constrained container */}
      <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 md:pb-32 pt-8">
        <div id="about">
          <AboutAndSkills />
        </div>
      </div>
    </>
  );
}
