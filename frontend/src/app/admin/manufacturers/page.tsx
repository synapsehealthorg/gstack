import { createClient } from "@/utils/supabase/server";
import { formatRelativeTime } from "@/utils/format";
import Link from "next/link";
import { CheckCircle, XCircle, Search, Filter } from "lucide-react";

export default async function ManufacturersQueue({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const supabase = createClient();
  const currentTab = searchParams.tab || "unverified";
  
  // Base query
  let query = supabase
    .from("manufacturer_profiles")
    .select(`
      id,
      company_name,
      country,
      city,
      minimum_order_quantity,
      verified,
      is_premium,
      created_at,
      portfolio_images
    `);

  // Apply tab filter
  if (currentTab === "unverified") {
    query = query.eq("verified", false).order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Apply search filter if present
  if (searchParams.q) {
    query = query.ilike("company_name", `%${searchParams.q}%`);
  }

  const { data: manufacturers, error } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1117]">Manufacturer Queue</h1>
          <p className="text-[#64748b] mt-1">Review and verify new manufacturer applications.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search manufacturers..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
            defaultValue={searchParams.q || ""}
            // Add client-side navigation logic for search in a real app
          />
          <Search size={16} className="absolute left-3 top-2.5 text-[#9ca3af]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#e2e8f0] mb-6">
        <Link 
          href="/admin/manufacturers?tab=unverified"
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            currentTab === "unverified" 
              ? "border-[#6366f1] text-[#6366f1]" 
              : "border-transparent text-[#64748b] hover:text-[#0f1117] hover:border-[#cbd5e1]"
          }`}
        >
          Unverified Queue
        </Link>
        <Link 
          href="/admin/manufacturers?tab=all"
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            currentTab === "all" 
              ? "border-[#6366f1] text-[#6366f1]" 
              : "border-transparent text-[#64748b] hover:text-[#0f1117] hover:border-[#cbd5e1]"
          }`}
        >
          All Manufacturers
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center space-x-4 mb-6">
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-md text-sm text-[#334155] hover:bg-[#f8fafc]">
          <Filter size={14} />
          <span>Filter</span>
        </button>
        <div className="h-4 w-px bg-[#e2e8f0]"></div>
        <span className="text-sm text-[#64748b]">{manufacturers?.length || 0} manufacturers found</span>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4 font-medium">Company Name</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">MOQ</th>
                <th className="px-6 py-4 font-medium">Portfolio</th>
                <th className="px-6 py-4 font-medium">Applied</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#ef4444]">
                    Error loading manufacturers: {error.message}
                  </td>
                </tr>
              ) : manufacturers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748b]">
                    <CheckCircle size={32} className="mx-auto mb-3 text-[#10b981] opacity-50" />
                    <p className="text-base font-medium text-[#0f1117]">All caught up!</p>
                    <p className="mt-1">There are no manufacturers waiting for verification.</p>
                  </td>
                </tr>
              ) : (
                manufacturers?.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-[#0f1117] flex items-center space-x-2">
                          <span>{m.company_name}</span>
                          {m.verified && <CheckCircle size={14} className="text-[#10b981]" />}
                          {m.is_premium && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Premium</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#334155]">
                      {m.city}, {m.country}
                    </td>
                    <td className="px-6 py-4 text-[#334155]">
                      {m.minimum_order_quantity} units
                    </td>
                    <td className="px-6 py-4 text-[#334155]">
                      {m.portfolio_images ? m.portfolio_images.length : 0} items
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/manufacturers/${m.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white border border-[#e2e8f0] rounded-md text-sm font-medium text-[#0f1117] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
