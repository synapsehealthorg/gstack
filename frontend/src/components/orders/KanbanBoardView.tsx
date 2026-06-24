"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import type { Demand, Order } from "@/lib/db"

interface KanbanBoardViewProps {
  orders?: Order[]
  demands?: Demand[]
  currentUserId?: string
  currentUserRole?: string
}

const MOCK_KANBAN = {
  draft: [
    { id: "d1", title: "Compression Tights × 800", progress: 60, timeLabel: "60% complete" },
    { id: "d2", title: "Kit Bags × 400", progress: 25, timeLabel: "25% complete" },
  ],
  design: [
    { id: "g1", title: "Goalkeeper Gloves × 1,200", factory: "Sport Arabia", value: "$13,440", escrow: "Pending", timeLabel: "Updated 1d ago" },
  ],
  production: [
    { id: "p1", title: "Football Jersey Kit × 500", factory: "Ali Sports", value: "$3,675", escrow: "Funded", progress: 45, timeLabel: "M2 of 4 · updated 5h ago" },
  ],
  shipping: [
    { id: "s1", title: "Training Shorts × 300", factory: "RunKit Sports", value: "$1,260", escrow: "Funded", timeLabel: "DHL · 3 days to dest.", isShipping: true },
  ],
  delivered: [] as any[],
  appeal: [
    { id: "a1", title: "Leather Holdall × 150", factory: "Karachi Leather", value: "$6,750", escrow: "Funded", timeLabel: "Stitching quality dispute", isUrgent: true },
  ],
}

const COLUMNS = [
  { id: "draft",      label: "Draft",      subtitle: "Building your techpack", accent: "#888780" },
  { id: "design",     label: "Design",     subtitle: "Specs being finalised",  accent: "#378ADD" },
  { id: "production", label: "Production", subtitle: "Being manufactured",     accent: "#EF9F27" },
  { id: "shipping",   label: "Shipping",   subtitle: "On its way",             accent: "#5DCAA5" },
  { id: "delivered",  label: "Delivered",  subtitle: "Confirm to release",     accent: "#639922", empty: "No orders awaiting\ndelivery confirmation" },
  { id: "appeal",     label: "Appeal",     subtitle: "Needs resolution",       accent: "#E24B4A", isUrgent: true },
]

type Card = {
  id: string; title: string; factory?: string; value?: string; escrow?: string;
  progress?: number; timeLabel: string; isUrgent?: boolean; isShipping?: boolean
}

function statusToColumn(status?: string) {
  if (status === "draft") return "draft"
  if (["active", "under_review", "confirmed", "sampling"].includes(status || "")) return "design"
  if (["in_production", "quality_check"].includes(status || "")) return "production"
  if (status === "shipped") return "shipping"
  if (["delivered", "completed"].includes(status || "")) return "delivered"
  if (status === "disputed") return "appeal"
  return "design"
}

function progressForStatus(status?: string) {
  const progress: Record<string, number> = {
    draft: 25,
    active: 35,
    under_review: 45,
    confirmed: 50,
    sampling: 58,
    in_production: 68,
    quality_check: 78,
    shipped: 88,
    delivered: 95,
    completed: 100,
    disputed: 72,
  }
  return progress[status || ""] || 50
}

function KCard({ card, accent }: { card: Card; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={`/orders/${card.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: "6px",
        border: `0.5px solid ${hovered ? "rgba(9,9,11,0.2)" : "rgba(9,9,11,0.08)"}`,
        borderLeft: `3px solid ${accent}`,
        padding: "9px 10px",
        marginBottom: "6px",
        cursor: "pointer",
        transition: "border-color 0.12s",
        display: "block",
        textDecoration: "none",
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: 500, color: "#09090B", lineHeight: 1.3, marginBottom: "5px" }}>
        {card.title}
      </div>

      {card.factory && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "10px", color: "#71717A" }}>🏭 {card.factory}</span>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#09090B" }}>{card.value}</span>
        </div>
      )}

      {card.escrow && (
        <div style={{ fontSize: "10px", color: card.escrow === "Funded" ? "#10B981" : "#F59E0B", fontWeight: 500, marginBottom: "4px" }}>
          💰 Escrow: {card.escrow}
        </div>
      )}

      {card.progress !== undefined && (
        <div style={{ height: "3px", background: "#F4F4F5", borderRadius: "2px", marginTop: "7px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${card.progress}%`, background: accent, borderRadius: "2px" }} />
        </div>
      )}

      <div style={{
        fontSize: "10px",
        color: card.isUrgent ? "#A32D2D" : "#A1A1AA",
        marginTop: "5px",
        display: "flex", alignItems: "center", gap: "3px",
      }}>
        {card.isUrgent ? "⚠ " : card.isShipping ? "🚛 " : "🕐 "}
        {card.timeLabel}
      </div>
    </Link>
  )
}

export default function KanbanBoardView({ orders = [] }: KanbanBoardViewProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const groups = orders.length > 0
    ? orders.reduce((acc, order) => {
        const column = statusToColumn(order.status)
        acc[column] = acc[column] || []
        acc[column].push({
          id: order.id,
          title: order.title || order.order_number || "Untitled order",
          factory: order.manufacturer_name || "Unassigned",
          value: `$${(order.amount || 0).toLocaleString()}`,
          escrow: order.escrow_status === "pending" ? "Pending" : "Funded",
          progress: progressForStatus(order.status),
          timeLabel: order.created_at ? `Updated ${new Date(order.created_at).toLocaleDateString()}` : "Updated recently",
          isUrgent: order.status === "disputed",
          isShipping: order.status === "shipped",
        })
        return acc
      }, {} as Record<string, Card[]>)
    : MOCK_KANBAN as Record<string, Card[]>

  return (
    <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px", alignItems: "flex-start", height: "100%" }}>
      <style>{`
        .kboard::-webkit-scrollbar { height: 5px; }
        .kboard::-webkit-scrollbar-thumb { background: rgba(9,9,11,0.1); border-radius: 3px; }
      `}</style>
      {COLUMNS.map(col => {
        const cards = groups[col.id] || []
        return (
          <div key={col.id} style={{
            flex: "0 0 220px", minWidth: "220px",
            background: "#F4F4F5",
            borderRadius: "10px",
            padding: "8px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 8px" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: col.accent !== "#888780" ? col.accent : "#09090B", display: "flex", alignItems: "center", gap: "5px" }}>
                  {col.label}
                </div>
                <div style={{ fontSize: "10px", color: "#A1A1AA", marginTop: "1px" }}>{col.subtitle}</div>
              </div>
              <span style={{
                fontSize: "10px", background: "#fff", color: "#71717A",
                padding: "1px 7px", borderRadius: "20px", border: "0.5px solid rgba(9,9,11,0.08)",
              }}>
                {cards.length}
              </span>
            </div>

            {cards.length === 0 ? (
              <div style={{ fontSize: "11px", color: "#A1A1AA", textAlign: "center", padding: "24px 8px", lineHeight: 1.5 }}>
                {(col.empty || "No orders here").split("\n").map((l, i) => <div key={i}>{l}</div>)}
              </div>
            ) : (
              cards.map(card => <KCard key={card.id} card={card} accent={col.accent} />)
            )}
          </div>
        )
      })}
    </div>
  )
}
