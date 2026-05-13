import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Security headers applied to all responses.
// In dev mode, React requires 'unsafe-eval' for debugging features like
// callstack reconstruction. Production keeps the strict policy.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "'self' https: 'unsafe-inline' 'unsafe-eval'"
  : "'self' https: 'unsafe-inline'";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Cross-Origin-Resource-Policy": "same-site",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": `default-src 'self' https:; script-src ${scriptSrc}; style-src 'self' https: 'unsafe-inline'; frame-src 'self' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; frame-ancestors 'self'; base-uri 'self';`,
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
