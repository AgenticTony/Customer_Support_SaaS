"use client";

import { use } from "react";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";

interface Props {
  searchParams: Promise<{ organizationId: string }>;
}

/**
 * The widget entry. The embed script (ch. 34) loads this in an iframe with the
 * org id as a query param: `/?organizationId=<id>`. React `use()` unwraps the
 * searchParams promise (Next 15+). Capitalization of `organizationId` matters
 * everywhere — it must match the embed URL and the Clerk/Convex org id.
 */
export default function Page({ searchParams }: Props) {
  const { organizationId } = use(searchParams);
  return (
    <div className="h-svh w-full">
      <WidgetView organizationId={organizationId} />
    </div>
  );
}
