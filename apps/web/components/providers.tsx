"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import * as React from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

// Workaround for convex-js#145 (present in convex 1.34.0–1.42.2, the latest as
// of 2026-07): ConvexProviderWithClerk drops `template: "convex"` when
// `sessionClaims.aud === "convex"`, sending the raw Clerk session token — which
// carries no custom JWT-template claims (email, name, org_id). getUserIdentity()
// then returns a near-empty identity, so every org-scoped check fails with
// "Missing organization". Forcing the template on every fetch restores the
// pre-1.34 (1.32.0) behavior without downgrading. Remove if/when convex ships a
// fix above 1.42.2.
function useAuthWithConvexTemplate() {
  const clerkAuth = useAuth();
  return {
    ...clerkAuth,
    getToken: (options?: Parameters<typeof clerkAuth.getToken>[0]) =>
      clerkAuth.getToken({ ...options, template: "convex" }),
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk
      client={convex}
      useAuth={useAuthWithConvexTemplate}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}
