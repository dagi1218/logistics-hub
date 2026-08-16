// src/app/track/[id]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CustomerTrackMap from "@/components/map/CustomerMapWrapper";
import LiveTracker from "@/components/map/LiveTracker";
import { getRoadPath } from "@/lib/routing";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerTrackingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const deliveryId = resolvedParams.id;

  // 1. Fetch delivery details
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      route: {
        include: {
          driver: true,
        },
      },
    },
  });

  if (!delivery) {
    notFound();
  }

  // 2. Auto-generate 4-digit verification PIN if not present for pending deliveries
  let verificationPin = delivery.verificationPin;
  if (!verificationPin && delivery.status === "PENDING") {
    verificationPin = Math.floor(1000 + Math.random() * 9000).toString();
    await prisma.delivery.update({
      where: { id: delivery.id },
      data: { verificationPin },
    });
  }

  const driver = delivery.route?.driver;
  const isEnRoute = delivery.status === "PENDING" && delivery.route && !delivery.route.isCompleted;
  const isDelivered = delivery.status === "DELIVERED";

  const roadPath = isEnRoute && driver?.currentLat != null && driver?.currentLng != null
    ? await getRoadPath([
        { latitude: driver.currentLat, longitude: driver.currentLng },
        { latitude: delivery.latitude, longitude: delivery.longitude },
      ])
    : [];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-zinc-200">
      
      {/* 📡 Live Background Refresher */}
      {isEnRoute && <LiveTracker intervalMs={2500} />}

      {/* Header */}
      <header className="bg-white p-6 border-b border-zinc-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold bg-zinc-900 text-white px-3 py-1 rounded-full uppercase tracking-wider">
            Logistics Hub
          </span>
          <span className={`h-3 w-3 rounded-full ${isDelivered ? "bg-emerald-500" : isEnRoute ? "bg-emerald-500 animate-ping" : "bg-amber-400"}`} />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Track Your Delivery</h1>
        <p className="text-xs text-zinc-500 font-mono">Tracking Ref: #{delivery.id.slice(0, 8).toUpperCase()}</p>
      </header>

      {/* Main Panel */}
      <main className="flex-1 p-5 space-y-5 overflow-y-auto">
        
        {/* 🔑 Secret Handover PIN Card (Shown while pending) */}
        {!isDelivered && verificationPin && (
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg space-y-2 border border-amber-400/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1.5">
                <span>🔑</span> Handover Security PIN
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                Required for Delivery
              </span>
            </div>
            <p className="text-xs text-amber-50 leading-relaxed">
              Give this 4-digit PIN to your courier upon arrival to confirm package handover:
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {verificationPin.split("").map((digit, index) => (
                <div
                  key={index}
                  className="w-11 h-12 rounded-xl bg-white text-zinc-900 font-mono font-black text-2xl flex items-center justify-center shadow-md"
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📊 4-Stage Delivery Progress Timeline */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Delivery Timeline</h2>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
            {/* Step 1: Order Created */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">Order Placed</p>
                <p className="text-xs text-zinc-500">Destination: {delivery.address}</p>
              </div>
            </div>

            {/* Step 2: Courier Assigned */}
            <div className="relative flex items-start gap-3">
              <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                driver ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500"
              }`}>
                {driver ? "✓" : "2"}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">Courier Assigned</p>
                <p className="text-xs text-zinc-500">
                  {driver ? `Driver: ${driver.name}` : "Awaiting dispatch assignment"}
                </p>
              </div>
            </div>

            {/* Step 3: Out for Delivery */}
            <div className="relative flex items-start gap-3">
              <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                isDelivered ? "bg-emerald-500 text-white" : isEnRoute ? "bg-blue-600 text-white animate-pulse" : "bg-zinc-200 text-zinc-500"
              }`}>
                {isDelivered ? "✓" : isEnRoute ? "🚚" : "3"}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">Out for Delivery</p>
                <p className="text-xs text-zinc-500">
                  {isEnRoute ? "Courier is en route with live GPS active" : isDelivered ? "Completed transit" : "In queue"}
                </p>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className="relative flex items-start gap-3">
              <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                isDelivered ? "bg-emerald-500 text-white shadow-xs" : "bg-zinc-200 text-zinc-500"
              }`}>
                {isDelivered ? "✓" : "4"}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  {isDelivered ? "Delivered & Signed" : "Delivered"}
                </p>
                <p className="text-xs text-zinc-500">
                  {isDelivered
                    ? `Handover completed ${delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}`
                    : "Recipient signature required upon arrival"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 📜 Verified Proof of Delivery Certificate (When Delivered) */}
        {isDelivered && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <span>✅</span>
              <span>Verified Proof of Delivery (POD)</span>
            </div>
            
            <div className="text-xs text-emerald-950 space-y-1 bg-white p-3.5 rounded-xl border border-emerald-100">
              <p><span className="font-semibold text-zinc-500">Delivered To:</span> {delivery.customerName}</p>
              {delivery.deliveredAt && (
                <p><span className="font-semibold text-zinc-500">Timestamp:</span> {new Date(delivery.deliveredAt).toLocaleString()}</p>
              )}
              {delivery.notes && (
                <p><span className="font-semibold text-zinc-500">Courier Note:</span> {delivery.notes}</p>
              )}

              {delivery.signature && (
                <div className="pt-2 border-t border-zinc-100 mt-2">
                  <p className="font-semibold text-zinc-500 text-[11px] mb-1">Recipient Digital Signature:</p>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={delivery.signature}
                      alt="Customer Signature"
                      className="h-16 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Map Module */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Live Radar</h3>
            {isEnRoute && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md animate-pulse border border-emerald-200">
                LIVE GPS ACTIVE
              </span>
            )}
          </div>

          <CustomerTrackMap
            customerLat={delivery.latitude}
            customerLng={delivery.longitude}
            driverId={isEnRoute ? driver?.id : null}
            driverLat={isEnRoute ? driver?.currentLat ?? null : null}
            driverLng={isEnRoute ? driver?.currentLng ?? null : null}
            customerName={delivery.customerName}
            roadPath={roadPath}
          />
        </div>

        {/* Address and Info block */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Delivery Destination</h3>
          <p className="text-sm font-semibold text-zinc-900">{delivery.customerName}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{delivery.address}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-5 bg-zinc-900 text-zinc-400 text-center text-[10px] tracking-wider rounded-t-3xl border-t border-zinc-800">
        LOGISTICS HUB • NEXT.JS 16 & PRISMA
      </footer>
    </div>
  );
}