// src/components/LogoutButton.tsx
"use client";

import { logout } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
    >
      Sign Out
    </button>
  );
}