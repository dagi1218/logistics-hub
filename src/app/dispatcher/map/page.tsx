// src/app/dispatcher/map/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import MapWrapper from "@/components/map/MapWrapper";
import OptimizeRouteButton from "@/components/map/OptimizeRouteButton";
import UnassignedDeliveriesSidebar from "../../../components/modals/UnassignedDeliveriesSidebar";
import { getRoadPath } from "@/lib/routing";
import LiveTracker from "@/components/map/LiveTracker";

export default async function MapDashboardPage() {
  // 1. Fetch active routes
  const activeRoutes = await prisma.route.findMany({
    where: { isCompleted: false },
    include: {
      driver: true,
      deliveries: { orderBy: { sequenceOrder: "asc" } },
    },
  });

  // 2. Fetch unassigned pending deliveries
  const unassignedDeliveries = await prisma.delivery.findMany({
    where: {
      routeId: null,
      status: "PENDING",
    },
    select: {
      id: true,
      customerName: true,
      address: true,
    },
  });

  // 3. Fetch all active driver accounts
  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // 4. Fetch road paths concurrently
  const routesPromises = activeRoutes.map(async (route, index) => {
    const routeColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
    const strokeColor = routeColors[index % routeColors.length];

    const deliveriesData = route.deliveries.map((delivery) => ({
      id: delivery.id,
      customerName: delivery.customerName,
      address: delivery.address,
      latitude: delivery.latitude,
      longitude: delivery.longitude,
      status: delivery.status,
    }));

    const roadPath = await getRoadPath(deliveriesData);

    return {
      id: route.id,
      driverName: route.driver.name,
      driverId: route.driverId,
      driverLocation: [route.driver.currentLat ?? 0, route.driver.currentLng ?? 0] as [number, number],
      strokeColor,
      deliveries: deliveriesData,
      roadPath,
    };
  });

  const routesData = await Promise.all(routesPromises);

  return (
    <div className="space-y-6">
      <LiveTracker intervalMs={2000} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Live Fleet Map</h1>
          <p className="text-sm text-zinc-500">
            Real-world road-snapped coordinates via OpenStreetMap for Addis Ababa.
          </p>
        </div>

        {/* Sidebar Component placed in page header */}
        <UnassignedDeliveriesSidebar
          unassignedDeliveries={unassignedDeliveries}
          availableDrivers={drivers}
        />
      </div>

      <MapWrapper routes={routesData} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {routesData.map((route) => (
          <div
            key={route.id}
            className="bg-white p-4 rounded-xl border border-zinc-200 text-sm shadow-xs"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: route.strokeColor }}
                />
                <div>
                  <p className="font-semibold text-zinc-700">{route.driverName}</p>
                  <p className="text-xs text-zinc-500">{route.deliveries.length} drops</p>
                </div>
              </div>
              <OptimizeRouteButton routeId={route.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}