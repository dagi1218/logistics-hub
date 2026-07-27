// src/app/login/page.tsx
"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    login as (
      state: { error: string } | null | undefined,
      formData: FormData
    ) => Promise<{ error: string } | null | undefined>,
    null
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-850 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Logistics Hub
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">System Access</h1>
          <p className="mt-1 text-xs text-zinc-400">Enter your credentials to manage routes</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-medium text-red-400">
              {state.error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="dispatcher@logisticshub.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            {isPending ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}