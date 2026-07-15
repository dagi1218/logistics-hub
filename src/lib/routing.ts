// 1. Helper function to fetch real-world road paths from OSRM
export  async function getRoadPath(
  deliveries: { latitude: number; longitude: number }[]
): Promise<[number, number][]> {
  if (deliveries.length < 2) return [];

  try {
    // OSRM expects: longitude,latitude;longitude,latitude
    const coordsString = deliveries
      .map((d) => `${d.longitude},${d.latitude}`)
      .join(";");

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

    // Fetch the road path. Next.js automatically caches this so we don't spam the API!
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache the route coordinates for 1 hour
    });

    if (!res.ok) throw new Error("OSRM routing request failed");

    const data = await res.json();

    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      // OSRM returns [longitude, latitude]. Leaflet needs [latitude, longitude].
      return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [
        coord[1], // Latitude
        coord[0], // Longitude
      ]);
    }
  } catch (error) {
    console.error("⚠️ Routing Engine failed. Falling back to straight lines:", error);
  }

  // Fallback: If OSRM is down, connect the points with straight lines
  return deliveries.map((d) => [d.latitude, d.longitude]);
}