"use client"

import React, { useState, useEffect } from "react"
import ViewSwitcher from "./ViewSwitcher"
import BriefBoard from "./BriefBoard"
import KanbanBoardView from "./KanbanBoardView"
import { proovDb, Order, Demand } from "@/lib/db"

interface BriefBoardHomeProps {
  currentUserId: string
  currentUserRole: string
  onNavigateBack: () => void
  orders?: Order[]
  demands?: Demand[]
}

export default function BriefBoardHome({ currentUserId, currentUserRole, onNavigateBack }: BriefBoardHomeProps) {
  const [view, setView] = useState<"list" | "board">("list")
  const [filter, setFilter] = useState<"All" | "Draft" | "Active" | "Completed">("All")
  
  const [orders, setOrders] = useState<Order[]>([])
  const [demands, setDemands] = useState<Demand[]>([])

  useEffect(() => {
    const loadData = async () => {
      const fetchedOrders = await proovDb.getOrders(currentUserId, currentUserRole)
      const fetchedDemands = await proovDb.getDemands()
      setOrders(fetchedOrders)
      setDemands(fetchedDemands)
    }
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener("proov_order_updated", handleUpdate)
    return () => window.removeEventListener("proov_order_updated", handleUpdate)
  }, [currentUserId, currentUserRole])

  // Filter orders based on the active filter tab
  const filteredOrders = orders.filter(order => {
    if (filter === "All") return true
    if (filter === "Draft" && order.status === "draft") return true
    // We will refine status mapping based on the kanban states
    if (filter === "Active" && ["todo", "processing", "production", "stitching", "shipped"].includes(order.status)) return true
    if (filter === "Completed" && ["received", "released"].includes(order.status)) return true
    return false
  })

  return (
    <div className="brief-board-home" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Top Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-primary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Orders</h2>
          
          <div style={{ display: "flex", gap: "16px" }}>
            {["All", "Draft", "Active", "Completed"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0 8px 0",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: filter === tab ? 600 : 500,
                  color: filter === tab ? "var(--text-primary)" : "var(--text-secondary)",
                  borderBottom: filter === tab ? "2px solid var(--text-primary)" : "2px solid transparent",
                  marginBottom: "-17px" // Align with bottom border
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <ViewSwitcher view={view} onChange={setView} />
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {view === "list" ? (
          <BriefBoard orders={filteredOrders} demands={demands} currentUserId={currentUserId} currentUserRole={currentUserRole} />
        ) : (
          <KanbanBoardView orders={filteredOrders} demands={demands} currentUserId={currentUserId} currentUserRole={currentUserRole} />
        )}
      </div>
    </div>
  )
}
