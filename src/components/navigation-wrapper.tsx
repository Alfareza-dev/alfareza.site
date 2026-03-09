"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/layout-shell";

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHiddenRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  return (
    <>
      {!isHiddenRoute && <Header />}
      <main className="flex flex-col flex-1 min-h-screen w-full">
        {children}
      </main>
      {!isHiddenRoute && <Footer />}
    </>
  );
}
