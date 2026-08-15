// src/components/CustomerTrackMap.tsx
"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDriverStream } from "@/hooks/useDriverStream";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const truckIcon = L.icon({
  iconUrl: '/truck.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

interface CustomerTrackMapProps {
  customerLat: number;
  customerLng: number;
  driverId?: string | null;
  driverLat: number | null;
  driverLng: number | null;
  roadPath: [number, number][];
  customerName: string;
}

export default function CustomerTrackMap({
  customerLat,
  customerLng,
  driverId,
  driverLat,
  driverLng,
  roadPath,
  customerName,
}: CustomerTrackMapProps) {
  // Subscribe to real-time SSE location updates for this driver
  const { location: sseLocation, isConnected } = useDriverStream(driverId);

  // Prefer live SSE location over initial server props if available
  const activeDriverLat = sseLocation?.lat ?? driverLat;
  const activeDriverLng = sseLocation?.lng ?? driverLng;

  const customerPosition: [number, number] = [customerLat, customerLng];
  const driverPosition: [number, number] | null =
    activeDriverLat !== null && activeDriverLng !== null ? [activeDriverLat, activeDriverLng] : null;
  const defaultRoad: [number, number][] = driverPosition
    ? [customerPosition, driverPosition]
    : [];
  const route: [number, number][] = roadPath.length > 0 ? roadPath : defaultRoad;

  const mapCenter: [number, number] = driverPosition
    ? [(customerLat + driverPosition[0]) / 2, (customerLng + driverPosition[1]) / 2]
    : customerPosition;

  return (
    <div className="h-[350px] w-full rounded-2xl overflow-hidden shadow-inner border border-zinc-200 relative">
      {/* Live SSE Stream Indicator */}
      {driverId && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-200 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-amber-400"}`} />
          <span>{isConnected ? "SSE Stream Active" : "Connecting..."}</span>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 📍 Customer Destination Pin */}
        <Marker position={customerPosition} icon={defaultIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold">Delivery Location</p>
              <p className="text-zinc-500">{customerName}</p>
            </div>
          </Popup>
        </Marker>

        {/* 🚚 Active Driver Location */}
        {driverPosition && (
          <Marker position={driverPosition} icon={truckIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <p className="font-bold text-blue-600">Your Courier</p>
                <p className="text-zinc-500">
                  {isConnected ? "Streaming Live Coordinates" : "En route to your location"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Draw polyline */}
        {driverPosition && (
          <Polyline 
            positions={route} 
            pathOptions={{ color: "#3b82f6", dashArray: "5, 10", weight: 3 }}
          />
        )}
      </MapContainer>
    </div>
  );
}