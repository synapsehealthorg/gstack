"use client"

import type { ActionResult } from "@/lib/pilot-contracts"

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
  { id: "demo-rfq-431", inquiryNumber: "PRV-2026-00431", buyerId: "demo-buyer-1", buyerName: "Northstar FC", title: "Football Jersey Kit - Full Team Set", description: "Home and away sublimated kits with player names, numbers, socks, and export packaging.", category: "Sportswear", quantity: 500, unit: "sets", targetPrice: 7.6, maxPrice: 9.2, tatDays: 21, destination: "Manchester, UK", incoterms: "FOB", sampleRequired: true, status: "active", visibility: "market", splitBidding: true, bidCount: 2, productCount: 3, products: [{ id: "demo-line-home", name: "Home jersey", category: "Sportswear", quantity: 500, unit: "pieces", targetUnitPrice: 7.6, thumbnailUrl: "/assets/baseball_jersey.png", qualityCoverage: "full" }, { id: "demo-line-away", name: "Away jersey", category: "Sportswear", quantity: 500, unit: "pieces", targetUnitPrice: 7.6, thumbnailUrl: "/assets/baseball_jersey.png", qualityCoverage: "full" }, { id: "demo-line-shorts", name: "Match shorts", category: "Sportswear", quantity: 500, unit: "pieces", targetUnitPrice: 4.2, thumbnailUrl: "/assets/create/apparel_mockups.png", qualityCoverage: "full" }], thumbnailUrl: "/assets/baseball_jersey.png", techpackUrls: [], expiresAt: new Date(now + 5 * 86400000).toISOString(), createdAt: new Date(now - 2 * 86400000).toISOString(), archivedAt: null, saved: false },
  { id: "demo-rfq-418", inquiryNumber: "PRV-2026-00418", buyerId: "demo-buyer-2", buyerName: "Sport Arabia", title: "Performance Polo Uniform Program", description: "Moisture-wicking polos with embroidered chest marks and individual polybag packaging.", category: "Apparel", quantity: 1200, unit: "pieces", targetPrice: 9.8, maxPrice: 12, tatDays: 28, destination: "Dubai, UAE", incoterms: "CIF", sampleRequired: true, status: "active", visibility: "market", splitBidding: false, bidCount: 1, productCount: 1, products: [{ id: "demo-line-polo", name: "Performance polo", category: "Apparel", quantity: 1200, unit: "pieces", targetUnitPrice: 9.8, thumbnailUrl: "/assets/polo_shirt.png", qualityCoverage: "full" }], thumbnailUrl: "/assets/polo_shirt.png", techpackUrls: [], expiresAt: new Date(now + 2 * 86400000).toISOString(), createdAt: new Date(now - 5 * 86400000).toISOString(), archivedAt: null, saved: false },
  { id: "demo-rfq-409", inquiryNumber: "PRV-2026-00409", buyerId: "demo-buyer-3", buyerName: "TrendForce", title: "Premium Heavyweight Hoodie Drop", description: "420 GSM brushed fleece hoodies with embroidery, woven labels, and recycled packaging.", category: "Outerwear", quantity: 300, unit: "pieces", targetPrice: 21, maxPrice: 27, tatDays: 35, destination: "Berlin, Germany", incoterms: "DDP", sampleRequired: true, status: "active", visibility: "market", splitBidding: false, bidCount: 0, productCount: 1, products: [{ id: "demo-line-hoodie", name: "Heavyweight hoodie", category: "Outerwear", quantity: 300, unit: "pieces", targetUnitPrice: 21, thumbnailUrl: "/assets/streetwear_hoodie.png", qualityCoverage: "full" }], thumbnailUrl: "/assets/streetwear_hoodie.png", techpackUrls: [], expiresAt: new Date(now + 9 * 86400000).toISOString(), createdAt: new Date(now - 86400000).toISOString(), archivedAt: null, saved: false },
]

const SEEDED_MANUFACTURERS: MarketplaceManufacturer[] = [
  { id: "demo-mfr-1", companyName: "Sialkot Performance Works", country: "Pakistan", city: "Sialkot", capabilities: ["Sublimation", "Cut and sew", "Embroidery"], certifications: ["ISO 9001", "WRAP"], minOrderQuantity: 100, leadTimeDays: 21, priceRange: "$6-$24", portfolioUrls: ["/assets/tracksuit.png"], verified: true, rating: 4.9, reviewCount: 38, bio: "Teamwear and technical sportswear manufacturer serving European clubs." },
  { id: "demo-mfr-2", companyName: "Anatolia Apparel Co.", country: "Turkey", city: "Istanbul", capabilities: ["Jersey", "Fleece", "Screen print"], certifications: ["OEKO-TEX", "BSCI"], minOrderQuantity: 150, leadTimeDays: 28, priceRange: "$8-$35", portfolioUrls: ["/assets/streetwear_hoodie.png"], verified: true, rating: 4.7, reviewCount: 24, bio: "Full-package apparel development with low-volume sampling and EU logistics." },
  { id: "demo-mfr-3", companyName: "Lanka Active Textiles", country: "Sri Lanka", city: "Colombo", capabilities: ["Activewear", "Bonding", "Recycled fabrics"], certifications: ["GRS", "SEDEX"], minOrderQuantity: 250, leadTimeDays: 32, priceRange: "$7-$29", portfolioUrls: ["/assets/polo_shirt.png"], verified: false, rating: 4.5, reviewCount: 11, bio: "Performance knit specialist with recycled material sourcing." },
]

let localListings = [...SEEDED_LISTINGS]
let localBids: MarketplaceBid[] = [
  { id: "mock-bid-1", inquiryId: "demo-rfq-431", manufacturerId: "demo-mfr-1", manufacturerName: "Sialkot Performance Works", unitPrice: 7.9, currency: "USD", tatDays: 22, sampleAvailable: true, sampleTatDays: 7, message: "Can deliver both kits with sublimated names and numbered polybags.", status: "pending", rating: 4.9, verified: true, location: "Pakistan", revision: 1, shortlisted: true, counterUnitPrice: null, counterTatDays: null, counterMessage: "", productPrices: [], orderId: null, createdAt: new Date(now - 3600000).toISOString() },
  { id: "mock-bid-2", inquiryId: "demo-rfq-431", manufacturerId: "demo-mfr-2", manufacturerName: "Anatolia Apparel Co.", unitPrice: 8.4, currency: "USD", tatDays: 18, sampleAvailable: true, sampleTatDays: 5, message: "Fast sampling and EU logistics available.", status: "pending", rating: 4.7, verified: true, location: "Turkey", revision: 1, shortlisted: false, counterUnitPrice: null, counterTatDays: null, counterMessage: "", productPrices: [], orderId: null, createdAt: new Date(now - 7200000).toISOString() },
]
let localQuestions: MarketplaceQuestion[] = [
  { id: "mock-question-1", inquiryId: "demo-rfq-431", authorId: "demo-mfr-1", authorName: "Sialkot Performance Works", body: "Do you need woven labels included in the target price?", attachmentUrls: [], createdAt: new Date(now - 1800000).toISOString() },
]

function browserSavedIds() {
  if (typeof window === "undefined") return new Set<string>()
  try { return new Set<string>(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")) } catch { return new Set<string>() }
}

function withSavedAndCounts() {
  const saved = browserSavedIds()
  return localListings.map((listing) => ({
    ...listing,
    saved: saved.has(listing.id),
    bidCount: localBids.filter((bid) => bid.inquiryId === listing.id && bid.status !== "withdrawn").length,
  }))
}

function fail<T>(code: string, error: unknown): ActionResult<T> {
  return { ok: false, code, message: error instanceof Error ? error.message : "Mock action failed" }
}

export const marketplaceRepository = {
  async listings(): Promise<MarketplaceResult<MarketplaceListing[]>> {
    return { data: withSavedAndCounts(), source: "demo" }
  },

  async toggleSaved(listing: MarketplaceListing): Promise<ActionResult<boolean>> {
    const saved = browserSavedIds()
    const nextSaved = !saved.has(listing.id)
    if (nextSaved) saved.add(listing.id); else saved.delete(listing.id)
    if (typeof window !== "undefined") localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]))
    return { ok: true, data: nextSaved }
  },

  async saveListing(listing: MarketplaceListing): Promise<ActionResult<MarketplaceListing>> {
    try {
      const id = listing.id.startsWith("new-") ? `mock-rfq-${Date.now()}` : listing.id
      const savedListing = { ...listing, id, inquiryNumber: listing.inquiryNumber === "Draft" ? `PRV-MOCK-${String(localListings.length + 1).padStart(4, "0")}` : listing.inquiryNumber }
      const index = localListings.findIndex((item) => item.id === listing.id || item.id === id)
      localListings = index >= 0 ? localListings.map((item, itemIndex) => itemIndex === index ? savedListing : item) : [savedListing, ...localListings]
      return { ok: true, data: savedListing }
    } catch (error) {
      return fail("RFQ_SAVE_FAILED", error)
    }
  },

  async removeListing(listing: MarketplaceListing): Promise<ActionResult<boolean>> {
    localListings = localListings.filter((item) => item.id !== listing.id)
    return { ok: true, data: true }
  },

  async bids(inquiryId?: string, manufacturerId?: string): Promise<MarketplaceResult<MarketplaceBid[]>> {
    return { data: localBids.filter((bid) => (!inquiryId || bid.inquiryId === inquiryId) && (!manufacturerId || bid.manufacturerId === manufacturerId)), source: "demo" }
  },

  async submitBid(listing: MarketplaceListing, values: Pick<MarketplaceBid, "unitPrice" | "tatDays" | "sampleAvailable" | "sampleTatDays" | "message" | "productPrices">): Promise<ActionResult<boolean>> {
    const existing = localBids.find((bid) => bid.inquiryId === listing.id && bid.manufacturerId === "mock-admin")
    const bid: MarketplaceBid = { id: existing?.id || `mock-bid-${Date.now()}`, inquiryId: listing.id, manufacturerId: "mock-admin", manufacturerName: "Design Mode Manufacturing", unitPrice: values.unitPrice, currency: "USD", tatDays: values.tatDays, sampleAvailable: values.sampleAvailable, sampleTatDays: values.sampleTatDays, message: values.message, status: "pending", rating: 4.8, verified: true, location: "Design Sandbox", revision: (existing?.revision || 0) + 1, shortlisted: existing?.shortlisted || false, counterUnitPrice: null, counterTatDays: null, counterMessage: "", productPrices: values.productPrices, orderId: existing?.orderId || null, createdAt: existing?.createdAt || new Date().toISOString() }
    localBids = existing ? localBids.map((item) => item.id === existing.id ? bid : item) : [bid, ...localBids]
    return { ok: true, data: true }
  },

  async withdrawBid(bidId: string): Promise<ActionResult<boolean>> {
    localBids = localBids.map((bid) => bid.id === bidId ? { ...bid, status: "withdrawn" } : bid)
    return { ok: true, data: true }
  },

  async setBidDecision(bid: MarketplaceBid, action: "shortlist" | "reject"): Promise<ActionResult<boolean>> {
    localBids = localBids.map((item) => item.id === bid.id ? { ...item, shortlisted: action === "shortlist" ? !item.shortlisted : item.shortlisted, status: action === "reject" ? "rejected" : item.status } : item)
    return { ok: true, data: true }
  },

  async counterBid(bid: MarketplaceBid, unitPrice: number, tatDays: number, message: string): Promise<ActionResult<boolean>> {
    localBids = localBids.map((item) => item.id === bid.id ? { ...item, counterUnitPrice: unitPrice, counterTatDays: tatDays, counterMessage: message } : item)
    return { ok: true, data: true }
  },

  async acceptBid(bidId: string): Promise<ActionResult<string>> {
    const orderId = `mock-order-${Date.now()}`
    localBids = localBids.map((bid) => bid.id === bidId ? { ...bid, status: "accepted", orderId } : bid)
    return { ok: true, data: orderId }
  },

  async questions(inquiryId: string): Promise<MarketplaceResult<MarketplaceQuestion[]>> {
    return { data: localQuestions.filter((question) => question.inquiryId === inquiryId), source: "demo" }
  },

  async askQuestion(listing: MarketplaceListing, body: string, attachmentUrls: string[] = []): Promise<ActionResult<boolean>> {
    localQuestions = [{ id: `mock-question-${Date.now()}`, inquiryId: listing.id, authorId: "mock-admin", authorName: "Design Mode", body, attachmentUrls, createdAt: new Date().toISOString() }, ...localQuestions]
    return { ok: true, data: true }
  },

  async manufacturers(): Promise<MarketplaceResult<MarketplaceManufacturer[]>> {
    return { data: SEEDED_MANUFACTURERS, source: "demo" }
  },
}

export function newMarketplaceListing(userId: string, userName: string): MarketplaceListing {
  const productId = `new-line-${crypto.randomUUID()}`
  return { id: `new-${crypto.randomUUID()}`, inquiryNumber: "Draft", buyerId: userId, buyerName: userName || "You", title: "", description: "", category: "Sportswear", quantity: 100, unit: "pieces", targetPrice: 10, maxPrice: 15, tatDays: 30, destination: "", incoterms: "FOB", sampleRequired: true, status: "draft", visibility: "market", splitBidding: false, bidCount: 0, productCount: 1, products: [{ id: productId, name: "Product", category: "Sportswear", quantity: 100, unit: "pieces", targetUnitPrice: 10, thumbnailUrl: "/assets/baseball_jersey.png", qualityCoverage: "partial" }], thumbnailUrl: "/assets/baseball_jersey.png", techpackUrls: [], expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(), createdAt: new Date().toISOString(), archivedAt: null, saved: false }
}
