"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Instagram, Linkedin, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/Alfareza-dev" },
    { icon: Instagram, href: "https://www.instagram.com/alfareza.dev/" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/alfareza-dev/" },
  ];

  return (
    <header className="w-full sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-40 border-b border-white/5">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-6">
        <Link href="/" className="font-bold text-xl tracking-tighter text-white flex items-baseline">
          Alfareza<span className="text-cyan-400 font-black">.</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Socials */}
        <div className="hidden md:flex items-center gap-4 text-muted-foreground">
          {socialLinks.map((social, i) => (
            <Link key={i} href={social.href} target="_blank" className="hover:text-white transition-colors">
              <social.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 h-screen w-full bg-[#0a0a0a]/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center md:hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Mobile Links */}
              <nav className="flex flex-col items-center gap-8 mb-12">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsOpen(false)}
                    className="text-3xl md:text-5xl font-bold tracking-tight text-white hover:text-purple-400 transition-colors font-sans"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              
              {/* Mobile Socials */}
              <div className="flex items-center gap-8 text-muted-foreground">
                {socialLinks.map((social, i) => (
                  <Link 
                    key={i} 
                    href={social.href} 
                    target="_blank" 
                    onClick={() => setIsOpen(false)}
                    className="hover:text-white transition-colors"
                  >
                    <social.icon className="w-8 h-8" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function Footer() {
  const pathname = usePathname();
  const hideAdminLink = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  return (
    <footer className="w-full max-w-5xl mx-auto pt-24 pb-0 md:py-20 mt-8 md:mt-24 px-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Alfareza. All rights reserved.</p>
      <div className="flex items-center gap-6 mt-6 md:mt-0 font-sans">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        {!hideAdminLink && (
          <Link href="/auth" className="hover:text-white transition-colors">Admin Login</Link>
        )}
      </div>
    </footer>
  );
}
