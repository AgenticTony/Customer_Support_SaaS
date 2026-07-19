"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  Blocks,
  Cpu,
  CreditCard,
  Inbox,
  LibraryBig,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const customerSupportItems: NavItem[] = [
  { title: "Conversations", url: "/conversations", icon: Inbox },
  { title: "Knowledge Base", url: "/files", icon: LibraryBig },
];

const configurationItems: NavItem[] = [
  { title: "Widget Customization", url: "/customization", icon: Palette },
  { title: "Integrations", url: "/integrations", icon: Blocks },
  { title: "AI Provider", url: "/plugins/llm", icon: Cpu },
];

const accountItems: NavItem[] = [
  { title: "Plans & Billing", url: "/billing", icon: CreditCard },
];

const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "Customer Support", items: customerSupportItems },
  { label: "Configuration", items: configurationItems },
  { label: "Account", items: accountItems },
];

/** Sound-wave mark — the brand signature, tying Echo to its voice-AI core. */
function EchoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect x="3" y="8.5" width="3" height="7" rx="1.5" fill="currentColor" />
      <rect
        x="8.5"
        y="5.5"
        width="3"
        height="13"
        rx="1.5"
        fill="currentColor"
      />
      <rect
        x="14"
        y="3"
        width="3"
        height="18"
        rx="1.5"
        fill="currentColor"
        opacity={0.6}
      />
      <rect
        x="19.5"
        y="7"
        width="3"
        height="10"
        rx="1.5"
        fill="currentColor"
        opacity={0.35}
      />
    </svg>
  );
}

// Full literal selectors (NOT interpolated) so Tailwind's source scanner emits
// the collapsed-variant rules — `${var}:hidden!` would never be generated.
const orgSwitcherAppearance = {
  elements: {
    rootBox: "w-full! h-8!",
    avatarBox: "size-4! rounded-sm!",
    organizationSwitcherTrigger:
      "w-full! justify-start! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
    organizationPreview: "group-data-[collapsible=icon]:justify-center! gap-2!",
    organizationPreviewTextContainer:
      "group-data-[collapsible=icon]:hidden! text-xs! font-medium! text-sidebar-foreground!",
    organizationSwitcherTriggerIcon:
      "group-data-[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground!",
  },
};

const userButtonAppearance = {
  elements: {
    rootBox: "w-full! h-8!",
    userButtonTrigger:
      "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
    userButtonBox:
      "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-sidebar-foreground!",
    userButtonOuterIdentifier: "pl-0! group-data-[collapsible=icon]:hidden!",
    avatarBox: "size-4!",
  },
};

export function DashboardSidebar() {
  const pathname = usePathname();
  // Exact match or a real path-segment prefix, so /files won't highlight /files-archive.
  const isActive = (url: string) =>
    url === "/"
      ? pathname === url
      : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader>
        <div className="flex h-14 items-center gap-2.5 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm ring-1 ring-white/10">
            <EchoMark className="size-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Echo
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <OrganizationSwitcher
                    hidePersonal
                    skipInvitationScreen
                    afterSelectOrganizationUrl="/conversations"
                    appearance={orgSwitcherAppearance}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          active &&
                            "bg-gradient-to-b from-sidebar-primary to-[#6366f1]! text-sidebar-primary-foreground! shadow-sm hover:to-[#6366f1]/90!",
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <UserButton showName appearance={userButtonAppearance} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
