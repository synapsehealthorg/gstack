"use client"

import React, { useState } from "react"
import { useOrderCreation } from "../OrderCreationContext"
import { v4 as uuidv4 } from "uuid"

export default function StepAddProducts() {
  const { state, dispatch } = useOrderCreation()
  const [activeImport, setActiveImport] = useState<'studio' | 'manual' | null>(null)

  // Local state for manual add
  const [manualName, setManualName] = useState("")
  const [manualCategory, setManualCategory] = useState("T-Shirt")
  const [manualMaterial, setManualMaterial] = useState("")
  const [manualQty, setManualQty] = useState(1)

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 1 })
  }

  const handleContinue = () => {
    if (state.products.length > 0) {
      dispatch({ type: 'SET_STEP', payload: 3 })
    }
  }

  const handleAddManual = () => {
    if (!manualName) return
    const newProduct = {
      id: uuidv4(),
      order_id: "", // Will be assigned on submit
      name: manualName,
      category: manualCategory,
      primary_material: manualMaterial,
      quantity: manualQty,
      sort_order: state.products.length,
      techpack_pages: []
    }
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct })
    setManualName("")
    setManualMaterial("")
    setManualQty(1)
    setActiveImport(null)
  }

  const handleRemoveProduct = (id: string) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: id })
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Role recap strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--color-background-secondary)", borderRadius: "8px", marginBottom: "32px", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--color-text-secondary)" }}>Role:</span>
          <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{state.role === 'sourcing' ? "I need this made" : "I'll make this"}</span>
        </div>
        <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--color-text-info)", cursor: "pointer", fontWeight: 500 }}>Change</button>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "8px" }}>Add products</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>What are you looking to produce? Add one or more products to this order.</p>
      </div>

      {/* Import Options: Top Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div 
          onClick={() => setActiveImport(activeImport === 'studio' ? null : 'studio')}
          style={{
            padding: "24px",
            borderRadius: "12px",
            border: activeImport === 'studio' ? "2px solid var(--color-border-info)" : "1px solid var(--color-border-tertiary)",
            backgroundColor: activeImport === 'studio' ? "var(--color-background-info)" : "var(--color-background-primary)",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-primary)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <div>
            <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>From Studio</div>
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Import your existing 3D designs</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveImport(activeImport === 'manual' ? null : 'manual')}
          style={{
            padding: "24px",
            borderRadius: "12px",
            border: activeImport === 'manual' ? "2px solid var(--color-border-info)" : "1px solid var(--color-border-tertiary)",
            backgroundColor: activeImport === 'manual' ? "var(--color-background-info)" : "var(--color-background-primary)",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-primary)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <div>
            <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>Add Manually</div>
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Create a product from scratch</div>
          </div>
        </div>
      </div>

      {/* Inspiration Upload: Bottom Row */}
      <div 
        style={{
          padding: "20px 24px",
          borderRadius: "12px",
          border: "1px dashed var(--color-border-tertiary)",
          backgroundColor: "var(--color-background-primary)",
          cursor: "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px"
        }}
      >
        <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "2px" }}>Upload inspiration & mood board</div>
          <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Help the manufacturer understand your overall vision (Optional)</div>
        </div>
        <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>Browse Files</button>
      </div>

      {/* Active Import Panels */}
      {activeImport === 'studio' && (
        <div style={{ padding: "24px", border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", marginBottom: "32px", backgroundColor: "var(--color-background-secondary)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "16px", color: "var(--color-text-primary)" }}>Select from your Studio</h3>
          <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "var(--color-background-primary)", borderRadius: "8px" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>No recent studio projects found.</p>
          </div>
        </div>
      )}

      {activeImport === 'manual' && (
        <div style={{ padding: "24px", border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", marginBottom: "32px", backgroundColor: "var(--color-background-secondary)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "16px", color: "var(--color-text-primary)" }}>Product Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Product Name</label>
              <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder="e.g. Classic Cotton Tee" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Category</label>
              <select value={manualCategory} onChange={e => setManualCategory(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }}>
                <option>T-Shirt</option>
                <option>Hoodie</option>
                <option>Pants</option>
                <option>Outerwear</option>
                <option>Accessories</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Primary Material</label>
              <input type="text" value={manualMaterial} onChange={e => setManualMaterial(e.target.value)} placeholder="e.g. 100% Organic Cotton" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Quantity</label>
              <input type="number" min="1" value={manualQty} onChange={e => setManualQty(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
            </div>
          </div>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Reference Images</label>
            <div style={{ padding: "32px", border: "1px dashed var(--color-border-tertiary)", borderRadius: "8px", textAlign: "center", backgroundColor: "var(--color-background-primary)", cursor: "pointer" }}>
              <div style={{ color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Drag and drop images, or <span style={{ color: "var(--color-text-info)" }}>browse</span></div>
            </div>
          </div>

          <button onClick={handleAddManual} disabled={!manualName} className="btn-primary" style={{ opacity: manualName ? 1 : 0.5 }}>
            Add Product
          </button>
        </div>
      )}

      {/* Added Products List */}
      {state.products.length > 0 && (
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "16px", color: "var(--color-text-primary)" }}>Added Products ({state.products.length})</h3>
          
          {state.products.length > 1 && (
            <div style={{ padding: "12px 16px", backgroundColor: "#EAF3DE", border: "1px solid #639922", borderRadius: "8px", color: "#27500A", fontSize: "13px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <div>Multi-product order detected. You'll be able to create a separate techpack and receive split bids for each product.</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {state.products.map((p, idx) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", border: "1px solid var(--color-border-tertiary)", borderRadius: "8px", backgroundColor: "var(--color-background-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "4px" }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{p.category} · Qty: {p.quantity}</div>
                  </div>
                </div>
                <button onClick={() => handleRemoveProduct(p.id)} style={{ background: "none", border: "none", color: "var(--color-text-tertiary)", cursor: "pointer", padding: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "24px" }}>
        <button onClick={handleBack} className="btn-secondary">Back</button>
        <button 
          className="btn-primary" 
          disabled={state.products.length === 0} 
          onClick={handleContinue}
          style={{ opacity: state.products.length > 0 ? 1 : 0.5 }}
        >
          Continue to Techpack &rarr;
        </button>
      </div>
    </div>
  )
}
