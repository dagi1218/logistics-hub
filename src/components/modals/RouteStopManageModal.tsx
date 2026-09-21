"use client";

import { useState, useTransition } from 'react';

import { reorderRouteStops } from '@/app/actions/dispatcher';
import { DeliveryStatus } from '../../../prisma/generated/enums';


export interface DeliveryStop {
    id: string;
    address: string;
    trackingNumber: string | null;
    latitude: number;
    longitude: number;
    customerName: string;
    routeId?: string;
    sequenceOrder: number;
    status: DeliveryStatus;


}

interface RouteStopManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    driverName: string;
    driverId: string;
    initialDeliveries: DeliveryStop[];
}


export default function RouteStopManagerModal({
    isOpen,
    onClose,
    driverName,
    driverId,
    initialDeliveries,
}: RouteStopManageModalProps) {
    const [deliveries, setDeliveries] = useState<DeliveryStop[]>(() =>
        [...initialDeliveries].sort((a, b) => a.sequenceOrder - b.sequenceOrder));

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    }

    const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updatedDeliveries = [...deliveries];
        const [movedItem] = updatedDeliveries.splice(draggedIndex, 1);

        updatedDeliveries.splice(targetIndex, 0, movedItem);


        const reordered = updatedDeliveries.map((item, index) => ({
            ...item,
            sequenceOrder: index + 1,

        }));

        setDraggedIndex(targetIndex);
        setDeliveries(reordered);


    }


    const handleSave = () => {
        setErrorMessage(null);
        const orderedIds = deliveries.map((d) => d.id);

        startTransition(async () => {
            const res = await reorderRouteStops(orderedIds, driverId);
            if (res?.success) {
                onClose();
            } else {
                setErrorMessage(res.error || "Failed to save new stop sequence");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h2 className="text-lg font-bold text-white">Reorder Route Stops</h2>
                        <p className="text-xs text-slate-400">Driver: <span className="text-cyan-400 font-medium">{driverName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition p-1 text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>
                {/* List of Drag-and-Drop Stops */}
                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                    <p className="text-xs text-slate-400 mb-2">
                        💡 Drag and drop the cards below to change the driver's delivery sequence.
                    </p>
                    {errorMessage && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                            {errorMessage}
                        </div>
                    )}
                    {deliveries.map((delivery, index) => (
                        <div
                            key={delivery.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={() => setDraggedIndex(null)}
                            className={`flex items-center gap-3 p-3.5 rounded-lg border transition cursor-grab active:cursor-grabbing ${draggedIndex === index
                                ? "bg-cyan-950/40 border-cyan-500/50 opacity-60 scale-[0.99]"
                                : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800"
                                }`}
                        >
                            {/* Drag Handle Icon */}
                            <div className="text-slate-500 select-none text-sm">
                                ⋮⋮
                            </div>
                            {/* Stop Sequence Badge */}
                            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                                {index + 1}
                            </div>
                            {/* Stop Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="text-xs font-semibold text-slate-200 truncate">
                                        {delivery.customerName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        #{delivery.trackingNumber}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {delivery.address}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                    >
                        {isPending ? "Saving Sequence..." : "Save Route Order"}
                    </button>
                </div>
            </div>
        </div>
    )



}