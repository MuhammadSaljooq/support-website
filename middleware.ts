import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow admin login page
    if (req.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // If user is not authenticated and trying to access dashboard/admin, redirect to login
    if (!req.nextauth.token && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/admin"))) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Protect admin routes - check if user is admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token as any;
      if (!token || token.role !== "ADMIN") {
        const loginUrl = new URL("/admin/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow admin login page
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          const tokenRole = (token as any)?.role;
          return !!token && tokenRole === "ADMIN";
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
  ],
  // Exclude admin login page from auth check
  exclude: ["/admin/login"],
};

