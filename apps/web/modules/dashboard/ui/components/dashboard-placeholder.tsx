import type { ComponentType } from "react";

import { SidebarTrigger } from "@workspace/ui/components/sidebar";

/**
 * Consistent shell for not-yet-built dashboard pages: a slim header (mobile
 * sidebar trigger + page title) and a centered, intentional empty state.
 * Empty screens are invitations to act, not dead ends.
 */
export function DashboardPlaceholder({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/60 px-4 backdrop-blur md:px-6">
        <SidebarTrigger className="-ml-1" />
        <span className="mx-1 hidden h-4 w-px bg-border md:block" />
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          {Icon ? (
            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm">
              <Icon className="size-5" />
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground">{description}</p>
          {action ? (
            <div className="mt-5 flex justify-center">{action}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
