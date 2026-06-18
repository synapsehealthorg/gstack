"use client"

import React from "react"
import { Order, OrderProduct } from "@/lib/db"

interface KanbanCardProps {
  order: Order
  products: OrderProduct[]
  columnId: string
  accentColor: string
  onClick: () => void
}

export default function KanbanCard({ order, products, columnId, accentColor, onClick }: KanbanCardProps) {
  const title = order.title || (products[0] ? products[0].name : "Untitled Order")
  const industry = products[0]?.category || "Apparel"
  const count = products.reduce((acc, p) => acc + (p.quantity || 1), 0)
  
  // Calculate techpack progress roughly
  const totalPages = products.length * 6
  let completedPages = 0
  products.forEach(p => {
    if (p.techpack_pages) {
      completedPages += p.techpack_pages.filter(tp => tp.is_complete).length
    }
  })
  const completionPercent = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: "8px",
        padding: "16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "transform 0.1s, box-shadow 0.1s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)"
      }}
    >
      <div>
        <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--color-text-primary)", marginBottom: "4px" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
          {industry} · {count} products
        </div>
      </div>

      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
        {columnId === "draft" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Completion</span>
              <span>{completionPercent}%</span>
            </div>
            <div style={{ height: "4px", backgroundColor: "var(--color-background-secondary)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${completionPercent}%`, backgroundColor: accentColor }} />
            </div>
          </div>
        )}

        {columnId === "design" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span>Bids received:</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>3</span>
            </div>
            <div style={{ color: "var(--color-border-info)" }}>Techpack under review</div>
          </div>
        )}

        {columnId === "production" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>
                {order.manufacturer_name?.[0] || "M"}
              </div>
              <span>{order.manufacturer_name}</span>
            </div>
            <div style={{ display: "flex", gap: "4px", fontSize: "10px", marginBottom: "4px" }}>
              <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--color-background-secondary)" }}>M1 ✅</span>
              <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: accentColor, color: "white" }}>M2 🔄</span>
              <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--color-background-secondary)", color: "var(--color-text-tertiary)" }}>M3 ⬜</span>
            </div>
            <div style={{ fontSize: "11px" }}>Updated 2 hours ago</div>
          </div>
        )}

        {columnId === "shipping" && (
          <div>
            <div style={{ fontWeight: "500", color: "var(--color-text-primary)", marginBottom: "4px" }}>{order.carrier || "DHL Express"}</div>
            <div style={{ color: accentColor, marginBottom: "4px", textDecoration: "underline" }}>{order.tracking_number || "Pending"}</div>
            <div>ETA: {order.turnaround_time ? "in " + order.turnaround_time : "Unknown"}</div>
          </div>
        )}

        {columnId === "delivered" && (
          <div>
            <div style={{ color: accentColor, marginBottom: "4px", fontSize: "14px" }}>★★★★★</div>
            <div>Total paid: ${(order.amount || 0).toLocaleString()}</div>
            <div style={{ fontSize: "11px", marginTop: "4px" }}>Completed</div>
          </div>
        )}

        {columnId === "appeal" && (
          <div>
             <div style={{ color: accentColor, fontWeight: "500", marginBottom: "4px" }}>Action needed</div>
             <div style={{ fontSize: "12px", color: "var(--color-text-primary)" }}>Dispute open for quality issue</div>
          </div>
        )}
      </div>
    </div>
  )
}
