"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { optimizeRoute } from "@/app/actions/routeActions";

interface OptimizeRouteButtonProps {
  routeId: string;
}

export default function OptimizeRouteButton({ routeId }: OptimizeRouteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [metrics, setMetrics] = useState<{ distanceKm: number; durationMins: number } | null>(null);
  const router = useRouter();

  const handleOptimize = () => {
    startTransition(async () => {
      const res = await optimizeRoute(routeId);
      if (res.success && res.distanceKm !== undefined && res.durationMins !== undefined) {
        setMetrics({ distanceKm: res.distanceKm, durationMins: res.durationMins });
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleOptimize}
        disabled={isPending}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs ${
          isPending
            ? "border-amber-300 bg-amber-50 text-amber-700 cursor-wait animate-pulse"
            : "border-sky-500 bg-sky-500 text-white hover:bg-sky-600 active:scale-95"
        }`}
      >
        {isPending ? "⚡ Solving TSP…" : "Optimize Route"}
      </button>

      {metrics && !isPending && (
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          ✨ ~{metrics.distanceKm} km ({metrics.durationMins} mins)
        </span>
      )}
    </div>
  );
}

