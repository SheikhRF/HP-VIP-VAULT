// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/cars/add',

]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api") || pathname.startsWith("/trpc");

  // 1. Check Admin Routes FIRST (for both Pages and APIs)
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    // Redirect non-admin users to /home
    if (sessionClaims?.role !== 'admin' && sessionClaims?.Role !== 'admin') {
      const url = new URL('/home', req.url);
      return Response.redirect(url);
    }
  }

  // 2. Standard API Authentication
  if (isApiRoute) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Protect all other non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};