// src/lib/db.ts — proov.io Supabase Database Layer

import { createClient } from "@/utils/supabase/client"

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type OrderRole = 'sourcing' | 'selling'
export type PublishVisibility = 'market' | 'private'
export type TechpackPageType = 'cover' | 'flats' | 'bom' | 'measurements' | 'colorways' | 'packaging'
export type QualityCoverage = 'full' | 'partial'

export interface User {
  id: string
  name: string
  role: string
  is_premium?: boolean
  username?: string
  order_count?: number
  bid_pass_expires_at?: string
  bid_pass_remaining?: number
  bid_pass_total?: number
  bio?: string
  specialties?: string[]
  moq?: number
  established?: number
  portfolio_samples?: string[]
}

export interface Demand {
  id: string
  buyer_id: string
  buyer_name: string
  title: string
  description: string
  category: string
  quantity: number
  fabric: string
  budget_range: string
  budget_min: number
  turnaround_time: string
  target_tat?: number
  status: string
  techpack_url: string
  created_at: string
  canvas_locked?: boolean
  canvas_doc?: any
  mood_board_item_count?: number
  inquiry_number?: string
  industry_id?: string
  expires_at?: string
  techpack_urls?: string[]
}

export interface Bid {
  id: string
  demand_id: string
  manufacturer_id: string
  manufacturer_name: string
  bid_price: number
  turnaround_time: string
  comments: string
  status: string
  created_at: string
  unit_price?: number
  currency?: string
  tat_days?: number
  message?: string
  portfolio_samples?: string[]
  product_prices?: Array<{ order_product_id: string, unit_price: number, tat_days: number }>
}

export interface ProductSnapshot {
  id: string
  owner_id: string
  studio_project_id?: string | null
  name: string
  category?: string
  thumbnail_url?: string | null
  mockup_urls?: string[]
  layers?: JsonValue[]
  specs?: Record<string, JsonValue>
  colorways?: JsonValue[]
  branding_profile?: Record<string, JsonValue>
  source?: 'studio' | 'import' | 'template' | 'manual'
  is_blank_template?: boolean
  template_id?: string | null
  builder_state?: Record<string, JsonValue>
  is_favorite?: boolean
  archived_at?: string | null
  status?: 'draft' | 'ready'
  last_opened_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface TechpackPage {
  id: string
  order_product_id: string
  page_type: TechpackPageType
  content: Record<string, JsonValue>
  image_urls: string[]
  is_complete: boolean
  version: number
  updated_at?: string
}

export interface OrderProduct {
  id: string
  order_id: string
  inquiry_id?: string
  studio_project_id?: string
  name: string
  style_code?: string
  category?: string
  primary_material?: string
  quantity: number
  unit?: string
  target_unit_price?: number
  bid_unit_price?: number
  product_snapshot_id?: string
  thumbnail_url?: string
  is_blank_template?: boolean
  size_grid?: Record<string, number>
  roster_enabled?: boolean
  roster_rows?: Array<Record<string, string>>
  specs_snapshot?: Record<string, JsonValue>
  quality_coverage?: QualityCoverage
  sort_order?: number
  techpack_pages?: TechpackPage[]
  created_at?: string
}

export interface OrderLogistics {
  tatDays?: number
  sampleRequired?: boolean
  sampleTatDays?: number
  deliveryAddressId?: string
  deliveryAddressText?: string
  incoterms?: 'FOB' | 'CIF' | 'EXW' | 'DDP'
}

export interface OrderCanvasPublishInput {
  orderName: string
  role: OrderRole
  visibility: PublishVisibility
  splitBidding: boolean
  products: OrderProduct[]
  techpackData: Record<string, TechpackPage[]>
  logistics: OrderLogistics
  saveAsDraft?: boolean
  invitedManufacturerIds?: string[]
}

export interface EscrowLedgerEntry {
  id: string
  order_id: string
  milestone_id?: string | null
  actor_id?: string | null
  entry_type: 'manual_funding' | 'milestone_release' | 'refund' | 'adjustment' | 'subscription'
  amount: number
  currency: string
  status: 'pending' | 'recorded' | 'released' | 'failed' | 'cancelled'
  payment_rail: 'manual' | 'whop' | 'stripe' | 'coinbase' | 'bank_transfer' | 'usdc'
  reference?: string | null
  notes?: string | null
  created_at: string
}

export interface OrderMilestone {
  id: string
  order_id: string
  milestone_number?: number | null
  title?: string | null
  description?: string | null
  percentage?: number | null
  amount?: number | null
  status?: string | null
  proof_urls?: string[] | null
  due_date?: string | null
  completed_at?: string | null
  created_at: string
}

export interface MilestoneEvent {
  id: string
  milestone_id?: string | null
  order_id: string
  actor_id?: string | null
  event_type: string
  proof_urls?: string[]
  notes?: string | null
  created_at: string
}

export interface ProovNotification {
  id: string
  user_id: string
  actor_id?: string | null
  order_id?: string | null
  inquiry_id?: string | null
  type: string
  title: string
  body?: string | null
  read_at?: string | null
  created_at: string
}

export interface OrderInspiration {
  id: string
  order_id: string
  uploader_id: string
  file_url: string
  file_type?: string
  caption?: string
  created_at?: string
}

export interface SavedAddress {
  id: string
  user_id: string
  label?: string
  address?: string
  city?: string
  country?: string
  is_default?: boolean
  created_at?: string
}

export interface Order {
  id: string
  demand_id: string
  buyer_id: string
  manufacturer_id: string
  manufacturer_name: string
  title: string
  amount: number
  status: string
  tracking_number: string
  carrier?: string
  shipping_invoice_url: string
  milestone_advance_paid: boolean
  fabric?: string
  quantity?: number
  turnaround_time?: string
  description?: string
  remarks?: string
  created_at: string
  order_number?: string
  escrow_status?: string
  milestones?: any[]
  techpack_url?: string
  order_type?: 'sourcing' | 'selling'
  visibility?: 'exchange' | 'private'
  split_bidding?: boolean
  techpack_locked?: boolean
  shared_with?: string[]
  products?: OrderProduct[]
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  sender_name: string
  content: string
  attachment_urls?: string[]
  message_type?: 'human' | 'system'
  event_type?: string
  metadata?: Record<string, JsonValue>
  created_at: string
}

export interface Transaction {
  id: string
  order_id: string
  amount: number
  currency: string
  type: string
  status: string
  tx_hash: string
  created_at: string
}

export interface LogEntry {
  id: string
  timestamp: string
  category: string
  message: string
  action: string
  details?: string
}

export const MOCK_USERS: User[] = []

export const proovDb = {
  getLogs: async (): Promise<LogEntry[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("logs").select("*").order("timestamp", { ascending: false }).limit(50)
    return (data || []).map((entry) => ({
      ...entry,
      action: entry.message || entry.category,
      details: entry.category,
    }))
  },

  logDebug: async (category: string, message: string): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("logs").insert([{ category, message, user_id: user?.id }])
    
    // Also dispatch event for real-time UI updates
    const entry = {
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      category,
      message
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("proov_log", { detail: entry }))
    }
  },

  getUser: async (userId: string): Promise<User | null> => {
    const supabase = createClient()
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
    if (!profile) return null
    
    let manufacturerData = null
    if (profile.user_type === "manufacturer") {
      const { data: m } = await supabase.from("manufacturer_profiles").select("*").eq("id", userId).single()
      manufacturerData = m
    }

    return {
      id: profile.id,
      name: profile.full_name,
      role: profile.user_type,
      is_premium: profile.is_premium,
      username: profile.username,
      bio: manufacturerData?.bio,
      moq: manufacturerData?.min_order_qty,
      established: manufacturerData?.established_year,
      portfolio_samples: manufacturerData?.portfolio_urls,
    }
  },

  getDemands: async (): Promise<Demand[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("inquiries").select("*, profiles(full_name)").order("created_at", { ascending: false })
    if (!data) return []
    return data.map((i: any) => ({
      id: i.id,
      buyer_id: i.buyer_id,
      buyer_name: i.profiles?.full_name || "Unknown Buyer",
      title: i.title,
      description: i.description,
      category: i.product_category,
      quantity: i.quantity,
      fabric: i.special_notes, // using special notes as fallback for fabric
      budget_range: i.target_price ? `$${i.target_price} - $${i.max_price}` : "TBD",
      budget_min: i.target_price,
      turnaround_time: `${i.tat_days || 0} days`,
      target_tat: i.tat_days || 0,
      status: i.status === "active" ? "open" : i.status,
      techpack_url: i.techpack_urls?.[0] || "",
      created_at: i.created_at,
      inquiry_number: i.inquiry_number,
      canvas_locked: i.canvas_locked
    }))
  },

  saveDemand: async (demand: Demand): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("inquiries").insert([{
      buyer_id: user.id,
      title: demand.title,
      description: demand.description,
      product_category: demand.category,
      quantity: demand.quantity,
      target_price: demand.budget_min,
      tat_days: parseInt(demand.turnaround_time) || 0,
      special_notes: demand.fabric,
      status: "active"
    }])
    await proovDb.logDebug("DEMAND", `Creating demand: ${demand.title}`)
  },

  updateDemandStatus: async (demandId: string, status: string): Promise<void> => {
    const supabase = createClient()
    const mappedStatus = status === "payment_pending" ? "under_review" : (status === "open" ? "active" : status)
    await supabase.from("inquiries").update({ status: mappedStatus }).eq("id", demandId)
    await proovDb.logDebug("DEMAND", `Updating demand ${demandId} status to: ${status}`)
  },

  getBidsForDemand: async (demandId: string): Promise<Bid[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("bids").select("*, profiles(full_name)").eq("inquiry_id", demandId)
    if (!data) return []
    return data.map((b: any) => ({
      id: b.id,
      demand_id: b.inquiry_id,
      manufacturer_id: b.manufacturer_id,
      manufacturer_name: b.profiles?.full_name || "Unknown Manufacturer",
      bid_price: b.unit_price,
      turnaround_time: `${b.tat_days || 0} days`,
      comments: b.message || "",
      status: b.status === "pending" ? "submitted" : b.status,
      created_at: b.created_at
    }))
  },

  getBidsByManufacturer: async (manufacturerId: string): Promise<Bid[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("bids").select("*, inquiries(title)").eq("manufacturer_id", manufacturerId)
    if (!data) return []
    return data.map((b: any) => ({
      id: b.id,
      demand_id: b.inquiry_id,
      manufacturer_id: b.manufacturer_id,
      manufacturer_name: "You",
      bid_price: b.unit_price,
      turnaround_time: `${b.tat_days || 0} days`,
      comments: b.message || "",
      status: b.status === "pending" ? "submitted" : b.status,
      created_at: b.created_at
    }))
  },

  saveBid: async (bid: Bid): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("bids").insert([{
      inquiry_id: bid.demand_id,
      manufacturer_id: user.id,
      unit_price: bid.bid_price,
      tat_days: parseInt(bid.turnaround_time) || 0,
      message: bid.comments,
      status: "pending"
    }])
    await proovDb.logDebug("BID", `Submitting bid for $${bid.bid_price} on demand ${bid.demand_id}`)
  },

  acceptBid: async (bidId: string): Promise<void> => {
    const supabase = createClient()
    await proovDb.logDebug("BID", `Accepting bid ${bidId}`)
    
    const { data: bid } = await supabase.from("bids").select("*").eq("id", bidId).single()
    if (bid) {
      await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId)
      await supabase.from("bids").update({ status: "rejected" }).eq("inquiry_id", bid.inquiry_id).neq("id", bidId)
      await supabase.from("inquiries").update({ status: "under_review" }).eq("id", bid.inquiry_id) // using under_review as proxy for payment_pending
      
      // Also generate an order record when accepted
      await supabase.from("orders").insert([{
        inquiry_id: bid.inquiry_id,
        bid_id: bid.id,
        buyer_id: (await supabase.from("inquiries").select("buyer_id").eq("id", bid.inquiry_id).single()).data?.buyer_id,
        manufacturer_id: bid.manufacturer_id,
        agreed_price: bid.unit_price,
        tat_days: bid.tat_days,
        status: "confirmed",
        escrow_status: "pending"
      }])
    }
  },

  getOrders: async (userId?: string, role: string = "buyer"): Promise<Order[]> => {
    const supabase = createClient()
    const field = role === "buyer" ? "buyer_id" : "manufacturer_id"
    let query = supabase
      .from("orders")
      .select("*, inquiries(title, quantity, special_notes), profiles!orders_manufacturer_id_fkey(full_name)")

    if (userId) {
      query = query.eq(field, userId)
    }

    const { data } = await query
    if (!data) return []
    return data.map((o: any) => ({
      id: o.id,
      demand_id: o.inquiry_id,
      buyer_id: o.buyer_id,
      manufacturer_id: o.manufacturer_id,
      manufacturer_name: o.profiles?.full_name || "Unknown Manufacturer",
      title: o.inquiries?.title || "Order",
      amount: o.agreed_price || 0,
      status: o.status,
      tracking_number: o.tracking_number || "",
      carrier: o.carrier || "",
      shipping_invoice_url: "",
      milestone_advance_paid: o.escrow_status !== "pending",
      quantity: o.inquiries?.quantity || 1,
      fabric: o.inquiries?.special_notes || "",
      turnaround_time: `${o.tat_days || 0} days`,
      remarks: o.remarks || "",
      created_at: o.created_at,
      order_number: o.order_number,
      escrow_status: o.escrow_status
    }))
  },

  getOrder: async (orderId: string): Promise<Order | null> => {
    const supabase = createClient()
    const { data: o } = await supabase.from("orders").select("*, inquiries(title, quantity, special_notes), profiles!orders_manufacturer_id_fkey(full_name)").eq("id", orderId).single()
    if (!o) return null
    return {
      id: o.id,
      demand_id: o.inquiry_id,
      buyer_id: o.buyer_id,
      manufacturer_id: o.manufacturer_id,
      manufacturer_name: o.profiles?.full_name || "Unknown Manufacturer",
      title: o.inquiries?.title || "Order",
      amount: o.agreed_price || 0,
      status: o.status,
      tracking_number: o.tracking_number || "",
      carrier: o.carrier || "",
      shipping_invoice_url: "",
      milestone_advance_paid: o.escrow_status !== "pending",
      quantity: o.inquiries?.quantity || 1,
      fabric: o.inquiries?.special_notes || "",
      turnaround_time: `${o.tat_days || 0} days`,
      remarks: o.remarks || "",
      created_at: o.created_at,
      order_number: o.order_number,
      escrow_status: o.escrow_status
    }
  },

  saveOrder: async (order: Order): Promise<void> => {
    const supabase = createClient()
    await supabase.from("orders").upsert([{
      id: order.id.includes("order_") ? undefined : order.id, // avoid UPSERTing mock IDs
      inquiry_id: order.demand_id,
      buyer_id: order.buyer_id,
      manufacturer_id: order.manufacturer_id,
      agreed_price: order.amount,
      status: order.status as any,
      tracking_number: order.tracking_number,
      remarks: order.remarks,
      escrow_status: order.escrow_status as any
    }])
    await proovDb.logDebug("ORDER", `Updating order contract ${order.id} for $${order.amount}`)
  },

  updateOrderStatus: async (orderId: string, status: string, trackingNumber?: string): Promise<void> => {
    const supabase = createClient()
    const updateData: any = { status }
    if (trackingNumber) updateData.tracking_number = trackingNumber
    await supabase.from("orders").update(updateData).eq("id", orderId)
    await proovDb.logDebug("ORDER", `Updating order ${orderId} status to: ${status}`)
  },

  updateOrderRemarks: async (orderId: string, remarks: string, status?: string): Promise<void> => {
    const supabase = createClient()
    const updateData: any = { remarks }
    if (status) updateData.status = status
    await supabase.from("orders").update(updateData).eq("id", orderId)
    await proovDb.logDebug("ORDER", `Saving remarks for order ${orderId}`)
  },

  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<void> => {
    const supabase = createClient()
    await supabase.from("orders").update({
      status: updates.status,
      tracking_number: updates.tracking_number,
      carrier: updates.carrier,
      remarks: updates.remarks,
      escrow_status: updates.escrow_status,
    }).eq("id", orderId)
    await proovDb.logDebug("ORDER", `Updating order ${orderId}`)
  },

  getOrderProducts: async (orderId: string): Promise<OrderProduct[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from("order_products")
      .select("*, techpack_pages(*)")
      .eq("order_id", orderId)
      .order("sort_order", { ascending: true })
    return data || []
  },

  getProductSnapshots: async (): Promise<ProductSnapshot[]> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from("product_snapshots")
      .select("*")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })

    return (data || []) as ProductSnapshot[]
  },

  saveProductSnapshot: async (snapshot: Partial<ProductSnapshot>): Promise<ProductSnapshot | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from("product_snapshots")
      .upsert([{
        ...snapshot,
        owner_id: snapshot.owner_id || user.id,
      }])
      .select()
      .single()

    return data as ProductSnapshot | null
  },

  publishOrderCanvas: async (input: OrderCanvasPublishInput): Promise<{ inquiryId: string; orderId?: string } | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const totalQuantity = input.products.reduce((acc, product) => acc + (product.quantity || 0), 0)
    const orderTotal = input.products.reduce(
      (acc, product) => acc + ((product.target_unit_price || 0) * (product.quantity || 0)),
      0
    )
    const hasPartialCoverage = input.products.some((product) => product.is_blank_template || product.quality_coverage === 'partial')
    const firstProduct = input.products[0]
    const status = input.saveAsDraft ? "draft" : "active"

    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .insert([{
        buyer_id: user.id,
        title: input.orderName || firstProduct?.name || "Untitled order",
        description: `${input.products.length} product order created from the Order Canvas.`,
        product_category: firstProduct?.category || "sportswear",
        quantity: totalQuantity,
        target_price: input.products.length === 1 ? firstProduct?.target_unit_price || 0 : 0,
        max_price: orderTotal,
        tat_days: input.logistics.tatDays || null,
        sample_required: input.logistics.sampleRequired || false,
        sample_tat_days: input.logistics.sampleTatDays || null,
        incoterms: input.logistics.incoterms || null,
        destination: input.logistics.deliveryAddressText || null,
        status,
        order_type: input.role,
        visibility: input.visibility,
        split_bidding: input.splitBidding,
        logistics: input.logistics as Record<string, JsonValue>,
        order_total: orderTotal,
        product_count: input.products.length,
        quality_coverage_flags: { hasPartialCoverage },
        published_at: input.saveAsDraft ? null : new Date().toISOString(),
        private_share_token: input.visibility === "private" ? crypto.randomUUID() : null,
      }])
      .select()
      .single()

    if (inquiryError || !inquiry) {
      console.error("publishOrderCanvas inquiry error", inquiryError)
      return null
    }

    let orderId: string | undefined

    // The Selling path is a direct transaction workflow. Create a valid confirmed
    // order shell immediately; Sourcing waits for bid acceptance.
    if (input.role === "selling") {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          inquiry_id: inquiry.id,
          buyer_id: user.id,
          manufacturer_id: input.role === "selling" ? user.id : null,
          agreed_price: orderTotal,
          tat_days: input.logistics.tatDays || null,
          status: "confirmed",
          escrow_status: "pending",
          order_type: input.role,
          visibility: input.visibility === "market" ? "exchange" : "private",
          split_bidding: input.splitBidding,
          techpack_locked: false,
          shared_with: input.invitedManufacturerIds || [],
          title: input.orderName,
          total_quantity: totalQuantity,
          order_total: orderTotal,
        }])
        .select()
        .single()

      if (orderError || !order) {
        console.error("publishOrderCanvas order error", orderError)
      } else {
        orderId = order.id
      }
    }

    const orderProductRows = input.products.map((product, index) => ({
      order_id: orderId || null,
      inquiry_id: inquiry.id,
      studio_project_id: product.studio_project_id || null,
      product_snapshot_id: product.product_snapshot_id || null,
      name: product.name,
      style_code: product.style_code || null,
      category: product.category || null,
      primary_material: product.primary_material || null,
      quantity: product.quantity || 1,
      unit: product.unit || "pieces",
      target_unit_price: product.target_unit_price || 0,
      sort_order: index,
      thumbnail_url: product.thumbnail_url || null,
      is_blank_template: product.is_blank_template || false,
      size_grid: product.size_grid || {},
      roster_enabled: product.roster_enabled || false,
      roster_rows: product.roster_rows || [],
      specs_snapshot: product.specs_snapshot || {},
      quality_coverage: product.quality_coverage || (product.is_blank_template ? "partial" : "full"),
    }))

    const { data: savedProducts, error: productsError } = await supabase
      .from("order_products")
      .insert(orderProductRows)
      .select()

    if (productsError) {
      console.error("publishOrderCanvas products error", productsError)
      if (orderId) await supabase.from("orders").delete().eq("id", orderId)
      await supabase.from("inquiries").delete().eq("id", inquiry.id)
      return null
    }

    const techpackRows = (savedProducts || []).flatMap((savedProduct: { id: string }, index: number) => {
      const localProduct = input.products[index]
      const pages = input.techpackData[localProduct.id] || []
      return pages.map((page) => ({
        order_product_id: savedProduct.id,
        page_type: page.page_type,
        content: page.content || {},
        image_urls: page.image_urls || [],
        is_complete: page.is_complete || false,
        version: page.version || 1,
      }))
    })

    if (techpackRows.length > 0) {
      const { error: techpackError } = await supabase.from("techpack_pages").insert(techpackRows)
      if (techpackError) {
        console.error("publishOrderCanvas techpack error", techpackError)
        if (orderId) await supabase.from("orders").delete().eq("id", orderId)
        await supabase.from("inquiries").delete().eq("id", inquiry.id)
        return null
      }
    }

    if (input.visibility === "private" && input.invitedManufacturerIds?.length) {
      const { error: invitationError } = await supabase.from("inquiry_invitations").insert(
        input.invitedManufacturerIds.map((manufacturerId) => ({ inquiry_id: inquiry.id, manufacturer_id: manufacturerId, invited_by: user.id }))
      )
      if (invitationError) {
        console.error("publishOrderCanvas invitations error", invitationError)
        if (orderId) await supabase.from("orders").delete().eq("id", orderId)
        await supabase.from("inquiries").delete().eq("id", inquiry.id)
        return null
      }
    }

    await proovDb.logDebug(
      "ORDER_CANVAS",
      `${input.saveAsDraft ? "Saved draft" : "Published"} ${input.role} order "${input.orderName}" (${input.products.length} products)`
    )

    return { inquiryId: inquiry.id, orderId }
  },

  createBid: async (bid: {
    demand_id: string
    manufacturer_id: string
    price: number
    tat_days: number
    comments?: string
    status?: string
  }): Promise<void> => {
    await proovDb.saveBid({
      id: "",
      demand_id: bid.demand_id,
      manufacturer_id: bid.manufacturer_id,
      manufacturer_name: "",
      bid_price: bid.price,
      turnaround_time: String(bid.tat_days),
      comments: bid.comments || "",
      status: bid.status || "pending",
      created_at: new Date().toISOString(),
    })
  },

  getTransactionsForOrder: async (orderId: string): Promise<Transaction[]> => {
    // Note: We did not define transactions table in the initial SQL schema!
    // Returning empty array for now since Whop handles transactions.
    return []
  },

  getEscrowLedgerEntries: async (orderId: string): Promise<EscrowLedgerEntry[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from("escrow_ledger_entries")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })

    return (data || []) as EscrowLedgerEntry[]
  },

  getOrderMilestones: async (orderId: string): Promise<OrderMilestone[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from("order_milestones")
      .select("*")
      .eq("order_id", orderId)
      .order("milestone_number", { ascending: true })

    return (data || []) as OrderMilestone[]
  },

  getMilestoneEvents: async (orderId: string): Promise<MilestoneEvent[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from("milestone_events")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })

    return (data || []) as MilestoneEvent[]
  },

  saveTransaction: async (tx: Transaction): Promise<void> => {
    // Note: No transactions table
  },

  getMessages: async (orderId: string): Promise<Message[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("messages").select("*, profiles(full_name)").eq("order_id", orderId).order("created_at", { ascending: true })
    if (!data) return []
    return data.map((m: any) => ({
      id: m.id,
      order_id: m.order_id,
      sender_id: m.sender_id,
      sender_name: m.message_type === "system" ? "System event" : m.profiles?.full_name || "Unknown",
      content: m.content,
      attachment_urls: m.attachment_urls || [],
      message_type: m.message_type || "human",
      event_type: m.event_type || undefined,
      metadata: m.metadata || {},
      created_at: m.created_at
    }))
  },

  saveMessage: async (msg: Message): Promise<void> => {
    const supabase = createClient()
    await supabase.from("messages").insert([{
      order_id: msg.order_id,
      sender_id: msg.sender_id,
      content: msg.content
    }])
  },

  createOrder: async (draft: Partial<Order>): Promise<Order | null> => {
    const supabase = createClient()
    const { data } = await supabase.from("orders").insert([{
      inquiry_id: draft.demand_id,
      buyer_id: draft.buyer_id,
      manufacturer_id: draft.manufacturer_id,
      agreed_price: draft.amount,
      tat_days: draft.turnaround_time ? parseInt(draft.turnaround_time, 10) || null : null,
      status: ["confirmed", "sampling", "in_production", "quality_check", "shipped", "delivered", "completed", "disputed"].includes(draft.status || "")
        ? draft.status
        : "confirmed",
      escrow_status: draft.escrow_status || "pending",
      order_type: draft.order_type || "sourcing",
      visibility: draft.visibility || "exchange",
      split_bidding: draft.split_bidding || false,
      techpack_locked: draft.techpack_locked || false,
      shared_with: draft.shared_with || [],
      title: draft.title,
      total_quantity: draft.quantity || 0,
      order_total: draft.amount || 0,
    }]).select().single()
    return data as Order
  },

  getOrderWithProducts: async (orderId: string): Promise<Order | null> => {
    const supabase = createClient()
    const { data: o } = await supabase.from("orders").select("*, products:order_products(*, techpack_pages(*))").eq("id", orderId).single()
    if (!o) return null
    return o as Order
  },

  saveOrderProduct: async (p: Partial<OrderProduct>): Promise<OrderProduct | null> => {
    const supabase = createClient()
    const { data } = await supabase.from("order_products").upsert([p]).select().single()
    return data as OrderProduct
  },

  saveTechpackPage: async (page: Partial<TechpackPage>): Promise<void> => {
    const supabase = createClient()
    await supabase.from("techpack_pages").upsert([page])
  },

  lockTechpack: async (orderId: string): Promise<void> => {
    const supabase = createClient()
    await supabase.from("orders").update({ techpack_locked: true }).eq("id", orderId)
    // In a real implementation we would also take a snapshot and write to techpack_lock_events
  },

  saveInspiration: async (file: Partial<OrderInspiration>): Promise<void> => {
    const supabase = createClient()
    await supabase.from("order_inspirations").insert([file])
  },

  searchManufacturers: async (query: string): Promise<User[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("profiles")
      .select("id, full_name, user_type")
      .eq("user_type", "manufacturer")
      .ilike("full_name", `%${query}%`)
      .limit(10)
    return (data || []).map(p => ({
      id: p.id,
      name: p.full_name,
      role: p.user_type
    }))
  },

  inviteManufacturers: async (orderId: string, ids: string[]): Promise<void> => {
    const supabase = createClient()
    await supabase.from("orders").update({ shared_with: ids }).eq("id", orderId)
  },

  getSavedAddresses: async (): Promise<SavedAddress[]> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase.from("saved_addresses").select("*").eq("user_id", user.id)
    return data || []
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()
      
    if (error || !profile) {
      // Fallback: search by full_name sanitized
      const { data: profiles } = await supabase.from("profiles").select("*")
      if (profiles) {
        const found = profiles.find(p => {
          const san = (p.full_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return san === username || p.id.startsWith(username);
        });
        if (found) return proovDb.getUser(found.id);
      }
      return null
    }
    return proovDb.getUser(profile.id)
  },

  getOrderByUsernameAndId: async (username: string, orderId: string): Promise<Order | null> => {
    const user = await proovDb.getUserByUsername(username)
    if (!user) return null
    
    const order = await proovDb.getOrder(orderId)
    if (!order) return null
    
    // Ensure the order belongs to the sharing user (either buyer or manufacturer)
    if (order.buyer_id !== user.id && order.manufacturer_id !== user.id) {
      return null
    }
    
    return order
  },

  updateUsername: async (userId: string, username: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient()
    
    // Sanitize username
    const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!sanitized) {
      return { success: false, error: "Username must be alphanumeric (hyphens and underscores allowed)" };
    }
    
    // Check if username is already taken by someone else
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", sanitized)
      .neq("id", userId)
      .maybeSingle()
      
    if (existing) {
      return { success: false, error: "Username is already taken" };
    }
    
    // Perform update
    const { error } = await supabase
      .from("profiles")
      .update({ username: sanitized })
      .eq("id", userId)
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  },

  reset: async (): Promise<void> => {
    // Not supported in production db layer
  }
}
