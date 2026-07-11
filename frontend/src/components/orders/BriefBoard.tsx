"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { Demand, Order } from "@/lib/db"
import OrderListRow from "./OrderListRow"

interface BriefBoardProps {
  orders?: Order[]
  demands?: Demand[]
  currentUserId?: string
  currentUserRole?: string
}

type OrderFilter = "all" | "active" | "completed" | "disputed"

export default function BriefBoard({ orders = [], currentUserId = "" }: BriefBoardProps) {
  const [filter, setFilter] = useState<OrderFilter>("all")
  const filtered = useMemo(() => orders.filter((order) => {
    if (filter === "all") return true
    if (filter === "active") return !["completed", "disputed"].includes(order.status)
    return order.status === filter
  }), [filter, orders])

  const filters: Array<{ key: OrderFilter; label: string; count: number }> = [
    { key: "all", label: "All orders", count: orders.length },
    { key: "active", label: "Active", count: orders.filter((order) => !["completed", "disputed"].includes(order.status)).length },
    { key: "completed", label: "Completed", count: orders.filter((order) => order.status === "completed").length },
    { key: "disputed", label: "Disputed", count: orders.filter((order) => order.status === "disputed").length },
  ]

  return <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="mb-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item.key} onClick={() => setFilter(item.key)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === item.key ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-600"}`}>{item.label} <span className="opacity-65">{item.count}</span></button>)}</div>
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {filtered.length ? filtered.map((order) => {
        const withProducts = order as Order & { products?: Parameters<typeof OrderListRow>[0]["products"] }
        return <Link key={order.id} href={`/orders/${order.id}`} className="block border-b border-slate-100 last:border-0"><OrderListRow order={order} products={withProducts.products || []} currentUserId={currentUserId} /></Link>
      }) : <div className="px-5 py-14 text-center"><p className="text-sm font-semibold text-slate-700">No persisted orders in this view</p><p className="mt-1 text-xs text-slate-400">Accepted marketplace bids appear here.</p></div>}
    </div>
  </div>
}
