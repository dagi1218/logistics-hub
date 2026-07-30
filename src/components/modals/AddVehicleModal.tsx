'use client';

import { useState, useTransition } from 'react';
import { createVehicle } from '@/app/actions/vehicle';

export function AddVehicleModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to close and reset modal error state
  const handleClose = () => {
    setErrorMsg(null);
    setIsModalOpen(false);
  };

  async function handleSubmit(formData: FormData) {
    setErrorMsg(null);

    startTransition(async () => {
      const result = await createVehicle(formData);

      if (result.success) {
        handleClose();
      } else {
        setErrorMsg(result.error || 'Failed to create vehicle');
      }
    });
  }

  return (
    <>
      {/* 1. The Trigger Button (Always renders) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
      >
        + Add Vehicle
      </button>

      {/* 2. The Modal Backdrop & Dialog (Conditionally rendered when open) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 className="text-xl font-semibold">Register New Vehicle</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                disabled={isPending}
              >
                ✕
              </button>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Form Body */}
            <form action={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    License Plate / VIN *
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    required
                    placeholder="ABC-1234"
                    className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue="ACTIVE"
                    className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">In Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Make *
                  </label>
                  <input
                    type="text"
                    name="make"
                    required
                    placeholder="Volvo, Scania, Ford..."
                    className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    required
                    placeholder="FH16, F-150..."
                    className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    defaultValue={new Date().getFullYear()}
                    className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Payload Capacity (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="capacity"
                    placeholder="e.g. 15.5"
                    className="mt-1 w-full rounded-md border p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-4 py-2 text-sm rounded-md border hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? 'Saving...' : 'Add Vehicle'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}