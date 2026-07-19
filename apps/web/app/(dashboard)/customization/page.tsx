import { Palette } from "lucide-react";

import { DashboardPlaceholder } from "@/modules/dashboard/ui/components/dashboard-placeholder";

export default function CustomizationPage() {
  return (
    <DashboardPlaceholder
      title="Widget Customization"
      icon={Palette}
      description="Shape the widget your customers see — greeting, suggested prompts, and voice."
    />
  );
}
