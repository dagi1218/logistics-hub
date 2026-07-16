// src/app/dispatcher/fleet/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function FleetPage() {
  // 1. Fetch all Drivers, including their nested Vehicle and Routes
  const drivers = await prisma.user.findMany({
    where: {
      role: "DRIVER", // Assuming "DRIVER" is your Enum role value
    },
    include: {
      vehicle: true,
      routes: {
        where: { isCompleted: false }, // Only pull active routes to determine current status
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-widest">
          <span>Dispatcher Console</span>
          <span>•</span>
          <span>Asset Management</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
          Fleet Registry
        </h1>
        <p className="text-zinc-400 text-sm">
          Monitor your active personnel, vehicle statuses, and real-time telemetry markers.
        </p>
      </div>

      {/* Grid Dashboard */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => {
          // 2. Compute dynamic status
          const hasActiveRoute = driver.routes.length > 0;
          const hasCoordinates = driver.currentLat !== null && driver.currentLng !== null;
          
          let statusLabel = "Offline";
          let statusColor = "bg-zinc-600 text-zinc-400 border-zinc-700";
          let indicatorColor = "bg-zinc-500";

          if (hasActiveRoute) {
            statusLabel = "Active / En Route";
            statusColor = "bg-emerald-950/40 text-emerald-400 border-emerald-800/50";
            indicatorColor = "bg-emerald-500 animate-pulse";
          } else if (hasCoordinates) {
            statusLabel = "Idle / Available";
            statusColor = "bg-amber-950/40 text-amber-400 border-amber-800/50";
            indicatorColor = "bg-amber-500";
          }

          return (
            <div 
              key={driver.id} 
              className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-750 transition-colors shadow-lg"
            >
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-100">{driver.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{driver.email}</p>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                    <span className={`h-2 w-2 rounded-full ${indicatorColor}`} />
                    {statusLabel}
                  </span>
                </div>

                <hr className="border-zinc-850" />

                {/* Vehicle Section */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Vehicle Details
                  </h4>
                  {driver.vehicle ? (
                    <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-850 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-zinc-300">
                          {driver.vehicle.model || "Standard Van"}
                        </p>
                        <p className="text-zinc-500 text-[10px] uppercase">
                          {"Delivery Truck"}
                        </p>
                      </div>
                      <span className="font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] border border-zinc-700">
                        {driver.vehicle.licensePlate|| "N/A"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">No assigned vehicle</p>
                  )}
                </div>

                {/* Telemetry Section */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Last Known Telemetry
                  </h4>
                  {hasCoordinates ? (
                    <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-850 space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-500">LAT:</span>
                        <span className="text-zinc-300">{driver.currentLat?.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-500">LNG:</span>
                        <span className="text-zinc-300">{driver.currentLng?.toFixed(6)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">No telemetry recorded</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-zinc-850 flex gap-3">
                <Link 
                  href={`/dispatcher/map`}
                  className="flex-1 text-center py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-bold rounded-xl transition-colors border border-zinc-700"
                >
                  View on Map
                </Link>
                <Link 
                  href={`/driver/${driver.id}`}
                  target="_blank"
                  className="flex-1 text-center py-2 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-900/20"
                >
                  Simulation Portal
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}