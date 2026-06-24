import { dbServer } from "@/lib/dbServer"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, amount, type } = await request.json()
    await dbServer.logDebug("SOLANA", `Simulated transaction processing: ${type} - $${amount} USDC`)
    
    const txId = "tx_sol_" + Date.now()
    await dbServer.saveTransaction({
      id: txId,
      order_id: orderId,
      amount,
      currency: "USDC",
      type,
      status: "succeeded",
      tx_hash: "solana_" + Math.random().toString(36).substr(2, 32),
      created_at: new Date().toISOString()
    })
    
    return NextResponse.json({ status: "success" })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown webhook error"
    return NextResponse.json({ status: "error", error: message }, { status: 400 })
  }
}
