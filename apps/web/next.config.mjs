/* global process */
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
}

export default withSentryConfig(nextConfig, {
  org: "foran-marketing",
  project: "javascript-nextjs",

  // Source-map upload auth token (build-time secret). Set in .env.sentry-build-plugin
  // or as SENTRY_AUTH_TOKEN in your build environment.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a wider set of client source files for better stack-trace resolution
  widenClientFileUpload: true,

  // Proxy route that forwards Sentry events to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Suppress non-CI build output
  silent: !process.env.CI,
})
