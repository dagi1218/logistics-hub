// src/components/StatusButton.tsx
"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import { DeliveryStatus } from "../../prisma/generated/client";
import ProofOfDeliveryModal from "@/components/modals/ProofOfDeliveryModal";

interface StatusButtonProps {
  deliveryId: string;
  currentStatus: DeliveryStatus;
  customerName?: string;
}

export default function StatusButton({ deliveryId, currentStatus, customerName = "Customer" }: StatusButtonProps) {
  const [, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useOptimistic immediately updates optimisticStatus when setOptimisticStatus is called
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    currentStatus,
    (_state: DeliveryStatus, newStatus: DeliveryStatus) => newStatus
  );

  // If the optimistic status is DELIVERED, render the success badge
  if (optimisticStatus === "DELIVERED") {
    return (
      <div className="w-full py-3 bg-emerald-50 text-emerald-700 text-center rounded-xl font-bold text-sm border border-emerald-200 shadow-xs transition-all animate-fade-in flex items-center justify-center gap-1.5">
        <span>✅</span>
        <span>Package Delivered & Signed</span>
      </div>
    );
  }

  const handlePODSuccess = () => {
    startTransition(() => {
      setOptimisticStatus("DELIVERED");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-all bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>✍️</span>
        <span>Complete Delivery (POD)</span>
      </button>

      {/* Proof of Delivery Modal */}
      <ProofOfDeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deliveryId={deliveryId}
        customerName={customerName}
        onSuccess={handlePODSuccess}
      />
    </>
  );
}