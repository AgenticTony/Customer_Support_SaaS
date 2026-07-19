import { Inbox } from "lucide-react";

import { DashboardPlaceholder } from "@/modules/dashboard/ui/components/dashboard-placeholder";

export default function ConversationsPage() {
  return (
    <DashboardPlaceholder
      title="Conversations"
      icon={Inbox}
      description="Customer conversations handled by your AI agent — and the ones it escalates to you — will appear here."
    />
  );
}
