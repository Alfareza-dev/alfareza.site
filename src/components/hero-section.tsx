"use client";

import { motion } from "framer-motion";
import { CyanButton } from "@/components/cyan-button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[85dvh] sm:min-h-[100dvh] px-4 pt-16 pb-16 md:py-20 overflow-hidden font-sans">

      {/* Hero Text Content — z-10, always above mountain */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center space-y-4"
      >
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-zinc-300/80 backdrop-blur-md mb-2">
          <span className="flex h-2 w-2 rounded-full bg-zinc-400 mr-2 animate-pulse"></span>
          Available for new opportunities
        </div>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 flex items-center justify-center">
          Hi, I&apos;m Alfareza
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-[4px] md:w-[8px] h-[30px] md:h-[70px] bg-zinc-400 ml-2"
          />
        </h1>

        <p className="max-w-[700px] text-lg md:text-xl text-zinc-400 mt-2 leading-relaxed">
          A passionate Software Engineering student who enjoys building modern web applications, experimenting with clean UI design, and continuously improving technical skills through real projects.
        </p>

        <div className="flex items-center gap-4 mt-6">
          <Link href="/portfolio">
            <CyanButton>
              View Portfolio
            </CyanButton>
          </Link>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-zinc-700/60 bg-white/5 hover:bg-white/10 text-zinc-300 h-10 px-8 py-2 backdrop-blur-md">
            Contact Me
          </Link>
        </div>
      </motion.div>

      {/* Mountain Background — LAST in DOM, absolutely grounded to viewport bottom, edge-to-edge */}
      <div className="absolute inset-x-0 -bottom-10 sm:bottom-0 z-0 h-[320px] sm:h-[55vh] md:h-[65vh] pointer-events-none overflow-hidden translate-y-[-80px] sm:translate-y-0">
        <Image
          src="/mountain-bg.webp"
          alt="Mountain Silhouette Background"
          fill
          sizes="100vw"
          priority={true}
          fetchPriority="high"
          className="object-cover object-bottom opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
        />
        {/* Top fade: mountain blends into the Navy background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2438] via-[#1c2438]/40 to-transparent" />
      </div>
    </section>
  );
}
