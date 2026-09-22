import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { deliveryId, pin, signature, notes } = body;

        if (!deliveryId || !pin) {
            return NextResponse.json(
                { success: false, error: "deliveryId and verification PIN are required." },

                { status: 400 }
            );
        }

        const delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId }
        });

        if (!delivery) {
            return NextResponse.json(
                { success: false, error: "Delivery not found." },
                { status: 404 }
            );
        }

        if (delivery.verificationPin && delivery.verificationPin !== pin.trim()) {
            return NextResponse.json(
                { success: false, error: "Invalid 4-digit verification PIN." },
                { status: 400 }
            );
        }

        const updatedDelivery = await prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                status: "DELIVERED",
                signature: signature || null,
                notes: notes || null,
                deliveredAt: new Date(),

            }
        })


        if (delivery.routeId) {
            const remainingPending = await prisma.delivery.count({
                where: {
                    routeId: delivery.routeId,
                    status: { not: "DELIVERED" }
                },

            });

            if (remainingPending === 0) {
                await prisma.route.update({
                    where: {
                        id: delivery.routeId,
                    },
                    data: {
                        isCompleted: true,
                    }
                });
            }
        }


        revalidatePath(`/track/${deliveryId}`);
        revalidatePath("/dispatcher/map");

        return NextResponse.json({
            success: true,
            message: "Delivery marked as completed!",
            delivery: updatedDelivery,
        });

    } catch (error) {
        console.error("Complete delivery error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}