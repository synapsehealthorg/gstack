import { dbServer } from "@/lib/dbServer"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { event, data } = await request.json()
    await dbServer.logDebug("WHOP_WEBHOOK", `Processing simulated event: ${event}`)
    
    if (event === "payment_succeeded" && data.orderId) {
      const orderId = data.orderId
      const amount = data.amount
      
      const order = await dbServer.getOrder(orderId)
      if (order) {
        order.status = "held"
        order.milestone_advance_paid = false
        await dbServer.saveOrder(order)
        
        const txId = "tx_dep_" + Date.now()
        await dbServer.saveTransaction({
          id: txId,
          order_id: orderId,
          amount: amount,
          currency: "USD",
          type: "escrow_deposit",
          status: "succeeded",
          tx_hash: "whop_ch_" + Math.random().toString(36).substr(2, 12),
          created_at: new Date().toISOString()
        })
        
        await dbServer.logDebug("WHOP_WEBHOOK", `Escrow payment of $${amount} successfully held for Order: ${orderId}`)
        
        const manufacturer = await dbServer.getUser(order.manufacturer_id)
        if (manufacturer && manufacturer.is_premium) {
          await dbServer.logDebug("ESCROW", `Manufacturer ${manufacturer.name} is VETTED PREMIUM. Releasing 50% milestone advance...`)
          
          const advanceAmount = amount / 2
          order.milestone_advance_paid = true
          await dbServer.saveOrder(order)

          const milestoneId = "tx_ms_" + Date.now()
          await dbServer.saveTransaction({
            id: milestoneId,
            order_id: orderId,
            amount: advanceAmount,
            currency: "USDC",
            type: "milestone_advance",
            status: "succeeded",
            tx_hash: "solana_" + Math.random().toString(36).substr(2, 32),
            created_at: new Date().toISOString()
          })
          
          await dbServer.logDebug("SOLANA", `Tx Succeeded: $${advanceAmount} USDC transfered to Sialkot wallet Fass...9xP6. Hash: solana_${milestoneId.substr(6)}...`)
        } else {
          await dbServer.logDebug("ESCROW", `Manufacturer is standard. Funds will be held 100% until delivery.`)
        }
        
        if (order.demand_id) {
          await dbServer.updateDemandStatus(order.demand_id, "in_production")
        }
      }
    } else if (event === "payment_disputed" && data.orderId) {
      const orderId = data.orderId
      const order = await dbServer.getOrder(orderId)
      if (order) {
        order.status = "disputed"
        await dbServer.saveOrder(order)
        
        const txId = "tx_disp_" + Date.now()
        await dbServer.saveTransaction({
          id: txId,
          order_id: orderId,
          amount: order.amount,
          currency: "USD",
          type: "buyer_dispute",
          status: "flagged",
          tx_hash: "whop_disp_" + Math.random().toString(36).substr(2, 12),
          created_at: new Date().toISOString()
        })
        
        await dbServer.logDebug("WHOP_WEBHOOK", `Order ${orderId} flagged as DISPUTED. Arbitration workspace activated.`)
      }
    }
    
    return NextResponse.json({ status: "processed" })
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e.message }, { status: 400 })
  }
}
