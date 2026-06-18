"use client"

import React from "react"
import { useOrderCreation } from "../OrderCreationContext"

export default function StepRoleSelect() {
  const { state, dispatch } = useOrderCreation()

  const handleSelect = (role: 'sourcing' | 'selling') => {
    dispatch({ type: 'SET_ROLE', payload: role })
  }

  const handleContinue = () => {
    if (state.role) {
      dispatch({ type: 'SET_STEP', payload: 2 })
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "8px" }}>What are you looking to do?</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Choose your role for this order.</p>
      </div>

      <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
        <div 
          onClick={() => handleSelect('sourcing')}
          style={{
            flex: 1,
            maxWidth: "340px",
            padding: "32px",
            borderRadius: "16px",
            border: state.role === 'sourcing' ? "2px solid var(--color-border-info)" : "1px solid var(--color-border-tertiary)",
            backgroundColor: state.role === 'sourcing' ? "var(--color-background-info)" : "var(--color-background-primary)",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", color: "var(--color-text-primary)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "12px" }}>I need this made</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.5, marginBottom: "16px" }}>
            You have a design or techpack and want to find a manufacturer to produce it.
          </p>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px", fontStyle: "italic" }}>
            "I am looking for a factory to make my hoodies."
          </p>
        </div>

        <div 
          onClick={() => handleSelect('selling')}
          style={{
            flex: 1,
            maxWidth: "340px",
            padding: "32px",
            borderRadius: "16px",
            border: state.role === 'selling' ? "2px solid var(--color-border-info)" : "1px solid var(--color-border-tertiary)",
            backgroundColor: state.role === 'selling' ? "var(--color-background-info)" : "var(--color-background-primary)",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", color: "var(--color-text-primary)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "12px" }}>I'll make this</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.5, marginBottom: "16px" }}>
            You are a manufacturer and want to offer your production services to buyers.
          </p>
          <p style={{ color: "var(--color-text-tertiary)", fontSize: "13px", fontStyle: "italic" }}>
            "I want to sell custom t-shirts to brands."
          </p>
        </div>
      </div>

      <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "24px" }}>
        <button className="btn-secondary" disabled style={{ opacity: 0.5 }}>Back</button>
        <button 
          className="btn-primary" 
          disabled={!state.role} 
          onClick={handleContinue}
          style={{ opacity: state.role ? 1 : 0.5 }}
        >
          Continue &rarr;
        </button>
      </div>
    </div>
  )
}
