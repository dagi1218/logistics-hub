// src/components/StatusButton.tsx
"use client";

import React, { useTransition } from "react";
import { updateDeliveryStatus } from "../app/actions/actions";
import { DeliveryStatus } from "../../prisma/generated/client";

interface StatusButtonProps {
  deliveryId: string;
  currentStatus: DeliveryStatus;
}

export default function StatusButton({ deliveryId, currentStatus }: StatusButtonProps) {
  // useTransition is a React hook that lets us track if a background server task is running
  const [isPending, startTransition] = useTransition();

  // If it's already delivered, we don't need a button, just a success badge
  if (currentStatus === "DELIVERED") {
    return (
      <div className="w-full py-3 bg-emerald-50 text-emerald-700 text-center rounded-xl font-bold text-sm border border-emerald-200">
        ✅ Package Delivered
      </div>
    );
  }

  const handleMarkDelivered = () => {
    startTransition(async () => {
      await updateDeliveryStatus(deliveryId, "DELIVERED");
    });
  };

  return (
    <button
      onClick={handleMarkDelivered}
      disabled={isPending}
      className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-all ${
        isPending 
          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
          : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
      }`}
    >
      {isPending ? "Updating Database..." : "Mark as Delivered"}
    </button>
  );
}