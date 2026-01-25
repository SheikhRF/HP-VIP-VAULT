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

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

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

    if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();

    // Redirect to home if they don't have the 'admin' role
    if (sessionClaims?.Role !== 'admin') {
      const url = new URL('/home', req.url);
      return Response.redirect(url);
    }
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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    '/(api|trpc)(.*)',
  ],
};
