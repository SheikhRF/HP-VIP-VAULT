// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

/**
  *public routes (that don't require authentication)
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
]);

/**
  *Create the middleware to protect the routes
 */
export default clerkMiddleware(async(auth, req) => {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api") || pathname.startsWith("/trpc");

  // redirect apis diferently to normal pages
  if (isApiRoute) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // authenticated -> allow request through
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

/**
  *Config to apply the middleware to all routes except static files and Next.js internals
 */
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',

    '/(api|trpc)(.*)',
  ],
};
