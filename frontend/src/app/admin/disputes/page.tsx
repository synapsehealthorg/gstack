"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, FileText, Gavel, MessageSquareText, Scale, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { EmptyState, FilterPills, PageHeader, SearchField, StatCard, StatusBadge, Toast, primaryButton, secondaryButton, useAdminToast } from "@/components/admin/AdminUI"

interface DisputeRow {
  id: string
  order_id: string
  reason: string
  description: string | null
  evidence_urls: string[] | null
  status: "open" | "under_review" | "resolved_buyer" | "resolved_manufacturer" | "closed"
  admin_notes: string | null
  created_at: string
  filer?: { full_name?: string } | null
  order?: { order_number?: string; agreed_price?: number; order_total?: number; buyer?: { full_name?: string } | null; manufacturer?: { full_name?: string } | null } | null
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRow[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("active")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [nowTimestamp] = useState(() => Date.now())
  const { toast, showToast, clearToast } = useAdminToast()

  const load = async () => {
    const { data, error } = await createClient().from("disputes").select("*, filer:profiles!disputes_filed_by_fkey(full_name), order:orders(order_number, agreed_price, order_total, buyer:profiles!orders_buyer_id_fkey(full_name), manufacturer:profiles!orders_manufacturer_id_fkey(full_name))").order("created_at", { ascending: false })
    setDisputes((data || []) as unknown as DisputeRow[])
    setWarning(error?.message || null)
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => disputes.filter((dispute) => {
    const active = dispute.status === "open" || dispute.status === "under_review"
    const matchesFilter = filter === "all" || (filter === "active" ? active : dispute.status === filter)
    return matchesFilter && `${dispute.id} ${dispute.order?.order_number} ${dispute.reason} ${dispute.filer?.full_name}`.toLowerCase().includes(query.toLowerCase())
  }), [disputes, filter, query])
  const selected = disputes.find((dispute) => dispute.id === selectedId)
  const activeCases = disputes.filter((item) => item.status === "open" || item.status === "under_review")
  const valueAtRisk = activeCases.reduce((sum, item) => sum + Number(item.order?.order_total || item.order?.agreed_price || 0), 0)

  const decide = async (decision: "resolved_buyer" | "resolved_manufacturer" | "closed" | "request_evidence") => {
    if (!selected || !notes.trim()) { setWarning("Decision reasoning is required."); return }
    if (decision !== "request_evidence" && !confirm(`Record ${decision.replace(/_/g, " ")} for this dispute?`)) return
    setWorking(true)
    const response = await fetch(`/api/admin/disputes/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision, notes }) })
    const payload = await response.json().catch(() => ({ error: "Unexpected dispute response" }))
    if (!response.ok) setWarning(payload.error || "Dispute action failed")
    else { showToast(decision === "request_evidence" ? "Evidence request recorded" : "Dispute decision recorded"); setSelectedId(null); setNotes(""); await load() }
    setWorking(false)
  }

  return <div className="space-y-7"><PageHeader eyebrow="Risk & arbitration" title="Disputes" description="Compare order evidence, conversation history, and escrow before recording an auditable decision." />
    {warning && <div className="flex justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span>{warning}</span><button onClick={() => setWarning(null)}><X size={15} /></button></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Active cases" value={String(activeCases.length)} detail={`${activeCases.filter((item) => nowTimestamp - +new Date(item.created_at) > 3 * 86400000).length} outside 3-day SLA`} icon={<Gavel size={18} />} tone="rose" /><StatCard label="Value at risk" value={`$${valueAtRisk.toLocaleString()}`} detail="Escrow remains protected" icon={<Scale size={18} />} tone="amber" /><StatCard label="Evidence files" value={String(activeCases.reduce((sum, item) => sum + (item.evidence_urls?.length || 0), 0))} detail="Across active cases" icon={<FileText size={18} />} /><StatCard label="Resolved cases" value={String(disputes.length - activeCases.length)} detail="Audited decisions" icon={<CheckCircle2 size={18} />} tone="emerald" /></div>
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between"><SearchField value={query} onChange={setQuery} placeholder="Search case, order, party..." /><FilterPills options={["active", "all", "open", "under_review", "resolved_buyer", "resolved_manufacturer", "closed"]} value={filter} onChange={setFilter} /></div>
      {loading ? <div className="p-5"><div className="h-64 animate-pulse rounded-xl bg-zinc-100" /></div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead><tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400"><th className="px-5 py-3">Case</th><th className="px-4 py-3">Parties</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Age</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.map((dispute) => { const ageDays = Math.max(0, Math.floor((nowTimestamp - +new Date(dispute.created_at)) / 86400000)); return <tr key={dispute.id} className="hover:bg-zinc-50"><td className="px-5 py-3"><p className="font-mono text-xs font-semibold text-zinc-900">{dispute.id.slice(0, 8)}</p><p className="text-[11px] text-zinc-400">{dispute.order?.order_number || dispute.order_id.slice(0, 8)}</p></td><td className="px-4 py-3"><p className="text-xs text-zinc-700">{dispute.order?.buyer?.full_name || dispute.filer?.full_name || "Buyer"}</p><p className="text-[11px] text-zinc-400">and {dispute.order?.manufacturer?.full_name || "Manufacturer"}</p></td><td className="px-4 py-3 text-xs capitalize text-zinc-600">{dispute.reason.replace(/_/g, " ")}</td><td className="px-4 py-3 text-xs font-semibold text-zinc-800">${Number(dispute.order?.order_total || dispute.order?.agreed_price || 0).toLocaleString()}</td><td className="px-4 py-3 text-xs text-zinc-600">{ageDays}d</td><td className="px-4 py-3"><StatusBadge status={dispute.status.replace(/_/g, " ")} /></td><td className="px-5 py-3 text-right"><button onClick={() => { setSelectedId(dispute.id); setNotes(dispute.admin_notes || "") }} className={`${secondaryButton} !h-8 !text-xs`}>{["open", "under_review"].includes(dispute.status) ? "Arbitrate" : "Review"}</button></td></tr>})}</tbody></table></div> : <div className="p-5"><EmptyState title="No disputes found" description="No cases match this view." /></div>}
    </section>
    {selected && <><button className="fixed inset-0 z-40 bg-zinc-950/25" aria-label="Close arbitration" onClick={() => setSelectedId(null)} /><aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4"><div><p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Arbitration workspace</p><h2 className="mt-0.5 font-semibold text-zinc-950">{selected.order?.order_number || selected.order_id.slice(0, 8)}</h2></div><button onClick={() => setSelectedId(null)} className="rounded-lg border border-zinc-200 p-2 text-zinc-500"><X size={17} /></button></div><div className="space-y-6 p-5"><div className="grid grid-cols-2 gap-3"><Fact label="At risk" value={`$${Number(selected.order?.order_total || selected.order?.agreed_price || 0).toLocaleString()}`} /><Fact label="Filed by" value={selected.filer?.full_name || "Order party"} /><Fact label="Reason" value={selected.reason.replace(/_/g, " ")} /><Fact label="Status" value={selected.status.replace(/_/g, " ")} /></div><section className="rounded-xl border border-rose-200 bg-rose-50 p-4"><div className="flex items-start gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" /><p className="text-sm leading-6 text-rose-800">{selected.description || "No complaint description supplied."}</p></div></section><section><h3 className="text-sm font-semibold">Evidence ({selected.evidence_urls?.length || 0})</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{selected.evidence_urls?.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 text-xs font-semibold text-zinc-700 hover:border-violet-200"><FileText size={15} className="text-violet-600" /><span className="min-w-0 flex-1 truncate">{url.split("/").pop()}</span><ExternalLink size={12} /></a>)}{!selected.evidence_urls?.length && <p className="col-span-2 rounded-lg border border-dashed border-zinc-200 p-5 text-center text-xs text-zinc-400">No evidence uploaded.</p>}</div></section><a href={`/orders/${selected.order_id}`} className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700"><MessageSquareText size={14} />Open order conversation and production history</a><label className="block"><span className="mb-1.5 block text-xs font-semibold text-zinc-700">Decision reasoning</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Summarize the evidence, policy, and decision..." className="min-h-28 w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-violet-400" /></label>{["open", "under_review"].includes(selected.status) ? <div className="grid gap-2"><button disabled={working} onClick={() => void decide("resolved_buyer")} className={primaryButton}>Resolve for buyer · refund escrow</button><button disabled={working} onClick={() => void decide("resolved_manufacturer")} className={secondaryButton}>Resolve for manufacturer · release escrow</button><button disabled={working} onClick={() => void decide("request_evidence")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700"><MessageSquareText size={15} />Request more evidence</button><button disabled={working} onClick={() => void decide("closed")} className="h-9 rounded-lg border border-rose-200 text-sm font-semibold text-rose-600">Close with no escrow action</button></div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><CheckCircle2 size={22} className="mx-auto text-emerald-600" /><p className="mt-2 text-sm font-semibold text-emerald-900">Decision recorded</p><p className="mt-1 text-xs text-emerald-700">{selected.admin_notes || "This case is closed."}</p></div>}</div></aside></>}
    {toast && <Toast message={toast} onClose={clearToast} />}
  </div>
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-zinc-200 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 truncate text-xs font-semibold capitalize text-zinc-800">{value}</p></div> }
