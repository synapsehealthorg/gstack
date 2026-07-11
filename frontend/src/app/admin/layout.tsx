import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getOptionalAppSession } from "@/lib/server/app-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getOptionalAppSession();
  if (!session || session.role !== "admin") redirect("/dashboard");
  return <AdminShell>{children}</AdminShell>;
}
