// src/components/SimulationControl.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { updateDriverLocation } from "@/app/actions/routeActions";

interface SimulationControlProps {
  driverId: string;
  roadPath: [number, number][];
}

export default function SimulationControl({ driverId, roadPath }: SimulationControlProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  //  Keep track of the current node index safely across async intervals
  const indexRef = useRef(0);

  const startSimulation = () => {
    if (roadPath.length === 0) return;
    indexRef.current = 0;
    setCurrentIndex(0);
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isSimulating) {
      intervalRef.current = setInterval(async () => {
        const nextIndex = indexRef.current + 1;
        
        // Stop the drive if we run out of path nodes
        if (nextIndex >= roadPath.length) {
          stopSimulation();
          return;
        }

        // 1. Update our mutable ref and UI state cleanly
        indexRef.current = nextIndex;
        setCurrentIndex(nextIndex);

        // 2. Fire the Server Action side-effect safely OUTSIDE of the state-updating cycle
        const [lat, lng] = roadPath[nextIndex];
        await updateDriverLocation(driverId, lat, lng);
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSimulating, roadPath, driverId]);

  return (
    <div className="bg-zinc-900 text-white p-5 rounded-2xl shadow-inner border border-zinc-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-wide text-zinc-400 uppercase">
            GPS Engine Simulator
          </h3>
          <p className="text-xs text-zinc-500">
            {isSimulating 
              ? `Moving along road node ${currentIndex + 1} of ${roadPath.length}` 
              : "GPS Transmitter Standby"}
          </p>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${isSimulating ? "bg-emerald-500 animate-ping" : "bg-zinc-600"}`} />
      </div>

      {isSimulating ? (
        <button
          onClick={stopSimulation}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors"
        >
          Stop Simulated Drive
        </button>
      ) : (
        <button
          onClick={startSimulation}
          disabled={roadPath.length === 0}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl text-sm transition-colors"
        >
          Start Simulated Drive
        </button>
      )}
    </div>
  );
}