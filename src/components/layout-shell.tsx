import Link from "next/link";
import { Github, Instagram, Linkedin } from "lucide-react";

export function Header() {
  return (
    <header className="w-full flex items-center justify-between p-6 max-w-5xl mx-auto border-b border-white/5 bg-transparent z-50">
      <Link href="/" className="font-bold text-xl tracking-tighter text-white flex items-baseline">
        Alfareza<span className="text-cyan-400 font-black">.</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </nav>

      <div className="flex items-center gap-4 text-muted-foreground">
        <Link href="https://github.com/Alfareza-dev" target="_blank" className="hover:text-white transition-colors">
          <Github className="w-5 h-5" />
        </Link>
        <Link href="https://www.instagram.com/alfareza.dev/" target="_blank" className="hover:text-white transition-colors">
          <Instagram className="w-5 h-5" />
        </Link>
        <Link href="https://www.linkedin.com/in/alfareza-dev/" target="_blank" className="hover:text-white transition-colors">
          <Linkedin className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full max-w-5xl mx-auto py-12 px-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Alfareza. All rights reserved.</p>
      <div className="flex items-center gap-6 mt-4 md:mt-0">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <Link href="/auth" className="hover:text-white transition-colors">Admin Login</Link>
      </div>
    </footer>
  );
}
