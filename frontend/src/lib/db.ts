// src/lib/db.ts — proov.io Supabase Database Layer

import { createClient } from "@/utils/supabase/client"

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

export interface TechpackPage {
  id: string
  order_product_id: string
  page_type: 'cover' | 'flats' | 'bom' | 'measurements' | 'colorways' | 'packaging'
  content: any
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
  sort_order?: number
  techpack_pages?: TechpackPage[]
  created_at?: string
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
}

export const proovDb = {
  getLogs: async (): Promise<LogEntry[]> => {
    const supabase = createClient()
    const { data } = await supabase.from("logs").select("*").order("timestamp", { ascending: false }).limit(50)
    return data || []
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

  getOrders: async (userId: string, role: string): Promise<Order[]> => {
    const supabase = createClient()
    const field = role === "buyer" ? "buyer_id" : "manufacturer_id"
    const { data } = await supabase.from("orders").select("*, inquiries(title, quantity, special_notes), profiles!orders_manufacturer_id_fkey(full_name)").eq(field, userId)
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

  getTransactionsForOrder: async (orderId: string): Promise<Transaction[]> => {
    // Note: We did not define transactions table in the initial SQL schema!
    // Returning empty array for now since Whop handles transactions.
    return []
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
      sender_name: m.profiles?.full_name || "Unknown",
      content: m.content,
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
    const { data } = await supabase.from("orders").insert([draft]).select().single()
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
