'use client';

import { useState } from "react";
import OptimizeRouteButton from "@/components/map/OptimizeRouteButton";
import RouteStopManagerModal, {
    DeliveryStop
} from "@/components/modals/RouteStopManageModal";

interface RouteCardControlsProps {
    routeId: string;
    driverName: string;
    driverId: string;
    stops: DeliveryStop[];
}

export default function RouteCardControls({
    routeId,
    driverName,
    driverId,
    stops

}: RouteCardControlsProps) {
    const [isReorderOpen, setIsReorderOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsReorderOpen(true)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
                >
                    Reorder Stops
                </button>
                <OptimizeRouteButton routeId={routeId} />
            </div>

            <RouteStopManagerModal
                isOpen={isReorderOpen}
                onClose={() => setIsReorderOpen(false)}
                driverId={driverId}
                driverName={driverName}
                initialDeliveries={stops}
            />
        </>


    );

}
