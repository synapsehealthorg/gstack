import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Star, AlertTriangle, Building, MapPin, Globe, Package, Calendar } from "lucide-react";
import Image from "next/image";

export default async function ManufacturerReview({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: manufacturer, error } = await supabase
    .from("manufacturer_profiles")
    .select(`
      *,
      user:id (email, created_at)
    `)
    .eq("id", params.id)
    .single();

  if (error || !manufacturer) {
    notFound();
  }

  // Fetch some stats for this manufacturer (bids, orders)
  const [{ count: bidsCount }, { count: ordersCount }] = await Promise.all([
    supabase.from("bids").select("id", { count: "exact", head: true }).eq("manufacturer_id", params.id),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("manufacturer_id", params.id)
  ]);

  return (
    <div className="flex h-full">
      {/* Left Side: Profile Data */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-[#e2e8f0]">
        <div className="mb-6">
          <Link href="/admin/manufacturers" className="inline-flex items-center text-[#64748b] hover:text-[#0f1117] transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" />
            Back to Queue
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f1117] flex items-center space-x-3">
              <span>{manufacturer.company_name}</span>
              {manufacturer.verified && <CheckCircle size={24} className="text-[#10b981]" />}
              {manufacturer.is_premium && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center">
                  <Star size={12} className="mr-1 fill-amber-800" /> Premium
                </span>
              )}
            </h1>
            <p className="text-[#64748b] mt-2 flex items-center">
              <MapPin size={16} className="mr-1.5" />
              {manufacturer.city}, {manufacturer.country}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
            <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-1">Account Created</p>
            <p className="font-medium text-[#0f1117] flex items-center">
              <Calendar size={16} className="mr-2 text-[#9ca3af]" />
              {/* @ts-ignore */}
              {new Date(manufacturer.user?.created_at || manufacturer.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
            <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-1">Total Bids</p>
            <p className="font-medium text-[#0f1117] text-xl">{bidsCount || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
            <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-1">Orders Won</p>
            <p className="font-medium text-[#0f1117] text-xl">{ordersCount || 0}</p>
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-[#0f1117] mb-4 flex items-center">
              <Building size={18} className="mr-2 text-[#64748b]" />
              Company Bio & Capabilities
            </h2>
            <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] text-[#334155] leading-relaxed">
              {manufacturer.bio || "No bio provided."}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f1117] mb-4 flex items-center">
              <Package size={18} className="mr-2 text-[#64748b]" />
              Production Details
            </h2>
            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-[#e2e8f0]">
                <div className="p-4">
                  <p className="text-[#64748b] text-sm mb-1">Minimum Order Quantity (MOQ)</p>
                  <p className="font-medium text-[#0f1117]">{manufacturer.minimum_order_quantity} units</p>
                </div>
                <div className="p-4">
                  <p className="text-[#64748b] text-sm mb-1">Website</p>
                  <p className="font-medium text-[#6366f1]">
                    {manufacturer.website ? (
                      <a href={manufacturer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {manufacturer.website}
                      </a>
                    ) : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f1117] mb-4">Portfolio ({manufacturer.portfolio_images?.length || 0})</h2>
            {manufacturer.portfolio_images && manufacturer.portfolio_images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {manufacturer.portfolio_images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-[#e2e8f0] bg-[#f8fafc]">
                    <img src={img} alt={`Portfolio ${i+1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-xl p-8 text-center text-[#64748b]">
                No portfolio items uploaded yet.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Right Side: Action Panel */}
      <div className="w-96 bg-white overflow-y-auto border-l border-[#e2e8f0] flex flex-col">
        <div className="p-6 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h2 className="text-sm font-bold text-[#475569] uppercase tracking-wider mb-1">Verification Decision</h2>
          <p className="text-xs text-[#64748b]">Every action is logged in the audit trail.</p>
        </div>
        
        <div className="p-6 space-y-4">
          {!manufacturer.verified ? (
            <>
              <form action={`/api/admin/manufacturers/${manufacturer.id}/verify`} method="POST">
                <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-3 rounded-lg font-medium transition-colors">
                  <CheckCircle size={18} />
                  <span>Approve & Verify</span>
                </button>
                <p className="text-xs text-center text-[#64748b] mt-2">Sets verified = true & sends welcome email</p>
              </form>

              <form action={`/api/admin/manufacturers/${manufacturer.id}/reject`} method="POST">
                <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-white border border-[#ef4444] text-[#ef4444] hover:bg-red-50 px-4 py-3 rounded-lg font-medium transition-colors">
                  <XCircle size={18} />
                  <span>Reject Application</span>
                </button>
                <p className="text-xs text-center text-[#64748b] mt-2">Will prompt for rejection reason</p>
              </form>
            </>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <CheckCircle size={24} className="text-[#10b981] mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-900">Verified Manufacturer</p>
              <p className="text-xs text-emerald-700 mt-1">This manufacturer is fully active.</p>
            </div>
          )}

          <hr className="border-[#e2e8f0] my-6" />

          <h3 className="text-sm font-bold text-[#475569] uppercase tracking-wider mb-4">Account Controls</h3>

          <form action={`/api/admin/manufacturers/${manufacturer.id}/set-premium`} method="POST">
            <button type="submit" className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              manufacturer.is_premium 
                ? "bg-white border border-[#cbd5e1] text-[#64748b] hover:bg-[#f8fafc]" 
                : "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200"
            }`}>
              <Star size={18} className={manufacturer.is_premium ? "" : "fill-amber-800"} />
              <span>{manufacturer.is_premium ? "Remove Premium Status" : "Mark as Premium"}</span>
            </button>
          </form>

          <form action={`/api/admin/users/${manufacturer.id}/suspend`} method="POST" className="pt-4">
            <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-white border border-[#e2e8f0] hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-red-50 text-[#64748b] px-4 py-3 rounded-lg font-medium transition-colors">
              <AlertTriangle size={18} />
              <span>Suspend Account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
