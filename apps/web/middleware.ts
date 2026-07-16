import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in(.*)", "/sign-up(.*)"];

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);

// Routes that an authenticated user may visit without an active organization.
// `/org-selection` must be included or the org-redirect below loops infinitely.
const isOrgFreeRoute = createRouteMatcher([
  ...PUBLIC_ROUTES,
  "/org-selection(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (userId && !orgId && !isOrgFreeRoute(req)) {
    return NextResponse.redirect(new URL("/org-selection", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Clerk auto-proxy
    "/__clerk/:path*",
  ],
};
