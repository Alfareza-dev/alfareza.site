"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/layout-shell";

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHiddenRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  return (
    <div className="flex flex-col min-h-screen w-full">
      {!isHiddenRoute && <Header />}
      <main className="flex flex-col flex-1 w-full">
        {children}
      </main>
      {!isHiddenRoute && <Footer />}
    </div>
  );
}
