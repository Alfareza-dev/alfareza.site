"use client";

import { motion } from "framer-motion";
import { CyanButton } from "@/components/cyan-button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-fit md:min-h-screen px-4 pb-0 md:pb-20 overflow-hidden pt-0 md:pt-16 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center z-10 space-y-6"
      >
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-teal-200/80 backdrop-blur-md mb-4">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
          Available for new opportunities
        </div>
        
        <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 flex items-center justify-center">
          Hi, I'm Alfareza
          <motion.span 
            animate={{ opacity: [1, 0] }} 
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-[4px] md:w-[8px] h-[30px] md:h-[70px] bg-teal-400 ml-2"
          />
        </h1>
        
        <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground mt-4 leading-relaxed">
          A passionate Software Engineering student who enjoys building modern web applications, experimenting with clean UI design, and continuously improving technical skills through real projects.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <Link href="/portfolio">
            <CyanButton>
              View Portfolio
            </CyanButton>
          </Link>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 px-8 py-2 backdrop-blur-md">
            Contact Me
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
