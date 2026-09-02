// src/middleware.ts
// Protects /admin routes — robust token retrieval across HTTP/HTTPS and Vercel environments

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const SECRET =
  process.env.NEXTAUTH_SECRET ||
  "54008bb1376ff404578b5d391f5acd6a86265ae28b70e2b16d0e186b8576e229";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isHttps = req.url.startsWith("https://");

    // 1. Check token with protocol-matching secureCookie
    let token = await getToken({
      req,
      secret: SECRET,
      secureCookie: isHttps,
    });

    // 2. Fallback: try opposite secureCookie flag in case cookie was set without/with __Secure prefix
    if (!token) {
      token = await getToken({
        req,
        secret: SECRET,
        secureCookie: !isHttps,
      });
    }

    // 3. Fallback: check if session token cookie exists under either standard name
    if (!token) {
      const hasCookie =
        req.cookies.get("__Secure-next-auth.session-token") ||
        req.cookies.get("next-auth.session-token");
      if (hasCookie) {
        token = await getToken({
          req,
          secret: SECRET,
          raw: false,
        });
      }
    }

    // If still no valid token or role is not admin, redirect cleanly to /login
    if (!token || token.role !== "admin") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
