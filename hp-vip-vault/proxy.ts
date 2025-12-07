// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
  *public routes (that don't require authentication)
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

/**
  *Create the middleware to protect the routes
 */
export default clerkMiddleware(async(auth, req) => {
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
