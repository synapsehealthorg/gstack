"use client"

import React, { useState } from "react"
import { useOrderCreation } from "../OrderCreationContext"
import InviteManufacturerModal from "../InviteManufacturerModal"
import { proovDb, Order } from "@/lib/db"

export default function StepReviewPost() {
  const { state, dispatch } = useOrderCreation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPosting, setIsPosting] = useState(false)

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 4 })
  }

  const handlePostExchange = async () => {
    setIsPosting(true)
    try {
      const orderDraft: Partial<Order> = {
        title: state.products[0]?.name || "New Order",
        status: state.role === 'sourcing' ? "open" : "draft",
        amount: state.products.reduce((acc, p) => acc + (p.target_unit_price || 0) * (p.quantity || 1), 0),
        quantity: state.products.reduce((acc, p) => acc + (p.quantity || 1), 0),
        order_type: state.role || 'sourcing',
        visibility: 'exchange',
        split_bidding: state.splitBidding,
        techpack_locked: false,
        turnaround_time: state.pricingData.turnaroundTime
      }
      const newOrder = await proovDb.createOrder(orderDraft)
      if (newOrder) {
        // Save products
        for (const p of state.products) {
          await proovDb.saveOrderProduct({ ...p, order_id: newOrder.id })
        }
        window.location.href = `/orders/${newOrder.id}`
      }
    } catch (error) {
      console.error("Failed to post order", error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleInvite = () => {
    setIsModalOpen(true)
  }

  const handleSendInvites = async (ids: string[]) => {
    setIsPosting(true)
    try {
      const orderDraft: Partial<Order> = {
        title: state.products[0]?.name || "New Order",
        status: state.role === 'sourcing' ? "open" : "draft",
        amount: state.products.reduce((acc, p) => acc + (p.target_unit_price || 0) * (p.quantity || 1), 0),
        quantity: state.products.reduce((acc, p) => acc + (p.quantity || 1), 0),
        order_type: state.role || 'sourcing',
        visibility: 'private',
        split_bidding: state.splitBidding,
        techpack_locked: false,
        shared_with: ids,
        turnaround_time: state.pricingData.turnaroundTime
      }
      const newOrder = await proovDb.createOrder(orderDraft)
      if (newOrder) {
        // Save products
        for (const p of state.products) {
          await proovDb.saveOrderProduct({ ...p, order_id: newOrder.id })
        }
        window.location.href = `/orders/${newOrder.id}`
      }
    } catch (error) {
      console.error("Failed to post order", error)
    } finally {
      setIsPosting(false)
    }
  }

  const orderTotal = state.products.reduce((acc, p) => acc + (p.target_unit_price || 0) * (p.quantity || 1), 0)

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
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "8px" }}>Review & Post</h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Review your order summary and choose how to share it.</p>
      </div>

      {/* Summary Card */}
      <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", overflow: "hidden", marginBottom: "32px", backgroundColor: "var(--color-background-primary)" }}>
        <div style={{ padding: "16px 20px", backgroundColor: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Order Summary</span>
          <button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })} style={{ background: "none", border: "none", color: "var(--color-text-info)", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Edit Details</button>
        </div>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Products</div>
              <div style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: 500 }}>
                {state.products.length} {state.products.length === 1 ? 'item' : 'items'}
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 400, marginTop: "4px" }}>
                  {state.products.map(p => `${p.quantity}x ${p.name}`).join(', ')}
                </div>
              </div>
            </div>
            {state.role === 'sourcing' && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-tertiary)" }}>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Total Target Price</div>
                <div style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: 500 }}>
                  ${orderTotal.toLocaleString()}
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Turnaround Time</div>
              <div style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: 500 }}>
                {state.pricingData.turnaroundTime || "Not specified"}
              </div>
            </div>
            {state.role === 'sourcing' && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Split Bidding</div>
                <div style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: 500 }}>
                  {state.splitBidding ? "Enabled" : "Disabled"}
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 400, marginTop: "2px" }}>
                    {state.splitBidding ? "Manufacturers will bid per product." : "Manufacturers will bid on the total order."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Actions */}
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "16px" }}>Share this order</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div 
          onClick={handlePostExchange}
          style={{ padding: "24px", border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", backgroundColor: "var(--color-background-primary)", cursor: "pointer", transition: "transform 0.1s", display: "flex", flexDirection: "column", gap: "12px" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--color-border-info)" }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--color-border-tertiary)" }}
        >
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-info)" }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>Post to Exchange</div>
          <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            Make your order public. Manufacturers in the proov network can discover and bid on it.
          </div>
          <button className="btn-secondary" disabled={isPosting} style={{ marginTop: "auto", alignSelf: "flex-start" }}>{isPosting ? "Posting..." : "Post publicly"}</button>
        </div>

        <div 
          onClick={handleInvite}
          style={{ padding: "24px", border: "1px solid var(--color-border-tertiary)", borderRadius: "12px", backgroundColor: "var(--color-background-primary)", cursor: "pointer", transition: "transform 0.1s", display: "flex", flexDirection: "column", gap: "12px" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--color-border-info)" }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--color-border-tertiary)" }}
        >
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-primary)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>Invite only</div>
          <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            Keep your order private. Only manufacturers you specifically invite or share the link with can see it.
          </div>
          <button className="btn-secondary" style={{ marginTop: "auto", alignSelf: "flex-start" }}>Share privately</button>
        </div>
      </div>

      <div style={{ padding: "16px", backgroundColor: "var(--color-background-secondary)", borderRadius: "8px", display: "flex", gap: "12px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>
          <strong style={{ color: "var(--color-text-primary)" }}>Specs lock once shared.</strong> The technical specifications cannot be edited by you after posting, but prices and timelines remain negotiable until a bid is accepted.
        </div>
      </div>

      <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "24px" }}>
        <button onClick={handleBack} disabled={isPosting} className="btn-secondary">Back</button>
      </div>

      <InviteManufacturerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendInvites={handleSendInvites}
      />
    </div>
  )
}
