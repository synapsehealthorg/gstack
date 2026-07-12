import "server-only"

import type { AppSession } from "@/lib/pilot-contracts"
import type { ProovNotification } from "@/lib/db"
import { proovDb } from "@/lib/db"

export async function getPilotOrders(_session: AppSession) {
  return proovDb.getOrders()
}

export async function getPilotOrderBundle(_session: AppSession, orderId: string) {
  const order = await proovDb.getOrder(orderId)
  if (!order) return null

  const [
    products,
    messages,
    ledgerEntries,
    persistedMilestones,
    milestoneEvents,
  ] = await Promise.all([
    proovDb.getOrderProducts(order.id),
    proovDb.getMessages(order.id),
    proovDb.getEscrowLedgerEntries(order.id),
    proovDb.getOrderMilestones(order.id),
    proovDb.getMilestoneEvents(order.id),
  ])

  const notifications: ProovNotification[] = [
    {
      id: "mock-notification-1",
      user_id: "mock-admin",
      order_id: order.id,
      type: "design_mode",
      title: "Frontend-only mock data",
      body: "This workspace is running without backend persistence.",
      read_at: null,
      created_at: new Date().toISOString(),
    },
  ]

  return {
    order,
    products,
    messages,
    ledgerEntries,
    persistedMilestones,
    milestoneEvents,
    notifications,
  }
}
