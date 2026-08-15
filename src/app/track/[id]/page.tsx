// src/app/track/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CustomerTrackMap from "@/components/map/CustomerMapWrapper";
import LiveTracker from "@/components/map/LiveTracker";
import { getRoadPath } from "@/lib/routing";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerTrackingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const deliveryId = resolvedParams.id;

  // 1. Fetch the delivery, including the route details and driver coordinates
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      route: {
        include: {
          driver: true,
        },
      },
    },
  });

  if (!delivery) {
    notFound(); // Triggers Next.js default 404 page if delivery doesn't exist
  }

  const driver = delivery.route?.driver;
  const isEnRoute = delivery.status === "PENDING" && delivery.route && !delivery.route.isCompleted;
  const roadPath = isEnRoute && driver?.currentLat != null && driver?.currentLng != null
    ? await getRoadPath([
        { latitude: driver.currentLat, longitude: driver.currentLng },
        { latitude: delivery.latitude, longitude: delivery.longitude },
      ])
    : [];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between max-w-md mx-auto shadow-xl border-x border-zinc-200">
      
      {/* 📡 Live Background Refresher (only poll if driver is actually driving) */}
      {isEnRoute && <LiveTracker intervalMs={2500} />}

      {/* Header */}
      <header className="bg-white p-6 border-b border-zinc-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Logistics Hub
          </span>
          <span className={`h-2.5 w-2.5 rounded-full ${isEnRoute ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Track Your Delivery</h1>
        <p className="text-xs text-zinc-500 font-mono">Order Ref: {delivery.id.slice(0, 8).toUpperCase()}</p>
      </header>

      {/* Main Panel */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Progress Tracker UI */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Delivery Status</h2>
          
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${
              delivery.status === "DELIVERED" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
            }`}>
              {delivery.status === "DELIVERED" ? "🎉" : "🚚"}
            </div>
            <div>
              <p className="font-extrabold text-zinc-950 text-base">
                {delivery.status === "DELIVERED" ? "Delivered!" : "Out for Delivery"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {delivery.status === "DELIVERED" 
                  ? "Your courier arrived safely." 
                  : `Assigned to Courier: ${driver?.name || "Pending Dispatch"}`}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Map Module */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Real-time Radar</h3>
            {isEnRoute && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md animate-pulse">
                LIVE GPS ACTIVE
              </span>
            )}
          </div>

          <CustomerTrackMap
            customerLat={delivery.latitude}
            customerLng={delivery.longitude}
            driverId={isEnRoute ? driver?.id : null}
            driverLat={isEnRoute ? driver?.currentLat ?? null : null}
            driverLng={isEnRoute ? driver?.currentLng ?? null : null}
            customerName={delivery.customerName}
            roadPath={roadPath}
          />
        </div>

        {/* Address and Info block */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Destination</h3>
          <p className="text-sm font-semibold text-zinc-800">{delivery.customerName}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{delivery.address}</p>
        </div>
      </main>

      {/* Clean Mobile-First Footer */}
      <footer className="p-6 bg-zinc-900 text-zinc-500 text-center text-[10px] tracking-wider rounded-t-3xl">
        POWERED BY NEXT.JS 15 & PRISMA
      </footer>
    </div>
  );
}