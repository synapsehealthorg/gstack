"use client"

import React from "react"
import { Demand } from "@/lib/db"

interface MarketBoardRowProps {
  demand: Demand
  isSelected: boolean
  onClick: () => void
}

export default function MarketBoardRow({ demand, isSelected, onClick }: MarketBoardRowProps) {
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
          backgroundColor: "#10B981", // Pulse green for open RFQ
          boxShadow: `0 0 0 4px #10B98133`
        }} />
      </div>

      {/* Middle: Demand Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "500", fontSize: "15px", color: "var(--text-primary)", marginBottom: "4px" }}>
          {demand.title || "Untitled RFQ"}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {demand.category || "Apparel"} · {demand.quantity || 0} units
        </div>
      </div>

      {/* Right: Stage-specific Info */}
      <div style={{ textAlign: "right", minWidth: "150px" }}>
        <div style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>
          Receiving Bids
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Target: ${demand.budget_min?.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
