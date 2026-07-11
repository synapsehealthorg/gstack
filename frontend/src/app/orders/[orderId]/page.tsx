import { Suspense } from "react";
import { proovDb, type Order } from "@/lib/db";
import { requireAppSession } from "@/lib/server/app-session";
import OrderWorkspaceClient from "@/components/orders/OrderWorkspaceClient";

function fallbackOrder(orderId: string): Order {
  const readable = orderId
    .replace(/^ORD-/i, "Order ")
    .replace(/^DRAFT-/i, "Draft ")
    .replace(/[-_]/g, " ");

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
  };
}

export default async function OrderDetailPage(
  props: { params: Promise<{ orderId: string }> }
) {
  const [session, { orderId }] = await Promise.all([
    requireAppSession(),
    props.params,
  ]);

  const dbOrder = await proovDb.getOrder(orderId);
  const order = dbOrder || fallbackOrder(orderId);

  const [products, messages, ledgerEntries, persistedMilestones, milestoneEvents] =
    await Promise.all([
      dbOrder ? proovDb.getOrderProducts(order.id) : Promise.resolve([]),
      dbOrder ? proovDb.getMessages(order.id) : Promise.resolve([]),
      dbOrder ? proovDb.getEscrowLedgerEntries(order.id) : Promise.resolve([]),
      dbOrder ? proovDb.getOrderMilestones(order.id) : Promise.resolve([]),
      dbOrder ? proovDb.getMilestoneEvents(order.id) : Promise.resolve([]),
    ]);

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        </div>
      }
    >
      <OrderWorkspaceClient
        order={order}
        session={session}
        products={products}
        messages={messages}
        ledgerEntries={ledgerEntries}
        persistedMilestones={persistedMilestones}
        milestoneEvents={milestoneEvents}
      />
    </Suspense>
  );
}
