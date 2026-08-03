// src/components/StatusButton.tsx
"use client";

import React, { useOptimistic, useTransition } from "react";
import { updateDeliveryStatus } from "@/app/actions/routeActions";
import { DeliveryStatus } from "../../prisma/generated/client";

interface StatusButtonProps {
  deliveryId: string;
  currentStatus: DeliveryStatus;
}

export default function StatusButton({ deliveryId, currentStatus }: StatusButtonProps) {
  // useTransition tracks background server task execution
  const [isPending, startTransition] = useTransition();

  // useOptimistic accepts (canonicalState, updateFn).
  // React immediately updates optimisticStatus when setOptimisticStatus is called inside startTransition.
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    currentStatus,
    (_state: DeliveryStatus, newStatus: DeliveryStatus) => newStatus
  );

  // If the optimistic status is DELIVERED, instantly render the success badge
  if (optimisticStatus === "DELIVERED") {
    return (
      <div className="w-full py-3 bg-emerald-50 text-emerald-700 text-center rounded-xl font-bold text-sm border border-emerald-200 shadow-xs transition-all animate-fade-in">
        ✅ Package Delivered
      </div>
    );
  }

  const handleMarkDelivered = () => {
    startTransition(async () => {
      // 1. Instantly render the optimistic "DELIVERED" badge
      setOptimisticStatus("DELIVERED");

      // 2. Perform the async Server Action in the background
      const res = await updateDeliveryStatus(deliveryId, "DELIVERED");

      if (!res.success) {
        // If the server action fails, notify the user.
        // React automatically reconciles state back to the canonical server state.
        alert(`Failed to update status: ${res.error}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleMarkDelivered}
      disabled={isPending}
      className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-all ${
        isPending
          ? "bg-emerald-600 text-white cursor-wait opacity-90"
          : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
      }`}
    >
      {isPending ? "Syncing with Server…" : "Mark as Delivered"}
    </button>
  );
}