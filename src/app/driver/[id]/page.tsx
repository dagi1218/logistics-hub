// src/app/driver/[id]/page.tsx
import React from "react";
import { prisma } from "../../../lib/prisma";
import StatusButton from "@/components/StatusButton";
import { notFound } from "next/navigation";

interface PageProps {
  // In Next.js 15+, params is a Promise that must be awaited
  params: Promise<{ id: string }>;
}

export default async function DriverAppPage({ params }: PageProps) {
  const resolvedParams = await params;
  const driverId = resolvedParams.id;

  // 1. Fetch only the active route for THIS specific driver
  const activeRoute = await prisma.route.findFirst({
    where: {
      driverId: driverId,
      isCompleted: false,
    },
    include: {
      driver: true,
      deliveries: {
        orderBy: [
          { status: 'asc' }, // PENDING comes before DELIVERED alphabetically
          { id: 'asc' }
        ],
      },
    },
  });

  // 2. Handle the case where the driver doesn't exist or has no active route
  if (!activeRoute) {
    return (
      <div className="max-w-md mx-auto bg-zinc-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">No Active Route</h1>
        <p className="text-zinc-500">You do not have any pending deliveries assigned to you right now.</p>
      </div>
    );
  }

  const deliveries = activeRoute.deliveries;
  const pendingCount = deliveries.filter(d => d.status === "PENDING").length;

  return (
    <div className="max-w-md mx-auto bg-zinc-50 min-h-screen pb-20">
      {/* Mobile-styled Header */}
      <div className="bg-zinc-900 text-white p-6 rounded-b-3xl shadow-md">
        <p className="text-zinc-400 text-sm font-medium mb-1">Driver Manifest</p>
        <h1 className="text-2xl font-bold">Hello, {activeRoute.driver.name} 👋</h1>
        <p className="text-zinc-400 text-sm mt-2">
          {pendingCount} stops remaining today
        </p>
      </div>

      {/* Delivery Cards */}
      <div className="p-4 space-y-4 mt-2">
        {deliveries.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">All clear! No deliveries assigned.</p>
        ) : (
          deliveries.map((delivery) => (
            <div 
              key={delivery.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {delivery.customerName}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">{delivery.address}</p>
                </div>
              </div>

              {/* The interactive client button! */}
              <StatusButton 
                deliveryId={delivery.id} 
                currentStatus={delivery.status} 
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}