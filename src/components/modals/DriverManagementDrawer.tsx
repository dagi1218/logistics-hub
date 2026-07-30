// src/components/DriverManagementDrawer.tsx
"use client";

import  { useState, useEffect, useTransition } from "react";
import { assignVehicleToDriver } from "@/app/actions/fleet";
import { DriverData, VehicleData } from "../FleetTable";

interface DrawerProps {
  driver: DriverData | null;
  allVehicles: VehicleData[];
  isOpen: boolean;
  onClose: () => void;
}

export default function DriverManagementDrawer({
  driver,
  allVehicles,
  isOpen,
  onClose,
}: DrawerProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (driver?.vehicle) {
      setSelectedVehicleId(driver.vehicle.id);
    } else {
      setSelectedVehicleId("");
    }
  }, [driver]);

  if (!isOpen || !driver) return null;

  const handleSave = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await assignVehicleToDriver(driver.id, selectedVehicleId || null);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Manage Driver Vehicle</h2>
              <p className="text-xs text-zinc-500">{driver.name} ({driver.email})</p>
            </div>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600">✕</button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Assigned Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs text-zinc-800 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="">-- No Vehicle Assigned --</option>
              {allVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} — {v.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
          >
            {isPending ? "Saving..." : "Save Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}