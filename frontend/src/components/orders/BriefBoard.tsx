"use client"

import React, { useState } from "react"
import Link from "next/link"
import type { Demand, Order } from "@/lib/db"
import OrderListRow from "./OrderListRow"

interface BriefBoardProps {
  orders?: Order[]
  demands?: Demand[]
  currentUserId?: string
  currentUserRole?: string
}

// ── Mock data matching proov_orders_page_list_kanban.html ──────────────────
const MOCK_ORDERS = [
  {
    id: "ORD-2026-00087",
    title: "Leather Holdall × 150 —...",
    meta: "ORD-2026-00087 · Leather goods",
    status: "appeal",
    source: "mine",
    cpInitials: "KL",
    cpName: "Karachi Leather",
    cpBg: "#FCEBEB",
    cpColor: "#791F1F",
    value: "$6,750",
    escrow: "Funded",
    date: "2h ago",
    thumbBg: "#FCEBEB",
    thumbDot: "#E24B4A",
  },
  {
    id: "ORD-2026-00091",
    title: "Football Jersey Kit × ...",
    meta: "ORD-2026-00091 · Sportswear",
    status: "production",
    source: "mine",
    cpInitials: "AS",
    cpName: "Ali Sports",
    cpBg: "#E6F1FB",
    cpColor: "#0C447C",
    value: "$3,675",
    escrow: "Funded",
    date: "5h ago",
    thumbBg: "#FAEEDA",
    thumbDot: "#EF9F27",
  },
  {
    id: "ORD-2026-00094",
    title: "Goalkeeper Gloves × 1,20...",
    meta: "ORD-2026-00094 · Sportswear",
    status: "design",
    source: "shared-with",
    cpInitials: "SA",
    cpName: "Sport Arabia",
    cpBg: "#E6F1FB",
    cpColor: "#0C447C",
    value: "$13,440",
    escrow: "Pending",
    date: "1d ago",
    thumbBg: "#E6F1FB",
    thumbDot: "#378ADD",
  },
  {
    id: "ORD-2026-00079",
    title: "Training Shorts × 300 —...",
    meta: "ORD-2026-00079 · Sportswear",
    status: "shipping",
    source: "mine",
    cpInitials: "RK",
    cpName: "RunKit Sports",
    cpBg: "#E1F5EE",
    cpColor: "#085041",
    value: "$1,260",
    escrow: "Funded",
    date: "2d ago",
    thumbBg: "#E1F5EE",
    thumbDot: "#5DCAA5",
  },
  {
    id: "DRAFT-2026-00112",
    title: "Compression Tights × 800...",
    meta: "DRAFT-2026-00112 · Apparel",
    status: "draft",
    source: "mine",
    cpInitials: "",
    cpName: "",
    cpBg: "",
    cpColor: "",
    value: "—",
    escrow: null,
    date: "3d ago",
    thumbBg: "#F4F4F5",
    thumbDot: "#A1A1AA",
  },
  {
    id: "ORD-2026-00062",
    title: "Leather Wallets × 600 ...",
    meta: "ORD-2026-00062 · Leather goods",
    status: "delivered",
    source: "shared-by",
    cpInitials: "PL",
    cpName: "Punjab Leather",
    cpBg: "#EAF3DE",
    cpColor: "#27500A",
    value: "$5,400",
    escrow: "Released",
    date: "6d ago",
    thumbBg: "#EAF3DE",
    thumbDot: "#639922",
  },
]

const STATUS: Record<string, { badgeBg: string; badgeColor: string; label: string }> = {
  appeal:     { badgeBg: "#FCEBEB", badgeColor: "#791F1F", label: "In appeal" },
  production: { badgeBg: "#FAEEDA", badgeColor: "#633806", label: "Production" },
  design:     { badgeBg: "#E6F1FB", badgeColor: "#0C447C", label: "Design" },
  shipping:   { badgeBg: "#E1F5EE", badgeColor: "#085041", label: "Shipping" },
  draft:      { badgeBg: "#F4F4F5", badgeColor: "#71717A", label: "Draft" },
  delivered:  { badgeBg: "#EAF3DE", badgeColor: "#27500A", label: "Delivered" },
}

const SOURCE: Record<string, { bg: string; color: string; label: string }> = {
  "mine":       { bg: "#F4F4F5", color: "#71717A", label: "My order" },
  "shared-by":  { bg: "#EEEDFE", color: "#3C3489", label: "Shared by me" },
  "shared-with":{ bg: "#FBEAF0", color: "#72243E", label: "Shared with me" },
}

const FILTERS = [
  { key: "mine", label: "My orders", count: 18 },
  { key: "shared-by", label: "Shared by me", count: 4 },
  { key: "shared-with", label: "Shared with me", count: 2 },
  { key: "archived", label: "Archived", count: 7 },
]

export default function BriefBoard({ orders = [], currentUserId = "phantom_sports_001" }: BriefBoardProps) {
  const [activeFilter, setActiveFilter] = useState("mine")
  const hasRealOrders = orders.length > 0

  return (
    <div style={{ background: "#fff", borderRadius: "8px" }}>
      {/* Filter pills + sort row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                fontSize: "13px",
                padding: "6px 16px",
                borderRadius: "20px",
                border: "0.5px solid",
                borderColor: activeFilter === f.key ? "#09090B" : "rgba(9,9,11,0.15)",
                cursor: "pointer",
                background: activeFilter === f.key ? "#09090B" : "#fff",
                color: activeFilter === f.key ? "#fff" : "#71717A",
                fontWeight: activeFilter === f.key ? 500 : 400,
                transition: "all 0.12s",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {f.label}
              <span style={{ opacity: activeFilter === f.key ? 0.7 : 0.5, fontSize: "12px" }}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort dropdown full-width */}
      <div style={{
        border: "0.5px solid rgba(9,9,11,0.08)",
        borderRadius: "8px",
        marginBottom: "12px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
      }}>
        <select style={{
          fontSize: "13px", color: "#09090B", border: "none", background: "transparent", cursor: "pointer",
          outline: "none", fontWeight: 500, flex: 1,
        }}>
          <option>Last updated</option>
          <option>Newest first</option>
          <option>Order value high to low</option>
          <option>Delivery date soonest</option>
        </select>
        <span style={{ fontSize: "12px", color: "#71717A" }}>▼</span>
      </div>

      {/* List rows */}
      <div style={{ border: "0.5px solid rgba(9,9,11,0.08)", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
        {hasRealOrders ? orders.map((order) => {
          const orderWithProducts = order as Order & { products?: Parameters<typeof OrderListRow>[0]["products"] }
          return (
          <Link key={order.id} href={`/orders/${order.id}`} style={{ display: "block", textDecoration: "none" }}>
            <OrderListRow order={order} products={orderWithProducts.products || []} currentUserId={currentUserId} />
          </Link>
          )
        }) : MOCK_ORDERS.map((order, i) => {
          const st = STATUS[order.status]
          const src = SOURCE[order.source]
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderBottom: i < MOCK_ORDERS.length - 1 ? "0.5px solid rgba(9,9,11,0.06)" : "none",
                cursor: "pointer",
                background: "#fff",
                transition: "background 0.1s",
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9F9F9")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              {/* Colored status dot */}
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: order.thumbDot, flexShrink: 0, display: "inline-block" }} />

              {/* Colored square thumbnail */}
              <div style={{
                width: "28px", height: "28px", borderRadius: "6px",
                background: order.thumbBg,
                flexShrink: 0, border: "0.5px solid rgba(9,9,11,0.06)",
              }} />

              {/* Main title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#09090B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {order.title}
                </div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>{order.meta}</div>
              </div>

              {/* Status badge */}
              <span style={{
                fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px",
                background: st.badgeBg, color: st.badgeColor, flexShrink: 0, whiteSpace: "nowrap",
              }}>
                {st.label}
              </span>

              {/* Source badge */}
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                background: src.bg, color: src.color, flexShrink: 0, whiteSpace: "nowrap",
              }}>
                {src.label}
              </span>

              {/* Counterparty */}
              <span style={{ fontSize: "12px", color: "#71717A", flexShrink: 0, width: "130px", display: "flex", alignItems: "center", gap: "6px" }}>
                {order.cpInitials ? (
                  <>
                    <span style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: order.cpBg, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "8px", fontWeight: 600, color: order.cpColor, flexShrink: 0,
                    }}>
                      {order.cpInitials}
                    </span>
                    {order.cpName}
                  </>
                ) : "—"}
              </span>

              {/* Value & Escrow */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, width: "90px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#09090B" }}>
                  {order.value}
                </span>
                {order.escrow && (
                  <span style={{ fontSize: "10px", color: order.escrow === "Funded" ? "#10B981" : "#F59E0B", fontWeight: 500, marginTop: "2px" }}>
                    Escrow: {order.escrow}
                  </span>
                )}
              </div>

              {/* Date */}
              <span style={{ fontSize: "11px", color: "#A1A1AA", flexShrink: 0, width: "55px", textAlign: "right" }}>
                {order.date}
              </span>

              {/* Checkbox placeholder */}
              <span style={{
                width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                border: "1px solid rgba(9,9,11,0.2)", display: "inline-block",
              }} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
