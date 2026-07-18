import { LibraryBig } from "lucide-react";

import { DashboardPlaceholder } from "@/modules/dashboard/ui/components/dashboard-placeholder";

export default function FilesPage() {
  return (
    <DashboardPlaceholder
      title="Knowledge Base"
      icon={LibraryBig}
      description="Upload your docs here. The AI grounds its answers in them, so customers get responses specific to your business."
    />
  );
}
