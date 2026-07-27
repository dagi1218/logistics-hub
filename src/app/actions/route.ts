// src/app/actions.ts
"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { DeliveryStatus } from "../../../prisma/generated/client";
import { optimizeRouteSequence } from "@/lib/routing";

export async function optimizeRoute(routeId: string) {
  try {
    // 1. Fetch the route along with its driver and pending deliveries
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        driver: true,
        deliveries: {
          where: { status: "PENDING" }
        }
      }
    });

    if (!route || !route.driver) {
      return { success: false, error: "Route or driver not found" };
    }

    const driverLat = route.driver.currentLat ?? 9.03; // Fallback to center coordinates if null
    const driverLng = route.driver.currentLng ?? 38.74;

    const stops = route.deliveries.map(d => ({
      id: d.id,
      latitude: d.latitude,
      longitude: d.longitude
    }));

    // 2. Call our OSRM utility to get the optimal sequence array
    const optimizedIds = await optimizeRouteSequence(driverLat, driverLng, stops);

    // 3. Write the new sequence orders back to the database using a transaction
    const updatePromises = optimizedIds.map((deliveryId, index) =>
      prisma.delivery.update({
        where: { id: deliveryId },
        data: { sequenceOrder: index }
      })
    );

   console.log("🚀 Sending transaction to Neon...");
  const result = await prisma.$transaction(updatePromises);
  console.log("✅ Database confirmation:", result);

    // 4. Instantly push updates to components rendering these queues
    revalidatePath("/dispatcher/map");
    revalidatePath("/dispatcher/deliveries");
    revalidatePath(`/driver/${route.driverId}`);
   

    return { success: true };
  } catch (error) {
    console.error("Failed to optimize route:", error);
    return { success: false, error: "Optimization process failed" };
  }
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: DeliveryStatus) {
  try {
    // 1. Update the database directly
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: newStatus },
    });

    //Tell Next.js to instantly refresh these pages 
    // to show the new data, without the user having to refresh their browser!
    revalidatePath("/dispatcher/map");
    revalidatePath("/driver");
    revalidatePath("/dispatcher/deliveries");

    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update delivery status" };
  }
}


export async function updateDriverLocation(driverId: string, lat: number, lng: number) {
  try {
    // 1. Update the driver's current coordinates in the database
    await prisma.user.update({
      where: { id: driverId },
      data: { 
        currentLat: lat, 
        currentLng: lng 
      },
    });

    // 2. Instantly refresh the Dispatcher Map so the truck icon moves!
    revalidatePath("/dispatcher/map");

    return { success: true };
  } catch (error) {
    console.error("Failed to update driver location:", error);
    return { success: false, error: "Failed to update location" };
  }
}