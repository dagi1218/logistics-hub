// 1. Helper function to fetch real-world road paths from OSRM
interface Coordinate {
  id: string;
  latitude: number;
  longitude: number;
}

/**
 * Uses the OSRM Trip API to solve the Traveling Salesman Problem for a list of stops.
 * Returns the stop IDs ordered by the most efficient real-road sequence.
 */
export async function optimizeRouteSequence(
  startLat: number,
  startLng: number,
  stops: Coordinate[]
): Promise<string[]> {
  if (stops.length === 0) return [];

  // 1. Build the coordinate string starting with driver/depot
  const coordinateString = [
    `${startLng},${startLat}`,
    ...stops.map((s) => `${s.longitude},${s.latitude}`),
  ].join(";");

  try {
    const url = `https://router.project-osrm.org/trip/v1/driving/${coordinateString}?source=first&destination=any&roundtrip=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.waypoints) {
      console.warn("OSRM Optimization failed, falling back to database order.");
      return stops.map((s) => s.id);
    }

    // 2. Map input stops (skipping index 0 which is start location) to their OSRM waypoint_index
    const orderedStops = stops
      .map((stop, index) => {
        // Waypoints array includes start location at index 0, so stop i is at index i + 1
        const waypoint = data.waypoints[index + 1];
        return {
          id: stop.id,
          // waypoint_index represents order in the trip
          order: waypoint?.waypoint_index ?? index + 1,
        };
      })
      // 3. Sort by the calculated visit order
      .sort((a, b) => a.order - b.order)
      // 4. Extract sorted IDs
      .map((s) => s.id);

    return orderedStops;
  } catch (error) {
    console.error("Error optimizing route sequence:", error);
    return stops.map((s) => s.id); // Safe fallback
  }
}

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