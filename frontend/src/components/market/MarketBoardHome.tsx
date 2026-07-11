"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Archive, BadgeCheck, Bookmark, Building2, Check, ChevronLeft, ChevronRight,
  Clock3, Copy, FileText, Filter, MapPin, MessageSquare, MoreHorizontal, Package,
  Paperclip, Plus, Search, Send, ShieldCheck, SlidersHorizontal, Star, Trash2, Trophy, X,
} from "lucide-react"
import {
  MarketplaceBid, MarketplaceListing, MarketplaceManufacturer, MarketplaceQuestion,
  MarketplaceRole, marketplaceRepository, newMarketplaceListing,
} from "@/lib/marketplace"
import { calculateSplitBidSummary, filterMarketplaceListings } from "@/lib/marketplace-domain"

type Tab = "browse" | "my-rfqs" | "archived" | "offers" | "manufacturers"
type Modal = "listing" | "bid" | "questions" | "compare" | "manufacturer" | null

interface MarketBoardHomeProps {
  currentUserId: string
  currentUserRole: MarketplaceRole
  currentUserName: string
}

export default function MarketBoardHome({ currentUserId, currentUserRole, currentUserName }: MarketBoardHomeProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(currentUserRole === "buyer" ? "my-rfqs" : "browse")
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [manufacturers, setManufacturers] = useState<MarketplaceManufacturer[]>([])
  const [offers, setOffers] = useState<MarketplaceBid[]>([])
  const [selected, setSelected] = useState<MarketplaceListing | null>(null)
  const [selectedManufacturer, setSelectedManufacturer] = useState<MarketplaceManufacturer | null>(null)
  const [bids, setBids] = useState<MarketplaceBid[]>([])
  const [questions, setQuestions] = useState<MarketplaceQuestion[]>([])
  const [modal, setModal] = useState<Modal>(null)
  const [editing, setEditing] = useState<MarketplaceListing | null>(null)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [sort, setSort] = useState("newest")
  const [savedOnly, setSavedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [nowTimestamp] = useState(() => Date.now())
  const pageSize = 6

  const load = useCallback(async () => {
    const [listingResult, manufacturerResult, offerResult] = await Promise.all([
      marketplaceRepository.listings(),
      marketplaceRepository.manufacturers(),
      currentUserId ? marketplaceRepository.bids(undefined, currentUserId) : Promise.resolve({ data: [], source: "demo" as const, warning: undefined }),
    ])
    setListings(listingResult.data)
    setManufacturers(manufacturerResult.data)
    setOffers(offerResult.data)
    setWarning(listingResult.warning || manufacturerResult.warning || offerResult.warning || null)
    setSelected((current) => current || listingResult.data[0] || null)
    setLoading(false)
  }, [currentUserId])

  useEffect(() => { void load() }, [load])

  const categories = useMemo(() => ["All", ...new Set(listings.map((item) => item.category))], [listings])
  const filtered = useMemo(() => {
    return filterMarketplaceListings(listings, { query, category, savedOnly, sort, tab, currentUserId })
  }, [category, currentUserId, listings, query, savedOnly, sort, tab])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const openListing = (listing: MarketplaceListing) => { setSelected(listing); setMenuId(null) }
  const openEditor = (listing?: MarketplaceListing) => {
    setEditing(listing ? { ...listing } : newMarketplaceListing(currentUserId, currentUserName))
    setModal("listing")
  }
  const saveListing = async (publish: boolean) => {
    if (!editing?.title.trim() || editing.quantity < 1 || editing.targetPrice <= 0) { setWarning("Title, quantity, and target price are required."); return }
    if (editing.id.startsWith("new-") && editing.visibility === "private") {
      setWarning("Private RFQs require selected manufacturers and product records. Continue in the full order builder.")
      setModal(null)
      router.push("/orders/new")
      return
    }
    setWorking(true)
    const result = await marketplaceRepository.saveListing({ ...editing, status: publish ? "active" : "draft" })
    if (!result.ok) { setWarning(result.message); setWorking(false); return }
    setWarning(null)
    setListings((items) => [result.data, ...items.filter((item) => item.id !== editing.id && item.id !== result.data.id)])
    setSelected(result.data); setModal(null); setWorking(false)
  }
  const duplicateListing = async (listing: MarketplaceListing) => {
    setWorking(true)
    const copy = { ...listing, id: `new-${crypto.randomUUID()}`, title: `${listing.title} Copy`, status: "draft" as const, bidCount: 0, createdAt: new Date().toISOString() }
    const result = await marketplaceRepository.saveListing(copy)
    if (result.ok) setListings((items) => [result.data, ...items])
    setWarning(result.ok ? null : result.message); setWorking(false); setMenuId(null)
  }
  const closeListing = async (listing: MarketplaceListing) => {
    const result = await marketplaceRepository.saveListing({ ...listing, status: "cancelled" })
    if (result.ok) setListings((items) => items.map((item) => item.id === listing.id ? result.data : item))
    setWarning(result.ok ? null : result.message); setMenuId(null)
  }
  const archiveListing = async (listing: MarketplaceListing) => {
    const result = await marketplaceRepository.saveListing({ ...listing, archivedAt: listing.archivedAt ? null : new Date().toISOString() })
    if (result.ok) setListings((items) => items.map((item) => item.id === listing.id ? result.data : item))
    setWarning(result.ok ? null : result.message); setMenuId(null)
  }
  const deleteListing = async (listing: MarketplaceListing) => {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return
    const result = await marketplaceRepository.removeListing(listing)
    if (result.ok) setListings((items) => items.filter((item) => item.id !== listing.id))
    setWarning(result.ok ? null : result.message); setMenuId(null)
  }
  const toggleSaved = async (listing: MarketplaceListing) => {
    if (currentUserRole === "guest") { router.push("/login?next=/marketplace"); return }
    const result = await marketplaceRepository.toggleSaved(listing)
    if (!result.ok) { setWarning(result.message); return }
    setListings((items) => items.map((item) => item.id === listing.id ? { ...item, saved: result.data } : item))
    setSelected((item) => item?.id === listing.id ? { ...item, saved: result.data } : item)
    setWarning(null)
  }
  const openBids = async (listing: MarketplaceListing, target: "bid" | "compare") => {
    setSelected(listing); setWorking(true)
    const result = await marketplaceRepository.bids(listing.id)
    setBids(result.data); setWarning(result.warning || null); setWorking(false); setModal(target)
  }
  const openQuestions = async (listing: MarketplaceListing) => {
    setSelected(listing); setWorking(true)
    const result = await marketplaceRepository.questions(listing.id)
    setQuestions(result.data); setWarning(result.warning || null); setWorking(false); setModal("questions")
  }

  return (
    <section className="min-h-screen bg-[#f8fafc] px-4 py-6 text-[#0f172a] sm:px-7 lg:px-9">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">Proov Exchange</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Marketplace</h1><p className="mt-1 text-sm text-[#64748b]">Source production, manage RFQs, and move accepted bids into execution.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            {currentUserRole === "admin" && <button onClick={() => router.push("/admin/market")} className="market-btn"><ShieldCheck size={15} />Moderation</button>}
            {currentUserRole === "buyer" && <button onClick={() => router.push("/orders/new")} className="market-btn"><Package size={15} />Build from products</button>}
            {currentUserRole === "buyer" && <button onClick={() => openEditor()} className="market-btn-primary"><Plus size={15} />New RFQ</button>}
          </div>
        </header>

        {warning && <div role="status" className="mb-4 flex items-start justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span>{warning}</span><button aria-label="Dismiss warning" onClick={() => setWarning(null)}><X size={15} /></button></div>}

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex overflow-x-auto rounded-lg bg-[#f1f5f9] p-1">
            <TabButton active={tab === "browse"} onClick={() => { setTab("browse"); setPage(1) }} label="Browse" />
            {currentUserRole === "buyer" && <TabButton active={tab === "my-rfqs"} onClick={() => { setTab("my-rfqs"); setPage(1) }} label="My RFQs" />}
            {currentUserRole === "buyer" && <TabButton active={tab === "archived"} onClick={() => { setTab("archived"); setPage(1) }} label="Archived" />}
            {currentUserRole === "manufacturer" && <TabButton active={tab === "offers"} onClick={() => { setTab("offers"); setPage(1) }} label={`My offers (${offers.length})`} />}
            <TabButton active={tab === "manufacturers"} onClick={() => { setTab("manufacturers"); setPage(1) }} label="Manufacturers" />
          </div>
          {tab !== "manufacturers" && tab !== "offers" && <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <label className="relative min-w-[220px] flex-1 lg:max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search RFQs, buyers, destinations" className="market-input pl-9" /></label>
            <label className="relative"><Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" /><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="market-select pl-8">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="relative"><SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" /><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="market-select pl-8"><option value="newest">Newest</option><option value="closing">Closing soon</option><option value="budget">Highest budget</option></select></label>
            {currentUserRole !== "guest" && <button onClick={() => { setSavedOnly(!savedOnly); setPage(1) }} className={`market-btn ${savedOnly ? "border-blue-200 bg-blue-50 text-blue-700" : ""}`}><Bookmark size={14} fill={savedOnly ? "currentColor" : "none"} />Saved</button>}
          </div>}
        </div>

        {loading ? <LoadingState /> : tab === "manufacturers" ? (
          <ManufacturerDirectory manufacturers={manufacturers} query={query} setQuery={setQuery} onOpen={(manufacturer) => { setSelectedManufacturer(manufacturer); setModal("manufacturer") }} />
        ) : tab === "offers" ? (
          <OffersView offers={offers} listings={listings} onBrowse={() => setTab("browse")} onOrder={(offer) => offer.orderId && router.push(`/orders/${offer.orderId}`)} onOpen={(offer) => { const listing = listings.find((item) => item.id === offer.inquiryId); if (listing) { setSelected(listing); setBids([offer]); setModal("bid") } }} onWithdraw={async (offer) => { if (!confirm("Withdraw this bid?")) return; const result = await marketplaceRepository.withdrawBid(offer.id); setWarning(result.ok ? null : result.message); if (result.ok) setOffers((items) => items.map((item) => item.id === offer.id ? { ...item, status: "withdrawn" } : item)) }} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs text-[#64748b]"><span>{filtered.length} opportunities</span><span>Page {safePage} of {pageCount}</span></div>
              {paged.length ? paged.map((listing) => <ListingCard key={listing.id} listing={listing} nowTimestamp={nowTimestamp} selected={selected?.id === listing.id} role={currentUserRole} menuOpen={menuId === listing.id} onOpen={() => openListing(listing)} onSave={() => void toggleSaved(listing)} onMenu={() => setMenuId(menuId === listing.id ? null : listing.id)} onEdit={() => openEditor(listing)} onDuplicate={() => void duplicateListing(listing)} onClose={() => void closeListing(listing)} onArchive={() => void archiveListing(listing)} onDelete={() => void deleteListing(listing)} />) : <EmptyState title="No RFQs match this view" action={tab === "my-rfqs" ? "Create RFQ" : "Clear filters"} onAction={() => tab === "my-rfqs" ? openEditor() : (setQuery(""), setCategory("All"), setSavedOnly(false))} />}
              {pageCount > 1 && <div className="flex justify-center gap-2 pt-2"><button className="market-btn" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} />Previous</button><button className="market-btn" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight size={14} /></button></div>}
            </div>
            <ListingDetail listing={selected} role={currentUserRole} isOwner={Boolean(selected && (selected.buyerId === currentUserId || selected.id.startsWith("local-")))} onSave={() => selected && void toggleSaved(selected)} onBid={() => selected && void openBids(selected, "bid")} onCompare={() => selected && void openBids(selected, "compare")} onQuestion={() => selected && void openQuestions(selected)} onEdit={() => selected && openEditor(selected)} />
          </div>
        )}
      </div>

      {modal === "listing" && editing && <ListingModal listing={editing} setListing={setEditing} working={working} onClose={() => setModal(null)} onSave={() => void saveListing(false)} onPublish={() => void saveListing(true)} />}
      {modal === "bid" && selected && <BidModal listing={selected} existing={bids.find((bid) => bid.manufacturerId === currentUserId)} working={working} onClose={() => setModal(null)} onSubmit={async (values) => { setWorking(true); const result = await marketplaceRepository.submitBid(selected, values); setWarning(result.ok ? null : result.message); setWorking(false); if (result.ok) { setModal(null); await load() } }} />}
      {modal === "questions" && selected && <QuestionsModal listing={selected} questions={questions} working={working} onClose={() => setModal(null)} onSend={async (body, attachmentUrls) => { setWorking(true); const result = await marketplaceRepository.askQuestion(selected, body, attachmentUrls); setWarning(result.ok ? null : result.message); if (result.ok) { const refreshed = await marketplaceRepository.questions(selected.id); setQuestions(refreshed.data) } setWorking(false) }} />}
      {modal === "compare" && selected && <CompareModal listing={selected} bids={bids} working={working} onClose={() => setModal(null)} onDecision={async (bid, action) => { setWorking(true); const result = await marketplaceRepository.setBidDecision(bid, action); setWarning(result.ok ? null : result.message); if (result.ok) { const refreshed = await marketplaceRepository.bids(selected.id); setBids(refreshed.data) } setWorking(false) }} onCounter={async (bid, price, days, message) => { setWorking(true); const result = await marketplaceRepository.counterBid(bid, price, days, message); setWarning(result.ok ? null : result.message); if (result.ok) { const refreshed = await marketplaceRepository.bids(selected.id); setBids(refreshed.data) } setWorking(false) }} onAccept={async (bid) => { if (!confirm(`Accept ${bid.manufacturerName}'s bid and create an order?`)) return; setWorking(true); const result = await marketplaceRepository.acceptBid(bid.id); setWarning(result.ok ? null : result.message); setWorking(false); if (result.ok) router.push(`/orders/${result.data}`) }} />}
      {modal === "manufacturer" && selectedManufacturer && <ManufacturerModal manufacturer={selectedManufacturer} guest={currentUserRole === "guest"} onClose={() => setModal(null)} onInvite={() => { setModal(null); router.push(currentUserRole === "guest" ? "/login?next=/marketplace" : "/orders/new") }} />}
      {working && <div className="fixed bottom-5 right-5 z-[80] rounded-lg bg-[#0f172a] px-4 py-2 text-xs font-semibold text-white shadow-xl">Saving changes...</div>}
    </section>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) { return <button onClick={onClick} className={`whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold transition ${active ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"}`}>{label}</button> }

function ListingCard({ listing, nowTimestamp, selected, role, menuOpen, onOpen, onSave, onMenu, onEdit, onDuplicate, onClose, onArchive, onDelete }: { listing: MarketplaceListing; nowTimestamp: number; selected: boolean; role: MarketplaceRole; menuOpen: boolean; onOpen: () => void; onSave: () => void; onMenu: () => void; onEdit: () => void; onDuplicate: () => void; onClose: () => void; onArchive: () => void; onDelete: () => void }) {
  const days = Math.max(0, Math.ceil((+new Date(listing.expiresAt) - nowTimestamp) / 86400000))
  return <article onClick={onOpen} className={`relative cursor-pointer rounded-xl border bg-white p-4 transition hover:border-[#94a3b8] hover:shadow-md ${selected ? "border-blue-300 ring-2 ring-blue-50" : "border-[#e2e8f0]"}`}>
    {listing.id.startsWith("demo-") && <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900 shadow-sm">Demo · read only</span>}
    <div className="flex gap-4"><img src={listing.thumbnailUrl} alt="" className="h-24 w-24 rounded-lg bg-[#f1f5f9] object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${listing.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{listing.status === "active" ? "Live" : listing.status}</span>{listing.splitBidding && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Split bidding</span>}<span className="font-mono text-[10px] text-[#94a3b8]">{listing.inquiryNumber}</span></div><h2 className="mt-1.5 truncate text-sm font-semibold text-[#0f172a]">{listing.title}</h2><p className="mt-1 text-xs text-[#64748b]">{listing.buyerName} · {listing.category}</p></div><div className="flex gap-1"><button aria-label="Save RFQ" onClick={(event) => { event.stopPropagation(); onSave() }} className="rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-blue-600"><Bookmark size={15} fill={listing.saved ? "currentColor" : "none"} /></button>{role === "buyer" && <button aria-label="RFQ actions" onClick={(event) => { event.stopPropagation(); onMenu() }} className="rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]"><MoreHorizontal size={16} /></button>}</div></div><div className="mt-3 grid grid-cols-4 gap-2"><Metric label="Quantity" value={`${listing.quantity.toLocaleString()} ${listing.unit}`} /><Metric label="Target" value={`$${listing.targetPrice.toFixed(2)}`} /><Metric label="TAT" value={`${listing.tatDays} days`} /><Metric label="Bids" value={String(listing.bidCount)} /></div><div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]"><span className="flex items-center gap-1"><MapPin size={12} />{listing.destination}</span><span className={`flex items-center gap-1 ${days <= 2 ? "text-rose-600" : ""}`}><Clock3 size={12} />{days}d remaining</span></div></div></div>
    {menuOpen && <div onClick={(event) => event.stopPropagation()} className="absolute right-4 top-12 z-20 w-44 rounded-lg border border-[#e2e8f0] bg-white p-1 shadow-xl"><ActionButton icon={<FileText size={13} />} label="Edit" onClick={onEdit} /><ActionButton icon={<Copy size={13} />} label="Duplicate" onClick={onDuplicate} />{listing.status === "active" && <ActionButton icon={<X size={13} />} label="Close RFQ" onClick={onClose} />}<ActionButton icon={<Archive size={13} />} label={listing.archivedAt ? "Restore" : "Archive"} onClick={onArchive} /><ActionButton icon={<Trash2 size={13} />} label="Delete" onClick={onDelete} danger /></div>}
  </article>
}

function ListingDetail({ listing, role, isOwner, onSave, onBid, onCompare, onQuestion, onEdit }: { listing: MarketplaceListing | null; role: MarketplaceRole; isOwner: boolean; onSave: () => void; onBid: () => void; onCompare: () => void; onQuestion: () => void; onEdit: () => void }) {
  if (!listing) return <EmptyState title="Select an RFQ" action="" onAction={() => {}} />
  return <aside className="sticky top-4 self-start overflow-hidden rounded-xl border border-[#e2e8f0] bg-white"><div className="relative h-52 bg-[#f1f5f9]"><img src={listing.thumbnailUrl} alt={listing.title} className="h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white"><p className="font-mono text-[10px] opacity-75">{listing.inquiryNumber}</p><h2 className="mt-1 text-xl font-semibold">{listing.title}</h2></div></div><div className="p-5"><div className="grid grid-cols-3 gap-2"><Metric label="Target / unit" value={`$${listing.targetPrice.toFixed(2)}`} large /><Metric label="Quantity" value={listing.quantity.toLocaleString()} large /><Metric label="Products" value={String(listing.productCount)} large /></div><p className="mt-5 text-sm leading-6 text-[#475569]">{listing.description}</p><div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-[#e2e8f0] py-4 text-xs"><Detail label="Buyer" value={listing.buyerName} /><Detail label="Destination" value={listing.destination} /><Detail label="Incoterms" value={listing.incoterms} /><Detail label="Sample" value={listing.sampleRequired ? "Required" : "Not required"} /><Detail label="Turnaround" value={`${listing.tatDays} days`} /><Detail label="Visibility" value={listing.visibility} /></div><div className="mt-5 flex flex-wrap gap-2">{role === "manufacturer" && listing.status === "active" && <button onClick={onBid} className="market-btn-primary flex-1"><Send size={14} />Place or revise bid</button>}{role === "manufacturer" && <button onClick={onQuestion} className="market-btn"><MessageSquare size={14} />Ask question</button>}{role === "buyer" && isOwner && <button onClick={onCompare} className="market-btn-primary flex-1"><Trophy size={14} />Compare {listing.bidCount} bids</button>}{role === "buyer" && isOwner && <button onClick={onEdit} className="market-btn"><FileText size={14} />Edit</button>}<button onClick={onSave} className="market-btn"><Bookmark size={14} fill={listing.saved ? "currentColor" : "none"} />{listing.saved ? "Saved" : "Save"}</button></div></div></aside>
}

function ListingModal({ listing, setListing, working, onClose, onSave, onPublish }: { listing: MarketplaceListing; setListing: (listing: MarketplaceListing) => void; working: boolean; onClose: () => void; onSave: () => void; onPublish: () => void }) {
  const set = (patch: Partial<MarketplaceListing>) => setListing({ ...listing, ...patch })
  const updateCommercial = (patch: Partial<MarketplaceListing>) => {
    const firstProduct = listing.products[0]
    const nextProduct = firstProduct ? { ...firstProduct, name: patch.title || firstProduct.name, category: patch.category || firstProduct.category, quantity: patch.quantity ?? firstProduct.quantity, targetUnitPrice: patch.targetPrice ?? firstProduct.targetUnitPrice } : undefined
    set({ ...patch, products: nextProduct ? [nextProduct, ...listing.products.slice(1)] : listing.products })
  }
  const expiryValue = listing.expiresAt.slice(0, 10)
  return <ModalShell title={listing.inquiryNumber === "Draft" ? "Create RFQ" : "Edit RFQ"} subtitle="Production requirements and commercial terms" onClose={onClose}>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="RFQ title" wide><input className="market-input" value={listing.title} onChange={(event) => updateCommercial({ title: event.target.value })} placeholder="e.g. 500 sublimated team kits" /></Field>
      <Field label="Description" wide><textarea className="market-input min-h-24 py-2" value={listing.description} onChange={(event) => set({ description: event.target.value })} /></Field>
      <Field label="Category"><select className="market-input" value={listing.category} onChange={(event) => updateCommercial({ category: event.target.value })}><option>Sportswear</option><option>Apparel</option><option>Outerwear</option><option>Leather Goods</option><option>Packaging</option></select></Field>
      <Field label="Quantity"><input type="number" min="1" className="market-input" value={listing.quantity} onChange={(event) => updateCommercial({ quantity: Number(event.target.value) })} /></Field>
      <Field label="Target unit price"><input type="number" min="0.01" step="0.01" className="market-input" value={listing.targetPrice} onChange={(event) => updateCommercial({ targetPrice: Number(event.target.value) })} /></Field>
      <Field label="Maximum unit price"><input type="number" min="0.01" step="0.01" className="market-input" value={listing.maxPrice} onChange={(event) => set({ maxPrice: Number(event.target.value) })} /></Field>
      <Field label="Turnaround days"><input type="number" min="1" className="market-input" value={listing.tatDays} onChange={(event) => set({ tatDays: Number(event.target.value) })} /></Field>
      <Field label="Bid deadline"><input type="date" min={new Date().toISOString().slice(0, 10)} className="market-input" value={expiryValue} onChange={(event) => set({ expiresAt: new Date(`${event.target.value}T23:59:59.000Z`).toISOString() })} /></Field>
      <Field label="Destination"><input className="market-input" value={listing.destination} onChange={(event) => set({ destination: event.target.value })} /></Field>
      <Field label="Incoterms"><select className="market-input" value={listing.incoterms} onChange={(event) => set({ incoterms: event.target.value })}><option>FOB</option><option>CIF</option><option>EXW</option><option>DDP</option></select></Field>
      <Field label="Visibility"><select className="market-input" value={listing.visibility} onChange={(event) => set({ visibility: event.target.value as MarketplaceListing["visibility"] })}><option value="market">Public marketplace</option><option value="private">Invited manufacturers</option></select><span className="mt-1 block text-[10px] text-[#94a3b8]">New private RFQs continue in the full product and invitation builder.</span></Field>
      <label className="flex items-center gap-2 text-xs text-[#475569]"><input type="checkbox" checked={listing.sampleRequired} onChange={(event) => set({ sampleRequired: event.target.checked })} />Sample required</label>
      <label className="flex items-center gap-2 text-xs text-[#475569]"><input type="checkbox" checked={listing.splitBidding} onChange={(event) => set({ splitBidding: event.target.checked })} />Allow per-product bids</label>
    </div>
    <div className="mt-6 flex justify-end gap-2"><button className="market-btn" onClick={onSave} disabled={working}>Save draft</button><button className="market-btn-primary" onClick={onPublish} disabled={working}>Publish RFQ</button></div>
  </ModalShell>
}

function BidModal({ listing, existing, working, onClose, onSubmit }: { listing: MarketplaceListing; existing?: MarketplaceBid; working: boolean; onClose: () => void; onSubmit: (values: Pick<MarketplaceBid, "unitPrice" | "tatDays" | "sampleAvailable" | "sampleTatDays" | "message" | "productPrices">) => void }) {
  const [unitPrice, setUnitPrice] = useState(existing?.counterUnitPrice || existing?.unitPrice || listing.targetPrice)
  const [tatDays, setTatDays] = useState(existing?.counterTatDays || existing?.tatDays || listing.tatDays)
  const [message, setMessage] = useState(existing?.message || "")
  const [sampleAvailable, setSampleAvailable] = useState(existing?.sampleAvailable ?? true)
  const [sampleTatDays, setSampleTatDays] = useState(existing?.sampleTatDays || 5)
  const [productPrices, setProductPrices] = useState(() => listing.products.map((product) => {
    const saved = existing?.productPrices.find((price) => price.order_product_id === product.id)
    return { order_product_id: product.id, unit_price: saved?.unit_price || product.targetUnitPrice || unitPrice, tat_days: saved?.tat_days || tatDays }
  }))
  const splitSummary = calculateSplitBidSummary(listing.products, productPrices, unitPrice, tatDays)
  const totalBid = listing.splitBidding ? splitSummary.total : unitPrice * listing.quantity
  const effectiveUnitPrice = listing.splitBidding ? splitSummary.weightedUnitPrice : unitPrice
  const updateLine = (productId: string, patch: Partial<(typeof productPrices)[number]>) => setProductPrices((items) => items.map((item) => item.order_product_id === productId ? { ...item, ...patch } : item))
  return <ModalShell title={existing ? "Revise bid" : "Submit bid"} subtitle={listing.title} onClose={onClose}>
    {existing?.counterUnitPrice && <div className="mb-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800"><strong>Buyer counter:</strong> ${existing.counterUnitPrice.toFixed(2)} per unit · {existing.counterTatDays} days. {existing.counterMessage}</div>}
    <div className="rounded-lg bg-[#f8fafc] p-3 text-xs text-[#475569]">Buyer target: <strong>${listing.targetPrice.toFixed(2)}</strong> · Quantity: <strong>{listing.quantity.toLocaleString()}</strong> · Total bid: <strong>${totalBid.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
    {listing.splitBidding && listing.products.length > 0 ? <div className="mt-4 space-y-2"><p className="text-xs font-semibold text-[#475569]">Per-product pricing</p>{listing.products.map((product) => { const price = productPrices.find((item) => item.order_product_id === product.id); return <div key={product.id} className="grid grid-cols-[1fr_110px_90px] items-center gap-2 rounded-lg border border-[#e2e8f0] p-3"><div><p className="text-xs font-semibold">{product.name}</p><p className="text-[10px] text-[#94a3b8]">{product.quantity.toLocaleString()} {product.unit} · target ${product.targetUnitPrice.toFixed(2)}</p></div><input aria-label={`${product.name} unit price`} type="number" min="0.01" step="0.01" className="market-input" value={price?.unit_price || 0} onChange={(event) => updateLine(product.id, { unit_price: Number(event.target.value) })} /><input aria-label={`${product.name} turnaround days`} type="number" min="1" className="market-input" value={price?.tat_days || tatDays} onChange={(event) => updateLine(product.id, { tat_days: Number(event.target.value) })} /></div>})}</div> : <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Unit price (USD)"><input type="number" min="0.01" step="0.01" className="market-input" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} /></Field><Field label="Turnaround days"><input type="number" min="1" className="market-input" value={tatDays} onChange={(event) => setTatDays(Number(event.target.value))} /></Field></div>}
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={sampleAvailable} onChange={(event) => setSampleAvailable(event.target.checked)} />Sample available</label>{sampleAvailable && <Field label="Sample days"><input type="number" min="1" className="market-input" value={sampleTatDays} onChange={(event) => setSampleTatDays(Number(event.target.value))} /></Field>}<Field label="Proposal" wide><textarea className="market-input min-h-28 py-2" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Explain capacity, materials, certifications, and delivery assumptions." /></Field></div>
    <div className="mt-6 flex justify-end gap-2"><button className="market-btn" onClick={onClose}>Cancel</button><button className="market-btn-primary" disabled={working || effectiveUnitPrice <= 0 || tatDays <= 0 || !message.trim() || (listing.splitBidding && productPrices.some((price) => price.unit_price <= 0 || price.tat_days <= 0))} onClick={() => onSubmit({ unitPrice: effectiveUnitPrice, tatDays: listing.splitBidding ? splitSummary.tatDays : tatDays, sampleAvailable, sampleTatDays, message, productPrices: listing.splitBidding ? productPrices : [] })}>{existing?.counterUnitPrice ? "Accept counter and revise" : existing ? "Submit revision" : "Submit bid"}</button></div>
  </ModalShell>
}

function QuestionsModal({ listing, questions, working, onClose, onSend }: { listing: MarketplaceListing; questions: MarketplaceQuestion[]; working: boolean; onClose: () => void; onSend: (body: string, attachmentUrls: string[]) => void }) {
  const [body, setBody] = useState("")
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const upload = async (file?: File) => {
    if (!file) return
    setUploading(true); setUploadError(null)
    try {
      const data = new FormData(); data.append("file", file)
      const response = await fetch("/api/upload", { method: "POST", body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Upload failed")
      setAttachment({ name: file.name, url: result.url })
    } catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed") }
    finally { setUploading(false) }
  }
  return <ModalShell title="RFQ questions" subtitle={listing.title} onClose={onClose}><div className="max-h-72 space-y-3 overflow-y-auto">{questions.length ? questions.map((question) => <div key={question.id} className="rounded-lg bg-[#f8fafc] p-3"><div className="flex justify-between text-[11px] font-semibold"><span>{question.authorName}</span><span className="font-normal text-[#94a3b8]">{new Date(question.createdAt).toLocaleString()}</span></div><p className="mt-1 text-sm text-[#475569]">{question.body}</p>{question.attachmentUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6E56CF]"><Paperclip size={12} />{url.split("/").pop()}</a>)}</div>) : <p className="py-8 text-center text-sm text-[#94a3b8]">No questions yet.</p>}</div><div className="mt-4 flex gap-2"><textarea value={body} onChange={(e) => setBody(e.target.value)} className="market-input min-h-20 flex-1 py-2" placeholder="Ask a specific production question" /><div className="flex flex-col justify-end gap-2"><label className="market-btn-secondary cursor-pointer"><Paperclip size={14} />{uploading ? "Uploading..." : "Attach"}<input type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" disabled={uploading || working} onChange={(event) => void upload(event.target.files?.[0])} /></label><button className="market-btn-primary" disabled={working || uploading || !body.trim()} onClick={() => { onSend(body, attachment ? [attachment.url] : []); setBody(""); setAttachment(null) }}><Send size={14} />Send</button></div></div>{attachment && <div className="mt-2 flex items-center justify-between rounded-lg border border-[#ddd6fe] bg-[#f5f3ff] px-3 py-2 text-xs text-[#6E56CF]"><span className="truncate"><Paperclip size={12} className="mr-1 inline" />{attachment.name}</span><button onClick={() => setAttachment(null)} aria-label="Remove attachment"><X size={12} /></button></div>}{uploadError && <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>}</ModalShell>
}

function CompareModal({ listing, bids, working, onClose, onAccept, onDecision, onCounter }: { listing: MarketplaceListing; bids: MarketplaceBid[]; working: boolean; onClose: () => void; onAccept: (bid: MarketplaceBid) => void; onDecision: (bid: MarketplaceBid, action: "shortlist" | "reject") => void; onCounter: (bid: MarketplaceBid, price: number, days: number, message: string) => void }) { const sorted = [...bids].sort((a, b) => a.unitPrice - b.unitPrice); const counter = (bid: MarketplaceBid) => { const price = Number(prompt("Counter unit price", String(bid.counterUnitPrice || bid.unitPrice))); if (!price) return; const days = Number(prompt("Required turnaround days", String(bid.counterTatDays || bid.tatDays))); if (!days) return; const message = prompt("Counter offer note", bid.counterMessage || "Confirm capacity and revised commercial terms.")?.trim(); if (!message) return; onCounter(bid, price, days, message) }; return <ModalShell title="Compare bids" subtitle={`${listing.title} · ${bids.length} bids`} onClose={onClose} wide><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-[#e2e8f0] text-[#64748b]"><th className="px-3 py-3">Manufacturer</th><th className="px-3 py-3">Unit price</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">TAT</th><th className="px-3 py-3">Sample</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Decision</th></tr></thead><tbody>{sorted.map((bid, index) => <tr key={bid.id} className={`border-b border-[#f1f5f9] ${bid.shortlisted ? "bg-blue-50/40" : ""}`}><td className="px-3 py-4"><span className="flex items-center gap-1 font-semibold">{bid.manufacturerName}{bid.verified && <BadgeCheck size={13} className="text-blue-600" />}</span><span className="text-[10px] text-[#94a3b8]">Revision {bid.revision}{bid.shortlisted ? " · Shortlisted" : ""}</span></td><td className="px-3 py-4 font-semibold text-emerald-700">${bid.unitPrice.toFixed(2)}{index === 0 && <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px]">lowest</span>}{bid.counterUnitPrice && <span className="block text-[10px] font-normal text-violet-600">Counter ${bid.counterUnitPrice.toFixed(2)}</span>}</td><td className="px-3 py-4">${(bid.unitPrice * listing.quantity).toLocaleString()}</td><td className="px-3 py-4">{bid.tatDays} days</td><td className="px-3 py-4">{bid.sampleAvailable ? `${bid.sampleTatDays}d` : "No"}</td><td className="px-3 py-4 capitalize">{bid.status}</td><td className="px-3 py-4"><div className="flex flex-wrap gap-1"><button disabled={working || bid.status !== "pending"} onClick={() => onDecision(bid, "shortlist")} className="market-btn !h-7 !px-2">{bid.shortlisted ? "Remove" : "Shortlist"}</button><button disabled={working || bid.status !== "pending"} onClick={() => counter(bid)} className="market-btn !h-7 !px-2">Counter</button><button disabled={working || bid.status !== "pending"} onClick={() => onAccept(bid)} className="market-btn-primary !h-7 !px-2"><Check size={12} />Accept</button><button disabled={working || bid.status !== "pending"} onClick={() => confirm(`Reject ${bid.manufacturerName}'s bid?`) && onDecision(bid, "reject")} className="market-btn !h-7 !px-2 text-rose-600">Reject</button></div></td></tr>)}</tbody></table>{!bids.length && <p className="py-12 text-center text-sm text-[#94a3b8]">No bids have been submitted yet.</p>}</div></ModalShell> }

function ManufacturerDirectory({ manufacturers, query, setQuery, onOpen }: { manufacturers: MarketplaceManufacturer[]; query: string; setQuery: (value: string) => void; onOpen: (manufacturer: MarketplaceManufacturer) => void }) { const filtered = manufacturers.filter((item) => `${item.companyName} ${item.country} ${item.capabilities.join(" ")}`.toLowerCase().includes(query.toLowerCase())); return <div><label className="relative mb-4 block max-w-md"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" /><input className="market-input pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search capabilities, locations, certifications" /></label><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((manufacturer) => <button key={manufacturer.id} onClick={() => onOpen(manufacturer)} className="rounded-xl border border-[#e2e8f0] bg-white p-5 text-left transition hover:border-blue-200 hover:shadow-md"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-700">{manufacturer.companyName.slice(0, 2).toUpperCase()}</div><span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Star size={13} fill="currentColor" />{manufacturer.rating || "New"}</span></div><h3 className="mt-4 flex items-center gap-1 text-sm font-semibold">{manufacturer.companyName}{manufacturer.verified && <BadgeCheck size={14} className="text-blue-600" />}</h3><p className="mt-1 flex items-center gap-1 text-xs text-[#64748b]"><MapPin size={12} />{manufacturer.city}, {manufacturer.country}</p><div className="mt-3 flex flex-wrap gap-1">{manufacturer.capabilities.slice(0, 3).map((capability) => <span key={capability} className="rounded bg-[#f1f5f9] px-2 py-1 text-[10px] text-[#475569]">{capability}</span>)}</div><div className="mt-4 grid grid-cols-3 gap-2"><Metric label="MOQ" value={String(manufacturer.minOrderQuantity)} /><Metric label="Lead time" value={`${manufacturer.leadTimeDays}d`} /><Metric label="Pricing" value={manufacturer.priceRange} /></div></button>)}</div></div> }

function ManufacturerModal({ manufacturer, guest, onClose, onInvite }: { manufacturer: MarketplaceManufacturer; guest: boolean; onClose: () => void; onInvite: () => void }) { return <ModalShell title={manufacturer.companyName} subtitle={`${manufacturer.city}, ${manufacturer.country}`} onClose={onClose}><div className="flex items-center gap-4 rounded-xl bg-[#f8fafc] p-4"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-lg font-semibold text-blue-700">{manufacturer.companyName.slice(0, 2).toUpperCase()}</div><div><p className="flex items-center gap-1 text-sm font-semibold">{manufacturer.verified && <BadgeCheck size={15} className="text-blue-600" />} {manufacturer.rating ? `${manufacturer.rating} rating · ${manufacturer.reviewCount} reviews` : "New manufacturer"}</p><p className="mt-1 text-xs text-[#64748b]">MOQ {manufacturer.minOrderQuantity} · {manufacturer.leadTimeDays} day lead time · {manufacturer.priceRange}</p></div></div><p className="mt-5 text-sm leading-6 text-[#475569]">{manufacturer.bio}</p><div className="mt-5"><h4 className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Capabilities</h4><div className="mt-2 flex flex-wrap gap-2">{manufacturer.capabilities.map((item) => <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{item}</span>)}</div></div><div className="mt-5"><h4 className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Certifications</h4><div className="mt-2 flex flex-wrap gap-2">{manufacturer.certifications.map((item) => <span key={item} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"><ShieldCheck size={12} />{item}</span>)}</div></div><button onClick={onInvite} className="market-btn-primary mt-6 w-full"><Send size={14} />{guest ? "Sign in to contact" : "Invite to private RFQ"}</button></ModalShell> }

function OffersView({ offers, listings, onOpen, onWithdraw, onOrder, onBrowse }: { offers: MarketplaceBid[]; listings: MarketplaceListing[]; onOpen: (offer: MarketplaceBid) => void; onWithdraw: (offer: MarketplaceBid) => void; onOrder: (offer: MarketplaceBid) => void; onBrowse: () => void }) { return <div className="space-y-3">{offers.length ? offers.map((offer) => { const listing = listings.find((item) => item.id === offer.inquiryId); return <article key={offer.id} className="flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 md:flex-row md:items-center"><div className="flex-1"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${offer.status === "accepted" ? "bg-emerald-50 text-emerald-700" : offer.status === "rejected" || offer.status === "withdrawn" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{offer.status}</span><span className="text-[10px] text-[#94a3b8]">Revision {offer.revision}</span>{offer.counterUnitPrice && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Counter received</span>}</div><h3 className="mt-2 text-sm font-semibold">{listing?.title || `RFQ ${offer.inquiryId.slice(0, 8)}`}</h3><p className="mt-1 text-xs text-[#64748b]">${offer.unitPrice.toFixed(2)} / unit · {offer.tatDays} days · {offer.message}</p></div><div className="flex gap-2">{offer.status === "accepted" && offer.orderId ? <button className="market-btn-primary" onClick={() => onOrder(offer)}>Open order</button> : <button className="market-btn" onClick={() => onOpen(offer)}>{offer.counterUnitPrice ? "Review counter" : "View / revise"}</button>}{offer.status === "pending" && <button className="market-btn text-rose-600" onClick={() => onWithdraw(offer)}>Withdraw</button>}</div></article> }) : <EmptyState title="No offers submitted" action="Browse RFQs" onAction={onBrowse} />}</div> }

function ModalShell({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/45 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div role="dialog" aria-modal="true" className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-4"><div><h2 className="text-lg font-semibold">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-[#64748b]">{subtitle}</p>}</div><button onClick={onClose} className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9]" aria-label="Close"><X size={18} /></button></div><div className="p-6">{children}</div></div></div> }
function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`block ${wide ? "sm:col-span-2" : ""}`}><span className="mb-1.5 block text-xs font-semibold text-[#475569]">{label}</span>{children}</label> }
function Metric({ label, value, large }: { label: string; value: string; large?: boolean }) { return <div className="rounded-lg bg-[#f8fafc] px-2.5 py-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-[#94a3b8]">{label}</p><p className={`mt-0.5 truncate font-semibold text-[#0f172a] ${large ? "text-sm" : "text-[11px]"}`}>{value}</p></div> }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">{label}</p><p className="mt-0.5 font-medium capitalize text-[#334155]">{value}</p></div> }
function ActionButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) { return <button onClick={onClick} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs hover:bg-[#f1f5f9] ${danger ? "text-rose-600" : "text-[#475569]"}`}>{icon}{label}</button> }
function EmptyState({ title, action, onAction }: { title: string; action: string; onAction: () => void }) { return <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-white p-8 text-center"><Building2 size={26} className="text-[#94a3b8]" /><h3 className="mt-3 text-sm font-semibold">{title}</h3>{action && <button className="market-btn-primary mt-4" onClick={onAction}>{action}</button>}</div> }
function LoadingState() { return <div className="grid gap-4 xl:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-xl border border-[#e2e8f0] bg-white p-4"><div className="h-full rounded-lg bg-[#f1f5f9]" /></div>)}</div> }
