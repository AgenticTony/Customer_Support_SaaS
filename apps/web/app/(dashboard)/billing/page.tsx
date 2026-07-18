import { CreditCard } from "lucide-react";

import { DashboardPlaceholder } from "@/modules/dashboard/ui/components/dashboard-placeholder";

export default function BillingPage() {
  return (
    <DashboardPlaceholder
      title="Plans & Billing"
      icon={CreditCard}
      description="Manage your plan, usage, and billing details."
    />
  );
}
