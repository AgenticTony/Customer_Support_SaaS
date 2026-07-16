"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const addUser = useMutation(api.users.add);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6">
      <UserButton />
      <OrganizationSwitcher hidePersonal />
      <Button
        size="sm"
        onClick={() => {
          addUser({}).catch((error) => console.error(error));
        }}
      >
        Add user
      </Button>
    </main>
  );
}
