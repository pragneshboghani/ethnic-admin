import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthRoutes } from "./enum/AuthRoutesEnum";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const pathname = request.nextUrl.pathname;

    const isAuthRoute = pathname === AuthRoutes.SIGN_IN || pathname === AuthRoutes.HOME;

    const isProtectedRoute = pathname.startsWith("/account");

    if (token && isAuthRoute) {
        return NextResponse.redirect(
            new URL("/account/dashboard", request.url)
        );
    }

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(
            new URL(AuthRoutes.HOME, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/sign-in",
        "/account/:path*",
    ],
};
