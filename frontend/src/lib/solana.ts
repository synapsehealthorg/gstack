// src/lib/solana.ts — Solana USDC wallet and Fasset PKR off-ramp simulation

import { proovDb } from "./db"

export const FASSET_PKR_RATE = 278.55 // 1 USDC = 278.55 PKR

export interface PendingPayout {
  amountUsdc: number
  amountPkr: number
  status: string
  initiated_at: string
  bank: string
  accountNumber: string
  completed_at?: string
}

export const solanaSimulator = {
  // Executes on-chain USDC transfer from platform escrow pool to manufacturer's wallet
  executePayout: async function(orderId: string, amount: number, type: string = "escrow_release"): Promise<string> {
    await proovDb.logDebug("SOLANA", `Initiating on-chain Solana transfer: ${amount} USDC for Order ${orderId}`)
    
    // Simulate smart contract wallet interaction delays locally
    return new Promise((resolve) => {
      setTimeout(async () => {
        const txHash = `solana_${Math.random().toString(36).substr(2, 6)}tx${Math.random().toString(36).substr(2, 6)}` + "5K7w9uXp6zQy"
        
        // Save the transaction
        await proovDb.saveTransaction({
          id: "tx_sol_" + Date.now(),
          order_id: orderId,
          amount: amount,
          currency: "USDC",
          type: type,
          status: "succeeded",
          tx_hash: txHash,
          created_at: new Date().toISOString()
        })

        // Add funds to manufacturer wallet balance (simulated local storage wallet balance)
        if (typeof window !== "undefined") {
          let walletBalance = parseFloat(localStorage.getItem("proov_wallet_balance") || "0")
          walletBalance += amount
          localStorage.setItem("proov_wallet_balance", walletBalance.toString())
          
          await proovDb.logDebug("SOLANA", `Tx Succeeded: $${amount} USDC transfered to Sialkot wallet Fass...9xP6. Hash: ${txHash.substr(0, 16)}...`)
          
          // Notify application to refresh wallet UI
          window.dispatchEvent(new CustomEvent("proov_wallet_updated", { detail: { balance: walletBalance } }))
        }
        
        resolve(txHash)
      }, 800)
    })
  },

  // Simulates withdrawal from Solana wallet via Fasset Exchange to local PKR Bank Account
  withdrawToBank: async function(bankDetails: { name?: string; accountNumber?: string } = {}): Promise<any> {
    if (typeof window === "undefined") return { status: "error" }
    
    const balance = parseFloat(localStorage.getItem("proov_wallet_balance") || "0")
    if (balance <= 0) {
      await proovDb.logDebug("FASSET", "Error: Wallet balance is 0.00 USDC. Nothing to withdraw.")
      return { status: "error", message: "Zero balance" }
    }
    
    const pkrAmount = balance * FASSET_PKR_RATE
    await proovDb.logDebug("FASSET", `Off-ramp initiated. Converting $${balance.toFixed(2)} USDC to PKR at rate ${FASSET_PKR_RATE}...`)
    
    // Deduct wallet balance
    localStorage.setItem("proov_wallet_balance", "0")
    window.dispatchEvent(new CustomEvent("proov_wallet_updated", { detail: { balance: 0 } }))
    
    // Create pending payout log
    localStorage.setItem("proov_pending_payout", JSON.stringify({
      amountUsdc: balance,
      amountPkr: pkrAmount,
      status: "pending_bank_settlement",
      initiated_at: new Date().toISOString(),
      bank: bankDetails.name || "Habib Bank Limited (HBL)",
      accountNumber: bankDetails.accountNumber || "PK78 HABB 0012 3456 7890 12"
    }))
    
    await proovDb.logDebug("FASSET", `Transfer of ${pkrAmount.toLocaleString(undefined, {maximumFractionDigits:2})} PKR sent to central clearing house. Awaiting bank network settlement.`)
    
    window.dispatchEvent(new CustomEvent("proov_payout_updated"))
    return { status: "success", pkrAmount }
  },

  // Simulates state update webhook from Fasset
  confirmBankSettlement: async function(): Promise<void> {
    if (typeof window === "undefined") return
    
    const pendingRaw = localStorage.getItem("proov_pending_payout")
    if (!pendingRaw) {
      await proovDb.logDebug("FASSET_WEBHOOK", "No pending off-ramp transactions found to settle.")
      return
    }
    
    const pending: PendingPayout = JSON.parse(pendingRaw)
    if (pending.status === "completed") {
      await proovDb.logDebug("FASSET_WEBHOOK", "Last transaction was already completed.")
      return
    }
    
    pending.status = "completed"
    pending.completed_at = new Date().toISOString()
    localStorage.setItem("proov_pending_payout", JSON.stringify(pending))
    
    await proovDb.logDebug("FASSET_WEBHOOK", `Bank Settle Webhook: ${pending.amountPkr.toLocaleString(undefined, {maximumFractionDigits:2})} PKR settled successfully in HBL Sialkot Branch.`)
    
    // Save transaction in database logs
    await proovDb.saveTransaction({
      id: "tx_pkr_" + Date.now(),
      order_id: "direct_offramp",
      amount: pending.amountPkr,
      currency: "PKR",
      type: "fasset_bank_payout",
      status: "completed",
      tx_hash: `fasset_settle_${Math.random().toString(36).substr(2, 12)}`,
      created_at: new Date().toISOString()
    })

    window.dispatchEvent(new CustomEvent("proov_payout_updated"))
  }
}
