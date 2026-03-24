"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ExternalLink, Menu, X, User } from "lucide-react";

interface AdminHeaderProps {
  userEmail: string;
  hasCriticalAlert: boolean;
}

const navLinks = [
  { name: "Dashboard", href: "/admin" },
  { name: "Posts", href: "/admin/posts" },
  { name: "Inbox", href: "/admin/messages" },
  { name: "Activity", href: "/admin/activity" },
  { name: "Security", href: "/admin/security" },
];

export function AdminHeader({ userEmail, hasCriticalAlert }: AdminHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close overlay on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-zinc-800 bg-[#1c2438]">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-lg tracking-tight text-white shrink-0">
            Admin <span className="text-brand-primary">Dashboard</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-all relative font-medium ${
                  pathname === link.href
                    ? "bg-[#f4f4f5] text-[#1c2438]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {link.name}
                {link.name === "Security" && hasCriticalAlert && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all"
            title="View Site"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Email: show on large, icon on medium, hide on mobile */}
          <span className="hidden lg:inline-block text-sm text-zinc-400 truncate max-w-[180px] px-2">
            {userEmail}
          </span>
          <span className="hidden md:inline-flex lg:hidden items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all cursor-default" title={userEmail}>
            <User className="w-4 h-4" />
          </span>

          <form action="/auth/signout" method="post">
            <button className="hidden md:inline-flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2.5 text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200">
          {/* Close button */}
          <div className="flex items-center justify-between p-6">
            <span className="font-bold text-lg tracking-tight">
              Admin <span className="text-brand-primary">Dashboard</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-bold tracking-tight transition-colors relative ${
                  pathname === link.href
                    ? "text-brand-primary"
                    : "text-white hover:text-brand-primary"
                }`}
              >
                {link.name}
                {link.name === "Security" && hasCriticalAlert && (
                  <span className="absolute -top-1 -right-3 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">{userEmail}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsOpen(false)}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-white text-muted-foreground h-10 px-3 border border-white/10 bg-white/5"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Site
              </Link>
              <form action="/auth/signout" method="post" className="flex-1">
                <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-white text-red-400 h-10 px-3 border border-red-500/20 bg-red-500/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
