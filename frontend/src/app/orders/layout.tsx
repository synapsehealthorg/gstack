import { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
