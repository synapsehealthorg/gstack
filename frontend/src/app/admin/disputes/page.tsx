import { createClient } from "@/utils/supabase/server";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, Search, Filter } from "lucide-react";

export default async function DisputeQueue({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string };
}) {
  const supabase = createClient();
  const currentFilter = searchParams.filter || "open";
  
  // Base query
  let query = supabase
    .from("disputes")
    .select(`
      *,
      order:orders(id, agreed_price, inquiry_id),
      filer:profiles!disputes_filed_by_fkey(user_type)
    `);

  // Apply status filter
  if (currentFilter === "open") {
    query = query.in("status", ["open", "under_review"]).order("created_at", { ascending: true });
  } else if (currentFilter === "resolved") {
    query = query.in("status", ["resolved_buyer", "resolved_manufacturer", "closed"]).order("resolved_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: disputes, error } = await query;

  // Calculate urgency (Days open)
  const getDaysOpen = (createdAt: string) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(createdAt).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1117]">Arbitration Console</h1>
          <p className="text-[#64748b] mt-1">Resolve active marketplace disputes.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search disputes..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
            defaultValue={searchParams.q || ""}
          />
          <Search size={16} className="absolute left-3 top-2.5 text-[#9ca3af]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#e2e8f0] mb-6">
        <Link 
          href="/admin/disputes?filter=open"
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            currentFilter === "open" 
              ? "border-[#ef4444] text-[#ef4444]" 
              : "border-transparent text-[#64748b] hover:text-[#0f1117] hover:border-[#cbd5e1]"
          }`}
        >
          Active Disputes
        </Link>
        <Link 
          href="/admin/disputes?filter=resolved"
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            currentFilter === "resolved" 
              ? "border-[#10b981] text-[#10b981]" 
              : "border-transparent text-[#64748b] hover:text-[#0f1117] hover:border-[#cbd5e1]"
          }`}
        >
          Resolved Cases
        </Link>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4 font-medium">Dispute ID</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Filed By</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">At Stake</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Age</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#ef4444]">
                    Error loading disputes: {error.message}
                  </td>
                </tr>
              ) : disputes?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#64748b]">
                    <CheckCircle2 size={32} className="mx-auto mb-3 text-[#10b981] opacity-50" />
                    <p className="text-base font-medium text-[#0f1117]">Zero Active Disputes!</p>
                    <p className="mt-1">The marketplace is peaceful right now.</p>
                  </td>
                </tr>
              ) : (
                disputes?.map((d) => {
                  const daysOpen = getDaysOpen(d.created_at);
                  const isUrgent = daysOpen >= 3 && d.status === "open";
                  
                  return (
                    <tr key={d.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[#64748b]">
                        {d.id.split("-")[0]}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${d.order_id}`} className="text-[#6366f1] hover:underline">
                          Order {d.order_id.split("-")[0]}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{d.filer?.user_type || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 text-[#334155] capitalize">
                        {d.reason.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#0f1117]">
                        {/* @ts-ignore */}
                        {formatCurrency(d.order?.agreed_price || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          d.status === "open" ? "bg-red-100 text-red-800" :
                          d.status === "under_review" ? "bg-amber-100 text-amber-800" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          {d.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {d.status === "open" || d.status === "under_review" ? (
                          <div className={`flex items-center space-x-1 ${isUrgent ? 'text-[#ef4444] font-medium' : 'text-[#64748b]'}`}>
                            <Clock size={14} />
                            <span>{daysOpen} days</span>
                            {isUrgent && <AlertCircle size={14} className="ml-1" />}
                          </div>
                        ) : (
                          <span className="text-[#64748b]">Resolved</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/disputes/${d.id}`}
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            isUrgent 
                              ? "bg-[#ef4444] text-white hover:bg-[#dc2626]" 
                              : "bg-white border border-[#e2e8f0] text-[#0f1117] hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
                          }`}
                        >
                          Workspace →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
