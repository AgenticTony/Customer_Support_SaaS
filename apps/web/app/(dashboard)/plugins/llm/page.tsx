import { Cpu } from "lucide-react";

import { DashboardPlaceholder } from "@/modules/dashboard/ui/components/dashboard-placeholder";

export default function AIProviderPage() {
  return (
    <DashboardPlaceholder
      title="AI Provider"
      icon={Cpu}
      description="Connect an OpenAI-compatible LLM provider to power voice and chat with your own key."
    />
  );
}
