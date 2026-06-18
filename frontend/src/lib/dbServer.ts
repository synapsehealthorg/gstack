// src/lib/dbServer.ts — Server-side only Database Layer for Webhooks

import { createClient } from "@/utils/supabase/server"
import { Demand, Bid, Order, Transaction, User, LogEntry, Message } from "./db"

export const dbServer = {
  logDebug: async (category: string, message: string): Promise<void> => {
    const supabase = await createClient()
    await supabase.from("logs").insert([{ category, message }])
  },

  getUser: async (userId: string): Promise<User | null> => {
    const supabase = await createClient()
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
    if (!profile) return null
    return {
      id: profile.id,
      name: profile.full_name,
      role: profile.user_type,
    }
  },

  getOrder: async (orderId: string): Promise<Order | null> => {
    const supabase = await createClient()
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
    const supabase = await createClient()
    await supabase.from("orders").upsert([{
      id: order.id,
      inquiry_id: order.demand_id,
      buyer_id: order.buyer_id,
      manufacturer_id: order.manufacturer_id,
      agreed_price: order.amount,
      status: order.status as any,
      tracking_number: order.tracking_number,
      remarks: order.remarks,
      escrow_status: order.escrow_status as any
    }])
    await dbServer.logDebug("ORDER", `Updating order contract ${order.id} for $${order.amount}`)
  },

  saveTransaction: async (tx: Transaction): Promise<void> => {
    // Note: No transactions table in schema currently. Just logging.
    await dbServer.logDebug("TX", `Recording ledger entry: ${tx.type} (${tx.status}) - $${tx.amount}`)
  },

  updateDemandStatus: async (demandId: string, status: string): Promise<void> => {
    const supabase = await createClient()
    const mappedStatus = status === "payment_pending" ? "under_review" : (status === "open" ? "active" : status)
    await supabase.from("inquiries").update({ status: mappedStatus }).eq("id", demandId)
  }
}
