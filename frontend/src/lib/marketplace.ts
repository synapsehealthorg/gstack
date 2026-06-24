"use client"

import { createClient } from "@/utils/supabase/client"

const LOCAL_KEY = "proov_marketplace_demo_v1"
const SAVED_KEY = "proov_marketplace_saved_v1"

export type MarketplaceRole = "buyer" | "manufacturer" | "admin" | "guest"
export type ListingStatus = "draft" | "active" | "under_review" | "accepted" | "cancelled" | "expired"

export interface MarketplaceProduct {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  targetUnitPrice: number
  thumbnailUrl: string
  qualityCoverage: "full" | "partial"
}

export interface MarketplaceListing {
  id: string
  inquiryNumber: string
  buyerId: string
  buyerName: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  targetPrice: number
  maxPrice: number
  tatDays: number
  destination: string
  incoterms: string
  sampleRequired: boolean
  status: ListingStatus
  visibility: "market" | "private"
  splitBidding: boolean
  bidCount: number
  productCount: number
  products: MarketplaceProduct[]
  thumbnailUrl: string
  techpackUrls: string[]
  expiresAt: string
  createdAt: string
  archivedAt: string | null
  saved: boolean
}

export interface MarketplaceBid {
  id: string
  inquiryId: string
  manufacturerId: string
  manufacturerName: string
  unitPrice: number
  currency: string
  tatDays: number
  sampleAvailable: boolean
  sampleTatDays: number
  message: string
  status: "pending" | "accepted" | "rejected" | "withdrawn"
  rating: number
  verified: boolean
  location: string
  revision: number
  shortlisted: boolean
  counterUnitPrice: number | null
  counterTatDays: number | null
  counterMessage: string
  productPrices: Array<{ order_product_id: string; unit_price: number; tat_days: number }>
  orderId: string | null
  createdAt: string
}

export interface MarketplaceManufacturer {
  id: string
  companyName: string
  country: string
  city: string
  capabilities: string[]
  certifications: string[]
  minOrderQuantity: number
  leadTimeDays: number
  priceRange: string
  portfolioUrls: string[]
  verified: boolean
  rating: number
  reviewCount: number
  bio: string
}

export interface MarketplaceQuestion {
  id: string
  inquiryId: string
  authorId: string
  authorName: string
  body: string
  attachmentUrls: string[]
  createdAt: string
}

export interface MarketplaceResult<T> {
  data: T
  source: "supabase" | "demo"
  warning?: string
}

const now = Date.now()
const SEEDED_LISTINGS: MarketplaceListing[] = [
  { id: "demo-rfq-431", inquiryNumber: "PRV-2026-00431", buyerId: "demo-buyer-1", buyerName: "Northstar FC", title: "Football Jersey Kit - Full Team Set", description: "Home and away sublimated kits with player names, numbers, socks, and export packaging.", category: "Sportswear", quantity: 500, unit: "sets", targetPrice: 7.6, maxPrice: 9.2, tatDays: 21, destination: "Manchester, UK", incoterms: "FOB", sampleRequired: true, status: "active", visibility: "market", splitBidding: true, bidCount: 7, productCount: 3, products: [{ id: "demo-line-home", name: "Home jersey", category: "Sportswear", quantity: 500, unit: "pieces", targetUnitPrice: 7.6, thumbnailUrl: "/assets/baseball_jersey.png", qualityCoverage: "full" }, { id: "demo-line-away", name: "Away jersey", category: "Sportswear", quantity: 500, unit: "pieces", targetUnitPrice: 7.6, thumbnailUrl: "/assets/baseball_jersey.png", qualityCoverage: "full" }, { id: "demo-line-shorts", name: "Match shorts", category: "Sportswear", quantity: 500, unit: "pieces", targetUnitPrice: 4.2, thumbnailUrl: "/assets/create/apparel_mockups.png", qualityCoverage: "full" }], thumbnailUrl: "/assets/baseball_jersey.png", techpackUrls: [], expiresAt: new Date(now + 5 * 86400000).toISOString(), createdAt: new Date(now - 2 * 86400000).toISOString(), archivedAt: null, saved: false },
  { id: "demo-rfq-418", inquiryNumber: "PRV-2026-00418", buyerId: "demo-buyer-2", buyerName: "Sport Arabia", title: "Performance Polo Uniform Program", description: "Moisture-wicking polos with embroidered chest marks and individual polybag packaging.", category: "Apparel", quantity: 1200, unit: "pieces", targetPrice: 9.8, maxPrice: 12, tatDays: 28, destination: "Dubai, UAE", incoterms: "CIF", sampleRequired: true, status: "active", visibility: "market", splitBidding: false, bidCount: 12, productCount: 1, products: [{ id: "demo-line-polo", name: "Performance polo", category: "Apparel", quantity: 1200, unit: "pieces", targetUnitPrice: 9.8, thumbnailUrl: "/assets/polo_shirt.png", qualityCoverage: "full" }], thumbnailUrl: "/assets/polo_shirt.png", techpackUrls: [], expiresAt: new Date(now + 2 * 86400000).toISOString(), createdAt: new Date(now - 5 * 86400000).toISOString(), archivedAt: null, saved: false },
  { id: "demo-rfq-409", inquiryNumber: "PRV-2026-00409", buyerId: "demo-buyer-3", buyerName: "TrendForce", title: "Premium Heavyweight Hoodie Drop", description: "420 GSM brushed fleece hoodies with embroidery, woven labels, and recycled packaging.", category: "Outerwear", quantity: 300, unit: "pieces", targetPrice: 21, maxPrice: 27, tatDays: 35, destination: "Berlin, Germany", incoterms: "DDP", sampleRequired: true, status: "active", visibility: "market", splitBidding: false, bidCount: 5, productCount: 1, products: [{ id: "demo-line-hoodie", name: "Heavyweight hoodie", category: "Outerwear", quantity: 300, unit: "pieces", targetUnitPrice: 21, thumbnailUrl: "/assets/streetwear_hoodie.png", qualityCoverage: "full" }], thumbnailUrl: "/assets/streetwear_hoodie.png", techpackUrls: [], expiresAt: new Date(now + 9 * 86400000).toISOString(), createdAt: new Date(now - 86400000).toISOString(), archivedAt: null, saved: false },
]

const SEEDED_MANUFACTURERS: MarketplaceManufacturer[] = [
  { id: "demo-mfr-1", companyName: "Sialkot Performance Works", country: "Pakistan", city: "Sialkot", capabilities: ["Sublimation", "Cut and sew", "Embroidery"], certifications: ["ISO 9001", "WRAP"], minOrderQuantity: 100, leadTimeDays: 21, priceRange: "$6-$24", portfolioUrls: ["/assets/tracksuit.png"], verified: true, rating: 4.9, reviewCount: 38, bio: "Teamwear and technical sportswear manufacturer serving European clubs." },
  { id: "demo-mfr-2", companyName: "Anatolia Apparel Co.", country: "Turkey", city: "Istanbul", capabilities: ["Jersey", "Fleece", "Screen print"], certifications: ["OEKO-TEX", "BSCI"], minOrderQuantity: 150, leadTimeDays: 28, priceRange: "$8-$35", portfolioUrls: ["/assets/streetwear_hoodie.png"], verified: true, rating: 4.7, reviewCount: 24, bio: "Full-package apparel development with low-volume sampling and EU logistics." },
  { id: "demo-mfr-3", companyName: "Lanka Active Textiles", country: "Sri Lanka", city: "Colombo", capabilities: ["Activewear", "Bonding", "Recycled fabrics"], certifications: ["GRS", "SEDEX"], minOrderQuantity: 250, leadTimeDays: 32, priceRange: "$7-$29", portfolioUrls: ["/assets/polo_shirt.png"], verified: false, rating: 4.5, reviewCount: 11, bio: "Performance knit specialist with recycled material sourcing." },
]

function browserSavedIds() {
  if (typeof window === "undefined") return new Set<string>()
  try { return new Set<string>(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")) } catch { return new Set<string>() }
}

function demoListings() {
  const saved = browserSavedIds()
  let custom: MarketplaceListing[] = []
  if (typeof window !== "undefined") {
    try { custom = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") } catch { custom = [] }
  }
  return [...custom, ...SEEDED_LISTINGS].map((listing) => ({ ...listing, saved: saved.has(listing.id) }))
}

function rowToListing(row: Record<string, unknown>, saved: Set<string>): MarketplaceListing {
  const products = (row.order_products || []) as Array<Record<string, unknown>>
  const profiles = row.profiles as Record<string, unknown> | null
  return {
    id: String(row.id), inquiryNumber: String(row.inquiry_number || String(row.id).slice(0, 8)), buyerId: String(row.buyer_id || ""), buyerName: String(profiles?.full_name || "Verified buyer"), title: String(row.title || "Untitled RFQ"), description: String(row.description || ""), category: String(row.product_category || "Other"), quantity: Number(row.quantity || 0), unit: String(row.unit || "pieces"), targetPrice: Number(row.target_price || 0), maxPrice: Number(row.max_price || 0), tatDays: Number(row.tat_days || 0), destination: String(row.destination || "Not specified"), incoterms: String(row.incoterms || "FOB"), sampleRequired: Boolean(row.sample_required), status: String(row.status || "draft") as ListingStatus, visibility: row.visibility === "private" ? "private" : "market", splitBidding: Boolean(row.split_bidding), bidCount: Number(row.bid_count || 0), productCount: Number(row.product_count || products.length || 1), products: products.map((product) => ({ id: String(product.id), name: String(product.name || "Product"), category: String(product.category || row.product_category || "Other"), quantity: Number(product.quantity || 0), unit: String(product.unit || "pieces"), targetUnitPrice: Number(product.target_unit_price || 0), thumbnailUrl: String(product.thumbnail_url || "/assets/baseball_jersey.png"), qualityCoverage: product.quality_coverage === "partial" ? "partial" : "full" })), thumbnailUrl: String(products[0]?.thumbnail_url || "/assets/baseball_jersey.png"), techpackUrls: (row.techpack_urls || []) as string[], expiresAt: String(row.expires_at || new Date(now + 7 * 86400000).toISOString()), createdAt: String(row.created_at || new Date().toISOString()), archivedAt: row.archived_at ? String(row.archived_at) : null, saved: saved.has(String(row.id)),
  }
}

function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Unknown database error" }

export const marketplaceRepository = {
  async listings(): Promise<MarketplaceResult<MarketplaceListing[]>> {
    const fallback = demoListings()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const listingsQuery = supabase.from("inquiries").select("*, profiles(full_name), order_products(id, name, category, quantity, unit, target_unit_price, thumbnail_url, quality_coverage)").order("created_at", { ascending: false })
      const favoritesQuery = user ? supabase.from("marketplace_favorites").select("inquiry_id").eq("user_id", user.id) : Promise.resolve({ data: [] })
      const [{ data, error }, { data: favorites }] = await Promise.all([listingsQuery, favoritesQuery])
      if (error) throw error
      const saved = new Set((favorites || []).map((item) => String(item.inquiry_id)))
      const live = (data || []).map((row) => rowToListing(row as Record<string, unknown>, saved))
      return { data: live.length ? live : fallback, source: live.length ? "supabase" : "demo", warning: live.length ? undefined : "No live RFQs yet. Showing clearly marked demo opportunities." }
    } catch (error) {
      return { data: fallback, source: "demo", warning: `Marketplace unavailable; showing demo opportunities. ${errorMessage(error)}` }
    }
  },

  async toggleSaved(listing: MarketplaceListing): Promise<MarketplaceResult<boolean>> {
    const saved = browserSavedIds()
    if (saved.has(listing.id)) saved.delete(listing.id); else saved.add(listing.id)
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]))
    try {
      const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser()
      if (!user || listing.id.startsWith("demo-")) return { data: saved.has(listing.id), source: "demo", warning: "Saved in this browser only." }
      if (saved.has(listing.id)) {
        const { error } = await supabase.from("marketplace_favorites").upsert({ user_id: user.id, inquiry_id: listing.id }); if (error) throw error
      } else {
        const { error } = await supabase.from("marketplace_favorites").delete().eq("user_id", user.id).eq("inquiry_id", listing.id); if (error) throw error
      }
      return { data: saved.has(listing.id), source: "supabase" }
    } catch (error) { return { data: saved.has(listing.id), source: "demo", warning: `Saved locally; cloud sync failed. ${errorMessage(error)}` } }
  },

  async saveListing(listing: MarketplaceListing): Promise<MarketplaceResult<MarketplaceListing>> {
    try {
      const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication required")
      const isNew = listing.id.startsWith("new-") || listing.id.startsWith("demo-")
      const payload = { buyer_id: user.id, title: listing.title, description: listing.description, product_category: listing.category, quantity: listing.quantity, unit: listing.unit, target_price: listing.targetPrice, max_price: listing.maxPrice, tat_days: listing.tatDays, destination: listing.destination, incoterms: listing.incoterms, sample_required: listing.sampleRequired, status: listing.status, visibility: listing.visibility, split_bidding: listing.splitBidding, expires_at: listing.expiresAt, archived_at: listing.archivedAt }
      const query = isNew ? supabase.from("inquiries").insert(payload) : supabase.from("inquiries").update(payload).eq("id", listing.id)
      const { data, error } = await query.select("id").single(); if (error) throw error

      if (listing.products.length) {
        const productRows = listing.products.map((product, index) => ({ inquiry_id: data.id, name: product.name, category: product.category, quantity: product.quantity, unit: product.unit, target_unit_price: product.targetUnitPrice, thumbnail_url: product.thumbnailUrl, quality_coverage: product.qualityCoverage, sort_order: index }))
        if (isNew) {
          const { error: productError } = await supabase.from("order_products").insert(productRows)
          if (productError) { await supabase.from("inquiries").delete().eq("id", data.id); throw productError }
        } else if (listing.products.length === 1) {
          const { error: productError } = await supabase.from("order_products").update(productRows[0]).eq("id", listing.products[0].id).eq("inquiry_id", data.id)
          if (productError) throw productError
        }
      }

      const { data: hydrated, error: hydrateError } = await supabase.from("inquiries").select("*, profiles(full_name), order_products(id, name, category, quantity, unit, target_unit_price, thumbnail_url, quality_coverage)").eq("id", data.id).single()
      if (hydrateError) throw hydrateError
      return { data: rowToListing(hydrated as Record<string, unknown>, browserSavedIds()), source: "supabase" }
    } catch (error) {
      const local = { ...listing, id: listing.id.startsWith("new-") ? `local-${crypto.randomUUID()}` : listing.id }
      const custom = demoListings().filter((item) => item.id.startsWith("local-") && item.id !== local.id)
      localStorage.setItem(LOCAL_KEY, JSON.stringify([local, ...custom]))
      return { data: local, source: "demo", warning: `Saved locally; database write failed. ${errorMessage(error)}` }
    }
  },

  async removeListing(listing: MarketplaceListing): Promise<MarketplaceResult<boolean>> {
    try {
      if (listing.id.startsWith("local-") || listing.id.startsWith("demo-")) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(demoListings().filter((item) => item.id.startsWith("local-") && item.id !== listing.id)))
        return { data: true, source: "demo", warning: "Removed from local demo data." }
      }
      const supabase = createClient(); const { error } = await supabase.from("inquiries").delete().eq("id", listing.id); if (error) throw error
      return { data: true, source: "supabase" }
    } catch (error) { return { data: false, source: "demo", warning: `Delete failed. ${errorMessage(error)}` } }
  },

  async bids(inquiryId?: string, manufacturerId?: string): Promise<MarketplaceResult<MarketplaceBid[]>> {
    try {
      const supabase = createClient(); let query = supabase.from("bids").select("*, profiles(full_name, country, manufacturer_profiles(verified)), orders(id)").order("created_at", { ascending: false })
      if (inquiryId) query = query.eq("inquiry_id", inquiryId); if (manufacturerId) query = query.eq("manufacturer_id", manufacturerId)
      const { data, error } = await query; if (error) throw error
      return { data: (data || []).map((row) => { const relatedOrder = Array.isArray(row.orders) ? row.orders[0] : row.orders; return { id: String(row.id), inquiryId: String(row.inquiry_id), manufacturerId: String(row.manufacturer_id), manufacturerName: String(row.profiles?.full_name || "Manufacturer"), unitPrice: Number(row.unit_price), currency: String(row.currency || "USD"), tatDays: Number(row.tat_days || 0), sampleAvailable: Boolean(row.sample_available), sampleTatDays: Number(row.sample_tat_days || 0), message: String(row.message || ""), status: row.status as MarketplaceBid["status"], rating: Number(row.rating || 0), verified: Boolean(row.profiles?.manufacturer_profiles?.verified), location: String(row.profiles?.country || ""), revision: Number(row.revision || 1), shortlisted: Boolean(row.shortlisted), counterUnitPrice: row.counter_unit_price == null ? null : Number(row.counter_unit_price), counterTatDays: row.counter_tat_days == null ? null : Number(row.counter_tat_days), counterMessage: String(row.counter_message || ""), productPrices: (row.product_prices || []) as MarketplaceBid["productPrices"], orderId: relatedOrder?.id ? String(relatedOrder.id) : null, createdAt: String(row.created_at) } }), source: "supabase" }
    } catch (error) { return { data: [], source: "demo", warning: `Bids could not load. ${errorMessage(error)}` } }
  },

  async submitBid(listing: MarketplaceListing, values: Pick<MarketplaceBid, "unitPrice" | "tatDays" | "sampleAvailable" | "sampleTatDays" | "message" | "productPrices">): Promise<MarketplaceResult<boolean>> {
    try {
      if (listing.id.startsWith("demo-")) return { data: false, source: "demo", warning: "This is a demo RFQ. Publish a live RFQ to test persisted bidding." }
      const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Authentication required")
      const { data: existing } = await supabase.from("bids").select("id, revision").eq("inquiry_id", listing.id).eq("manufacturer_id", user.id).maybeSingle()
      const { error } = await supabase.from("bids").upsert({ id: existing?.id, inquiry_id: listing.id, manufacturer_id: user.id, unit_price: values.unitPrice, tat_days: values.tatDays, sample_available: values.sampleAvailable, sample_tat_days: values.sampleTatDays, message: values.message, product_prices: values.productPrices, revision: Number(existing?.revision || 0) + 1, status: "pending", counter_unit_price: null, counter_tat_days: null, counter_message: null, updated_at: new Date().toISOString() }); if (error) throw error
      await supabase.rpc("notify_marketplace_user", { target_user_id: listing.buyerId, target_inquiry_id: listing.id, event_type: existing ? "bid_revised" : "bid_received", event_title: existing ? "A manufacturer revised their bid" : "New marketplace bid received", event_body: `${listing.title}: $${values.unitPrice.toFixed(2)} per unit, ${values.tatDays} days.` })
      return { data: true, source: "supabase" }
    } catch (error) { return { data: false, source: "demo", warning: `Bid was not submitted. ${errorMessage(error)}` } }
  },

  async withdrawBid(bidId: string): Promise<MarketplaceResult<boolean>> {
    try { const supabase = createClient(); const { error } = await supabase.from("bids").update({ status: "withdrawn", updated_at: new Date().toISOString() }).eq("id", bidId); if (error) throw error; return { data: true, source: "supabase" } }
    catch (error) { return { data: false, source: "demo", warning: `Bid withdrawal failed. ${errorMessage(error)}` } }
  },

  async setBidDecision(bid: MarketplaceBid, action: "shortlist" | "reject"): Promise<MarketplaceResult<boolean>> {
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("update_marketplace_bid_decision", { target_bid_id: bid.id, bid_action: action, target_shortlisted: action === "shortlist" ? !bid.shortlisted : null }); if (error) throw error
      return { data: true, source: "supabase" }
    } catch (error) { return { data: false, source: "demo", warning: `Bid decision failed. ${errorMessage(error)}` } }
  },

  async counterBid(bid: MarketplaceBid, unitPrice: number, tatDays: number, message: string): Promise<MarketplaceResult<boolean>> {
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("update_marketplace_bid_decision", { target_bid_id: bid.id, bid_action: "counter", offered_unit_price: unitPrice, offered_tat_days: tatDays, offer_message: message }); if (error) throw error
      return { data: true, source: "supabase" }
    } catch (error) { return { data: false, source: "demo", warning: `Counter offer failed. ${errorMessage(error)}` } }
  },

  async acceptBid(bidId: string): Promise<MarketplaceResult<string | null>> {
    try { const supabase = createClient(); const { data, error } = await supabase.rpc("accept_marketplace_bid", { target_bid_id: bidId }); if (error) throw error; return { data: String(data), source: "supabase" } }
    catch (error) { return { data: null, source: "demo", warning: `Bid acceptance failed. ${errorMessage(error)}` } }
  },

  async questions(inquiryId: string): Promise<MarketplaceResult<MarketplaceQuestion[]>> {
    try { const supabase = createClient(); const { data, error } = await supabase.from("inquiry_messages").select("*, profiles(full_name)").eq("inquiry_id", inquiryId).order("created_at"); if (error) throw error; return { data: (data || []).map((row) => ({ id: String(row.id), inquiryId: String(row.inquiry_id), authorId: String(row.author_id), authorName: String(row.profiles?.full_name || "Member"), body: String(row.body), attachmentUrls: (row.attachment_urls || []) as string[], createdAt: String(row.created_at) })), source: "supabase" } }
    catch (error) { return { data: [], source: "demo", warning: `Questions could not load. ${errorMessage(error)}` } }
  },

  async askQuestion(listing: MarketplaceListing, body: string, attachmentUrls: string[] = []): Promise<MarketplaceResult<boolean>> {
    try { if (listing.id.startsWith("demo-")) return { data: false, source: "demo", warning: "Questions on demo RFQs are not persisted." }; const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Authentication required"); const { error } = await supabase.from("inquiry_messages").insert({ inquiry_id: listing.id, author_id: user.id, body, attachment_urls: attachmentUrls }); if (error) throw error; return { data: true, source: "supabase" } }
    catch (error) { return { data: false, source: "demo", warning: `Question was not sent. ${errorMessage(error)}` } }
  },

  async manufacturers(): Promise<MarketplaceResult<MarketplaceManufacturer[]>> {
    try { const supabase = createClient(); const { data, error } = await supabase.from("manufacturer_profiles").select("*, profiles(full_name, country)").order("verified", { ascending: false }); if (error) throw error; const live = (data || []).map((row) => ({ id: String(row.id), companyName: String(row.company_name || row.profiles?.full_name || "Manufacturer"), country: String(row.country || row.profiles?.country || ""), city: String(row.city || ""), capabilities: row.capabilities || [], certifications: row.certifications || [], minOrderQuantity: Number(row.min_order_qty || 0), leadTimeDays: Number(row.lead_time_days || 0), priceRange: String(row.price_range || "Contact for pricing"), portfolioUrls: row.portfolio_urls || [], verified: Boolean(row.verified), rating: Number(row.rating || 0), reviewCount: Number(row.review_count || 0), bio: String(row.bio || "") })); return { data: live.length ? live : SEEDED_MANUFACTURERS, source: live.length ? "supabase" : "demo", warning: live.length ? undefined : "No live manufacturers yet. Showing demo profiles." } }
    catch (error) { return { data: SEEDED_MANUFACTURERS, source: "demo", warning: `Manufacturer directory unavailable. ${errorMessage(error)}` } }
  },
}

export function newMarketplaceListing(userId: string, userName: string): MarketplaceListing {
  const productId = `new-line-${crypto.randomUUID()}`
  return { id: `new-${crypto.randomUUID()}`, inquiryNumber: "Draft", buyerId: userId, buyerName: userName || "You", title: "", description: "", category: "Sportswear", quantity: 100, unit: "pieces", targetPrice: 10, maxPrice: 15, tatDays: 30, destination: "", incoterms: "FOB", sampleRequired: true, status: "draft", visibility: "market", splitBidding: false, bidCount: 0, productCount: 1, products: [{ id: productId, name: "Product", category: "Sportswear", quantity: 100, unit: "pieces", targetUnitPrice: 10, thumbnailUrl: "/assets/baseball_jersey.png", qualityCoverage: "partial" }], thumbnailUrl: "/assets/baseball_jersey.png", techpackUrls: [], expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(), createdAt: new Date().toISOString(), archivedAt: null, saved: false }
}
