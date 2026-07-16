import { AuthLayout } from "@/modules/auth/ui/layouts";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
