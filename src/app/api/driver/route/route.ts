import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const driverId = searchParams.get("driverId");
        if (!driverId) {
            return NextResponse.json({
                success: false,
                error: "Driver ID is required!"
            }, { status: 400 });
        }

        const activeRoute = await prisma.route.findFirst({
            where: {
                driverId: driverId,
                isCompleted: false
            },
            include: {
                deliveries: {
                    orderBy: {
                        sequenceOrder: "asc"
                    },
                }
            }
        });

        if (!activeRoute) {
            return NextResponse.json({
                success: true,
                message: "No active route found!",
                route: null
            });
        }

        return NextResponse.json({
            success: true,
            route: {
                id: activeRoute.id,
                isCompleted: activeRoute.isCompleted,
                deliveries: activeRoute.deliveries.map((delivery) => ({
                    id: delivery.id,
                    customerName: delivery.customerName,
                    address: delivery.address,
                    latitude: delivery.latitude,
                    longitude: delivery.longitude,
                    sequenceOrder: delivery.sequenceOrder,
                    status: delivery.status,
                    trackingNumber: delivery.trackingNumber,
                    verificationPin: delivery.verificationPin,
                })),
            },
        });

    }
    catch (error) {
        console.error("Fetch driver route error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}