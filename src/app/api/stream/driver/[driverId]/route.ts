import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const { driverId } = await params;

  if (!driverId) {
    return new Response("Missing driverId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection confirmation event
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({ driverId, time: Date.now() })}\n\n`
        )
      );

      // Stream driver GPS coordinates every second
      const interval = setInterval(async () => {
        try {
          const driver = await prisma.user.findUnique({
            where: { id: driverId },
            select: { id: true, currentLat: true, currentLng: true, name: true },
          });

          if (driver && driver.currentLat != null && driver.currentLng != null) {
            const payload = JSON.stringify({
              driverId: driver.id,
              lat: driver.currentLat,
              lng: driver.currentLng,
              timestamp: Date.now(),
            });
            controller.enqueue(encoder.encode(`event: location\ndata: ${payload}\n\n`));
          }
        } catch (error) {
          console.error("Error in driver SSE stream:", error);
        }
      }, 1000);

      // Clean up resources when connection is aborted by client
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Ignore if controller already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
