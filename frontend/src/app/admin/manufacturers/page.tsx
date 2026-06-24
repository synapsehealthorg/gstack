"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, BadgeCheck, Building2, CheckCircle2, ExternalLink, FileCheck2, MapPin, ShieldCheck, Star, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { EmptyState, FilterPills, PageHeader, SearchField, StatCard, StatusBadge, Toast, primaryButton, secondaryButton, useAdminToast } from "@/components/admin/AdminUI"

interface ManufacturerRow {
  id: string
  company_name: string
  country: string | null
  city: string | null
  min_order_qty: number | null
  capabilities: string[] | null
  certifications: string[] | null
  portfolio_urls: string[] | null
  verified: boolean
  rating: number | null
  review_count: number | null
  created_at?: string
  profiles?: { full_name?: string; email?: string; account_status?: "active" | "under_review" | "suspended"; is_premium?: boolean; created_at?: string } | null
}

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<ManufacturerRow[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("pending")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const { toast, showToast, clearToast } = useAdminToast()

  const load = async () => {
    const { data, error } = await createClient().from("manufacturer_profiles").select("*, profiles(full_name, email, account_status, is_premium, created_at)").order("verified", { ascending: true })
    setManufacturers((data || []) as unknown as ManufacturerRow[])
    setWarning(error?.message || null)
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  const statusOf = (item: ManufacturerRow) => item.profiles?.account_status === "suspended" ? "suspended" : item.verified ? "verified" : "pending"
  const filtered = useMemo(() => manufacturers.filter((item) => (filter === "all" || statusOf(item) === filter) && `${item.company_name} ${item.city} ${item.country} ${(item.capabilities || []).join(" ")}`.toLowerCase().includes(query.toLowerCase())), [manufacturers, query, filter])
  const selected = manufacturers.find((item) => item.id === selectedId)
  const pending = manufacturers.filter((item) => !item.verified && item.profiles?.account_status !== "suspended")
  const verified = manufacturers.filter((item) => item.verified)
  const suspended = manufacturers.filter((item) => item.profiles?.account_status === "suspended")

  const decide = async (action: "verify" | "hold" | "suspend" | "restore" | "toggle_premium") => {
    if (!selected || !notes.trim()) { setWarning("Review reasoning is required."); return }
    if (["suspend", "hold"].includes(action) && !confirm(`${action} ${selected.company_name}?`)) return
    setWorking(true)
    const response = await fetch(`/api/admin/manufacturers/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, notes }) })
    const payload = await response.json().catch(() => ({ error: "Unexpected review response" }))
    if (!response.ok) setWarning(payload.error || "Manufacturer action failed")
    else { showToast(`${selected.company_name}: ${action.replace("_", " ")} recorded`); setSelectedId(null); setNotes(""); await load() }
    setWorking(false)
  }

  return <div className="space-y-7"><PageHeader eyebrow="Trust & safety" title="Manufacturer verification" description="Review real factory profiles, production capability, documentation, and account risk." />
    {warning && <div className="flex justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span>{warning}</span><button onClick={() => setWarning(null)}><X size={15} /></button></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Awaiting review" value={String(pending.length)} detail="Unverified applications" icon={<FileCheck2 size={18} />} tone="amber" /><StatCard label="Verified network" value={String(verified.length)} detail={`${new Set(verified.map((item) => item.country).filter(Boolean)).size} countries`} icon={<ShieldCheck size={18} />} tone="emerald" /><StatCard label="Average rating" value={verified.length ? (verified.reduce((sum, item) => sum + Number(item.rating || 0), 0) / verified.length).toFixed(1) : "0"} detail={`${verified.reduce((sum, item) => sum + Number(item.review_count || 0), 0)} reviews`} icon={<Star size={18} />} /><StatCard label="Suspended" value={String(suspended.length)} detail="Restricted marketplace access" icon={<AlertTriangle size={18} />} tone="rose" /></div>
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between"><SearchField value={query} onChange={setQuery} placeholder="Search company, location, capability..." /><FilterPills options={["pending", "all", "verified", "suspended"]} value={filter} onChange={setFilter} /></div>
      {loading ? <div className="p-5"><div className="h-64 animate-pulse rounded-xl bg-zinc-100" /></div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead><tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400"><th className="px-5 py-3">Manufacturer</th><th className="px-4 py-3">Capabilities</th><th className="px-4 py-3">MOQ</th><th className="px-4 py-3">Certifications</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Review</th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.map((item) => <tr key={item.id} className="hover:bg-zinc-50"><td className="px-5 py-3"><div className="flex items-center gap-3"><span className="rounded-lg bg-zinc-100 p-2 text-zinc-500"><Building2 size={17} /></span><span><span className="flex items-center gap-1 text-xs font-semibold text-zinc-900">{item.company_name}{item.verified && <BadgeCheck size={13} className="text-blue-600" />}</span><span className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400"><MapPin size={10} />{item.city}, {item.country}</span></span></div></td><td className="px-4 py-3 text-xs text-zinc-600">{(item.capabilities || []).slice(0, 2).join(", ") || "Not supplied"}<span className="block text-[11px] text-zinc-400">{item.portfolio_urls?.length || 0} portfolio items</span></td><td className="px-4 py-3 text-xs text-zinc-600">{item.min_order_qty || 0} units</td><td className="px-4 py-3 text-xs text-zinc-600">{item.certifications?.length || 0}</td><td className="px-4 py-3 text-xs font-semibold text-zinc-700">{Number(item.rating || 0).toFixed(1)}</td><td className="px-4 py-3"><StatusBadge status={statusOf(item)} /></td><td className="px-5 py-3 text-right"><button onClick={() => { setSelectedId(item.id); setNotes("") }} className={`${secondaryButton} !h-8 !text-xs`}>Review</button></td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title="Queue is clear" description="No manufacturers match this view." /></div>}
    </section>
    {selected && <><button className="fixed inset-0 z-40 bg-zinc-950/25" aria-label="Close review" onClick={() => setSelectedId(null)} /><aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4"><div><p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">Verification review</p><h2 className="mt-0.5 font-semibold text-zinc-950">{selected.company_name}</h2></div><button onClick={() => setSelectedId(null)} className="rounded-lg border border-zinc-200 p-2 text-zinc-500"><X size={17} /></button></div><div className="space-y-6 p-5"><div className="grid grid-cols-2 gap-3"><ReviewFact label="Location" value={`${selected.city}, ${selected.country}`} /><ReviewFact label="Account" value={selected.profiles?.account_status || "active"} /><ReviewFact label="Minimum order" value={`${selected.min_order_qty || 0} units`} /><ReviewFact label="Rating" value={`${Number(selected.rating || 0).toFixed(1)} / 5`} /></div><section><h3 className="text-sm font-semibold text-zinc-900">Capabilities</h3><div className="mt-2 flex flex-wrap gap-2">{(selected.capabilities || []).map((item) => <span key={item} className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700">{item}</span>)}</div></section><section><h3 className="text-sm font-semibold text-zinc-900">Certifications</h3><div className="mt-2 space-y-2">{(selected.certifications || []).map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3 text-xs font-medium"><FileCheck2 size={15} className="text-emerald-600" />{item}</div>)}{!selected.certifications?.length && <p className="text-xs text-zinc-400">No certifications supplied.</p>}</div></section><section><h3 className="text-sm font-semibold text-zinc-900">Portfolio ({selected.portfolio_urls?.length || 0})</h3><div className="mt-2 grid grid-cols-2 gap-2">{selected.portfolio_urls?.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3 text-xs font-semibold text-violet-600"><ExternalLink size={13} />Open item</a>)}</div></section><label className="block"><span className="mb-1.5 block text-xs font-semibold text-zinc-700">Review reasoning</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record evidence reviewed and decision reasoning..." className="min-h-24 w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-violet-400" /></label><div className="grid gap-2 sm:grid-cols-2"><button disabled={working} onClick={() => void decide(selected.verified ? "restore" : "verify")} className={primaryButton}><CheckCircle2 size={15} />{selected.verified ? "Restore access" : "Approve & verify"}</button><button disabled={working} onClick={() => void decide("hold")} className={secondaryButton}>Place on review hold</button><button disabled={working} onClick={() => void decide(selected.profiles?.account_status === "suspended" ? "restore" : "suspend")} className="h-9 rounded-lg border border-rose-200 text-sm font-semibold text-rose-600">{selected.profiles?.account_status === "suspended" ? "Restore account" : "Suspend account"}</button><button disabled={working} onClick={() => void decide("toggle_premium")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700"><Star size={14} />{selected.profiles?.is_premium ? "Remove premium" : "Mark premium"}</button></div></div></aside></>}
    {toast && <Toast message={toast} onClose={clearToast} />}
  </div>
}

function ReviewFact({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-zinc-200 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 truncate text-xs font-semibold capitalize text-zinc-800">{value}</p></div> }
