"use client"

import React from "react"
import { Order, Demand } from "@/lib/db"

interface BriefBoardRowProps {
  order: Order
  demand?: Demand
  isSelected: boolean
  onClick: () => void
}

export default function BriefBoardRow({ order, demand, isSelected, onClick }: BriefBoardRowProps) {
  // Determine dot color and display info based on status
  let dotColor = "#9CA3AF" // draft - grey
  let rightText = ""
  let statusText = ""

  if (order.status === "draft") {
    dotColor = "#9CA3AF"
    statusText = "Not submitted"
  } else if (order.status === "live" || order.status === "open") {
    dotColor = "#10B981" // pulsing green (pulsing handled via CSS usually, static here for simple implementation)
    statusText = "Receiving bids"
    rightText = `Target: $${order.amount?.toLocaleString() || demand?.budget_min?.toLocaleString()}`
  } else if (["todo", "payment_pending", "processing", "stitching", "production", "shipped"].includes(order.status)) {
    dotColor = "#F59E0B" // amber
    statusText = `In progress (${order.status})`
    rightText = `Agreed: $${order.amount?.toLocaleString()}`
  } else if (["received", "released", "completed"].includes(order.status)) {
    dotColor = "#10B981" // green solid
    statusText = "Completed"
    rightText = `Final: $${order.amount?.toLocaleString()}`
  } else {
    dotColor = "#3B82F6" // confirmed - blue
    statusText = order.status
  }

  return (
    <div 
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border-primary)",
        backgroundColor: isSelected ? "var(--bg-secondary)" : "var(--bg-primary)",
        cursor: "pointer",
        transition: "background-color 0.2s"
      }}
    >
      {/* Left: Status Dot */}
      <div style={{ width: "40px" }}>
        <div style={{ 
          width: "10px", 
          height: "10px", 
          borderRadius: "50%", 
          backgroundColor: dotColor,
          boxShadow: order.status === "live" || order.status === "open" ? `0 0 0 4px ${dotColor}33` : "none"
        }} />
      </div>

      {/* Middle: Order Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "500", fontSize: "15px", color: "var(--text-primary)", marginBottom: "4px" }}>
          {order.title || demand?.title || "Untitled Order"}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {demand?.category || "Apparel"} · {order.quantity || demand?.quantity || 0} products
        </div>
      </div>

      {/* Right: Stage-specific Info */}
      <div style={{ textAlign: "right", minWidth: "150px" }}>
        <div style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>
          {statusText}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {rightText}
        </div>
      </div>
    </div>
  )
}
