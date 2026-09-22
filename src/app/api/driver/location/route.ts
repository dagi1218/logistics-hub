import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { driverId, latitude, longitude } = body;

        if (!driverId || latitude === undefined || longitude == undefined) {
            return NextResponse.json(
                {
                    success: false, error: "driverId, latitude, and longitude are required."
                }, { status: 400 }
            )
        }

        const updatedDriver = await prisma.user.update({
            where: { id: driverId },
            data: {
                currentLat: parseFloat(latitude),

                currentLng: parseFloat(longitude),
            },
            select: {
                id: true,
                name: true,
                currentLat: true,
                currentLng: true
            }


        });
        revalidatePath("/dispatcher/map");
       

        return NextResponse.json({
            success: true,
            driver: updatedDriver,
        });

    }
    catch (error) {
        console.error("Update driver location error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}