// src/components/MapWrapper.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

// We execute the dynamic import HERE, safely inside a Client Component boundary
const DynamicMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200 flex items-center justify-center">
      <span className="text-zinc-400 font-medium text-sm">Loading map engine...</span>
    </div>
  ),
});

// Re-declare the interface so TypeScript stays happy
interface Location {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  driverName: string;
}

export default function MapWrapper({ locations }: { locations: Location[] }) {
  return <DynamicMap locations={locations} />;
}