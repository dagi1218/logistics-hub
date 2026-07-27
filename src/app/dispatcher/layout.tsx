
import React from "react";
import Link from "next/link"; 
import LogoutButton from "@/components/LogoutButton";
export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigation links mapping directly to our blueprint
  const navItems = [
    { label: "Dashboard", href: "/dispatcher", icon: "📊" },
    { label: "Deliveries", href: "/dispatcher/deliveries", icon: "📦" },
    { label: "Fleet Status", href: "/dispatcher/fleet", icon: "🚚" },
    { label: "Live Map", href: "/dispatcher/map", icon: "🗺️" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex">
      {/* 1. PERSISTENT SIDEBAR */}
      <aside className="w-64 bg-zinc-900 text-zinc-100 flex flex-col fixed inset-y-0 left-0 z-20 border-r border-zinc-800">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Addis Logistics
            </h1>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors duration-200 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer / Profile Stub */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center font-bold text-zinc-950">
            AK
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">Abebe Kebede</span>
            <span className="text-xs text-zinc-500 truncate">Dispatcher Control</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      {/* We add 'pl-64' (Padding Left) so our page content sits perfectly next to the fixed sidebar without overlapping */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Global Top Dashboard Header */}
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-zinc-500">HQ Terminal Center</h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-1 rounded-md border border-emerald-200">
              ● Neon Database Live
            </span>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Addis Ababa, ET
          </div>
          <LogoutButton />

        </header>

        {/* Dynamic Page Target Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}