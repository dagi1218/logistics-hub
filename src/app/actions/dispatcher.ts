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

export async function assignVehicleToDriver(driverId: string, vehicleId: string | null) {
  if (!driverId) {
    throw new Error("Driver ID is required");
  }

  // Unassign driver from any existing vehicle
  await prisma.vehicle.updateMany({
    where: { driverId: driverId },
    data: { driverId: null },
  });

  // Assign vehicle to driver if vehicleId is provided
  if (vehicleId) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { driverId: driverId },
    });
  }

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
                    sequenceOrder: index + 1,
                  },
              })
      )
    );

    revalidatePath("/dispatcher/map");
    revalidatePath("/dispatcher/deliveries");
}


export async function assignDeliveriesToDriver(driverId:string,deliveryIds:string[]){
           if(!driverId|| deliveryIds.length===0){
                return {success:false,message:"Select a driver and at least one delivery to assign."};
           }

           try{
             let activeRoute=await prisma.route.findFirst({
                  where:{driverId:driverId,isCompleted:false},
                  include:{deliveries:true}
             });

             if(!activeRoute){
                activeRoute=await prisma.route.create({
                    data:{driverId:driverId,isCompleted:false},
                    include:{deliveries:true}
                });
             }

             const currentStopCount = activeRoute.deliveries.length;
              
             const updatePromises = deliveryIds.map((deliveryId,index) =>
                 prisma.delivery.update({
                    where:{id:deliveryId},
                    data:{
                        routeId: activeRoute.id,
                        sequenceOrder: currentStopCount + index + 1,
                 }}
                )
            );

            await prisma.$transaction(updatePromises);

            revalidatePath("/dispatcher/map");
            revalidatePath("/dispatcher/deliveries");
            return {success:true};
            
             }catch(error){
                console.error("Assignment error: ",error);
                return { success: false, error: "Failed to dispatch route." };
             }
           }



