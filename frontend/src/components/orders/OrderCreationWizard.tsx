"use client"

import React, { useEffect } from "react"
import { useOrderCreation } from "./OrderCreationContext"
import StepRoleSelect from "./wizard/StepRoleSelect"
import StepAddProducts from "./wizard/StepAddProducts"
import StepTechpackEditor from "./wizard/StepTechpackEditor"
import StepPricingVisibility from "./wizard/StepPricingVisibility"
import StepReviewPost from "./wizard/StepReviewPost"

export default function OrderCreationWizard() {
  const { state } = useOrderCreation()

  const steps = [
    { number: 1, label: "Role" },
    { number: 2, label: "Products" },
    { number: 3, label: "Techpack" },
    { number: 4, label: "Pricing" },
    { number: 5, label: "Review" }
  ]

  // Render current step component
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StepRoleSelect />
      case 2:
        return <StepAddProducts />
      case 3:
        return <StepTechpackEditor />
      case 4:
        return <StepPricingVisibility />
      case 5:
        return <StepReviewPost />
      default:
        return <StepRoleSelect />
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-secondary)", display: "flex", flexDirection: "column" }}>
      {/* Top Header / Progress */}
      <div style={{ backgroundColor: "var(--color-background-primary)", borderBottom: "1px solid var(--color-border-tertiary)", padding: "20px 40px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            proov
          </div>
          
          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ 
                    width: "24px", height: "24px", borderRadius: "50%", 
                    backgroundColor: state.currentStep >= step.number ? "var(--color-background-info)" : "var(--color-background-secondary)", 
                    color: state.currentStep >= step.number ? "var(--color-text-info)" : "var(--color-text-tertiary)", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold",
                    border: state.currentStep === step.number ? "1px solid var(--color-border-info)" : "1px solid transparent"
                  }}>
                    {state.currentStep > step.number ? "✓" : step.number}
                  </div>
                  <span style={{ 
                    fontSize: "13px", fontWeight: 500, 
                    color: state.currentStep >= step.number ? "var(--color-text-primary)" : "var(--color-text-tertiary)" 
                  }}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div style={{ width: "32px", height: "1px", backgroundColor: state.currentStep > step.number ? "var(--color-border-info)" : "var(--color-border-tertiary)" }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ width: "80px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => window.location.href = "/orders"} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: "14px" }}>
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {renderStep()}
      </div>
    </div>
  )
}
