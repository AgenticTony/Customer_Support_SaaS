import { cookies } from "next/headers";

import { AuthGuard, OrganizationGuard } from "@/modules/auth/ui/components";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

/**
 * Server component. Reads the sidebar cookie so the open/collapsed state
 * hydrates correctly (no expand-then-collapse flash on refresh).
 *
 * NOTE: the cookie name is the literal "sidebar_state" on purpose — importing
 * SIDEBAR_COOKIE_NAME from the shadcn sidebar resolves `undefined` under this
 * Turborepo SSR setup (it bit the course in ch.18). The literal matches the
 * constant in packages/ui/.../sidebar.tsx.
 */
export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  // `!== "false"` (not `=== "true"`) so a missing cookie defaults to OPEN,
  // matching SidebarProvider's default — first-time visitors see the full sidebar.
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AuthGuard>
      <OrganizationGuard>
        <SidebarProvider defaultOpen={defaultOpen}>
          <DashboardSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
