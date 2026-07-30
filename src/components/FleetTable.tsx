// src/components/FleetTable.tsx
"use client";

import React, { useState } from "react";
import DriverManagementDrawer from "./modals/DriverManagementDrawer";

export interface VehicleData {
  id: string;
  licensePlate: string;
  model: string;
  driverId: string;
}

export interface DriverData {
  id: string;
  name: string;
  email: string;
  role: "DISPATCHER" | "DRIVER";
  vehicle: VehicleData | null;
  routes: { isCompleted: boolean }[];
}

interface FleetTableProps {
  drivers: DriverData[];
  allVehicles: VehicleData[];
}

export default function FleetTable({ drivers, allVehicles }: FleetTableProps) {
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getDriverStatus = (driver: DriverData) => {
    const hasActiveRoute = driver.routes.some((r) => !r.isCompleted);
    if (hasActiveRoute) return { label: "ON ROUTE", color: "bg-blue-50 text-blue-700 border-blue-200" };
    if (driver.vehicle) return { label: "AVAILABLE", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return { label: "NO VEHICLE", color: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned Vehicle</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {drivers.map((driver) => {
              const status = getDriverStatus(driver);
              return (
                <tr key={driver.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {driver.name}
                    <span className="block text-[11px] font-normal text-zinc-400">{driver.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {driver.vehicle ? (
                      `${driver.vehicle.licensePlate} (${driver.vehicle.model})`
                    ) : (
                      <span className="text-zinc-400 font-normal">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedDriver(driver);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DriverManagementDrawer
        driver={selectedDriver}
        allVehicles={allVehicles}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}