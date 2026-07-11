import { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
