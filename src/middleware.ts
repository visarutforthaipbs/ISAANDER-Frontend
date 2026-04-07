import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Security headers applied to all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /author/dashboard (not login page)
  if (pathname.startsWith("/author/dashboard") && !pathname.startsWith("/author/dashboard/login")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const response = NextResponse.redirect(new URL("/author/dashboard/login", request.url));
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/author/dashboard/login", request.url));
      response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }
  }

  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
