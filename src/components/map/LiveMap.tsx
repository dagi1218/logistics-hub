"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pendingIcon = L.divIcon({
  className: "custom-pending-pin",
  html: `<div style="background-color: #f59e0b; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});


interface UnassignedDelivery {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface Route {
  id: string;
  driverName: string;
  driverId: string;
  driverLocation: [number, number];
  strokeColor: string;
  deliveries: Delivery[];
  roadPath: [number, number][]; 
}

interface LiveMapProps {
  routes: Route[];
  unassignedDeliveries?: UnassignedDelivery[];

}

// create per-route truck icon instances (avoids marker reuse/render issues)
const createTruckIcon = (url = "/truck.png") =>
  L.icon({
    iconUrl: url,
    iconSize: [32, 32],
    // anchor bottom-center so the icon points to the location
    iconAnchor: [16, 32],
  });

export default function LiveMap({ routes ,unassignedDeliveries=[]}: LiveMapProps) {
  const addisCenter: [number, number] = [9.0222, 38.7468];

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative z-0">
      <MapContainer 
        center={addisCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes.map((route) => {
          const routeLayerKey = `${route.id}-${route.deliveries.map((delivery) => delivery.id).join("-")}`;

          return (
            <React.Fragment key={routeLayerKey}>
              {/* Draw the smooth real-world road lines! */}
              {route.roadPath.length > 0 && (
              <Polyline
                positions={route.roadPath} // Connects road network nodes perfectly
                pathOptions={{
                  color: route.strokeColor,
                  weight: 4,
                  opacity: 0.8,
                  dashArray: "2, 6", // Clean, tight dashed look
                }}
              />
            )}

            {/* Plot markers */}
            {route.deliveries.map((delivery) => (
              <Marker 
                key={delivery.id} 
                position={[delivery.latitude, delivery.longitude]} 
                icon={defaultIcon}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-zinc-900 mb-0.5">{delivery.customerName}</p>
                    <p className="text-xs text-zinc-500 mb-2">{delivery.address}</p>
                    <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-zinc-100">
                      <span className="text-xs font-semibold text-zinc-600">
                        👤 {route.driverName}
                      </span>
                      <span className={`text-[10px] tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                        delivery.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        delivery.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>

              

              
            ))}

              {/* Plot the driver's current location */}
              <Marker
                key={route.driverId}
                position={route.driverLocation}
                icon={createTruckIcon()}
              >
                <Popup>
                  <div className="font-sans">
                    <p className="font-bold text-zinc-900">{route.driverName}</p>
                    <p className="text-xs text-zinc-500">Active Unit</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}