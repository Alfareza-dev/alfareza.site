"use client";

import { useEffect, useState, ReactNode } from "react";

export function ClientMountedWrapper({ children, skeleton }: { children: ReactNode, skeleton?: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{skeleton || null}</>;
  }

  return <>{children}</>;
}
