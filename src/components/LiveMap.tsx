"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// The foolproof fix for Next.js missing Leaflet icons
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Define the shape of the data we expect from the server
interface Location {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  driverName: string;
}

interface LiveMapProps {
  locations: Location[];
}

export default function LiveMap({ locations }: LiveMapProps) {
  // Center map on Addis Ababa
  const addisCenter: [number, number] = [9.0222, 38.7468];

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative z-0">
      <MapContainer 
        center={addisCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full"
      >
        {/* OpenStreetMap Base Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Plotting the deliveries dynamically */}
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.latitude, loc.longitude]} 
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-zinc-900 mb-1">{loc.customerName}</p>
                <p className="text-xs text-zinc-600 mb-2">{loc.address}</p>
                <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-zinc-200">
                  <span className="text-xs font-semibold text-zinc-500">
                    🚚 {loc.driverName}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                    loc.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                    loc.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {loc.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}