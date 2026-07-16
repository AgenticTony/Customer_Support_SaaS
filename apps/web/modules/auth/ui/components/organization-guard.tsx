"use client";

import { useOrganization } from "@clerk/nextjs";

import { AuthLayout } from "@/modules/auth/ui/layouts";
import { OrgSelectionView } from "@/modules/auth/ui/views";

export const OrganizationGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded, organization } = useOrganization();

  // Avoid flashing OrgSelectionView while Clerk hydrates the active org.
  if (!isLoaded) {
    return null;
  }

  if (!organization) {
    return (
      <AuthLayout>
        <OrgSelectionView />
      </AuthLayout>
    );
  }

  return <>{children}</>;
};
