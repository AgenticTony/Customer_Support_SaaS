"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { AuthLayout } from "@/modules/auth/ui/layouts";
import { SignInView } from "@/modules/auth/ui/views";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLoading>
        <AuthLayout>
          <p>Loading...</p>
        </AuthLayout>
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </>
  );
};
