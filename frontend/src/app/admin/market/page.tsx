"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, AlertTriangle, Eye, PauseCircle, Radio, TrendingUp, X } from "lucide-react"
import { MarketplaceListing, marketplaceRepository } from "@/lib/marketplace"
import { EmptyState, FilterPills, PageHeader, SearchField, StatCard, StatusBadge, Toast, secondaryButton, useAdminToast } from "@/components/admin/AdminUI"

export default function MarketPage() {
  const [rfqs, setRfqs] = useState<MarketplaceListing[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [selected, setSelected] = useState<MarketplaceListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [nowTimestamp] = useState(() => Date.now())
  const { toast, showToast, clearToast } = useAdminToast()

  useEffect(() => {
    let cancelled = false
    marketplaceRepository.listings().then((result) => {
      if (cancelled) return
      setRfqs(result.data)
      setWarning(result.warning || null)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => rfqs.filter((rfq) => {
    const matchesFilter = filter === "all" || rfq.status === filter || (filter === "closing" && +new Date(rfq.expiresAt) - nowTimestamp < 86400000)
    return matchesFilter && `${rfq.title} ${rfq.inquiryNumber} ${rfq.buyerName}`.toLowerCase().includes(query.toLowerCase())
  }), [rfqs, query, filter, nowTimestamp])

  const live = rfqs.filter((item) => item.status === "active")
  const risk = rfqs.filter((item) => item.bidCount > 20 || (item.maxPrice > 0 && item.targetPrice > item.maxPrice))

  const moderate = async (rfq: MarketplaceListing, status: "active" | "under_review" | "cancelled") => {
    if (rfq.id.startsWith("demo-") || rfq.id.startsWith("local-")) { setWarning("Demo RFQs cannot be moderated. Apply the marketplace migration and load live records first."); return }
    setWorkingId(rfq.id)
    const response = await fetch(`/api/admin/market/${rfq.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, reason: status === "under_review" ? "Manual marketplace risk review" : status === "cancelled" ? "Cancelled by marketplace administrator" : "Restored after administrator review" }) })
    const payload = await response.json().catch(() => ({ error: "Unexpected moderation response" }))
    if (!response.ok) setWarning(payload.error || "Moderation failed")
    else {
      setRfqs((items) => items.map((item) => item.id === rfq.id ? { ...item, status } : item))
      setSelected((item) => item?.id === rfq.id ? { ...item, status } : item)
      showToast(`${rfq.inquiryNumber} updated to ${status.replace("_", " ")}`)
    }
    setWorkingId(null)
  }

  const riskScan = () => {
    setFilter("all")
    showToast(`Risk scan completed: ${risk.length} ${risk.length === 1 ? "flag" : "flags"} found`)
  }

  return <div className="space-y-7">
    <PageHeader eyebrow="Marketplace" title="Market monitor" description="Review live RFQs, bidding behavior, expiries, and marketplace risk with audited controls." actions={<button className={secondaryButton} onClick={riskScan}><Activity size={15} />Run risk scan</button>} />
    {warning && <div className="flex justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span>{warning}</span><button onClick={() => setWarning(null)}><X size={15} /></button></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Live RFQs" value={String(live.length)} detail={`${live.filter((item) => +new Date(item.expiresAt) - Date.now() < 86400000).length} close today`} icon={<Radio size={18} />} tone="emerald" /><StatCard label="Bids visible" value={String(rfqs.reduce((sum, item) => sum + item.bidCount, 0))} detail="Across loaded marketplace records" icon={<TrendingUp size={18} />} /><StatCard label="Median bids / RFQ" value={rfqs.length ? (rfqs.reduce((sum, item) => sum + item.bidCount, 0) / rfqs.length).toFixed(1) : "0"} detail="Current marketplace liquidity" icon={<Activity size={18} />} /><StatCard label="Risk flags" value={String(risk.length)} detail="Needs manual review" icon={<AlertTriangle size={18} />} tone="rose" /></div>
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between"><SearchField value={query} onChange={setQuery} placeholder="Search RFQ, buyer, category..." /><FilterPills options={["all", "active", "closing", "under_review", "cancelled"]} value={filter} onChange={setFilter} /></div>
      {loading ? <div className="p-5"><div className="h-64 animate-pulse rounded-xl bg-zinc-100" /></div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400"><th className="px-5 py-3">RFQ</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Bids</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Controls</th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.map((rfq) => { const flagged = rfq.bidCount > 20 || (rfq.maxPrice > 0 && rfq.targetPrice > rfq.maxPrice); return <tr key={rfq.id} className={flagged ? "bg-rose-50/40" : "hover:bg-zinc-50"}><td className="px-5 py-3"><p className="text-xs font-semibold text-zinc-900">{rfq.title}</p><p className="mt-0.5 text-[11px] text-zinc-400">{rfq.inquiryNumber} · {rfq.category}{flagged && <span className="ml-2 font-semibold text-rose-600">Risk flagged</span>}</p></td><td className="px-4 py-3 text-xs text-zinc-600">{rfq.buyerName}</td><td className="px-4 py-3 text-xs font-semibold text-zinc-700">${rfq.targetPrice.toFixed(2)}</td><td className="px-4 py-3 text-xs font-semibold text-zinc-700">{rfq.bidCount}</td><td className="px-4 py-3 text-xs text-zinc-600">{new Date(rfq.expiresAt).toLocaleDateString()}</td><td className="px-4 py-3"><StatusBadge status={rfq.status.replace("_", " ")} /></td><td className="px-5 py-3"><div className="flex justify-end gap-1"><button title="Inspect RFQ" onClick={() => setSelected(rfq)} className="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-100"><Eye size={15} /></button><button disabled={workingId === rfq.id} title={rfq.status === "under_review" ? "Restore RFQ" : "Pause for review"} onClick={() => void moderate(rfq, rfq.status === "under_review" ? "active" : "under_review")} className="rounded-md border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"><PauseCircle size={15} /></button></div></td></tr>})}</tbody></table></div> : <div className="p-5"><EmptyState title="No RFQs found" description="Try another search or status filter." /></div>}
    </section>
    {selected && <><button aria-label="Close RFQ review" onClick={() => setSelected(null)} className="fixed inset-0 z-40 bg-zinc-950/25" /><aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">RFQ review</p><h2 className="mt-1 font-semibold">{selected.title}</h2></div><button onClick={() => setSelected(null)}><X size={18} /></button></div><div className="space-y-5 p-5"><div className="grid grid-cols-2 gap-3"><Fact label="Buyer" value={selected.buyerName} /><Fact label="Visibility" value={selected.visibility} /><Fact label="Target" value={`$${selected.targetPrice.toFixed(2)}`} /><Fact label="Bid count" value={String(selected.bidCount)} /></div><p className="text-sm leading-6 text-zinc-600">{selected.description}</p><div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600"><p><strong>Destination:</strong> {selected.destination}</p><p className="mt-2"><strong>Terms:</strong> {selected.incoterms} · {selected.tatDays} days · {selected.quantity.toLocaleString()} {selected.unit}</p></div><label className="block"><span className="mb-1.5 block text-xs font-semibold">Moderation reason</span><textarea readOnly value="All actions are recorded with the authenticated administrator and supplied reason." className="min-h-20 w-full rounded-lg border border-zinc-200 p-3 text-xs text-zinc-500" /></label><div className="grid gap-2"><button onClick={() => void moderate(selected, selected.status === "under_review" ? "active" : "under_review")} className={secondaryButton}>{selected.status === "under_review" ? "Restore to marketplace" : "Pause for manual review"}</button><button onClick={() => void moderate(selected, "cancelled")} className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700">Cancel RFQ</button></div></div></aside></>}
    {toast && <Toast message={toast} onClose={clearToast} />}
  </div>
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-zinc-200 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 truncate text-xs font-semibold capitalize text-zinc-800">{value}</p></div> }
