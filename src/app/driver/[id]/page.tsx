// src/app/driver/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import StatusButton from "@/components/StatusButton";
import SimulationControl from "@/components/SimulationControl";
import { getRoadPath } from "@/lib/routing";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverAppPage({ params }: PageProps) {
  const resolvedParams = await params;
  const driverId = resolvedParams.id;

  const activeRoute = await prisma.route.findFirst({
    where: {
      driverId: driverId,
      isCompleted: false,
    },
    include: {
      driver: true,
      deliveries: {
        orderBy: [
          { status: 'asc' },
          { id: 'asc' }
        ],
      },
    },
  });

  if (!activeRoute) {
    return (
      <div className="max-w-md mx-auto bg-zinc-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">No Active Route</h1>
        <p className="text-zinc-500">You do not have any pending deliveries assigned to you right now.</p>
      </div>
    );
  }

  // Calculate the path coordinates for the simulator to run on
  const deliveriesData = activeRoute.deliveries.map((d) => ({
    latitude: d.latitude,
    longitude: d.longitude,
  }));
  const roadPath = await getRoadPath(deliveriesData);

  const deliveries = activeRoute.deliveries;
  const pendingCount = deliveries.filter(d => d.status === "PENDING").length;

  return (
    <div className="max-w-md mx-auto bg-zinc-50 min-h-screen pb-20 space-y-4">
      {/* Header */}
      <div className="bg-zinc-900 text-white p-6 rounded-b-3xl shadow-md space-y-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Driver Portal</p>
          <h1 className="text-2xl font-bold">Hello, {activeRoute.driver.name} 👋</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {pendingCount} stops remaining today
          </p>
        </div>

        {/* New Simulator Controller widget on driver phone screen */}
        <SimulationControl driverId={driverId} roadPath={roadPath} />
      </div>

      {/* Deliveries */}
      <div className="p-4 space-y-4">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-zinc-900">{delivery.customerName}</h2>
              <p className="text-sm text-zinc-500 mt-1">{delivery.address}</p>
            </div>
            <StatusButton deliveryId={delivery.id} currentStatus={delivery.status} />
          </div>
        ))}
      </div>
    </div>
  );
}