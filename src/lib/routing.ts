// src/lib/routing.ts

export interface Coordinate {
  id: string;
  latitude: number;
  longitude: number;
}

export interface OptimizationResult {
  orderedIds: string[];
  distanceKm: number;
  durationMins: number;
}

/**
 * Calculates the Haversine (great-circle) distance between two GPS coordinates in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Local Nearest-Neighbor Greedy Heuristic Solver for TSP.
 * Used as an algorithmic fallback when external routing API is unavailable.
 */
export function solveNearestNeighborTSP(
  startLat: number,
  startLng: number,
  stops: Coordinate[]
): OptimizationResult {
  if (stops.length === 0) {
    return { orderedIds: [], distanceKm: 0, durationMins: 0 };
  }

  const unvisited = [...stops];
  const orderedStops: Coordinate[] = [];
  let currentLat = startLat;
  let currentLng = startLng;
  let totalDistanceKm = 0;

  while (unvisited.length > 0) {
    let closestIndex = 0;
    let minDistance = haversineDistance(
      currentLat,
      currentLng,
      unvisited[0].latitude,
      unvisited[0].longitude
    );

    for (let i = 1; i < unvisited.length; i++) {
      const dist = haversineDistance(
        currentLat,
        currentLng,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const nextStop = unvisited.splice(closestIndex, 1)[0];
    orderedStops.push(nextStop);
    totalDistanceKm += minDistance;
    currentLat = nextStop.latitude;
    currentLng = nextStop.longitude;
  }

  // Assuming average urban traffic speed ~30 km/h (0.5 km per min)
  const durationMins = Math.round((totalDistanceKm / 30) * 60);

  return {
    orderedIds: orderedStops.map((s) => s.id),
    distanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    durationMins,
  };
}

/**
 * Uses OSRM Trip API (or local Nearest-Neighbor heuristic fallback) to solve TSP.
 */
export async function optimizeRouteSequence(
  startLat: number,
  startLng: number,
  stops: Coordinate[]
): Promise<OptimizationResult> {
  if (stops.length === 0) {
    return { orderedIds: [], distanceKm: 0, durationMins: 0 };
  }

  const coordinateString = [
    `${startLng},${startLat}`,
    ...stops.map((s) => `${s.longitude},${s.latitude}`),
  ].join(";");

  try {
    const url = `https://router.project-osrm.org/trip/v1/driving/${coordinateString}?source=first&destination=any&roundtrip=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.waypoints) {
      console.warn("OSRM Optimization API returned non-Ok state, using Nearest-Neighbor fallback.");
      return solveNearestNeighborTSP(startLat, startLng, stops);
    }

    const orderedStops = stops
      .map((stop, index) => {
        const waypoint = data.waypoints[index + 1];
        return {
          id: stop.id,
          order: waypoint?.waypoint_index ?? index + 1,
        };
      })
      .sort((a, b) => a.order - b.order)
      .map((s) => s.id);

    const trip = data.trips?.[0];
    const distanceKm = trip?.distance ? parseFloat((trip.distance / 1000).toFixed(2)) : 0;
    const durationMins = trip?.duration ? Math.round(trip.duration / 60) : 0;

    return {
      orderedIds: orderedStops,
      distanceKm,
      durationMins,
    };
  } catch (error) {
    console.error("OSRM API error, applying local Nearest-Neighbor TSP fallback:", error);
    return solveNearestNeighborTSP(startLat, startLng, stops);
  }
}

export async function getRoadPath(
  deliveries: { latitude: number; longitude: number }[]
): Promise<[number, number][]> {
  if (deliveries.length < 2) return [];

  try {
    const coordsString = deliveries
      .map((d) => `${d.longitude},${d.latitude}`)
      .join(";");

    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("OSRM routing request failed");

    const data = await res.json();

    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [
        coord[1],
        coord[0],
      ]);
    }
  } catch (error) {
    console.error("⚠️ Routing Engine failed. Falling back to straight lines:", error);
  }

  return deliveries.map((d) => [d.latitude, d.longitude]);
}