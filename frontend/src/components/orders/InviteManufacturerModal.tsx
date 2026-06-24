"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, Check, Link2, MapPin, Search, X } from "lucide-react"
import { MarketplaceManufacturer, marketplaceRepository } from "@/lib/marketplace"

interface InviteManufacturerModalProps {
  isOpen: boolean
  onClose: () => void
  onSendInvites: (invitedIds: string[]) => void
  username?: string
  orderId?: string
}

export default function InviteManufacturerModal({ isOpen, onClose, onSendInvites, username = "user", orderId = "draft" }: InviteManufacturerModalProps) {
  const [query, setQuery] = useState("")
  const [manufacturers, setManufacturers] = useState<MarketplaceManufacturer[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    marketplaceRepository.manufacturers().then((result) => {
      if (cancelled) return
      setManufacturers(result.data)
      setWarning(result.warning || null)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [isOpen])

  const filtered = useMemo(() => manufacturers.filter((item) => `${item.companyName} ${item.city} ${item.country} ${item.capabilities.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [manufacturers, query])
  if (!isOpen) return null

  const toggle = (manufacturer: MarketplaceManufacturer) => {
    if (manufacturer.id.startsWith("demo-")) {
      setWarning("Demo manufacturer profiles cannot receive live invitations.")
      return
    }
    setSelected((ids) => ids.includes(manufacturer.id) ? ids.filter((id) => id !== manufacturer.id) : ids.length < 5 ? [...ids, manufacturer.id] : ids)
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/${username}/${orderId}`)
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1800)
  }

  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div><h3 className="font-semibold text-zinc-950">Invite manufacturers</h3><p className="mt-0.5 text-xs text-zinc-500">Select up to five verified production partners.</p></div><button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><X size={18} /></button></header><div className="p-5"><label className="relative block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, country, or capability" className="market-input pl-9" /></label>{warning && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{warning}</p>}<div className="mt-4 max-h-80 space-y-2 overflow-y-auto">{loading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-zinc-100" />) : filtered.map((manufacturer) => { const active = selected.includes(manufacturer.id); const demo = manufacturer.id.startsWith("demo-"); return <button key={manufacturer.id} onClick={() => toggle(manufacturer)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${demo ? "cursor-not-allowed opacity-60" : active ? "border-blue-300 bg-blue-50" : "border-zinc-200 hover:border-zinc-300"}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600">{manufacturer.companyName.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-1 truncate text-sm font-semibold text-zinc-900">{manufacturer.companyName}{manufacturer.verified && <BadgeCheck size={14} className="text-blue-600" />}{demo && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">Demo</span>}</span><span className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500"><MapPin size={11} />{manufacturer.city}, {manufacturer.country} · MOQ {manufacturer.minOrderQuantity}</span></span><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-transparent"}`}><Check size={13} /></span></button> })}{!loading && !filtered.length && <p className="py-10 text-center text-sm text-zinc-400">No manufacturers match this search.</p>}</div></div><footer className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-5 py-4"><button onClick={() => void copyLink()} className="flex items-center gap-2 text-xs font-semibold text-zinc-600"><Link2 size={14} />{linkCopied ? "Link copied" : "Copy private link"}</button><button disabled={!selected.length} onClick={() => { onSendInvites(selected); onClose() }} className="market-btn-primary">Send invites ({selected.length})</button></footer></div></div>
}
