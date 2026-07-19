"use client";

import { HomeIcon, InboxIcon, type LucideIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

// The real Jotai screen router lands in ch. 11; `active` will be derived from
// the current screen then. Hard-coded for now (Home = "selection" screen).
const navItems: { icon: LucideIcon; label: string; active: boolean }[] = [
  { icon: HomeIcon, label: "Home", active: true },
  { icon: InboxIcon, label: "Inbox", active: false },
];

/**
 * Reusable widget footer — primary navigation. Buttons are no-ops for now;
 * ch. 11 wires them to the screen router.
 */
export const WidgetFooter = () => (
  <footer className="flex items-center justify-between border-t border-border bg-background">
    {navItems.map(({ icon: Icon, label, active }) => (
      <Button
        key={label}
        variant="ghost"
        size="icon"
        className="h-14 flex-1 rounded-none"
        aria-label={label}
      >
        <Icon className={cn("size-5", active && "text-primary")} />
      </Button>
    ))}
  </footer>
);
