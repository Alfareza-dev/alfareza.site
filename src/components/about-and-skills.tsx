import { 
  Code2, 
  Paintbrush, 
  Database, 
  Layout, 
  Terminal, 
  Cpu, 
  Globe, 
  Layers 
} from "lucide-react";

const skills = [
  { name: "HTML", icon: Layout },
  { name: "CSS", icon: Paintbrush },
  { name: "JS", icon: FileCode2 },
  { name: "Next.js", icon: Globe },
  { name: "Tailwind", icon: Layers },
  { name: "Prisma", icon: Database },
  { name: "Git", icon: Terminal },
  { name: "UI Design", icon: Paintbrush }, 
];

// Note: Using Lucide react icons since specific brand icons are not built in.
// In a real app one might use react-icons or si-icons for brand logos.
import { FileCode2 } from "lucide-react";

export function AboutAndSkills() {
  return (
    <section className="mt-24 grid md:grid-cols-2 gap-12 items-start">
      {/* About Me */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Building Skills Through Passion & Practice
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          I am a Grade 11 student majoring in Software Engineering (RPL) with a strong interest in full-stack web development. Beyond programming, I explore photography, videography, drone flying, and automotive to sharpen creativity and precision.
        </p>
      </div>

      {/* Skills 4x2 Grid */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <div 
              key={skill.name} 
              className="flex flex-col items-center justify-center gap-2 p-4 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-primary/30 transition-all duration-300 group"
            >
              <skill.icon className="w-6 h-6 text-muted-foreground group-hover:text-brand-primary transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
