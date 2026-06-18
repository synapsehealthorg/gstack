"use client"

import React, { useState } from "react"
import { useOrderCreation } from "../OrderCreationContext"
import { TechpackPage } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export default function StepTechpackEditor() {
  const { state, dispatch } = useOrderCreation()
  
  // State for which product is currently being edited
  const [activeProductId, setActiveProductId] = useState<string>(
    state.products.length > 0 ? state.products[0].id : ""
  )
  
  // State for which page tab is active (Cover, Flats, etc.)
  const [activeTab, setActiveTab] = useState<'cover' | 'flats' | 'bom' | 'measurements' | 'colorways' | 'packaging'>('cover')

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 2 })
  }

  const handleContinue = () => {
    dispatch({ type: 'SET_STEP', payload: 4 })
  }

  const activeProduct = state.products.find(p => p.id === activeProductId)
  const productPages = activeProduct ? (state.techpackData[activeProduct.id] || []) : []
  
  // Helper to save a page
  const savePage = (pageType: 'cover' | 'flats' | 'bom' | 'measurements' | 'colorways' | 'packaging', content: any, isComplete: boolean) => {
    if (!activeProduct) return
    const newPage: TechpackPage = {
      id: uuidv4(),
      order_product_id: activeProduct.id,
      page_type: pageType,
      content,
      image_urls: [],
      is_complete: isComplete,
      version: 1
    }
    dispatch({ type: 'SET_TECHPACK_PAGE', payload: { productId: activeProduct.id, page: newPage } })
  }

  const isPageComplete = (pageType: string) => {
    const page = productPages.find(p => p.page_type === pageType)
    return page ? page.is_complete : false
  }

  const tabs: Array<{ id: 'cover' | 'flats' | 'bom' | 'measurements' | 'colorways' | 'packaging', label: string, index: number }> = [
    { id: 'cover', label: 'Cover', index: 1 },
    { id: 'flats', label: 'Flats', index: 2 },
    { id: 'bom', label: 'BOM', index: 3 },
    { id: 'measurements', label: 'Measurements', index: 4 },
    { id: 'colorways', label: 'Colorways', index: 5 },
    { id: 'packaging', label: 'Packaging', index: 6 },
  ]

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "8px" }}>Techpack Editor</h2>
          <p style={{ color: "var(--color-text-secondary)" }}>Define the specifications for your products.</p>
        </div>
      </div>

      {/* Product Tabs (only if >1 product) */}
      {state.products.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
          {state.products.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProductId(p.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: activeProductId === p.id ? "1px solid var(--color-border-info)" : "1px solid var(--color-border-tertiary)",
                backgroundColor: activeProductId === p.id ? "var(--color-background-info)" : "var(--color-background-primary)",
                color: activeProductId === p.id ? "var(--color-text-info)" : "var(--color-text-primary)",
                fontSize: "14px",
                fontWeight: activeProductId === p.id ? 500 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
              </div>
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", backgroundColor: "var(--color-background-primary)", overflow: "hidden" }}>
        {/* Page Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-secondary)", overflowX: "auto" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "16px 20px",
                border: "none",
                backgroundColor: "transparent",
                borderBottom: activeTab === t.id ? "2px solid var(--color-border-info)" : "2px solid transparent",
                color: activeTab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontSize: "14px",
                fontWeight: activeTab === t.id ? 500 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <span style={{ color: "var(--color-text-tertiary)" }}>{t.index}</span>
              {t.label}
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isPageComplete(t.id) ? "#10B981" : "var(--color-border-tertiary)" }} />
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: "16px 20px", color: "var(--color-text-tertiary)", fontSize: "12px", display: "flex", alignItems: "center" }}>
            {activeProduct && "Autosaved"}
          </div>
        </div>

        {/* Editor Content Area */}
        <div style={{ padding: "32px", minHeight: "500px" }}>
          {activeTab === 'cover' && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)" }}>Cover Page</h3>
                <button 
                  onClick={() => savePage('cover', { saved: true }, true)} 
                  className="btn-secondary" 
                  style={{ fontSize: "12px", padding: "4px 12px" }}
                >
                  Mark complete
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
                {/* Images */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>Product render / hero image</label>
                    <div style={{ aspectRatio: "3/4", border: "1px dashed var(--color-border-tertiary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background-secondary)", color: "var(--color-text-tertiary)", cursor: "pointer" }}>
                      Upload image
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div style={{ aspectRatio: "1/1", border: "1px dashed var(--color-border-tertiary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background-secondary)", fontSize: "10px", color: "var(--color-text-tertiary)" }}>Front</div>
                    <div style={{ aspectRatio: "1/1", border: "1px dashed var(--color-border-tertiary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background-secondary)", fontSize: "10px", color: "var(--color-text-tertiary)" }}>Back</div>
                    <div style={{ aspectRatio: "1/1", border: "1px dashed var(--color-border-tertiary)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background-secondary)", fontSize: "10px", color: "var(--color-text-tertiary)" }}>Detail</div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
                    <div style={{ padding: "12px 16px", backgroundColor: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>Style Information</div>
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Style Name</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", borderBottom: "1px dashed var(--color-border-tertiary)" }}>{activeProduct?.name || "Untitled"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Category</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", borderBottom: "1px dashed var(--color-border-tertiary)" }}>{activeProduct?.category || "Apparel"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Base Size</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", borderBottom: "1px dashed var(--color-border-tertiary)" }}>M</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Size Range</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", borderBottom: "1px dashed var(--color-border-tertiary)" }}>XS - XXL</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", backgroundColor: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)", fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>Order Basics</div>
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Total Quantity</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", borderBottom: "1px dashed var(--color-border-tertiary)" }}>{activeProduct?.quantity || 1} {activeProduct?.unit || 'pieces'}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Sample Required</span>
                        <span style={{ fontSize: "13px", color: "var(--color-text-primary)", borderBottom: "1px dashed var(--color-border-tertiary)" }}>Yes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'cover' && (
            <div style={{ height: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", border: "1px dashed var(--color-border-tertiary)", borderRadius: "8px" }}>
              <div style={{ marginBottom: "16px", color: "var(--color-text-tertiary)" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "8px" }}>{tabs.find(t => t.id === activeTab)?.label} Editor</h3>
              <p style={{ fontSize: "14px", maxWidth: "400px", textAlign: "center", marginBottom: "24px" }}>Add {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} specifications for {activeProduct?.name}.</p>
              <button 
                onClick={() => savePage(activeTab, { saved: true }, true)} 
                className="btn-secondary"
              >
                Mark Complete (Demo)
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "24px" }}>
        <button onClick={handleBack} className="btn-secondary">Back</button>
        <button 
          className="btn-primary" 
          onClick={handleContinue}
        >
          Continue to Pricing &rarr;
        </button>
      </div>
    </div>
  )
}
