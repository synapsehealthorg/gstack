import Link from "next/link";
import { Suspense } from "react";
import { requireAppSession } from "@/lib/server/app-session";
import { getPilotOrders } from "@/lib/server/pilot-data";
import {
  BriefBoardClient,
  KanbanBoardClient,
} from "@/components/orders/OrderBoardsClient";

function OrdersBoardSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-64 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="h-5 w-24 rounded bg-slate-200 mb-4" />
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="h-4 w-full rounded bg-slate-200 mb-2" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

async function OrdersBoard({
  isListView,
  session,
}: {
  isListView: boolean;
  session: Awaited<ReturnType<typeof requireAppSession>>;
}) {
  const orders = await getPilotOrders(session);
  return isListView ? (
    <BriefBoardClient
      orders={orders}
      currentUserId={session.userId}
      currentUserRole={session.role}
    />
  ) : (
    <KanbanBoardClient
      orders={orders}
      currentUserId={session.userId}
      currentUserRole={session.role}
    />
  );
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [searchParams, session] = await Promise.all([
    props.searchParams,
    requireAppSession(),
  ]);
  const isListView = searchParams.view === "list";

  return (
    <main className="mx-auto flex min-h-screen max-w-[1500px] flex-col bg-[#f8fafc] px-5 py-8">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {session.role} workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Persisted sourcing, production, escrow, and dispute activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
            <Link
              href="/orders?view=kanban"
              className={`rounded-md px-3 py-1.5 ${
                !isListView ? "bg-slate-950 text-white" : "text-slate-600"
              }`}
            >
              Board
            </Link>
            <Link
              href="/orders?view=list"
              className={`rounded-md px-3 py-1.5 ${
                isListView ? "bg-slate-950 text-white" : "text-slate-600"
              }`}
            >
              List
            </Link>
          </div>
          <Link href="/marketplace" className="market-btn">
            Marketplace
          </Link>
          {session.role === "buyer" && (
            <Link href="/orders/new" className="market-btn-primary">
              New RFQ
            </Link>
          )}
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-hidden">
        <Suspense fallback={<OrdersBoardSkeleton />}>
          <OrdersBoard isListView={isListView} session={session} />
        </Suspense>
      </section>
    </main>
  );
}
