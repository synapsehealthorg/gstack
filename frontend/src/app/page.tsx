import { redirect } from "next/navigation";
import { getOptionalAppSession } from "@/lib/server/app-session";

export default async function RootPage() {
  const session = await getOptionalAppSession();
  if (session) redirect("/dashboard");
  redirect("/login");
}
