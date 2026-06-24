import type { MarketplaceListing } from "./marketplace"

export interface MarketplaceFilterInput {
  query: string
  category: string
  savedOnly: boolean
  sort: "newest" | "closing" | "budget" | string
  tab: "browse" | "my-rfqs" | "archived" | string
  currentUserId: string
}

export function filterMarketplaceListings(listings: MarketplaceListing[], input: MarketplaceFilterInput) {
  const normalized = input.query.trim().toLowerCase()
  return listings.filter((item) => {
    if (input.tab === "archived") return Boolean(item.archivedAt) && (!input.query || `${item.title} ${item.description}`.toLowerCase().includes(normalized))
    if (item.archivedAt) return false
    if (input.tab === "my-rfqs" && item.buyerId !== input.currentUserId && !item.id.startsWith("local-")) return false
    if (input.tab === "browse" && item.status !== "active") return false
    if (input.category !== "All" && item.category !== input.category) return false
    if (input.savedOnly && !item.saved) return false
    return !normalized || `${item.title} ${item.description} ${item.buyerName} ${item.destination}`.toLowerCase().includes(normalized)
  }).sort((a, b) => input.sort === "budget" ? b.maxPrice - a.maxPrice : input.sort === "closing" ? +new Date(a.expiresAt) - +new Date(b.expiresAt) : +new Date(b.createdAt) - +new Date(a.createdAt))
}

export function marketplaceRiskFlags(listing: MarketplaceListing) {
  return {
    unusualBidVelocity: listing.bidCount > 20,
    invalidPriceRange: listing.maxPrice > 0 && listing.targetPrice > listing.maxPrice,
  }
}

export function calculateSplitBidSummary(
  products: Array<{ id: string; quantity: number }>,
  prices: Array<{ order_product_id: string; unit_price: number; tat_days: number }>,
  fallbackUnitPrice: number,
  fallbackTatDays: number,
) {
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
  const total = products.reduce((sum, product) => {
    const line = prices.find((price) => price.order_product_id === product.id)
    return sum + product.quantity * (line?.unit_price ?? fallbackUnitPrice)
  }, 0)
  return {
    total,
    weightedUnitPrice: totalQuantity ? total / totalQuantity : fallbackUnitPrice,
    tatDays: Math.max(fallbackTatDays, ...prices.map((price) => price.tat_days)),
  }
}
