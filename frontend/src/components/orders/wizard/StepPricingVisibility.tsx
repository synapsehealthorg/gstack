"use client"

import React, { useState } from "react"
import { useOrderCreation } from "../OrderCreationContext"

export default function StepPricingVisibility() {
  const { state, dispatch } = useOrderCreation()
  
  // Local state
  const [productPrices, setProductPrices] = useState<Record<string, number>>(
    state.products.reduce((acc, p) => ({ ...acc, [p.id]: p.target_unit_price || 0 }), {})
  )

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 3 })
  }

  const handleContinue = () => {
    // Sync pricing
    state.products.forEach(p => {
      const price = productPrices[p.id]
      if (price !== p.target_unit_price) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: { ...p, target_unit_price: price } })
      }
    })
    dispatch({ type: 'SET_STEP', payload: 5 })
  }

  const updatePrice = (id: string, price: number) => {
    setProductPrices(prev => ({ ...prev, [id]: price }))
  }

  const toggleSplitBidding = () => {
    dispatch({ type: 'SET_SPLIT_BIDDING', payload: !state.splitBidding })
  }

  const updateTAT = (tat: string) => {
    dispatch({ type: 'UPDATE_PRICING', payload: { turnaroundTime: tat } })
  }

  const orderTotal = state.products.reduce((acc, p) => acc + (productPrices[p.id] || 0) * (p.quantity || 1), 0)

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Role recap strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--color-background-secondary)", borderRadius: "8px", marginBottom: "32px", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--color-text-secondary)" }}>Role:</span>
          <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{state.role === 'sourcing' ? "I need this made" : "I'll make this"}</span>
        </div>
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })} style={{ background: "none", border: "none", color: "var(--color-text-info)", cursor: "pointer", fontWeight: 500 }}>Change</button>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "8px" }}>Pricing & Details</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Set your target price and delivery requirements.</p>
      </div>

      {state.role === 'sourcing' ? (
        <>
          {/* Sourcing Path */}
          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", overflow: "hidden", marginBottom: "32px", backgroundColor: "var(--color-background-primary)" }}>
            <div style={{ padding: "16px", backgroundColor: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)", fontWeight: 500, color: "var(--color-text-primary)" }}>
              Products Pricing
            </div>
            <div style={{ padding: "0 16px" }}>
              {state.products.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: i < state.products.length - 1 ? "1px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Qty: {p.quantity} {p.unit}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}>$</span>
                      <input 
                        type="number" 
                        value={productPrices[p.id] || ""} 
                        onChange={(e) => updatePrice(p.id, Number(e.target.value))}
                        placeholder="Target unit price"
                        style={{ padding: "10px 10px 10px 24px", width: "140px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
                      />
                    </div>
                    <div style={{ width: "100px", textAlign: "right", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      ${((productPrices[p.id] || 0) * (p.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px", backgroundColor: "var(--color-background-secondary)", borderTop: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Order Total Target</span>
              <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)" }}>${orderTotal.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", marginBottom: "32px", backgroundColor: "var(--color-background-primary)" }}>
            <div>
              <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>Allow split bidding</div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", maxWidth: "400px" }}>Let manufacturers bid a price per product within this order — you still pick one manufacturer for the whole order.</div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
              <input type="checkbox" checked={state.splitBidding} onChange={toggleSplitBidding} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: state.splitBidding ? "var(--color-border-info)" : "var(--color-border-secondary)", borderRadius: "24px", transition: "0.2s" }}>
                <span style={{ position: "absolute", height: "18px", width: "18px", left: state.splitBidding ? "22px" : "3px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transition: "0.2s" }} />
              </span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Delivery Address</label>
              <select 
                value={state.pricingData.shippingAddressId || ""}
                onChange={(e) => dispatch({ type: 'UPDATE_PRICING', payload: { shippingAddressId: e.target.value } })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
              >
                <option value="">Select an address...</option>
                <option value="1">Warehouse — London, UK</option>
                <option value="new">+ Add new address</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Target Turnaround Time</label>
              <input 
                type="text" 
                value={state.pricingData.turnaroundTime || ""} 
                onChange={(e) => updateTAT(e.target.value)}
                placeholder="e.g. 30 days"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
              />
              <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "6px" }}>proov avg for {state.products[0]?.category || "Apparel"}: 25-40 days</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Selling Path */}
          <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", overflow: "hidden", marginBottom: "32px", backgroundColor: "var(--color-background-primary)" }}>
            <div style={{ padding: "16px", backgroundColor: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)", fontWeight: 500, color: "var(--color-text-primary)" }}>
              Price & Lead Time
            </div>
            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
               <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Price per Unit (USD)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
                  />
               </div>
               <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Production Lead Time (Days)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 30"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
                  />
               </div>
            </div>
          </div>
        </>
      )}

      <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "24px" }}>
        <button onClick={handleBack} className="btn-secondary">Back</button>
        <button 
          className="btn-primary" 
          onClick={handleContinue}
        >
          Review & Post &rarr;
        </button>
      </div>
    </div>
  )
}
