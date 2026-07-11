import "server-only"

import type { AppSession } from "@/lib/pilot-contracts"
import type {
  EscrowLedgerEntry,
  Message,
  MilestoneEvent,
  Order,
  OrderMilestone,
  OrderProduct,
  ProovNotification,
} from "@/lib/db"
import { createClient } from "@/utils/supabase/server"

type OrderRow = Record<string, unknown> & {
  profiles?: { full_name?: string | null } | null
  inquiries?: { title?: string | null; quantity?: number | null; special_notes?: string | null; incoterms?: string | null; destination?: string | null; sample_required?: boolean | null } | null
}

function mapOrder(row: OrderRow): Order {
  const amount = Number(row.order_total || row.agreed_price || 0)
  const quantity = Number(row.total_quantity || row.inquiries?.quantity || 0)
  return {
    id: String(row.id),
    demand_id: String(row.inquiry_id || ""),
    buyer_id: String(row.buyer_id || ""),
    manufacturer_id: String(row.manufacturer_id || ""),
    manufacturer_name: row.profiles?.full_name || "Manufacturer",
    title: String(row.title || row.inquiries?.title || "Order"),
    amount,
    status: String(row.status || "confirmed"),
    tracking_number: String(row.tracking_number || ""),
    carrier: String(row.carrier || ""),
    shipping_invoice_url: "",
    milestone_advance_paid: row.escrow_status !== "pending",
    quantity,
    fabric: String(row.inquiries?.special_notes || ""),
    turnaround_time: `${Number(row.tat_days || 0)} days`,
    remarks: String(row.remarks || ""),
    created_at: String(row.created_at || new Date(0).toISOString()),
    order_number: String(row.order_number || ""),
    escrow_status: String(row.escrow_status || "pending"),
    techpack_locked: Boolean(row.techpack_locked),
    incoterms: String(row.inquiries?.incoterms || ""),
    destination: String(row.inquiries?.destination || ""),
    sample_required: Boolean(row.inquiries?.sample_required),
  }
}

const orderSelect = "*, inquiries(title, quantity, special_notes, incoterms, destination, sample_required), profiles!orders_manufacturer_id_fkey(full_name)"

export async function getPilotOrders(session: AppSession): Promise<Order[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("orders").select(orderSelect).order("created_at", { ascending: false })
    if (session.role === "buyer") query = query.eq("buyer_id", session.userId)
    if (session.role === "manufacturer") query = query.eq("manufacturer_id", session.userId)
    const { data, error } = await query
    if (error) throw new Error(`Could not load orders: ${error.message}`)
    return (data || []).map((row) => mapOrder(row as OrderRow))
  } catch (err: any) {
    console.error("Failed to load orders:", err)
    return []
  }
}

export async function getPilotOrderBundle(session: AppSession, orderId: string) {
  try {
    const supabase = await createClient()
    const { data: row, error } = await supabase.from("orders").select(orderSelect).eq("id", orderId).maybeSingle()
    if (error) throw new Error(`Could not load order: ${error.message}`)
    if (!row) return null

    const order = mapOrder(row as OrderRow)
    const authorized = session.role === "admin" || order.buyer_id === session.userId || order.manufacturer_id === session.userId
    if (!authorized) return null

    const [productsResult, messagesResult, ledgerResult, milestonesResult, eventsResult, notificationsResult] = await Promise.all([
      supabase.from("order_products").select("*, techpack_pages(*)").eq("order_id", orderId).order("sort_order"),
      supabase.from("messages").select("*, profiles(full_name)").eq("order_id", orderId).order("created_at"),
      supabase.from("escrow_ledger_entries").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("order_milestones").select("*").eq("order_id", orderId).order("milestone_number"),
      supabase.from("milestone_events").select("*").eq("order_id", orderId).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", session.userId).order("created_at", { ascending: false }).limit(20),
    ])

    const firstError = [productsResult.error, messagesResult.error, ledgerResult.error, milestonesResult.error, eventsResult.error, notificationsResult.error].find(Boolean)
    if (firstError) throw new Error(`Could not load order workspace: ${firstError.message}`)

    const messages = (messagesResult.data || []).map((message) => ({
      ...message,
      sender_name: message.profiles?.full_name || (message.message_type === "system" ? "System" : "Member"),
    })) as Message[]

    return {
      order,
      products: (productsResult.data || []) as OrderProduct[],
      messages,
      ledgerEntries: (ledgerResult.data || []) as EscrowLedgerEntry[],
      persistedMilestones: (milestonesResult.data || []) as OrderMilestone[],
      milestoneEvents: (eventsResult.data || []) as MilestoneEvent[],
      notifications: (notificationsResult.data || []) as ProovNotification[],
    }
  } catch (err: any) {
    console.error("Failed to load order bundle:", err)
    return null
  }
}
