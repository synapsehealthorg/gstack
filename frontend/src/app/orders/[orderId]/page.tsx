import OrderWorkspace from "@/components/orders/OrderWorkspace"
import { proovDb, type Order } from "@/lib/db"

function fallbackOrder(orderId: string): Order {
  const readable = orderId
    .replace(/^ORD-/i, "Order ")
    .replace(/^DRAFT-/i, "Draft ")
    .replace(/[-_]/g, " ")

  return {
    id: orderId,
    demand_id: orderId,
    buyer_id: "buyer-demo",
    manufacturer_id: "manufacturer-demo",
    manufacturer_name: "Ali Sports",
    title: readable.length > 8 ? readable : "Football Jersey Kit",
    amount: 3675,
    status: orderId.toLowerCase().includes("draft") ? "draft" : "confirmed",
    tracking_number: "",
    shipping_invoice_url: "",
    milestone_advance_paid: false,
    quantity: 500,
    fabric: "Polyester performance mesh",
    turnaround_time: "21 days",
    remarks: "",
    created_at: new Date().toISOString(),
    order_number: orderId,
    escrow_status: "pending",
  }
}

export default async function OrderWorkspacePage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params
  const dbOrder = await proovDb.getOrder(params.orderId)
  const order = dbOrder || fallbackOrder(params.orderId)
  const products = dbOrder ? await proovDb.getOrderProducts(order.id) : []
  const messages = dbOrder ? await proovDb.getMessages(order.id) : []
  const ledgerEntries = dbOrder ? await proovDb.getEscrowLedgerEntries(order.id) : []
  const persistedMilestones = dbOrder ? await proovDb.getOrderMilestones(order.id) : []
  const milestoneEvents = dbOrder ? await proovDb.getMilestoneEvents(order.id) : []

  return (
    <OrderWorkspace
      order={order}
      products={products}
      messages={messages}
      ledgerEntries={ledgerEntries}
      persistedMilestones={persistedMilestones}
      milestoneEvents={milestoneEvents}
    />
  )
}
