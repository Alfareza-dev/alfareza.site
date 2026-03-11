"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ intervalSeconds = 30 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, intervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [router, intervalSeconds]);

  return null;
}
