// src/app/dispatcher/map/page.tsx
import React from "react";
import { prisma } from "../../../lib/prisma";
import MapWrapper from "../../../components/MapWrapper"; // Standard import!

export default async function MapDashboardPage() {
  // 1. Fetch active routes, including their driver and deliveries sorted by sequence
  const activeRoutes = await prisma.route.findMany({
    where: {
      isCompleted: false,
    },
    include: {
      driver: true,
      deliveries: {
        orderBy: {
          id: "asc", // Assumes creation order represents the delivery sequence
        },
      },
    },
  });

  // 2. Format the data to pass down to our Map wrapper
  const routesData = activeRoutes.map((route, index) => {
    // Assign a distinct stroke color to each driver's path
    const routeColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
    const strokeColor = routeColors[index % routeColors.length];

    return {
      id: route.id,
      driverName: route.driver.name,
      strokeColor: strokeColor,
      // Map the ordered deliveries for this specific route
      deliveries: route.deliveries.map((delivery) => ({
        id: delivery.id,
        customerName: delivery.customerName,
        address: delivery.address,
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        status: delivery.status,
      })),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Live Fleet Map
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time visual route paths for active dispatches in Addis Ababa.
          </p>
        </div>
      </div>

      {/* 3. Pass the structured routes to the wrapper */}
      <MapWrapper routes={routesData} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {routesData.map((route) => (
          <div 
            key={route.id} 
            className="bg-white p-4 rounded-xl border border-zinc-200 text-sm flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <span 
                className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" 
                style={{ backgroundColor: route.strokeColor }}
              />
              <span className="font-semibold text-zinc-700">{route.driverName}</span>
            </div>
            <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md font-mono">
              {route.deliveries.length} drops
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}