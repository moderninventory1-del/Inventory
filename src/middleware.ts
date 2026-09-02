// src/middleware.ts
// Protects /admin routes — redirects unauthenticated users to /login

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If accessing admin routes and no token or wrong role → redirect to login
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    secret:
      process.env.NEXTAUTH_SECRET ||
      "54008bb1376ff404578b5d391f5acd6a86265ae28b70e2b16d0e186b8576e229",
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
