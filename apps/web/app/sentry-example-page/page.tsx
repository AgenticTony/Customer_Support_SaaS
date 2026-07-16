"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@workspace/ui/components/button";

// Temporary page to verify the Sentry setup. Removed in ch.6.
export default function SentryExamplePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Sentry Example Page</h1>
      <Button
        onClick={() => {
          throw new Error("Sentry frontend example error");
        }}
      >
        Throw sample error
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          Sentry.captureMessage("Sentry captured message (manual)");
        }}
      >
        Send captureMessage
      </Button>
    </main>
  );
}
