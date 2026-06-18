import React from "react"
import { proovDb } from "@/lib/db"

export default async function OrderBidsPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params
  const order = await proovDb.getOrder(params.orderId)
  if (!order) return <div>Order not found</div>

  const products = await proovDb.getOrderProducts(order.id)

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>{order.title}</h1>
            <span style={{ padding: "4px 12px", borderRadius: "16px", backgroundColor: "var(--color-background-secondary)", fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Review bids and negotiate prices.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-secondary">Message Buyers</button>
          <button className="btn-primary">Accept Bid</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Techpack Review Notice */}
          <div style={{ padding: "16px 20px", backgroundColor: "#FEF2F2", border: "1px solid #F87171", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#DC2626" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#991B1B", marginBottom: "4px" }}>Techpack Lock Required</div>
              <div style={{ fontSize: "13px", color: "#B91C1C" }}>Before production begins, the final techpack must be locked. This allows manufacturers to make adjustments for their specific production capabilities.</div>
            </div>
            <button style={{ marginLeft: "auto", padding: "8px 16px", backgroundColor: "#DC2626", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Lock Techpack</button>
          </div>

          {/* Bids List */}
          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", overflow: "hidden", backgroundColor: "var(--color-background-primary)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-background-secondary)" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Received Bids (2)</h3>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Split Bidding: {order.split_bidding ? "Enabled" : "Disabled"}</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Mock Bid 1 */}
              <div style={{ padding: "20px", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>M1</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Guangzhou Textiles</div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>China · ★ 4.8</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)" }}>${(order.amount || 5000).toLocaleString()}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Total Bid</div>
                  </div>
                </div>
                {order.split_bidding && (
                  <div style={{ backgroundColor: "var(--color-background-secondary)", padding: "12px", borderRadius: "6px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "8px", color: "var(--color-text-secondary)" }}>Breakdown</div>
                    {products.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0" }}>
                        <span>{p.name}</span>
                        <span style={{ fontWeight: 500 }}>${p.target_unit_price || 0} / unit</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn-secondary" style={{ flex: 1 }}>Message</button>
                  <button className="btn-primary" style={{ flex: 1 }}>Accept Bid</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", padding: "20px", backgroundColor: "var(--color-background-primary)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--color-text-primary)" }}>Order Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Total Units</span>
                <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{order.quantity}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Target Turnaround</span>
                <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{order.turnaround_time || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Target Price</span>
                <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>${(order.amount || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Type</span>
                <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{order.order_type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
