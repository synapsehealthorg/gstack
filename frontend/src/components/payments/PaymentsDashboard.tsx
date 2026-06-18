"use client"
import React, { useState, useEffect } from 'react'

const MOCK_TRANSACTIONS = [
  { id: "tx_1", date: "2026-06-08", type: "Escrow Lock", amount: 1200, status: "completed", description: "Order #4092 - Pattern grading" },
  { id: "tx_2", date: "2026-06-05", type: "Subscription", amount: 49, status: "completed", description: "Proov Premium (Monthly)" },
  { id: "tx_3", date: "2026-06-01", type: "Release", amount: 850, status: "completed", description: "Order #4011 - Sample production" },
  { id: "tx_4", date: "2026-05-28", type: "Invoice", amount: 250, status: "pending", description: "Direct invoice - Shipping fees" },
  { id: "tx_5", date: "2026-05-20", type: "Escrow Lock", amount: 3000, status: "completed", description: "Order #3988 - Bulk manufacturing" },
];

export default function PaymentsDashboard({ onBack }: { onBack?: () => void }) {
  const [walletBalance, setWalletBalance] = useState("0.00");

  useEffect(() => {
    // Attempt to load real wallet balance if user connected one
    const savedBalance = localStorage.getItem("proov_wallet_balance");
    if (savedBalance) {
      setWalletBalance(savedBalance);
    } else {
      setWalletBalance("450.00"); // Mock balance
    }
  }, []);

  return (
    <section className="view-panel active" style={{ padding: "24px", maxWidth: "1200px" }}>
      {onBack && (
        <button 
          onClick={onBack}
          style={{ 
            background: "none", border: "none", color: "var(--text-secondary)", fontSize: "14px", 
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px",
            fontWeight: "500"
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to Dashboard
        </button>
      )}
      <div className="panel-header" style={{ marginBottom: "24px" }}>
        <h1 className="panel-title">Wallet & Billing</h1>
        <p className="panel-subtitle">Manage your escrow locks, invoices, and subscription.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* Left Column: Balances */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Balance Overview Card */}
          <div className="panel-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "var(--text-primary)" }}>Balance Overview</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total in Escrow</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>$4,200.00</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Paid Out</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>$12,850.00</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Wallet Balance (USDC)</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>${walletBalance}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-primary" style={{ fontSize: "12px", padding: "6px 12px" }}>Top Up</button>
                  <button className="btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>Withdraw</button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="panel-card" style={{ padding: "24px", background: "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(139, 92, 246, 0.1) 100%)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "inline-block", padding: "4px 8px", backgroundColor: "rgba(139, 92, 246, 0.2)", color: "#C4B5FD", borderRadius: "4px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Current Plan</div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "white", margin: "0 0 4px 0" }}>proov Premium</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>Renews on July 8, 2026</p>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "white" }}>$49<span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>/mo</span></div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>Manage Plan</button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>View Invoices</button>
            </div>
          </div>

        </div>

        {/* Right Column: Transactions List */}
        <div className="panel-card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>Recent Transactions</h3>
            <button style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer" }}>View All</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            {MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid var(--border-primary)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>{tx.description}</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{tx.date}</span>
                    <span style={{ 
                      fontSize: "11px", 
                      padding: "2px 6px", 
                      borderRadius: "4px",
                      backgroundColor: tx.type === "Escrow Lock" ? "rgba(245, 158, 11, 0.1)" : 
                                       tx.type === "Release" ? "rgba(16, 185, 129, 0.1)" : 
                                       "var(--bg-tertiary)",
                      color: tx.type === "Escrow Lock" ? "#F59E0B" : 
                             tx.type === "Release" ? "#10B981" : 
                             "var(--text-secondary)"
                    }}>
                      {tx.type}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {tx.type === "Release" ? "+" : "-"}${tx.amount.toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: tx.status === "completed" ? "#10B981" : "#F59E0B",
                    textTransform: "capitalize"
                  }}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
