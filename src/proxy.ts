
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-super-secret-key-change-this-in-prod"
);

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  //  Define Public pages (accessible to anyone)
  const isPublicPath = path === "/login" || path.startsWith("/track/");

  // Retrieve session cookie
  const sessionToken = req.cookies.get("session")?.value;

  //  Verify session token
  let decodedUser: any = null;
  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
      decodedUser = payload;
    } catch (err) {
      // Invalid or expired token; clear it
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  // Enforce Access Rules
  if (!decodedUser && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (decodedUser) {
    // If logged in and trying to access /login, redirect appropriately
    if (path === "/login") {
      if (decodedUser.role === "DISPATCHER" || decodedUser.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dispatcher/map", req.url));
      }
      return NextResponse.redirect(new URL(`/driver/${decodedUser.userId}`, req.url));
    }

    // Lock down `/dispatcher` to DISPATCHER or ADMIN only
    if (path.startsWith("/dispatcher") && decodedUser.role !== "DISPATCHER" && decodedUser.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Lock down `/driver` to the specific logged-in driver only!
    if (path.startsWith("/driver")) {
      const targetDriverId = path.split("/")[2];
      if (decodedUser.role !== "DRIVER" && decodedUser.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Prevent Driver A from accessing Driver B's link
      if (decodedUser.role === "DRIVER" && decodedUser.userId !== targetDriverId) {
        return NextResponse.redirect(new URL(`/driver/${decodedUser.userId}`, req.url));
      }
    }
  }

  return NextResponse.next();
}

// Intercept all routes except static assets, maps, and APIs
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};