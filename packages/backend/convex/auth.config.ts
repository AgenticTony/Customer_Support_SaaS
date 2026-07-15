export default {
  providers: [
    {
      // Clerk Frontend API URL — set CLERK_JWT_ISSUER_DOMAIN on the Convex
      // dashboard (and locally in packages/backend/.env.local).
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
