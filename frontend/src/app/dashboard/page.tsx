import Link from "next/link";
import { Suspense } from "react";
import { requireAppSession } from "@/lib/server/app-session";
import { getPilotOrders } from "@/lib/server/pilot-data";

// Stat cards that stream in after data loads
async function DashboardStats({ session }: { session: Awaited<ReturnType<typeof requireAppSession>> }) {
  const orders = await getPilotOrders(session);
  const active = orders.filter(
    (o) => !["completed", "disputed"].includes(o.status)
  ).length;
  const awaitingEscrow = orders.filter((o) => o.escrow_status === "pending").length;
  const disputed = orders.filter((o) => o.status === "disputed").length;

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      {(
        [
          ["Active orders", active],
          ["Awaiting escrow", awaitingEscrow],
          ["Disputes", disputed],
        ] as [string, number][]
      ).map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
      ))}
    </section>
  );
}

// Skeleton shown while stats stream in
function StatsSkeleton() {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse"
        >
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-3 h-9 w-12 rounded bg-slate-200" />
        </div>
      ))}
    </section>
  );
}

export default async function DashboardPage() {
  // Only session is awaited before streaming the shell — stats stream in separately
  const session = await requireAppSession();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        {/* Page shell renders immediately */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              {session.role} workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Welcome, {session.displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Run real RFQs, bids, orders, and manual escrow from the pilot
              workflow.
            </p>
          </div>
          <Link href="/settings" className="market-btn">
            Account settings
          </Link>
        </header>

        {/* Stats stream in with Suspense — page shell visible immediately */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats session={session} />
        </Suspense>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/marketplace"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-violet-300 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Marketplace
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {session.role === "manufacturer"
                ? "Find RFQs and manage bids"
                : "Publish RFQs and compare bids"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              All accepted bids use the atomic order-creation workflow.
            </p>
          </Link>
          <Link
            href="/orders"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-violet-300 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Execution
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Open order workspaces
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track messages, milestones, evidence, escrow, shipping, and
              disputes.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
