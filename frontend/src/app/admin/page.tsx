import { createClient } from "@/utils/supabase/server";
import { formatCurrency } from "@/utils/format";
import { DollarSign, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminOverview() {
  const supabase = createClient();

  // Fetch aggregate stats
  // In a real app, you might want to use a database view or RPC for complex aggregations
  const [
    { data: activeOrders },
    { count: openDisputes },
    { count: pendingVerifications },
    { data: allOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id")
      .not("status", "in", '("completed","cancelled","disputed")'),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("manufacturer_profiles")
      .select("id", { count: "exact", head: true })
      .eq("verified", false),
    supabase
      .from("orders")
      .select("agreed_price")
      .neq("status", "cancelled"),
  ]);

  const totalGMV = allOrders?.reduce((sum, order) => sum + (order.agreed_price || 0), 0) || 0;
  const COMMISSION_RATE = 0.10; // 10% default
  const platformRevenue = totalGMV * COMMISSION_RATE;

  // Fetch recent activity (simulated with recent orders and bids for now, until we have an activity table)
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, status, created_at, agreed_price, buyer:buyer_profiles(company_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1117]">Platform Overview</h1>
          <p className="text-[#64748b]">Real-time marketplace metrics and operations.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total GMV (All Time)"
          value={formatCurrency(totalGMV)}
          icon={<DollarSign size={20} className="text-[#10b981]" />}
        />
        <MetricCard
          title="Platform Revenue (10%)"
          value={formatCurrency(platformRevenue)}
          icon={<DollarSign size={20} className="text-[#6366f1]" />}
        />
        <MetricCard
          title="Active Orders"
          value={activeOrders?.length || 0}
          icon={<Clock size={20} className="text-[#f59e0b]" />}
        />
        <MetricCard
          title="Open Disputes"
          value={openDisputes || 0}
          icon={<ShieldAlert size={20} className={openDisputes ? "text-[#ef4444]" : "text-[#10b981]"} />}
          alert={openDisputes && openDisputes > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0f1117] mb-4">Urgent Actions</h2>
          <div className="space-y-4">
            <QuickAction
              title="Verification Queue"
              count={pendingVerifications || 0}
              href="/admin/manufacturers"
              icon={<CheckCircle size={18} className="text-[#f59e0b]" />}
            />
            <QuickAction
              title="Open Disputes"
              count={openDisputes || 0}
              href="/admin/disputes"
              icon={<ShieldAlert size={18} className={openDisputes ? "text-[#ef4444]" : "text-[#9ca3af]"} />}
              urgent={openDisputes && openDisputes > 0}
            />
          </div>
        </div>

        {/* Activity Feed (Placeholder for actual admin_actions/logs) */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#0f1117] mb-4">Recent Platform Activity</h2>
          <div className="space-y-4">
            {recentOrders?.map((order) => (
              <div key={order.id} className="flex items-start space-x-4 pb-4 border-b border-[#f1f5f9] last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center flex-shrink-0 mt-1">
                  <Package size={14} className="text-[#6366f1]" />
                </div>
                <div>
                  <p className="text-[#0f1117] font-medium">
                    New Order Created: {order.id.slice(0, 8)}
                  </p>
                  <p className="text-[#64748b] text-sm mt-0.5">
                    {/* @ts-ignore - Supabase join typing can be tricky */}
                    {order.buyer?.company_name || 'A buyer'} started an order for {formatCurrency(order.agreed_price || 0)}.
                  </p>
                  <p className="text-[#94a3b8] text-xs mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {recentOrders?.length === 0 && (
              <p className="text-[#64748b] text-sm italic">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, alert }: { title: string; value: string | number; icon: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-6 shadow-sm ${alert ? 'border-[#ef4444] bg-red-50/10' : 'border-[#e2e8f0]'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#64748b] font-medium text-sm">{title}</h3>
        <div className="p-2 bg-[#f8fafc] rounded-lg">
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${alert ? 'text-[#ef4444]' : 'text-[#0f1117]'}`}>{value}</p>
    </div>
  );
}

function QuickAction({ title, count, href, icon, urgent }: { title: string; count: number; href: string; icon: React.ReactNode; urgent?: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 rounded-lg border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors group">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-[#334155] group-hover:text-[#0f1117] transition-colors">{title}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          urgent ? 'bg-[#ef4444] text-white' : count > 0 ? 'bg-[#6366f1] text-white' : 'bg-[#e2e8f0] text-[#64748b]'
        }`}>
          {count}
        </span>
        <span className="text-[#9ca3af]">→</span>
      </div>
    </Link>
  );
}

// Simple Package icon since we didn't import it at the top
function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
