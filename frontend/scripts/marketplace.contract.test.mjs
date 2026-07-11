import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { calculateSplitBidSummary, filterMarketplaceListings, marketplaceRiskFlags } from "../src/lib/marketplace-domain.ts"

const listing = (patch = {}) => ({
  id: "rfq-1", inquiryNumber: "PRV-1", buyerId: "buyer-a", buyerName: "Northstar", title: "Football kits", description: "Sublimated teamwear", category: "Sportswear", quantity: 500, unit: "sets", targetPrice: 8, maxPrice: 10, tatDays: 21, destination: "Manchester", incoterms: "FOB", sampleRequired: true, status: "active", visibility: "market", splitBidding: false, bidCount: 7, productCount: 1, thumbnailUrl: "/assets/baseball_jersey.png", techpackUrls: [], expiresAt: "2026-07-01T00:00:00.000Z", createdAt: "2026-06-01T00:00:00.000Z", saved: false, ...patch,
})

test("browse only returns active listings matching search and category", () => {
  const result = filterMarketplaceListings([
    listing(),
    listing({ id: "rfq-2", title: "Leather bags", category: "Leather Goods" }),
    listing({ id: "rfq-3", title: "Archived kit", status: "cancelled" }),
  ], { query: "football", category: "Sportswear", savedOnly: false, sort: "newest", tab: "browse", currentUserId: "buyer-a" })
  assert.deepEqual(result.map(({ id }) => id), ["rfq-1"])
})

test("buyer ownership and saved filters do not leak other private work", () => {
  const result = filterMarketplaceListings([
    listing({ saved: true }),
    listing({ id: "rfq-2", buyerId: "buyer-b", saved: true }),
    listing({ id: "local-draft", buyerId: "", status: "draft", saved: true }),
  ], { query: "", category: "All", savedOnly: true, sort: "newest", tab: "my-rfqs", currentUserId: "buyer-a" })
  assert.deepEqual(result.map(({ id }) => id), ["rfq-1", "local-draft"])
})

test("marketplace sorting and risk flags are deterministic", () => {
  const result = filterMarketplaceListings([
    listing({ id: "low", maxPrice: 8 }),
    listing({ id: "high", maxPrice: 25 }),
  ], { query: "", category: "All", savedOnly: false, sort: "budget", tab: "browse", currentUserId: "" })
  assert.deepEqual(result.map(({ id }) => id), ["high", "low"])
  assert.deepEqual(marketplaceRiskFlags(listing({ bidCount: 24, targetPrice: 12, maxPrice: 10 })), { unusualBidVelocity: true, invalidPriceRange: true })
})

test("archived RFQs stay out of active views and remain recoverable", () => {
  const archived = listing({ id: "archived", archivedAt: "2026-06-10T00:00:00.000Z" })
  assert.equal(filterMarketplaceListings([archived], { query: "", category: "All", savedOnly: false, sort: "newest", tab: "browse", currentUserId: "buyer-a" }).length, 0)
  assert.deepEqual(filterMarketplaceListings([archived], { query: "", category: "All", savedOnly: false, sort: "newest", tab: "archived", currentUserId: "buyer-a" }).map(({ id }) => id), ["archived"])
})

test("split bids calculate line totals, weighted unit price, and longest TAT", () => {
  const summary = calculateSplitBidSummary(
    [{ id: "jersey", quantity: 100 }, { id: "shorts", quantity: 50 }],
    [{ order_product_id: "jersey", unit_price: 8, tat_days: 18 }, { order_product_id: "shorts", unit_price: 4, tat_days: 22 }],
    10,
    14,
  )
  assert.deepEqual(summary, { total: 1000, weightedUnitPrice: 1000 / 150, tatDays: 22 })
})

test("migration defines private access, audited moderation, and atomic acceptance", () => {
  const sql = readFileSync(new URL("../supabase/migrations/00008_marketplace_lifecycle.sql", import.meta.url), "utf8")
  for (const contract of ["marketplace_favorites", "inquiry_invitations", "inquiry_messages", "Marketplace inquiry visibility", "accept_marketplace_bid", "product_prices", "bid_unit_price", "Admins manage disputes", "Admins manage manufacturer profiles", "notifications"]) assert.match(sql, new RegExp(contract))
})

test("migration secures public profiles, uploads, signup, deletion, and bid decisions", () => {
  const sql = readFileSync(new URL("../supabase/migrations/00008_marketplace_lifecycle.sql", import.meta.url), "utf8")
  for (const contract of [
    "Public reads verified manufacturer profiles",
    "Authenticated users upload marketplace files",
    "handle_marketplace_user_signup",
    "Buyers delete own inquiries",
    "update_marketplace_bid_decision",
    "bids_inquiry_manufacturer_unique",
  ]) assert.match(sql, new RegExp(contract))
  assert.doesNotMatch(sql, /coalesce\(auth\.jwt\(\)->>'user_type'/)
})
