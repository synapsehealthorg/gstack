import React from "react"
import BriefBoard from "@/components/orders/BriefBoard"
import KanbanBoardView from "@/components/orders/KanbanBoardView"
import { proovDb } from "@/lib/db"
import Link from "next/link"

export default async function OrdersPage(props: { searchParams: Promise<{ view?: string }> }) {
  const searchParams = await props.searchParams
  const isListView = searchParams.view === 'list'
  
  const orders = await proovDb.getOrders()
  const demands = await proovDb.getDemands()
  const currentUserId = "phantom_sports_001"
  const currentUserRole = "buyer"

  const ordersWithProducts = await Promise.all(
    orders.map(async (order) => {
      const products = await proovDb.getOrderProducts(order.id)
      return { ...order, products }
    })
  )

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "var(--color-text-primary)", margin: "0 0 8px 0" }}>Orders</h1>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Manage your sourcing and production pipelines.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* View Toggle */}
          <div style={{ display: "flex", backgroundColor: "var(--color-background-secondary)", padding: "4px", borderRadius: "8px" }}>
            <Link href="/orders?view=kanban" style={{ padding: "6px 12px", borderRadius: "4px", backgroundColor: !isListView ? "var(--color-background-primary)" : "transparent", color: !isListView ? "var(--color-text-primary)" : "var(--color-text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, boxShadow: !isListView ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
              Board
            </Link>
            <Link href="/orders?view=list" style={{ padding: "6px 12px", borderRadius: "4px", backgroundColor: isListView ? "var(--color-background-primary)" : "transparent", color: isListView ? "var(--color-text-primary)" : "var(--color-text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, boxShadow: isListView ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
              List
            </Link>
          </div>

          <Link href="/orders/new" className="btn-primary" style={{ textDecoration: "none" }}>
            + New Order
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {isListView ? (
          <BriefBoard 
            orders={ordersWithProducts} 
            demands={demands} 
            currentUserId={currentUserId} 
            currentUserRole={currentUserRole} 
          />
        ) : (
          <KanbanBoardView 
            orders={ordersWithProducts} 
            demands={demands} 
            currentUserId={currentUserId} 
            currentUserRole={currentUserRole} 
          />
        )}
      </div>
    </div>
  )
}
