// src/lib/whop.ts — Escrow controller simulating Whop API checkout and webhook callbacks

import { proovDb } from "./db"
import { solanaSimulator } from "./solana"

export const whopSimulator = {
  // Generates a mock Whop checkout page URL
  createCheckoutSession: async function(orderId: string, amount: number, buyerEmail: string): Promise<string> {
    const mockUrl = `https://whop.com/checkout/proov_escrow_pay?order_id=${orderId}&amount=${amount}&ref=proov_io`
    
    await proovDb.saveTransaction({
      id: "tx_session_" + Date.now(),
      order_id: orderId,
      amount: amount,
      currency: "USD",
      type: "checkout_initiated",
      status: "pending",
      tx_hash: `whop_sess_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    })
    
    console.log(`[WHOP API] Checkout URL generated for Order ${orderId}: ${mockUrl}`)
    return mockUrl
  },

  // Simulates a webhook delivery from Whop
  processWebhookEvent: async function(eventType: string, payload: any): Promise<any> {
    await proovDb.logDebug("WHOP_WEBHOOK", `Processing simulated event: ${eventType}`)

    switch (eventType) {
      case "payment_succeeded": {
        const { orderId, amount } = payload
        const order = await proovDb.getOrder(orderId)
        if (!order) {
          await proovDb.logDebug("WHOP_WEBHOOK", `Error: Order ${orderId} not found.`)
          return { status: "error", message: "Order not found" }
        }
        
        // Update order status to "processing" (escrow funded)
        order.status = "processing"
        order.escrow_status = "milestone_1_released"
        
        if (!order.milestones) {
          order.milestones = [
            { milestone_number: 1, title: "M1 — Production Start", percentage: 40, amount: order.amount * 0.40, status: "pending" },
            { milestone_number: 2, title: "M2 — Quality Check", percentage: 30, amount: order.amount * 0.30, status: "pending" },
            { milestone_number: 3, title: "M3 — Delivery", percentage: 30, amount: order.amount * 0.30, status: "pending" }
          ]
        }
        
        order.milestones[0].status = "paid"
        order.milestone_advance_paid = true
        await proovDb.saveOrder(order)
        
        // Record deposit transaction
        await proovDb.saveTransaction({
          id: "tx_dep_" + Date.now(),
          order_id: orderId,
          amount: amount,
          currency: "USD",
          type: "escrow_deposit",
          status: "succeeded",
          tx_hash: `whop_ch_${Math.random().toString(36).substr(2, 12)}`,
          created_at: new Date().toISOString()
        })

        await proovDb.logDebug("WHOP_WEBHOOK", `Escrow payment of $${amount} successfully held for Order: ${orderId}`)
        
        // Release 40% milestone advance to manufacturer immediately
        const advanceAmount = order.amount * 0.40
        await proovDb.logDebug("ESCROW", `Releasing Milestone 1 advance (40%): $${advanceAmount} USDC...`)
        await solanaSimulator.executePayout(orderId, advanceAmount, "milestone_advance")
        
        // Update associated demand status
        if (order.demand_id) {
          await proovDb.updateDemandStatus(order.demand_id, "in_production")
        }
        
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("proov_order_updated", { detail: order }))
        }
        break
      }
      
      case "payment_disputed": {
        const { orderId } = payload
        const order = await proovDb.getOrder(orderId)
        if (order) {
          order.status = "disputed"
          await proovDb.saveOrder(order)
          
          await proovDb.saveTransaction({
            id: "tx_disp_" + Date.now(),
            order_id: orderId,
            amount: order.amount,
            currency: "USD",
            type: "buyer_dispute",
            status: "flagged",
            tx_hash: `whop_disp_${Math.random().toString(36).substr(2, 12)}`,
            created_at: new Date().toISOString()
          })
          
          await proovDb.logDebug("WHOP_WEBHOOK", `Order ${orderId} flagged as DISPUTED. Arbitration workspace activated.`)
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("proov_order_updated", { detail: order }))
          }
        }
        break
      }
      
      default:
        await proovDb.logDebug("WHOP_WEBHOOK", `Unhandled webhook event type: ${eventType}`)
    }
    
    return { status: "success", event: eventType }
  }
}
