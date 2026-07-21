"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { optimizeRoute } from "@/app/actions/actions";

interface OptimizeRouteButtonProps {
  routeId: string;
}

export default function OptimizeRouteButton({ routeId }: OptimizeRouteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOptimize = () => {
    startTransition(async () => {
      await optimizeRoute(routeId);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleOptimize}
      disabled={isPending}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
        isPending
          ? "border-zinc-300 bg-zinc-100 text-zinc-500"
          : "border-sky-500 bg-sky-500 text-white hover:bg-sky-600"
      }`}
    >
      {isPending ? "Optimizing…" : "Optimize Route"}
    </button>
  );
}
