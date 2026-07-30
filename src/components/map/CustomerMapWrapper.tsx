"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./CustomerTrackMap"), {
     ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200 flex items-center justify-center">
      <span className="text-zinc-400 font-medium text-sm">Querying OSRM road networks...</span>
    </div>
  ),
});

interface CustomerTrackMapProps {
  customerLat: number;
  customerLng: number;
  driverLat: number | null;
  driverLng: number | null;
  customerName: string;
  roadPath: any;
}

export default function CustomerMapWrapper({
  customerLat,
  customerLng,
  driverLat,
  driverLng,
  customerName,
  roadPath,
}: CustomerTrackMapProps) {
  return (
    <DynamicMap
      customerLat={customerLat}
      customerLng={customerLng}
      driverLat={driverLat}
      driverLng={driverLng}
      customerName={customerName}
      roadPath={roadPath}
    />
  );
}
