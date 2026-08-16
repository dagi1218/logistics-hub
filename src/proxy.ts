// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Define Public routes (accessible to anyone without auth)
  const isPublicPath =
    path === "/login" ||
    path.startsWith("/track/") ||
    path.startsWith("/api/stream/");

  // 2. Retrieve & verify session token using centralized auth utility
  const sessionToken = req.cookies.get("session")?.value;
  const decodedUser = sessionToken ? await verifyToken(sessionToken) : null;

  // If a session token exists but is invalid or expired, clear it and redirect to login
  if (sessionToken && !decodedUser) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("session");
    return res;
  }

  // 3. Unauthenticated access enforcement
  if (!decodedUser && !isPublicPath) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated user routing & RBAC enforcement
  if (decodedUser) {
    // If logged-in user visits /login, redirect to role home
    if (path === "/login") {
      const homePath =
        decodedUser.role === "DISPATCHER" || decodedUser.role === "ADMIN"
          ? "/dispatcher/map"
          : `/driver/${decodedUser.userId}`;
      return NextResponse.redirect(new URL(homePath, req.url));
    }

    // Role Guard: /dispatcher/* -> Only DISPATCHER or ADMIN
    if (path.startsWith("/dispatcher")) {
      if (decodedUser.role !== "DISPATCHER" && decodedUser.role !== "ADMIN") {
        return NextResponse.redirect(
          new URL(`/driver/${decodedUser.userId}`, req.url)
        );
      }
    }

    // Role Guard: /driver/* - Specific driver or DISPATCHER/ADMIN
    if (path.startsWith("/driver")) {
      const targetDriverId = path.split("/")[2];

      if (decodedUser.role === "DRIVER" && targetDriverId && decodedUser.userId !== targetDriverId) {
        // Prevent Driver A from accessing Driver B's dashboard
        return NextResponse.redirect(
          new URL(`/driver/${decodedUser.userId}`, req.url)
        );
      }
    }

    // 5. Downstream Header Enrichment (Identity Propagation)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decodedUser.userId);
    requestHeaders.set("x-user-role", decodedUser.role);
    requestHeaders.set("x-user-email", decodedUser.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Intercept all routes except Next.js internals and static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};