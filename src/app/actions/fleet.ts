"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignVehicleToDriver(
  driverId: string,
  vehicleId: string | null
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Find if driver already has a vehicle
      const existingVehicle = await tx.vehicle.findUnique({
        where: { driverId },
      });

      //  Unassign old vehicle if it's different from the new one
      if (existingVehicle && existingVehicle.id !== vehicleId) {
        await tx.vehicle.update({
          where: { id: existingVehicle.id },
          data: { driverId: null },
        });
      }

      //  Assign new vehicle
      if (vehicleId) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { driverId },
        });
      }
    });

    revalidatePath("/dispatcher/fleet");
    revalidatePath("/dispatcher/map");
    return { success: true };
  } catch (error) {
    console.error("Error updating vehicle assignment: ", error);
    return { success: false, error: "Failed to update vehicle assignment." };
  }
}