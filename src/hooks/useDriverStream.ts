"use client";

import { useEffect, useState } from "react";

export interface LocationUpdate {
  driverId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export function useDriverStream(driverId: string | null | undefined) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const eventSource = new EventSource(`/api/stream/driver/${driverId}`);

    eventSource.addEventListener("connected", () => {
      setIsConnected(true);
      setError(null);
    });

    eventSource.addEventListener("location", (event: MessageEvent) => {
      try {
        const data: LocationUpdate = JSON.parse(event.data);
        setLocation(data);
        setIsConnected(true);
      } catch (err) {
        console.error("Failed to parse SSE location data:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn("SSE connection interrupted, EventSource automatically reconnecting:", err);
      setIsConnected(false);
      setError("Reconnecting stream...");
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [driverId]);

  return { location, isConnected, error };
}
