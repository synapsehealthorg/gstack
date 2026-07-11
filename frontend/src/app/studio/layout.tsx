import { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

// The /studio index page renders inside the sidebar shell.
// The nested [productId] layout below overrides this to go full-screen.
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
