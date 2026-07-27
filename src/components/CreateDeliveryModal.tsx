

"use client";

import React, { useState } from "react";
import { createDelivery } from "@/app/actions/dispatcher";

export default function CreateDeliveryModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
      >
        + New Delivery
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Create New Delivery</h2>
            
            <form action={async (formData) => {
              await createDelivery(formData);
              setIsOpen(false);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Customer Name</label>
                <input required name="customerName" type="text" className="w-full px-3 py-2 border rounded-xl text-sm border-zinc-300 focus:outline-blue-500 text-zinc-900" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Address (Addis Ababa)</label>
                <input required name="address" type="text" className="w-full px-3 py-2 border rounded-xl text-sm border-zinc-300 focus:outline-blue-500 text-zinc-900" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Latitude</label>
                  <input required name="latitude" type="number" step="any" defaultValue="9.0100" className="w-full px-3 py-2 border rounded-xl text-sm border-zinc-300 text-zinc-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Longitude</label>
                  <input required name="longitude" type="number" step="any" defaultValue="38.7610" className="w-full px-3 py-2 border rounded-xl text-sm border-zinc-300 text-zinc-900" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700">Save Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
