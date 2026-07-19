import { cn } from "@workspace/ui/lib/utils";

interface WidgetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable widget header — a brand indigo gradient. All future widget screens
 * (auth, inbox, chat, voice) render their title/state inside this.
 */
export const WidgetHeader = ({ children, className }: WidgetHeaderProps) => (
  <header
    className={cn(
      "bg-gradient-to-b from-[#4338ca] to-[#6366f1] p-4 text-primary-foreground",
      className,
    )}
  >
    {children}
  </header>
);
