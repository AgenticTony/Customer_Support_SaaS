"use client";

import { WidgetFooter } from "@/modules/widget/ui/components/widget-footer";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

interface WidgetViewProps {
  organizationId: string;
}

/**
 * The widget shell: a rounded card with a gradient header (greeting), a body
 * (chat area — filled in later chapters), and a nav footer. Renders inside a
 * fixed-size iframe (ch. 34 embed); `organizationId` selects the org whose
 * config/greeting the widget shows (wired up in ch. 10+).
 *
 * "use client" now so ch. 10 can dynamically import it with SSR disabled.
 */
export const WidgetView = ({ organizationId }: WidgetViewProps) => {
  return (
    <main
      data-organization-id={organizationId}
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
    >
      <WidgetHeader>
        <div className="flex flex-col justify-end gap-y-1 px-2 pb-5 pt-7">
          <p className="text-2xl font-semibold tracking-tight">Hi there! 👋</p>
          <p className="text-sm text-primary-foreground/80">
            How can we help you today?
          </p>
        </div>
      </WidgetHeader>
      {/* Chat body arrives in later chapters (conversations / inbox). */}
      <div className="flex flex-1 flex-col" />
      <WidgetFooter />
    </main>
  );
};
