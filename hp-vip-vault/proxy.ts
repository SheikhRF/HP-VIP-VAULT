import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api/webhooks(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/cars/add',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // 1. Always allow public routes through first - no auth check whatsoever
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Check Admin Routes
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.role !== 'admin' && sessionClaims?.Role !== 'admin') {
      const url = new URL('/home', req.url);
      return Response.redirect(url);
    }
  }

  // 3. Protect all API routes
  const isApiRoute = pathname.startsWith("/api") || pathname.startsWith("/trpc");
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

  // 4. Protect all other non-public routes
  await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api(?!/webhooks)|trpc)(.*)',
  ],
};