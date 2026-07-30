// src/components/LiveTracker.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LiveTracker({ intervalMs = 2000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    // 📡 Poll the server-side data by refreshing the router cache
    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  // This component doesn't render anything; it's a pure background engine
  return null;
}