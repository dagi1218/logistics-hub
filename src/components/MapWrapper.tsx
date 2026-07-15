// src/components/MapWrapper.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200 flex items-center justify-center">
      <span className="text-zinc-400 font-medium text-sm">Querying OSRM road networks...</span>
    </div>
  ),
});

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface Route {
  id: string;
  driverName: string;
  strokeColor: string;
  deliveries: Delivery[];
  roadPath: [number, number][]; // <-- Add this
}

export default function MapWrapper({ routes }: { routes: Route[] }) {
  return <DynamicMap routes={routes} />;
}