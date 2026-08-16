"use client";

import React, { useRef, useState, useEffect } from "react";
import { completeDeliveryWithPOD } from "@/app/actions/routeActions";

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  customerName: string;
  onSuccess: () => void;
}

export default function ProofOfDeliveryModal({
  isOpen,
  onClose,
  deliveryId,
  customerName,
  onSuccess,
}: ProofOfDeliveryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#09090b";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (pin.trim().length !== 4) {
      setErrorMessage("Please enter the 4-digit customer verification PIN.");
      return;
    }

    setIsSubmitting(true);

    try {
      const canvas = canvasRef.current;
      const signatureDataUrl = hasDrawn && canvas ? canvas.toDataURL("image/png") : undefined;

      const res = await completeDeliveryWithPOD(deliveryId, {
        pin: pin.trim(),
        signature: signatureDataUrl,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to submit Proof of Delivery.");
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMessage("An unexpected network error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Proof of Delivery (POD)</h2>
            <p className="text-xs text-zinc-500">Receiver: {customerName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 hover:bg-zinc-300 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* 🔑 PIN Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Customer Handover PIN <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-zinc-500">
              Ask the recipient for the 4-digit PIN shown on their live tracking screen:
            </p>
            <input
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 4819"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-center text-xl font-mono font-bold tracking-widest text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              required
            />
          </div>

          {/* ✍️ Digital Signature Canvas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Recipient Signature (Optional)
              </label>
              {hasDrawn && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Clear Signature
                </button>
              )}
            </div>
            <div className="border border-zinc-300 rounded-2xl overflow-hidden bg-zinc-50 touch-none">
              <canvas
                ref={canvasRef}
                width={360}
                height={140}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="w-full h-[140px] cursor-crosshair block"
              />
            </div>
            <p className="text-[10px] text-zinc-400 text-center">
              Draw signature above using finger or mouse
            </p>
          </div>

          {/* 📝 Delivery Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Courier Remarks / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handed to security / left at reception"
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || pin.length !== 4}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                isSubmitting || pin.length !== 4
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? "Verifying PIN & Saving POD…" : "Confirm & Complete Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
