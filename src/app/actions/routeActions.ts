"use server";

import { prisma } from "@/lib/prisma";
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

    const driverLat = route.driver.currentLat ?? 9.03; // Fallback coordinates
    const driverLng = route.driver.currentLng ?? 38.74;

    const stops = route.deliveries.map(d => ({
      id: d.id,
      latitude: d.latitude,
      longitude: d.longitude
    }));

    // 2. Call TSP optimizer (OSRM Trip API with Nearest-Neighbor fallback)
    const { orderedIds, distanceKm, durationMins } = await optimizeRouteSequence(
      driverLat,
      driverLng,
      stops
    );

    // 3. Write new sequence orders back to database in a transaction
    const updatePromises = orderedIds.map((deliveryId, index) =>
      prisma.delivery.update({
        where: { id: deliveryId },
        data: { sequenceOrder: index }
      })
    );

    await prisma.$transaction(updatePromises);

    // 4. Push updates to pages rendering these queues
    revalidatePath("/dispatcher/map");
    revalidatePath("/dispatcher/deliveries");
    revalidatePath(`/driver/${route.driverId}`);

    return {
      success: true,
      stopsCount: stops.length,
      distanceKm,
      durationMins,
    };
  } catch (error) {
    console.error("Failed to optimize route:", error);
    return { success: false, error: "Optimization process failed" };
  }
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: DeliveryStatus) {
  try {
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: newStatus },
    });

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
    await prisma.user.update({
      where: { id: driverId },
      data: { 
        currentLat: lat, 
        currentLng: lng 
      },
    });

    revalidatePath("/dispatcher/map");

    return { success: true };
  } catch (error) {
    console.error("Failed to update driver location:", error);
    return { success: false, error: "Failed to update location" };
  }
}
