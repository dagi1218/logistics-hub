// src/components/CustomerTrackMap.tsx
"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});



// Custom truck icon for our driver
const truckIcon = L.icon({
  iconUrl: '/truck.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

interface CustomerTrackMapProps {
  customerLat: number;
  customerLng: number;
  driverLat: number | null;
  driverLng: number | null;
  roadPath: [number, number][]; // Optional road path for future use
  customerName: string;
}

export default function CustomerTrackMap({
  customerLat,
  customerLng,
  driverLat,
  driverLng,
  roadPath,
  customerName,
}: CustomerTrackMapProps) {
  const customerPosition: [number, number] = [customerLat, customerLng];
  const driverPosition: [number, number] | null =
    driverLat !== null && driverLng !== null ? [driverLat, driverLng] : null;
  const defaultRoad: [number, number][] = driverPosition
    ? [customerPosition, driverPosition]
    : [];
  const route: [number, number][] = roadPath.length > 0 ? roadPath : defaultRoad;

  // Center the map on the customer, or split the difference if the driver is active
  const mapCenter: [number, number] = driverPosition
    ? [(customerLat + driverPosition[0]) / 2, (customerLng + driverPosition[1]) / 2]
    : customerPosition;

  return (
    <div className="h-[350px] w-full rounded-2xl overflow-hidden shadow-inner border border-zinc-200">
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
                <p className="text-zinc-500">En route to your location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Draw a dashed line between them if driver is active */}
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