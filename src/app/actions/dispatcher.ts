"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDelivery(formData: FormData) {
  const customerName = formData.get("customerName")?.toString().trim() ?? "";
  const address = formData.get("address")?.toString().trim() ?? "";
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  if (!customerName || !address || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Missing required delivery fields");
  }

  await prisma.delivery.create({
    data: {
      customerName,
      address,
      latitude,
      longitude,
      status: "PENDING",
    },
  });

  revalidatePath("/dispatcher/deliveries");
  revalidatePath("/dispatcher/map");
}

export async function assignVehicleToDriver(driverId:string, vehicleId:string| null){
    if(!driverId){
        throw new Error("Driver ID is required");
    }

    await prisma.user.update({
         where:{
            id:driverId
         },
         data:{
            vehicleId:vehicleId? vehicleId : null
         }
    });

    revalidatePath("/dispatcher/fleet");
}


export async function createRouteWithDeliveries(driverId: string,deliveryIds: string[]) {
      const newRoute = await prisma.route.create({
        data: {
          driverId,
          isCompleted: false,
        }
      });

      await Promise.all(
          deliveryIds.map((deliveryId,index) =>
              prisma.delivery.update({
                  where: { id: deliveryId },
                  data: {
                    routeId: newRoute.id,
                    squenceOrder: index + 1,
                  },
              })
      )
    );

    revalidatePath("/dispatcher/map");
    revalidatePath("/dispatcher/deliveries");
}


