"use client";

import Link from "next/link";
import { Activity, ArrowUpRight, CircleDollarSign, Clock3, Gavel, Package, ShieldCheck, TrendingUp } from "lucide-react";
import { adminDisputes, adminOrders, adminPayouts } from "@/components/admin/admin-data";
import { PageHeader, StatCard, StatusBadge, secondaryButton } from "@/components/admin/AdminUI";

const revenue = [42, 54, 48, 68, 62, 78, 72, 86, 92, 88, 108, 121];

export default function AdminOverview() {
  const totalGmv = adminOrders.reduce((sum, order) => sum + order.value, 0);
  const pendingPayouts = adminPayouts.filter((payout) => payout.status === "pending").reduce((sum, payout) => sum + payout.net, 0);
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Friday, June 20" title="Platform overview" description="Live marketplace operations, financial movement, and the work that needs attention." actions={<Link href="/admin/logs" className={secondaryButton}>View audit trail <ArrowUpRight size={14} /></Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross merchandise value" value={`$${(totalGmv / 1000).toFixed(1)}k`} detail="+18.2% from last month" icon={<TrendingUp size={18} />} />
        <StatCard label="Active production" value={String(adminOrders.filter((order) => !["shipped", "completed"].includes(order.status)).length)} detail="Across 5 manufacturers" icon={<Package size={18} />} tone="emerald" />
        <StatCard label="Pending payouts" value={`$${(pendingPayouts / 1000).toFixed(1)}k`} detail="2 releases need approval" icon={<CircleDollarSign size={18} />} tone="amber" />
        <StatCard label="Open disputes" value={String(adminDisputes.filter((dispute) => dispute.status !== "resolved").length)} detail="2 are outside target SLA" icon={<Gavel size={18} />} tone="rose" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-zinc-950">GMV momentum</h2><p className="mt-1 text-xs text-zinc-500">Rolling twelve-week settled order value</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">+18.2%</span></div>
          <div className="mt-7 flex h-44 items-end gap-2 border-b border-zinc-200 pb-px">
            {revenue.map((value, index) => <div key={index} className="group flex h-full flex-1 items-end"><div title={`Week ${index + 1}: $${value}k`} className="w-full rounded-t bg-violet-100 transition hover:bg-violet-500" style={{ height: `${Math.round((value / 121) * 100)}%` }} /></div>)}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-zinc-400"><span>Apr 4</span><span>May 9</span><span>Jun 20</span></div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-950">Priority queue</h2><p className="mt-1 text-xs text-zinc-500">Ordered by operational impact</p>
          <div className="mt-4 space-y-2">
            <Priority href="/admin/disputes" icon={<Gavel size={16} />} title="2 disputes outside SLA" detail="$26.5k at risk" urgent />
            <Priority href="/admin/payouts" icon={<CircleDollarSign size={16} />} title="2 payouts awaiting release" detail="$7.5k net" />
            <Priority href="/admin/manufacturers" icon={<ShieldCheck size={16} />} title="3 verification reviews" detail="Oldest waiting 5 hours" />
            <Priority href="/admin/market" icon={<Activity size={16} />} title="1 RFQ risk flag" detail="Unusual bid velocity" />
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div><h2 className="font-semibold text-zinc-950">Orders in motion</h2><p className="mt-0.5 text-xs text-zinc-500">Production and escrow health</p></div><Link href="/admin/orders" className="text-xs font-semibold text-violet-600 hover:text-violet-700">View all</Link></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400"><th className="px-5 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Progress</th><th className="px-4 py-3 font-semibold">Value</th><th className="px-5 py-3 font-semibold">Due</th></tr></thead><tbody className="divide-y divide-zinc-100">{adminOrders.slice(0, 5).map((order) => <tr key={order.id} className="hover:bg-zinc-50"><td className="px-5 py-3"><p className="text-xs font-semibold text-zinc-900">{order.title}</p><p className="mt-0.5 text-[11px] text-zinc-400">{order.id} · {order.manufacturer}</p></td><td className="px-4 py-3"><StatusBadge status={order.status} /></td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-24 rounded-full bg-zinc-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${order.progress}%` }} /></div><span className="text-[11px] text-zinc-500">{order.progress}%</span></div></td><td className="px-4 py-3 text-xs font-semibold text-zinc-700">${order.value.toLocaleString()}</td><td className="px-5 py-3 text-xs text-zinc-500">{order.due}</td></tr>)}</tbody></table></div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-950">Platform health</h2><p className="mt-1 text-xs text-zinc-500">Core service status</p>
          <div className="mt-5 space-y-4"><Health label="Marketplace API" value="99.99%" /><Health label="Escrow webhooks" value="99.95%" /><Health label="AI generation" value="99.72%" warning /><Health label="Notification delivery" value="99.98%" /></div>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600"><Clock3 size={15} className="text-zinc-400" />Last checked 36 seconds ago</div>
        </section>
      </div>
    </div>
  );
}

function Priority({ href, icon, title, detail, urgent }: { href: string; icon: React.ReactNode; title: string; detail: string; urgent?: boolean }) {
  return <Link href={href} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 transition hover:border-violet-200 hover:bg-violet-50/40"><span className={`rounded-lg p-2 ${urgent ? "bg-rose-50 text-rose-600" : "bg-zinc-100 text-zinc-500"}`}>{icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-zinc-800">{title}</span><span className="mt-0.5 block text-[11px] text-zinc-500">{detail}</span></span><ArrowUpRight size={14} className="text-zinc-300" /></Link>;
}

function Health({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return <div><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-zinc-700">{label}</span><span className={warning ? "text-amber-600" : "text-emerald-600"}>{value}</span></div><div className="h-1.5 rounded-full bg-zinc-100"><div className={`h-full rounded-full ${warning ? "w-[86%] bg-amber-400" : "w-[98%] bg-emerald-500"}`} /></div></div>;
}
