import React from "react"
import { proovDb } from "@/lib/db"

export default async function OrderProductionPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params
  const order = await proovDb.getOrder(params.orderId)
  if (!order) return <div>Order not found</div>

  const products = await proovDb.getOrderProducts(order.id)

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>{order.title}</h1>
            <span style={{ padding: "4px 12px", borderRadius: "16px", backgroundColor: "#EAF3DE", fontSize: "12px", color: "#27500A", fontWeight: 500 }}>
              PRODUCTION
            </span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Manufacturer: <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{order.manufacturer_name || "Guangzhou Textiles"}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-secondary">Message Factory</button>
          <button className="btn-secondary">View PO</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Progress Tracker */}
          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", padding: "24px", backgroundColor: "var(--color-background-primary)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "24px", color: "var(--color-text-primary)" }}>Production Progress</h3>
            
            <div style={{ position: "relative", padding: "0 20px" }}>
              <div style={{ position: "absolute", top: "12px", left: "40px", right: "40px", height: "4px", backgroundColor: "var(--color-background-secondary)", borderRadius: "2px", zIndex: 1 }} />
              <div style={{ position: "absolute", top: "12px", left: "40px", width: "50%", height: "4px", backgroundColor: "#10B981", borderRadius: "2px", zIndex: 1 }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#10B981", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                  <div style={{ fontSize: "12px", fontWeight: 500, textAlign: "center", color: "var(--color-text-primary)" }}>Pattern & Sample</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#10B981", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                  <div style={{ fontSize: "12px", fontWeight: 500, textAlign: "center", color: "var(--color-text-primary)" }}>Fabric Sourcing</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-background-primary)", border: "2px solid #10B981", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 500, textAlign: "center", color: "var(--color-text-primary)" }}>Cutting & Sewing</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", border: "2px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}></div>
                  <div style={{ fontSize: "12px", fontWeight: 500, textAlign: "center", color: "var(--color-text-tertiary)" }}>Quality Control</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", border: "2px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}></div>
                  <div style={{ fontSize: "12px", fontWeight: 500, textAlign: "center", color: "var(--color-text-tertiary)" }}>Ready to Ship</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Updates */}
          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", padding: "24px", backgroundColor: "var(--color-background-primary)" }}>
             <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "24px", color: "var(--color-text-primary)" }}>Recent Updates</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
               {/* Update Item */}
               <div style={{ display: "flex", gap: "16px" }}>
                 <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>M</div>
                 <div style={{ flex: 1 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                     <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Guangzhou Textiles</span>
                     <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>2 hours ago</span>
                   </div>
                   <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 12px 0" }}>Fabric cutting has begun for the Classic Cotton Tee. We expect sewing to start tomorrow.</p>
                   <div style={{ display: "flex", gap: "12px" }}>
                     <div style={{ width: "120px", height: "80px", borderRadius: "8px", backgroundColor: "var(--color-background-secondary)", border: "1px dashed var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "var(--color-text-tertiary)" }}>Image 1</div>
                     <div style={{ width: "120px", height: "80px", borderRadius: "8px", backgroundColor: "var(--color-background-secondary)", border: "1px dashed var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "var(--color-text-tertiary)" }}>Image 2</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Action Needed */}
          <div style={{ border: "1px solid var(--color-border-info)", borderRadius: "12px", padding: "20px", backgroundColor: "var(--color-background-info)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--color-text-info)", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Payment Milestone Due
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-primary)", marginBottom: "16px" }}>The 50% deposit for production must be released from escrow to continue.</p>
            <button className="btn-primary" style={{ width: "100%", padding: "8px", fontSize: "13px" }}>Release Funds ($2,500)</button>
          </div>

          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", padding: "20px", backgroundColor: "var(--color-background-primary)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--color-text-primary)" }}>Products Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {products.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Qty: {p.quantity}</div>
                  </div>
                  <button style={{ background: "none", border: "none", color: "var(--color-text-info)", fontSize: "12px", cursor: "pointer" }}>Techpack</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
