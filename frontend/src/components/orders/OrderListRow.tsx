"use client"

import React from "react"
import { Order, OrderProduct } from "@/lib/db"

interface OrderListRowProps {
  order: Order
  products: OrderProduct[]
  currentUserId: string
  isSelected?: boolean
  onClick?: () => void
}

export default function OrderListRow({ order, products, currentUserId, isSelected, onClick }: OrderListRowProps) {
  // Determine status color and styles
  let statusColor = ""
  let statusBg = ""
  let statusTextColor = ""
  let statusText = ""

  switch (order.status) {
    case "draft":
      statusColor = "var(--text-tertiary)"
      statusBg = "var(--color-background-secondary)"
      statusTextColor = "var(--text-secondary)"
      statusText = "Draft"
      break
    case "active":
    case "under_review":
    case "confirmed":
      statusColor = "#378ADD"
      statusBg = "#E6F1FB"
      statusTextColor = "#0C447C"
      statusText = "Design"
      break
    case "sampling":
    case "in_production":
    case "quality_check":
      statusColor = "#EF9F27"
      statusBg = "#FAEEDA"
      statusTextColor = "#633806"
      statusText = "Production"
      break
    case "shipped":
      statusColor = "#5DCAA5"
      statusBg = "#E1F5EE"
      statusTextColor = "#085041"
      statusText = "Shipping"
      break
    case "delivered":
    case "completed":
      statusColor = "#639922"
      statusBg = "#EAF3DE"
      statusTextColor = "#27500A"
      statusText = "Delivered"
      break
    case "disputed":
      statusColor = "#E24B4A"
      statusBg = "#FCEBEB"
      statusTextColor = "#791F1F"
      statusText = "In appeal"
      break
    default:
      statusColor = "var(--text-tertiary)"
      statusBg = "var(--color-background-secondary)"
      statusTextColor = "var(--text-secondary)"
      statusText = order.status || "Unknown"
  }

  // Determine source
  let sourceBg = ""
  let sourceText = ""
  let sourceLabel = ""

  if (order.buyer_id === currentUserId || order.manufacturer_id === currentUserId) {
    sourceBg = "var(--color-background-secondary)"
    sourceText = "var(--text-secondary)"
    sourceLabel = "My order"
  } else if (order.shared_with && order.shared_with.includes(currentUserId)) {
    sourceBg = "#FBEAF0"
    sourceText = "#72243E"
    sourceLabel = "Shared with me"
  } else {
    sourceBg = "#EEEDFE"
    sourceText = "#3C3489"
    sourceLabel = "Shared by me"
  }

  // Formatting date
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString() : "Just now"

  return (
    <div 
      className="list-row"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
        borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer",
        backgroundColor: isSelected ? "var(--color-background-secondary)" : "transparent"
      }}
    >
      <span className="status-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, backgroundColor: statusColor }}></span>
      
      <div className="thumb-strip" style={{ display: "flex", flexShrink: 0 }}>
        {products.length > 0 ? products.map((p, i) => (
          <div key={i} className="thumb" style={{
            width: "28px", height: "28px", borderRadius: "6px", border: "1.5px solid var(--color-background-primary)",
            marginLeft: i > 0 ? "-8px" : "0", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", backgroundColor: statusBg, color: statusTextColor
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
          </div>
        )) : (
          <div className="thumb" style={{
            width: "28px", height: "28px", borderRadius: "6px", border: "1.5px solid var(--color-background-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", backgroundColor: statusBg, color: statusTextColor
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
          </div>
        )}
      </div>

      <div className="row-main" style={{ flex: 1, minWidth: 0 }}>
        <div className="row-title" style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {order.title || (products[0] ? products[0].name : "Untitled Order")} {products.length > 1 ? `+ ${products.length - 1} more` : ""}
        </div>
        <div className="row-meta" style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
          {order.order_number || order.id.slice(0,8)} · {products[0]?.category || "Apparel"}
        </div>
      </div>

      <span className="row-status-badge" style={{ fontSize: "11px", fontWeight: 500, padding: "2px 9px", borderRadius: "20px", flexShrink: 0, backgroundColor: statusBg, color: statusTextColor }}>
        {statusText}
      </span>

      <span className="row-source" style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "20px", flexShrink: 0, width: "80px", textAlign: "center", backgroundColor: sourceBg, color: sourceText }}>
        {sourceLabel}
      </span>

      <span className="row-counterparty" style={{ fontSize: "11px", color: "var(--color-text-secondary)", flexShrink: 0, width: "120px", display: "flex", alignItems: "center", gap: "5px" }}>
        <span className="cp-av" style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 500, color: "var(--color-text-info)", flexShrink: 0 }}>
          {order.manufacturer_name ? order.manufacturer_name.slice(0,2).toUpperCase() : "NA"}
        </span>
        {order.manufacturer_name || "Unassigned"}
      </span>

      <span className="row-value" style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-primary)", flexShrink: 0, width: "70px", textAlign: "right" }}>
        ${order.amount?.toLocaleString() || "0"}
      </span>

      <span className="row-date" style={{ fontSize: "11px", color: "var(--color-text-tertiary)", flexShrink: 0, width: "70px", textAlign: "right" }}>
        {dateStr}
      </span>

      <span className="icon-cell" style={{ width: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>
    </div>
  )
}
