// src/app/actions.ts
"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { DeliveryStatus } from "../../../prisma/generated/client";

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