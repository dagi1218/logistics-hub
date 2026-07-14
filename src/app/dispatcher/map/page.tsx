// src/app/dispatcher/map/page.tsx
import React from "react";
import { prisma } from "../../../lib/prisma";
import MapWrapper from "../../../components/MapWrapper"; // Standard import!

export default async function MapDashboardPage() {
  // 1. Fetch only deliveries for today's active routes
  const activeDeliveries = await prisma.delivery.findMany({
    where: {
      route: {
        isCompleted: false,
      },
    },
    include: {
      route: {
        include: {
          driver: true,
        },
      },
    },
  });

  // 2. Format the data for the map
  const mapLocations = activeDeliveries.map((delivery) => ({
    id: delivery.id,
    customerName: delivery.customerName,
    address: delivery.address,
    latitude: delivery.latitude,
    longitude: delivery.longitude,
    status: delivery.status,
    driverName: delivery.route.driver.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Live Fleet Map
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time geospatial tracking for active routes in Addis Ababa.
          </p>
        </div>
      </div>

      {/* 3. Pass data to our new Client Wrapper */}
      <MapWrapper locations={mapLocations} />
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 text-sm flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></span>
          <span className="text-zinc-600">Delivered</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 text-sm flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm border border-amber-600"></span>
          <span className="text-zinc-600">Pending</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-zinc-200 text-sm flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-600"></span>
          <span className="text-zinc-600">Failed / Missed</span>
        </div>
      </div>
    </div>
  );
}