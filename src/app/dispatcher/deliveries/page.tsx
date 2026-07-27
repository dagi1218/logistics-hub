// src/app/dispatcher/deliveries/page.tsx
import React from "react";
import { prisma } from "../../../lib/prisma";
import { DeliveryStatus } from "../../../../prisma/generated/client";
import SearchBar from "../../../components/SearchBar";
import CreateDeliveryModal from "../../../components/CreateDeliveryModal";

// Next.js automatically passes URL search parameters as a Promise to page components
interface PageProps {
  searchParams: Promise<{ query?: string; status?: string }>;
}

export default async function DeliveriesPage({ searchParams }: PageProps) {
  // 1. Await and extract the URL parameters
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const statusFilter = resolvedParams.status;

  // 2. Build a dynamic Prisma query based on what is in the URL
  const deliveries = await prisma.delivery.findMany({
    where: {
      // If there is a search query, look in the customer name OR address
      ...(query && {
        OR: [
          { customerName: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      }),
      // If a status is selected, filter by it
      ...(statusFilter && {
        status: statusFilter as DeliveryStatus,
      }),
    },
    // Sort newest first
    orderBy: { id: "desc" },
    // Join relational data to get the driver's name!
    include: {
      route: {
        include: {
          driver: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Delivery History
          </h1>
          <p className="text-sm text-zinc-500">
            Search and filter all fleet deliveries across Addis Ababa.
          </p>
        </div>
        <CreateDeliveryModal />
        {/* Placeholder for our Search Bar Component */}
        <SearchBar />
      </div>

      {/* The Data Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500">
                  No deliveries found matching your search.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {delivery.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {delivery.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {delivery.route?.driver.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      delivery.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      delivery.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}