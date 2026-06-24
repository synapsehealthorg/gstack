import { dbServer } from "@/lib/dbServer"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amountPkr, usdAmount } = await request.json()
    await dbServer.logDebug("FASSET_WEBHOOK", `Bank Settle Webhook: ${amountPkr.toLocaleString()} PKR settled successfully.`)
    
    const txId = "tx_pkr_" + Date.now()
    await dbServer.saveTransaction({
      id: txId,
      order_id: "withdrawal",
      amount: usdAmount,
      currency: "PKR",
      type: "fasset_bank_payout",
      status: "completed",
      tx_hash: "bank_ref_" + Math.random().toString(36).substr(2, 8),
      created_at: new Date().toISOString()
    })
    
    return NextResponse.json({ status: "success" })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown webhook error"
    return NextResponse.json({ status: "error", error: message }, { status: 400 })
  }
}
