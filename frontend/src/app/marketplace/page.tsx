import type { Metadata } from "next";
import Link from "next/link";
import MarketBoardHome from "@/components/market/MarketBoardHome";

export const metadata: Metadata = {
  title: "Marketplace | Proov",
  description: "Browse verified manufacturers and live production opportunities on Proov.",
};

export default function PublicMarketplacePage() {
  return <main className="min-h-screen bg-[#f8fafc]">
    <nav className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-3 sm:px-9">
      <Link href="/" className="font-semibold tracking-tight text-[#0f172a]">proov.to</Link>
      <div className="flex items-center gap-2"><Link href="/login" className="market-btn">Sign in</Link><Link href="/login" className="market-btn-primary">Join marketplace</Link></div>
    </nav>
    <MarketBoardHome currentUserId="" currentUserRole="guest" currentUserName="Guest" />
  </main>;
}
