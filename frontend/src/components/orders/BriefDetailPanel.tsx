"use client"

import React, { useState } from "react"
import { Order, Demand, proovDb } from "@/lib/db"
import TechpackViewer from "@/components/techpack/TechpackViewer"

interface BriefDetailPanelProps {
  order: Order | null
  demand: Demand | null
  onClose: () => void
  currentUserId: string
  currentUserRole: string
}

export default function BriefDetailPanel({ order, demand, onClose, currentUserId, currentUserRole }: BriefDetailPanelProps) {
  if (!order) return null

  const [activeTab, setActiveTab] = useState<"overview" | "techpack">("overview");
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    async function loadProfile() {
      if (currentUserId) {
        const p = await proovDb.getUser(currentUserId);
        setCurrentUserProfile(p);
      }
    }
    loadProfile();
  }, [currentUserId]);

  const handleShare = () => {
    if (!order) return;
    const username = currentUserProfile?.username || 
                     currentUserProfile?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || 
                     "user";
    const shareUrl = `${window.location.origin}/${username}/${order.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Try parsing techpack data from demand description
  let techpackData = null;
  if (demand && demand.description) {
    try {
      const parsed = JSON.parse(demand.description);
      if (parsed.isTechpack) {
        techpackData = parsed;
      }
    } catch (e) {
      // not json
    }
  }

  // If order is not provided, maybe it's just a demand (draft/live)
  // The component expects order but also works with demand
  const currentStatus = order?.status || demand?.status || "draft";

  const handleManufacturerUpload = () => {
    alert("Manufacturer: Final design files uploaded and attached to techpack.");
  };

  const handleBuyerLock = async () => {
    alert("Buyer: Techpack verified and locked. Escrow funds will now be deducted and order moved to production.");
    if (order) {
      await proovDb.updateOrder(order.id, { status: "production" });
      onClose(); // close panel to refresh state
    }
  };

  let stageTitle = "Order Details"
  if (currentStatus === "draft" || currentStatus === "open") {
    stageTitle = "Live Brief"
  } else if (["todo", "processing", "production", "stitching"].includes(currentStatus)) {
    stageTitle = "In Production"
  } else if (["shipped", "received", "released"].includes(currentStatus)) {
    stageTitle = "Completed / Shipping"
  }

  return (
    <div style={{
      width: techpackData && activeTab === "techpack" ? "900px" : "420px",
      minWidth: "420px",
      height: "100%",
      borderLeft: "1px solid var(--border-primary)",
      backgroundColor: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      boxShadow: "-4px 0 12px rgba(0,0,0,0.05)",
      overflowY: "auto"
    }}>
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--border-primary)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{stageTitle}</h3>
        <button 
          onClick={onClose}
          style={{
            background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-secondary)"
          }}
        >
          &times;
        </button>
      </div>

      {techpackData && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)", padding: "0 24px" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "16px 20px", background: "none", border: "none",
              borderBottom: activeTab === "overview" ? "2px solid var(--accent-violet)" : "2px solid transparent",
              color: activeTab === "overview" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === "overview" ? "600" : "500", cursor: "pointer", fontSize: "14px"
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("techpack")}
            style={{
              padding: "16px 20px", background: "none", border: "none",
              borderBottom: activeTab === "techpack" ? "2px solid var(--accent-violet)" : "2px solid transparent",
              color: activeTab === "techpack" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === "techpack" ? "600" : "500", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", gap: "8px"
            }}
          >
            Techpack <span style={{ padding: "2px 6px", backgroundColor: "var(--accent-violet)", color: "#FFF", borderRadius: "4px", fontSize: "10px" }}>AI Draft</span>
          </button>
        </div>
      )}

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1, overflowY: "auto" }}>
        {activeTab === "overview" && (
          <>
            {/* Order Header Info */}
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                {demand?.category || "Category"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 12px 0" }}>{order?.title || demand?.title || "Untitled"}</h2>
                {order && (
                  <button
                    onClick={handleShare}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--accent-violet)",
                      backgroundColor: "rgba(124, 58, 237, 0.08)",
                      border: "1px solid rgba(124, 58, 237, 0.15)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      flexShrink: 0
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    {copied ? "Copied!" : "Share Link"}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <div><strong style={{ color: "var(--text-primary)" }}>Qty:</strong> {order?.quantity || demand?.quantity || "-"}</div>
                <div><strong style={{ color: "var(--text-primary)" }}>Target TAT:</strong> {order?.turnaround_time || demand?.turnaround_time || "-"}</div>
              </div>
            </div>

            {/* If no order exists (only demand), show Live Brief status */}
            {!order && (
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Live Brief</h4>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  This brief is currently live and receiving bids from manufacturers.
                </div>
                {currentUserRole === "manufacturer" && (
                  <button className="btn-primary" style={{ width: "100%" }}>Place Bid</button>
                )}
              </div>
            )}

            {/* Dynamic content based on stage */}
            {order && order.status === "draft" && (
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Products</h4>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Products added from Studio will appear here.
                </div>
                <button className="btn-primary" style={{ width: "100%", marginTop: "16px" }}>
                  Edit & Submit Brief
                </button>
              </div>
            )}

            {order && order.status === "live" && (
              <div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Incoming Bids</h4>
                <div style={{ padding: "16px", border: "1px solid var(--border-primary)", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Receiving bids...</div>
                  <button className="btn-secondary" style={{ width: "100%" }}>Compare Bids</button>
                </div>
              </div>
            )}

            {order && ["todo", "processing", "production", "stitching", "shipped", "received", "released"].includes(order.status) && (
              <div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Manufacturer</h4>
                <div style={{ padding: "16px", border: "1px solid var(--border-primary)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--accent-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {order.manufacturer_name?.[0] || "M"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "500", fontSize: "14px" }}>{order.manufacturer_name || "Assigned Manufacturer"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Agreed Price: ${(order.amount || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Milestones</h4>
                  <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    Status: {order.status}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "techpack" && techpackData && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
            <TechpackViewer techpackData={techpackData} />
            
            {/* Techpack Action Bar */}
            <div style={{ marginTop: "auto", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Verify details before starting production.
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {currentUserRole === "manufacturer" && currentStatus !== "production" && (
                  <button className="btn-secondary" onClick={handleManufacturerUpload}>Upload Final Design Files</button>
                )}
                {currentUserRole === "buyer" && currentStatus !== "production" && (
                  <button className="btn-primary" onClick={handleBuyerLock}>Verify & Lock Techpack</button>
                )}
                {currentStatus === "production" && (
                  <span style={{ padding: "8px 16px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>Techpack Locked</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
