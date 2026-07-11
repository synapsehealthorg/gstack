import type { Metadata } from "next";
import MarketBoardHome from "@/components/market/MarketBoardHome";
import { requireAppSession } from "@/lib/server/app-session";

export const metadata: Metadata = {
  title: "Marketplace | Proov",
  description: "Browse verified manufacturers and live production opportunities on Proov.",
};

export default async function MarketplacePage() {
  const session = await requireAppSession();
  return (
    <MarketBoardHome
      currentUserId={session.userId}
      currentUserRole={session.role}
      currentUserName={session.displayName}
    />
  );
}
