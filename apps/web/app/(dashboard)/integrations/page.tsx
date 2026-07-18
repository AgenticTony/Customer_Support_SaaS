import { Blocks } from "lucide-react";

import { DashboardPlaceholder } from "@/modules/dashboard/ui/components/dashboard-placeholder";

export default function IntegrationsPage() {
  return (
    <DashboardPlaceholder
      title="Integrations"
      icon={Blocks}
      description="Embed the support widget on any site with a drop-in script. Snippets for HTML, React, and Next.js will live here."
    />
  );
}
