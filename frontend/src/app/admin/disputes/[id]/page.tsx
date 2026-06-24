import { createClient } from "@/utils/supabase/server";
import { formatCurrency } from "@/utils/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, AlertTriangle, FileText, Download, CheckCircle, Scale, ShieldAlert, FileImage } from "lucide-react";

export default async function ArbitrationWorkspace({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dispute, error } = await supabase
    .from("disputes")
    .select(`
      *,
      order:orders(id, agreed_price, status, created_at),
      filer:profiles!disputes_filed_by_fkey(user_type, full_name)
    `)
    .eq("id", id)
    .single();

  if (error || !dispute) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, attachment_urls, message_type, created_at, sender:profiles(full_name)")
    .eq("order_id", dispute.order_id)
    .order("created_at", { ascending: true });

  const orderMessages = (messages || []) as Array<{
    id: string;
    content: string;
    attachment_urls: string[] | null;
    message_type: string;
    created_at: string;
    sender: { full_name: string | null } | Array<{ full_name: string | null }> | null;
  }>;

  const isUrgent = dispute.status === "open" && 
    Math.ceil(Math.abs(new Date().getTime() - new Date(dispute.created_at).getTime()) / (1000 * 60 * 60 * 24)) >= 3;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="px-8 py-4 bg-white border-b border-[#e2e8f0] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/admin/disputes" className="text-[#64748b] hover:text-[#0f1117] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-[#e2e8f0]"></div>
          <div>
            <h1 className="text-xl font-bold text-[#0f1117] flex items-center space-x-3">
              <span>Arbitration Workspace</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                dispute.status === "open" ? "bg-red-100 text-red-800" :
                dispute.status === "under_review" ? "bg-amber-100 text-amber-800" :
                "bg-emerald-100 text-emerald-800"
              }`}>
                {dispute.status.replace("_", " ")}
              </span>
              {isUrgent && (
                <span className="flex items-center text-xs font-bold text-[#ef4444] uppercase tracking-wider">
                  <AlertTriangle size={14} className="mr-1" /> URGENT SLA
                </span>
              )}
            </h1>
            <p className="text-[#64748b] text-sm mt-0.5">Dispute ID: {dispute.id}</p>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUMN 1: CASE BRIEF */}
        <div className="w-80 bg-white border-r border-[#e2e8f0] overflow-y-auto flex-shrink-0 p-6 flex flex-col space-y-6">
          <div>
            <h2 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3 flex items-center">
              <FileText size={14} className="mr-2" /> Case Brief
            </h2>
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-[#e2e8f0] space-y-3 text-sm">
              <div>
                <p className="text-[#64748b] text-xs mb-0.5">Order</p>
                <Link href={`/admin/orders/${dispute.order_id}`} className="font-medium text-[#6366f1] hover:underline">
                  {dispute.order_id.split("-")[0]}
                </Link>
              </div>
              <div>
                <p className="text-[#64748b] text-xs mb-0.5">Amount at Stake</p>
                <p className="font-medium text-[#0f1117]">{formatCurrency(dispute.order?.agreed_price || 0)}</p>
              </div>
              <div>
                <p className="text-[#64748b] text-xs mb-0.5">Filed By</p>
                <p className="font-medium text-[#0f1117] capitalize">
                  {dispute.filer?.full_name || "Order party"} ({dispute.filer?.user_type})
                </p>
              </div>
              <div>
                <p className="text-[#64748b] text-xs mb-0.5">Reason Code</p>
                <p className="font-medium text-[#0f1117] capitalize">{dispute.reason.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-[#64748b] text-xs mb-0.5">Filed Date</p>
                <p className="font-medium text-[#0f1117]">{new Date(dispute.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Timeline</h2>
            <div className="relative pl-4 space-y-4 before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-[#e2e8f0]">
              <div className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 rounded-full bg-[#10b981] ring-4 ring-white top-1"></div>
                <p className="text-xs font-medium text-[#0f1117]">Order Created</p>
                <p className="text-[10px] text-[#64748b]">{new Date(dispute.order?.created_at).toLocaleDateString()}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 rounded-full bg-[#ef4444] ring-4 ring-white top-1"></div>
                <p className="text-xs font-medium text-[#0f1117]">Dispute Filed</p>
                <p className="text-[10px] text-[#64748b]">{new Date(dispute.created_at).toLocaleDateString()}</p>
              </div>
              {dispute.status !== "open" && dispute.status !== "under_review" && (
                <div className="relative">
                  <div className="absolute -left-5 w-2.5 h-2.5 rounded-full bg-[#6366f1] ring-4 ring-white top-1"></div>
                  <p className="text-xs font-medium text-[#0f1117]">Resolved</p>
                  <p className="text-[10px] text-[#64748b]">{new Date(dispute.resolved_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: EVIDENCE REVIEW */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            
            <section>
              <h2 className="text-lg font-bold text-[#0f1117] mb-4 flex items-center">
                <ShieldAlert size={20} className="mr-2 text-[#ef4444]" />
                Complaint Details
              </h2>
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                <p className="text-[#334155] whitespace-pre-wrap leading-relaxed">
                  {dispute.description || "No description provided by the filer."}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#0f1117] mb-4 flex items-center">
                <FileImage size={20} className="mr-2 text-[#6366f1]" />
                Evidence Files ({dispute.evidence_urls?.length || 0})
              </h2>
              {dispute.evidence_urls && dispute.evidence_urls.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {dispute.evidence_urls.map((url: string, idx: number) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#e2e8f0] bg-white aspect-video flex items-center justify-center">
                      {url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                        <img src={url} alt="Evidence" className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-center">
                          <FileText size={32} className="mx-auto text-[#9ca3af] mb-2" />
                          <span className="text-xs text-[#64748b]">Document File</span>
                        </div>
                      )}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Download className="text-white" size={24} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-[#cbd5e1] rounded-xl p-8 text-center text-[#64748b]">
                  No evidence files attached to this dispute.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#0f1117] mb-4">Order Chat History</h2>
              <div className="bg-white border border-[#e2e8f0] rounded-xl divide-y divide-[#e2e8f0]">
                {orderMessages.length ? orderMessages.map((message) => (
                  <div key={message.id} className="p-4">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-[#334155]">{message.message_type === "system" ? "System event" : (Array.isArray(message.sender) ? message.sender[0]?.full_name : message.sender?.full_name) || "Order member"}</span>
                      <span className="text-[#94a3b8]">{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-[#475569]">{message.content}</p>
                    {message.attachment_urls?.map((url: string) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6366f1]"><Download size={12} />{url.split("/").pop()}</a>)}
                  </div>
                )) : <p className="p-6 text-center text-sm text-[#64748b]">No order messages have been recorded.</p>}
              </div>
            </section>

          </div>
        </div>

        {/* COLUMN 3: DECISION PANEL */}
        <div className="w-80 bg-white border-l border-[#e2e8f0] overflow-y-auto flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h2 className="text-sm font-bold text-[#475569] uppercase tracking-wider flex items-center">
              <Scale size={16} className="mr-2" /> Render Decision
            </h2>
            <p className="text-xs text-[#64748b] mt-1">Actions taken here are irreversible.</p>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {dispute.status === "open" || dispute.status === "under_review" ? (
              <div className="space-y-6">
                
                {/* Resolve for Buyer */}
                <div className="border border-[#e2e8f0] rounded-xl p-4">
                  <h3 className="font-bold text-[#0f1117] mb-3">Resolve for Buyer</h3>
                  <form action={`/api/admin/disputes/${dispute.id}/resolve`} method="POST" className="space-y-3">
                    <input type="hidden" name="decision" value="resolved_buyer" />
                    <button type="submit" className="w-full bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Issue Full Refund
                    </button>
                    {/* Partial refund UI would go here in Phase 2 */}
                  </form>
                </div>

                {/* Resolve for Manufacturer */}
                <div className="border border-[#e2e8f0] rounded-xl p-4">
                  <h3 className="font-bold text-[#0f1117] mb-3">Resolve for Manufacturer</h3>
                  <form action={`/api/admin/disputes/${dispute.id}/resolve`} method="POST">
                    <input type="hidden" name="decision" value="resolved_manufacturer" />
                    <button type="submit" className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Release Escrow Funds
                    </button>
                  </form>
                </div>

                <hr className="border-[#e2e8f0]" />

                {/* Intermediary Actions */}
                <div className="space-y-3">
                  <form action={`/api/admin/disputes/${dispute.id}/request-evidence`} method="POST">
                    <button type="submit" className="w-full bg-white border border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Request More Evidence
                    </button>
                  </form>
                  <form action={`/api/admin/disputes/${dispute.id}/resolve`} method="POST">
                    <input type="hidden" name="decision" value="closed" />
                    <button type="submit" className="w-full bg-white border border-[#ef4444] text-[#ef4444] hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Close (No Action)
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <CheckCircle size={48} className="text-[#10b981] mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-[#0f1117]">Case Closed</h3>
                <p className="text-sm text-[#64748b] mt-1 mb-4">This dispute has been resolved.</p>
                <div className="bg-[#f8fafc] rounded-lg border border-[#e2e8f0] p-4 w-full text-left text-sm">
                  <p className="text-[#64748b] text-xs mb-1">Outcome</p>
                  <p className="font-medium text-[#0f1117] capitalize">{dispute.status.replace("_", " ")}</p>
                  <p className="text-[#64748b] text-xs mt-3 mb-1">Resolved At</p>
                  <p className="font-medium text-[#0f1117]">{new Date(dispute.resolved_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Admin Notes Section */}
          <div className="p-6 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <h3 className="text-sm font-bold text-[#0f1117] mb-2">Admin Notes (Internal)</h3>
            <textarea 
              className="w-full text-sm border border-[#cbd5e1] rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none"
              placeholder="Add private notes about this case..."
              defaultValue={dispute.admin_notes || ""}
            ></textarea>
            <button className="mt-2 w-full bg-white border border-[#e2e8f0] text-[#334155] px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#f1f5f9] transition-colors">
              Save Note
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
