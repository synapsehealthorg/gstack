"use client"

import React, { useState } from "react"
import { Demand, proovDb } from "@/lib/db"

interface MarketDetailPanelProps {
  demand: Demand | null
  onClose: () => void
  currentUserId: string
  currentUserRole: string
}

export default function MarketDetailPanel({ demand, onClose, currentUserId, currentUserRole }: MarketDetailPanelProps) {
  const [bidPrice, setBidPrice] = useState<number>(demand?.budget_min || 0)
  const [bidTat, setBidTat] = useState<number>(14)
  const [bidComments, setBidComments] = useState("")

  if (!demand) return null

  const handlePlaceBid = async () => {
    if (currentUserRole !== "manufacturer") {
      alert("Only manufacturers can place bids.")
      return
    }

    try {
      await proovDb.createBid({
        demand_id: demand.id,
        manufacturer_id: currentUserId,
        price: bidPrice,
        tat_days: bidTat,
        comments: bidComments,
        status: "pending"
      })
      alert("Bid placed successfully!")
      onClose()
    } catch (err) {
      alert("Error placing bid: " + err)
    }
  }

  return (
    <div style={{
      width: "420px",
      minWidth: "420px",
      height: "100%",
      borderLeft: "1px solid var(--border-primary)",
      backgroundColor: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      boxShadow: "-4px 0 12px rgba(0,0,0,0.05)",
      overflowY: "auto"
    }}>
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--border-primary)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Public RFQ</h3>
        <button 
          onClick={onClose}
          style={{
            background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-secondary)"
          }}
        >
          &times;
        </button>
      </div>

      <div style={{ padding: "24px", flex: 1 }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
          {demand.title}
        </h2>
        
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <span style={{ padding: "4px 8px", backgroundColor: "var(--bg-secondary)", borderRadius: "4px", fontSize: "13px", fontWeight: "500" }}>
            {demand.category}
          </span>
          <span style={{ padding: "4px 8px", backgroundColor: "var(--bg-secondary)", borderRadius: "4px", fontSize: "13px", fontWeight: "500" }}>
            Qty: {demand.quantity}
          </span>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Description</h4>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)" }}>
            {demand.description}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--bg-secondary)", padding: "16px", borderRadius: "8px", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>Target Budget</div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>${demand.budget_min?.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>Target TAT</div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>{demand.target_tat} days</div>
          </div>
        </div>

        {/* Bidding Section for Manufacturers */}
        {currentUserRole === "manufacturer" && (
          <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "24px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Place a Bid</h4>
            
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Your Price (Total USD)</label>
              <input 
                type="number" 
                value={bidPrice} 
                onChange={(e) => setBidPrice(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Estimated TAT (Days)</label>
              <input 
                type="number" 
                value={bidTat} 
                onChange={(e) => setBidTat(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Comments / Pitch</label>
              <textarea 
                value={bidComments}
                onChange={(e) => setBidComments(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", resize: "none" }}
              />
            </div>

            <button 
              onClick={handlePlaceBid}
              style={{ width: "100%", padding: "12px", borderRadius: "6px", backgroundColor: "var(--text-primary)", color: "var(--bg-primary)", fontWeight: "600", cursor: "pointer", border: "none" }}
            >
              Submit Bid
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
