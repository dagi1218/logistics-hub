
"use client";

import  { useState, useTransition } from "react";
import { assignDeliveriesToDriver } from "@/app/actions/dispatcher";

interface DeliveryItem {
  id: string;
  customerName: string;
  address: string;
}

interface DriverItem {
  id: string;
  name: string;
}

interface SidebarProps {
  unassignedDeliveries: DeliveryItem[];
  availableDrivers: DriverItem[];
}

export default function UnassignedDeliveriesSidebar({
  unassignedDeliveries,
  availableDrivers,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedDeliveryIds.length === unassignedDeliveries.length) {
      setSelectedDeliveryIds([]);
    } else {
      setSelectedDeliveryIds(unassignedDeliveries.map((d) => d.id));
    }
  };

  const toggleDelivery = (id: string) => {
    setSelectedDeliveryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await assignDeliveriesToDriver(selectedDriverId, selectedDeliveryIds);
      if (result.success) {
        setSelectedDeliveryIds([]);
        setSelectedDriverId("");
      } else if (result.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <div className="relative">
      {/* Drawer Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50"
        >
          <span>📦 Unassigned Drops ({unassignedDeliveries.length})</span>
        </button>
      )}

      {/* Slide-over Drawer */}
      {isOpen && (
        <aside className="w-80 raaaounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Unassigned Drops</h2>
              <p className="text-[11px] text-zinc-500">
                {unassignedDeliveries.length} orders pending route assignment
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          </div>

          {errorMsg && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-center text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {unassignedDeliveries.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No pending deliveries. All packages are assigned!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Actions Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <button
                  onClick={toggleSelectAll}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  {selectedDeliveryIds.length === unassignedDeliveries.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-[11px] font-bold text-zinc-500">
                  {selectedDeliveryIds.length} selected
                </span>
              </div>

              {/* Delivery Items List */}
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {unassignedDeliveries.map((delivery) => {
                  const isChecked = selectedDeliveryIds.includes(delivery.id);
                  return (
                    <div
                      key={delivery.id}
                      onClick={() => toggleDelivery(delivery.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                        isChecked
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div click
                          className="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-800">{delivery.customerName}</p>
                          <p className="line-clamp-1 text-[11px] text-zinc-500">{delivery.address}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver Selector & Dispatch Controls */}
              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Assign To Driver
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a driver...</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAssign}
                  disabled={
                    isPending || selectedDeliveryIds.length === 0 || !selectedDriverId
                  }
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-40"
                >
                  {isPending ? "Dispatching..." : `Assign ${selectedDeliveryIds.length} Drop(s)`}
                </button>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}