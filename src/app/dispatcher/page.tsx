// src/app/dispatcher/page.tsx
import React from "react";
// Import the shared Prisma client instance we locked down earlier
import { prisma } from "../../lib/prisma"; 
import { DeliveryStatus, Role } from "../../../prisma/generated/client";

export default async function DispatcherDashboardRoot() {
  console.log("🖥️ Server Component executing directly on the server backend...");

  // 1. Run database queries concurrently using Promise.all to prevent waterfalling
  const [totalDrivers, pendingDeliveries, totalDeliveriesToday] = await Promise.all([
    // Count only users who are registered as drivers
    prisma.user.count({
      where: { role: Role.DRIVER },
    }),
    // Count packages that are currently waiting to be delivered
    prisma.delivery.count({
      where: { status: DeliveryStatus.PENDING },
    }),
    // Count all deliveries tied to routes active today
    prisma.delivery.count(),
  ]);

  // 2. Fetch completed deliveries to calculate a real-time success rate
  const successfulDeliveries = await prisma.delivery.count({
    where: { status: DeliveryStatus.DELIVERED },
  });

  // Prevent division by zero if the database is wiped or empty
  const successRate = totalDeliveriesToday > 0 
    ? Math.round((successfulDeliveries / totalDeliveriesToday) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Control Center Overview
        </h1>
        <p className="text-sm text-zinc-500">
          Real-time server-side coordination and performance metrics for the Addis Ababa fleet.
        </p>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Fleet Card */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between h-36">
          <span className="text-sm font-medium text-zinc-400">Active Fleet</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-800">{totalDrivers}</span>
            <span className="text-xs text-zinc-500 font-medium">Registered Drivers</span>
          </div>
        </div>

        {/* Pending Shipments Card */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between h-36">
          <span className="text-sm font-medium text-zinc-400">Pending Shipments</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-800">{pendingDeliveries}</span>
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-sm">
              Awaiting Dropoff
            </span>
          </div>
        </div>

        {/* Delivery Success Rate Card */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between h-36">
          <span className="text-sm font-medium text-zinc-400">Delivery Success Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-800">{successRate}%</span>
            <span className="text-xs text-zinc-500 font-medium">
              ({successfulDeliveries}/{totalDeliveriesToday} dropped)
            </span>
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-6 text-sm flex items-center justify-between border border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 animate-pulse">●</span>
          <p>
            <strong>Zero-Client Fetching Active:</strong> This layout layout page used 0 bytes of client-side JavaScript to query your database.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500">Render Time: Safe on Server</span>
      </div>
    </div>
  );
}