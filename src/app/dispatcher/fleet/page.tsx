// src/app/dispatcher/fleet/page.tsx


import { prisma } from "@/lib/prisma";
import FleetTable from "@/components/FleetTable";
import { AddVehicleModal } from '@/components/modals/AddVehicleModal';

export default async function FleetPage() {
 
  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    include: {
      vehicle: true,
      routes: {
        select: { isCompleted: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { licensePlate: "asc" },
  });

  return (
    <div className="space-y-6">
      <AddVehicleModal/>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Fleet Control</h1>
        <p className="text-sm text-zinc-500">
          Assign vehicles and monitor active driver routes.
        </p>
      </div>

      <FleetTable drivers={drivers as any} allVehicles={vehicles as any} />

    </div>
  );
}