"use client"

import Link from "next/link"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Lock,
  MessageSquare,
  Paperclip,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Download,
  MoreVertical,
  Send,
  Smile,
  Check,
  Search,
  Bell,
  MessageCircle,
  Plus,
  Eye,
  X,
} from "lucide-react"
import type { EscrowLedgerEntry, Message, MilestoneEvent, Order, OrderMilestone, OrderProduct, ProovNotification, TechpackPage } from "@/lib/db"
import type { AppSession, EscrowEntryType, OrderLifecycleAction } from "@/lib/pilot-contracts"
import { recordManualEscrow, transitionOrder } from "@/lib/pilot-lifecycle"
import { createClient } from "@/utils/supabase/client"

type Attention = {
  title: string
  detail: string
  owner: string
  action: string
  tone: "urgent" | "review" | "money" | "shipping" | "calm"
  icon: React.ComponentType<{ size?: number; className?: string }>
}

type Milestone = {
  name: string
  description: string
  percent: number
  state: "done" | "current" | "next" | "blocked"
  action?: string
  amount?: number | null
  dueDate?: string | null
  proofCount?: number
}

type ConversationEvent = {
  id: string
  author: "assistant" | "buyer" | "manufacturer" | "system"
  title: string
  body: string
  time: string
  actions?: string[]
  attachment?: string
}

const pageLabels: Record<string, string> = {
  cover: "Cover",
  flats: "Flats",
  bom: "BOM",
  measurements: "Measurements",
  colorways: "Colorways",
  packaging: "Packaging",
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    active: "RFQ live",
    under_review: "Techpack review",
    confirmed: "Matched",
    sampling: "Sample review",
    in_production: "Making",
    quality_check: "Quality check",
    shipped: "Shipped",
    delivered: "Delivery review",
    completed: "Complete",
    disputed: "Dispute",
  }
  return labels[status || ""] || "Execution"
}

function escrowLabel(status?: string) {
  if (status === "released") return "Released"
  if (status && status !== "pending") return "Funded"
  return "Pending"
}

function contractLabel(order: Order) {
  if (order.techpack_locked) return "Locked"
  if (order.status === "draft" || order.status === "active") return "Drafting"
  return "Review"
}

function getAttention(order: Order, qcApproved = false): Attention {
  if (order.status === "disputed") {
    return {
      title: "Resolve dispute intake",
      detail: "A dispute is open. Review the techpack evidence and latest messages before funds move.",
      owner: "Proov admin + both parties",
      action: "Open dispute room",
      tone: "urgent",
      icon: AlertCircle,
    }
  }

  if (order.status === "delivered") {
    return {
      title: "Confirm delivery",
      detail: "The shipment is marked delivered. Confirm receipt to release the final milestone.",
      owner: "Buyer",
      action: "Confirm delivery",
      tone: "shipping",
      icon: Truck,
    }
  }

  if (order.status === "quality_check") {
    if (qcApproved) {
      return { title: "Ship approved production", detail: "QC is approved. Add carrier and tracking to move the order into shipping.", owner: "Manufacturer", action: "Add tracking", tone: "shipping", icon: Truck }
    }
    return {
      title: "Review QC proof",
      detail: "The manufacturer uploaded QC evidence. Approve it or request a correction before M2 releases.",
      owner: "Buyer",
      action: "Review QC",
      tone: "review",
      icon: ClipboardCheck,
    }
  }

  if (order.status === "confirmed" && order.escrow_status === "pending") {
    return {
      title: "Escrow funding required",
      detail: "Fund escrow to start production and lock your order.",
      owner: "Buyer",
      action: "Record escrow funding",
      tone: "money",
      icon: CircleDollarSign,
    }
  }

  if (order.status === "confirmed") {
    return { title: "Start production", detail: "Escrow is recorded. Confirm materials and begin production.", owner: "Manufacturer", action: "Confirm production start", tone: "money", icon: CircleDollarSign }
  }

  if (order.status === "sampling") {
    return {
      title: "Approve physical sample",
      detail: "Sample approval unlocks the production-start milestone and keeps the contract traceable.",
      owner: "Buyer",
      action: "Approve sample",
      tone: "review",
      icon: ShieldCheck,
    }
  }

  if (order.status === "in_production") {
    return { title: "Submit quality evidence", detail: "Attach QC evidence, then submit it for buyer review.", owner: "Manufacturer", action: "QC proof submitted", tone: "review", icon: ClipboardCheck }
  }

  if (order.status === "shipped") {
    return {
      title: "Mark shipment delivered",
      detail: "Tracking is active. Mark delivery when the carrier confirms arrival.",
      owner: "Manufacturer",
      action: "Mark delivered",
      tone: "shipping",
      icon: Truck,
    }
  }

  return {
    title: "Lock execution plan",
    detail: "Review the final techpack, confirm milestone terms, and keep the next action visible here.",
    owner: "Buyer + manufacturer",
    action: "Review plan",
    tone: "calm",
    icon: Lock,
  }
}

function milestonesFor(order: Order): Milestone[] {
  const status = order.status || "confirmed"
  const isFunded = order.escrow_status && order.escrow_status !== "pending"
  return [
    {
      name: "Sample Approved",
      description: "Buyer approves the physical or digital sample before production funds release.",
      percent: 10,
      state: ["sampling", "in_production", "quality_check", "shipped", "delivered", "completed"].includes(status) ? "done" : "current",
      action: status === "confirmed" ? "Awaiting sample decision" : undefined,
    },
    {
      name: "Production Start",
      description: "Manufacturer confirms materials and production start. Releases 40%.",
      percent: 40,
      state: status === "confirmed" && !isFunded ? "blocked" : ["in_production", "quality_check", "shipped", "delivered", "completed"].includes(status) ? "done" : "current",
      action: status === "confirmed" && !isFunded ? "Escrow funding required" : "Confirm production start",
    },
    {
      name: "Quality Check Approval",
      description: "QC proof is uploaded and reviewed against the locked techpack. Releases 30%.",
      percent: 30,
      state: ["quality_check"].includes(status) ? "current" : ["shipped", "delivered", "completed"].includes(status) ? "done" : "next",
      action: status === "quality_check" ? "Review QC evidence" : undefined,
    },
    {
      name: "Delivery / Shipment",
      description: "Tracking or receipt confirmation closes the order. Releases final 20%.",
      percent: 20,
      state: ["delivered"].includes(status) ? "current" : ["completed"].includes(status) ? "done" : "next",
      action: status === "delivered" ? "Confirm receipt" : undefined,
    },
  ]
}

function milestonesFromRows(order: Order, rows: OrderMilestone[]): Milestone[] {
  if (rows.length === 0) return milestonesFor(order)

  const hasCurrent = rows.some((row) => row.status === "in_progress" || row.status === "pending")

  return rows.map((row, index) => {
    const isDone = row.status === "completed" || Boolean(row.completed_at)
    const isCurrent = !isDone && (row.status === "in_progress" || (row.status === "pending" && (!hasCurrent || rows.findIndex((candidate) => candidate.status !== "completed" && !candidate.completed_at) === index)))

    return {
      name: row.title || `Milestone ${row.milestone_number || index + 1}`,
      description: row.description || "Production milestone tracked inside the order.",
      percent: row.percentage || 0,
      state: isDone ? "done" : isCurrent ? "current" : "next",
      action: isCurrent ? "Record milestone update" : undefined,
      amount: row.amount,
      dueDate: row.due_date,
      proofCount: row.proof_urls?.length || 0,
    }
  })
}

function completionFor(product: OrderProduct) {
  const pages = product.techpack_pages || []
  if (pages.length === 0) return 0
  return Math.round((pages.filter((page) => page.is_complete).length / pages.length) * 100)
}

function formatMoney(value?: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0)
}

function formatLedgerType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function productFallback(order: Order): OrderProduct[] {
  return [
    {
      id: `${order.id}-product`,
      order_id: order.id,
      name: order.title || "Order product",
      category: "Sportswear",
      primary_material: order.fabric || "Not specified",
      quantity: order.quantity || 0,
      unit: "pieces",
      target_unit_price: order.quantity ? Math.round((order.amount || 0) / Math.max(order.quantity, 1)) : 0,
      sort_order: 0,
      quality_coverage: "full",
      style_code: "",
      techpack_pages: [],
    },
  ]
}

function formatConversationTime(value?: string) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

function assistantEventFor(order: Order): ConversationEvent {
  const attention = getAttention(order)
  return {
    id: "assistant-current-action",
    author: "assistant",
    title: "Proov Assistant",
    body: `${attention.title}: ${attention.detail}`,
    time: "Now",
    actions: [attention.action, "Message about it"],
  }
}

function systemMilestoneEvent(order: Order): ConversationEvent {
  return {
    id: "system-milestones",
    author: "system",
    title: "System event",
    body: `Milestone rules attached to ${order.order_number || order.id.slice(0, 8)}: Sample Approved, Production Start 40%, QC 30%, Delivery 20%.`,
    time: "10:35 AM",
  }
}

function conversationFromMessages(order: Order, messages: Message[]): ConversationEvent[] {
  const hydrated = messages.map((message) => {
    const isSystem = message.message_type === "system"
    const isBuyer = message.sender_id === order.buyer_id
    const isManufacturer = message.sender_id === order.manufacturer_id
    const author: ConversationEvent["author"] = isSystem ? "system" : isBuyer ? "buyer" : isManufacturer ? "manufacturer" : "manufacturer"

    return {
      id: message.id,
      author,
      title: isSystem ? message.sender_name || "System event" : message.sender_name || (isBuyer ? "Buyer" : order.manufacturer_name || "Manufacturer"),
      body: message.content || "Activity recorded.",
      time: formatConversationTime(message.created_at),
      attachment: message.attachment_urls?.[0],
    }
  })

  if (hydrated.length === 0) {
    return [assistantEventFor(order), systemMilestoneEvent(order)]
  }

  const hasSystem = hydrated.some((event) => event.author === "system")
  return [assistantEventFor(order), ...hydrated, ...(hasSystem ? [] : [systemMilestoneEvent(order)])]
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function lifecycleActionForLabel(label: string): OrderLifecycleAction | null {
  const normalized = label.toLowerCase()
  if (normalized.includes("dispute")) return "file_dispute"
  if (normalized.includes("approve sample")) return "approve_sample"
  if (normalized.includes("production start") || normalized.includes("start production")) return "start_production"
  if (normalized.includes("qc proof") || normalized.includes("submit qc")) return "submit_qc"
  if (normalized.includes("review qc") || normalized.includes("approve qc")) return "approve_qc"
  if (normalized.includes("add tracking") || normalized.includes("mark shipped")) return "mark_shipped"
  if (normalized.includes("mark delivered")) return "mark_delivered"
  if (normalized.includes("confirm delivery") || normalized.includes("confirm receipt")) return "confirm_delivery"
  return null
}

function optimisticOrder(order: Order, action: OrderLifecycleAction): Order {
  if (action === "file_dispute") return { ...order, status: "disputed" }
  if (action === "approve_sample" || action === "start_production" || action === "request_qc_changes") return { ...order, status: "in_production" }
  if (action === "submit_qc") return { ...order, status: "quality_check" }
  if (action === "mark_shipped") return { ...order, status: "shipped" }
  if (action === "mark_delivered") return { ...order, status: "delivered" }
  if (action === "confirm_delivery") return { ...order, status: "completed" }
  return order
}

function roleCanPerform(role: AppSession["role"], action: OrderLifecycleAction | null) {
  if (!action) return false
  if (action === "file_dispute") return role === "buyer" || role === "manufacturer"
  if (["approve_sample", "approve_qc", "request_qc_changes", "confirm_delivery"].includes(action)) return role === "buyer"
  return role === "manufacturer"
}

function Accordion({
  id,
  title,
  subtitle,
  expanded,
  onToggle,
  children,
  badge,
  icon: Icon
}: {
  id: string
  title: string
  subtitle?: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  badge?: React.ReactNode
  icon?: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-zinc-900 hover:bg-zinc-50/50"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-[#6E56CF]" />}
          <div className="flex items-center">
            <span className="text-sm font-semibold tracking-tight text-zinc-900">{title}</span>
            {subtitle && <span className="ml-3 text-xs text-zinc-500 font-normal">{subtitle}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {badge}
          {expanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-zinc-100 bg-white p-5 text-sm text-zinc-600">
          {children}
        </div>
      )}
    </div>
  )
}

export default function OrderWorkspace({
  order,
  session,
  products,
  messages = [],
  ledgerEntries = [],
  persistedMilestones = [],
  milestoneEvents = [],
  notifications = [],
}: {
  order: Order
  session: AppSession
  products: OrderProduct[]
  messages?: Message[]
  ledgerEntries?: EscrowLedgerEntry[]
  persistedMilestones?: OrderMilestone[]
  milestoneEvents?: MilestoneEvent[]
  notifications?: ProovNotification[]
}) {
  const router = useRouter()
  const [workspaceOrder, setWorkspaceOrder] = useState(order)
  const workspaceProducts = products.length > 0 ? products : productFallback(order)
  const [activeProductId, setActiveProductId] = useState(workspaceProducts[0]?.id)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [composerValue, setComposerValue] = useState("")
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; url: string } | null>(null)
  const [escrowEntryType, setEscrowEntryType] = useState<EscrowEntryType>("manual_funding")
  const [escrowAmount, setEscrowAmount] = useState(String(order.amount || ""))
  const [escrowReference, setEscrowReference] = useState("")
  const [escrowNotes, setEscrowNotes] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const [conversation, setConversation] = useState<ConversationEvent[]>(() => conversationFromMessages(order, messages))
  const milestones = milestonesFromRows(workspaceOrder, persistedMilestones)
  const qcApproved = persistedMilestones.some((milestone) => milestone.milestone_number === 2 && milestone.status === "completed")
  const attention = getAttention(workspaceOrder, qcApproved)
  const attentionLifecycleAction = lifecycleActionForLabel(attention.action)
  const canPerformAttention = roleCanPerform(session.role, attentionLifecycleAction)
  const AttentionIcon = attention.icon
  const units = workspaceProducts.reduce((sum, product) => sum + (product.quantity || 0), 0)
  const activeProduct = workspaceProducts.find((product) => product.id === activeProductId) || workspaceProducts[0]
  const activePages = activeProduct.techpack_pages || []
  const activeMilestone = milestones.find((milestone) => milestone.state === "current" || milestone.state === "blocked") || milestones[0]
  const isEscrowPending = workspaceOrder.escrow_status === "pending" || !workspaceOrder.escrow_status
  const isDisputed = workspaceOrder.status === "disputed"
  const latestLedgerEntry = ledgerEntries[0]
  const releasedAmount = ledgerEntries
    .filter((entry) => entry.status === "released" || entry.entry_type === "milestone_release")
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
  const actionHistory = [
    "Techpack v1 created",
    workspaceOrder.escrow_status === "pending" ? "Escrow awaiting manual record" : "Escrow funding recorded",
    `${activeMilestone.name} is the current operating step`,
  ]
  const sectionPages = activePages.length > 0 ? activePages : productFallback(order)[0].techpack_pages || []
  const canPersist = isUuid(order.id)

  useEffect(() => setWorkspaceOrder(order), [order])

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    products: false,
    techpack: false,
    pricing: false,
    escrow: true,
    qc: false,
    shipping: false,
    files: false,
    dispute: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const persistConversationEvent = async (event: ConversationEvent, messageType: "human" | "system", eventType?: string) => {
    if (!canPersist) return false

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from("messages").insert([{
      order_id: order.id,
      sender_id: user.id,
      content: event.body,
      message_type: messageType,
      event_type: eventType,
      metadata: {
        title: event.title,
        action_label: event.actions?.[0] || null,
        author_role: event.author,
      },
      attachment_urls: event.attachment ? [event.attachment] : [],
    }])

    return !error
  }

  const confirmAction = async (label: string) => {
    const action = lifecycleActionForLabel(label)
    if (!action) { setNotice("This control is informational. Use the relevant lifecycle action below."); return }
    if (!canPersist) { setNotice("Only persisted orders can be changed."); return }

    let notes: string | undefined
    let carrier: string | undefined
    let trackingNumber: string | undefined
    const proofUrls = pendingAttachment ? [pendingAttachment.url] : []
    if (action === "file_dispute") {
      notes = window.prompt("Describe the dispute and the outcome you need")?.trim()
      if (!notes) return
    }
    if (action === "submit_qc" && proofUrls.length === 0) {
      setNotice("Attach QC evidence in the conversation composer before submitting QC.")
      return
    }
    if (action === "mark_shipped") {
      trackingNumber = window.prompt("Tracking number")?.trim()
      if (!trackingNumber) return
      carrier = window.prompt("Carrier")?.trim() || undefined
    }

    setNotice("Saving lifecycle event...")
    setIsSavingEvent(true)
    const result = await transitionOrder({ orderId: order.id, action, notes, proofUrls, carrier, trackingNumber })
    setIsSavingEvent(false)
    if (!result.ok) { setNotice(result.message); return }
    setWorkspaceOrder((current) => optimisticOrder(current, action))
    setPendingAttachment(null)
    setNotice("Saved.")
    router.refresh()
  }

  const submitEscrowEntry = async () => {
    const amount = Number(escrowAmount)
    if (!Number.isFinite(amount) || amount <= 0 || !escrowReference.trim()) {
      setNotice("Enter a positive amount and a payment reference.")
      return
    }
    setIsSavingEvent(true)
    setNotice("Recording manual escrow entry...")
    const result = await recordManualEscrow({ orderId: order.id, entryType: escrowEntryType, amount, currency: "USD", reference: escrowReference.trim(), notes: escrowNotes.trim() || undefined })
    setIsSavingEvent(false)
    if (!result.ok) { setNotice(result.message); return }
    setEscrowReference("")
    setEscrowNotes("")
    setNotice("Escrow entry recorded.")
    router.refresh()
  }

  const sendMessage = async () => {
    const trimmed = composerValue.trim()
    if (!trimmed && !pendingAttachment) return

    const event: ConversationEvent = {
      id: `${Date.now()}-buyer`,
      author: session.role === "manufacturer" ? "manufacturer" : "buyer",
      title: session.displayName,
      body: trimmed || `Attached ${pendingAttachment?.name}`,
      time: "Just now",
      attachment: pendingAttachment?.url,
    }

    setConversation((current) => [...current, event])
    setComposerValue("")
    setPendingAttachment(null)
    setNotice(canPersist ? "Saving message..." : "Message added locally.")
    setIsSavingEvent(true)
    const persisted = await persistConversationEvent(event, "human")
    setIsSavingEvent(false)
    setNotice(persisted ? "Message saved." : canPersist ? "Could not save message." : "Message added locally.")
  }

  const uploadAttachment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setNotice("Uploading attachment...")
    const body = new FormData()
    body.append("file", file)
    try {
      const response = await fetch("/api/upload", { method: "POST", body })
      const payload = await response.json() as { url?: string; filename?: string; error?: string }
      if (!response.ok || !payload.url) throw new Error(payload.error || "Upload failed")
      setPendingAttachment({ name: payload.filename || file.name, url: payload.url })
      setNotice("Attachment ready to send.")
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Attachment upload failed.")
    }
    event.target.value = ""
  }

  // Determine timeline progress step index (0 to 8)
  const status = workspaceOrder.status || "confirmed"
  const isFunded = workspaceOrder.escrow_status && workspaceOrder.escrow_status !== "pending"
  let activeStep = 2 // default to Matched
  if (status === "draft") activeStep = 0
  else if (status === "active") activeStep = 1
  else if (status === "confirmed") {
    activeStep = isFunded ? 3 : 2
  } else if (["sampling", "in_production"].includes(status)) {
    activeStep = 4 // Making
  } else if (status === "quality_check") {
    activeStep = 5 // QC
  } else if (status === "shipped") {
    activeStep = 6 // Shipped
  } else if (status === "delivered") {
    activeStep = 7 // Arrived
  } else if (status === "completed") {
    activeStep = 8 // Done

  }

  const stepsList = [
    "Draft",
    "Published",
    "Matched",
    "Funded",
    "Making",
    "QC",
    "Shipped",
    "Arrived",
    "Done",
  ]

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans antialiased">
      {/* Top Navbar */}
      <nav className="border-b border-zinc-200 bg-white/95 px-6 py-3 sticky top-0 z-50 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/orders" className="text-zinc-400 hover:text-zinc-900 transition flex items-center gap-1.5 text-sm">
              <ArrowLeft size={16} />
              <span>Orders</span>
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900 font-medium text-sm">{workspaceOrder.order_number || workspaceOrder.id.slice(0, 8)}</span>
          </div>

          <div className="flex items-center gap-5">
            <button className="text-zinc-500 hover:text-zinc-800 transition"><Search size={19} /></button>
            <button type="button" onClick={() => setNotificationsOpen((open) => !open)} className="text-zinc-500 hover:text-zinc-800 transition relative" aria-label="Notifications">
              <Bell size={19} />
              {notifications.some((item) => !item.read_at) && <span className="absolute -top-1 -right-1 min-w-3.5 rounded-full bg-[#6E56CF] px-1 text-[9px] font-bold text-white">{notifications.filter((item) => !item.read_at).length}</span>}
            </button>
            {notificationsOpen && <div className="absolute right-28 top-12 z-[70] w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"><div className="border-b border-zinc-100 px-4 py-3 text-xs font-semibold">Notifications</div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map((item) => <div key={item.id} className="border-b border-zinc-100 px-4 py-3 last:border-0"><p className="text-xs font-semibold text-zinc-800">{item.title}</p>{item.body && <p className="mt-1 text-[11px] text-zinc-500">{item.body}</p>}</div>) : <p className="px-4 py-8 text-center text-xs text-zinc-400">No notifications yet.</p>}</div></div>}
            <button className="text-zinc-500 hover:text-zinc-800 transition"><MessageCircle size={19} /></button>
            <div className="h-6 w-px bg-zinc-200" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-[#6E56CF]">
                JK
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold text-zinc-900">{session.displayName}</p>
                <p className="text-[10px] capitalize text-zinc-500">{session.role}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Order Header */}
      <header className="bg-white border-b border-zinc-100 px-6 py-6">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{workspaceOrder.title || "Untitled order"}</h1>
              <span className="rounded-full bg-[#F0EDFF] border border-[#E1DBFF]/60 px-2.5 py-0.5 text-xs font-semibold text-[#6E56CF]">
                {statusLabel(workspaceOrder.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">Buyer</span>
              <span>{workspaceOrder.buyer_id === session.userId ? session.displayName : "Buyer"}</span>
              <span className="text-zinc-300">→</span>
              <span className="font-semibold text-zinc-700">Manufacturer</span>
              <span>{workspaceOrder.manufacturer_name || "Manufacturer"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex flex-col text-right mr-4 hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Total Value</span>
              <span className="text-base font-bold text-zinc-900">{formatMoney(workspaceOrder.amount)} <span className="text-xs font-normal text-zinc-500">USD</span></span>
            </div>
            <div className="flex flex-col text-right mr-4 hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Total Quantity</span>
              <span className="text-base font-bold text-zinc-900">{units.toLocaleString()} <span className="text-xs font-normal text-zinc-500">Units</span></span>
            </div>
            <div className="flex flex-col text-right mr-4 hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Target Delivery</span>
              <span className="text-base font-bold text-zinc-900">{workspaceOrder.turnaround_time || "Not set"}</span>
            </div>
            <button
              type="button"
              disabled={!canPerformAttention}
              onClick={() => confirmAction(attention.action)}
              className="rounded-lg bg-[#6E56CF] px-4.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B3CC4] focus:outline-none focus:ring-2 focus:ring-[#6E56CF]/50 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {attention.action === "Record escrow funding" ? (session.role === "admin" ? "Record below" : "Awaiting admin") : canPerformAttention ? attention.action : `Waiting on ${attention.owner}`}
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Progress Stepper Timeline */}
      <section className="bg-white border-b border-zinc-200 px-6 py-6 overflow-x-auto">
        <div className="mx-auto w-full max-w-[1500px] min-w-[700px]">
          <div className="relative flex items-center justify-between px-4">
            {/* Background progress line */}
            <div className="absolute left-6 right-6 top-[15px] h-0.5 -translate-y-1/2 bg-zinc-100" />
            {/* Active progress fill */}
            <div 
              className="absolute left-6 top-[15px] h-0.5 -translate-y-1/2 bg-[#6E56CF] transition-all duration-300"
              style={{ width: `${(activeStep / (stepsList.length - 1)) * 96}%` }}
            />
            {stepsList.map((step, index) => {
              const isDone = index < activeStep
              const isCurrent = index === activeStep
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`flex h-7.5 w-7.5 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isDone 
                        ? "border-[#6E56CF] bg-[#6E56CF] text-white" 
                        : isCurrent 
                          ? "border-[#6E56CF] bg-white text-[#6E56CF] font-bold ring-4 ring-[#6E56CF]/10" 
                          : "border-zinc-200 bg-white text-zinc-400"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span 
                    className={`mt-2.5 text-[11px] font-semibold tracking-tight transition-colors duration-300 ${
                      isCurrent ? "text-[#6E56CF]" : isDone ? "text-zinc-800" : "text-zinc-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)_390px]">
        {/* Left Column - Products in this order */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Products in this order</h2>
              <button className="text-xs font-semibold text-[#6E56CF] hover:underline flex items-center gap-0.5">
                <Plus size={12} /> Add product
              </button>
            </div>
            
            <div className="space-y-4">
              {workspaceProducts.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => {
                    setActiveProductId(product.id)
                    setNotice(`${product.name} selected.`)
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    activeProduct.id === product.id 
                      ? "border-[#6E56CF]/40 bg-[#F0EDFF]/15 ring-1 ring-[#6E56CF]/20" 
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-400 text-xs font-medium overflow-hidden">
                      {product.name.toLowerCase().includes("jersey") ? (
                        <div className="bg-[#5B3CC4]/10 w-full h-full flex flex-col items-center justify-center p-1 text-center font-bold text-[#6E56CF]">
                          JSY
                        </div>
                      ) : product.name.toLowerCase().includes("shorts") ? (
                        <div className="bg-emerald-500/10 w-full h-full flex flex-col items-center justify-center p-1 text-center font-bold text-emerald-600">
                          SHR
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 w-full h-full flex flex-col items-center justify-center p-1 text-center font-bold text-amber-600">
                          SOK
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-zinc-900">{product.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{product.quantity?.toLocaleString()} Units · {product.style_code || "Main Product"}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          Techpack: Complete
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          QC Coverage: Full
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Middle Column - Collapsible Sections */}
        <section className="space-y-4">
          {notice && (
            <div role="status" className="rounded-xl border border-violet-100 bg-[#F8F7FF] px-4 py-3 text-xs text-[#6E56CF] font-medium flex items-center justify-between">
              <span>{notice}</span>
              <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-zinc-600"><X size={14} /></button>
            </div>
          )}

          {/* Attention Banner */}
          <div className="overflow-hidden rounded-xl border border-[#E1DBFF]/80 bg-[#F0EDFF]/35 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6E56CF]/10 text-[#6E56CF] border border-[#6E56CF]/20">
                  <AttentionIcon size={20} />
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6E56CF]">What needs your attention</p>
                  <h3 className="text-base font-bold text-zinc-900">{attention.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500 max-w-xl leading-relaxed">{attention.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEscrowPending && (
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-widest">Amount to fund</span>
                    <span className="text-sm font-bold text-zinc-900">{formatMoney(workspaceOrder.amount)} USD</span>
                  </div>
                )}
                <button
                  type="button"
                  disabled={!canPerformAttention}
                  onClick={() => confirmAction(attention.action)}
                  className="rounded-lg bg-[#6E56CF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B3CC4] disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {attention.action === "Record escrow funding" ? (session.role === "admin" ? "Record below" : "Awaiting admin") : canPerformAttention ? attention.action : "Waiting on counterparty"}
                </button>
              </div>
            </div>
          </div>

          {/* Accordion Panels */}
          <div className="space-y-3">
            {/* 1. Order Summary */}
            <Accordion
              id="summary"
              title="Order Summary"
              expanded={expandedSections.summary}
              onToggle={() => toggleSection("summary")}
              icon={FileText}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-400 text-xs">Source</span>
                    <span className="font-semibold text-zinc-800 text-xs">Market</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-400 text-xs">Incoterms</span>
                    <span className="font-semibold text-zinc-800 text-xs">{workspaceOrder.incoterms || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-400 text-xs">TAT</span>
                    <span className="font-semibold text-zinc-800 text-xs">{workspaceOrder.turnaround_time || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-400 text-xs">Sample required</span>
                    <span className="font-semibold text-zinc-800 text-xs">{workspaceOrder.sample_required ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 text-xs">Delivery address</span>
                    <span className="font-medium text-zinc-700 text-xs leading-relaxed">{workspaceOrder.destination || "Recorded in the locked order documents."}</span>
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Current responsibility</span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold text-zinc-800">{attention.owner}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Start / continue production and keep buyer updated.</p>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Payment status</span>
                    <p className="text-xs font-bold text-zinc-800 mt-1">{isEscrowPending ? "Awaiting funding" : "Escrow funded"}</p>
                    <p className="text-[11px] font-semibold text-[#6E56CF] mt-0.5">{formatMoney(workspaceOrder.amount)} USD</p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => confirmAction("View escrow")}
                    className="w-full text-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    View escrow
                  </button>
                </div>
              </div>
            </Accordion>

            {/* 2. Products & Quantities */}
            <Accordion
              id="products"
              title="Products & Quantities"
              subtitle={`${workspaceProducts.length} Products · ${units.toLocaleString()} Units`}
              expanded={expandedSections.products}
              onToggle={() => toggleSection("products")}
              icon={Plus}
            >
              <div className="space-y-3">
                {workspaceProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-zinc-100 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-800">{p.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Style: {p.style_code || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-800">{p.quantity?.toLocaleString()} {p.unit || "pcs"}</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Target: {formatMoney(p.target_unit_price || 0)}/unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>

            {/* 3. Techpack */}
            <Accordion
              id="techpack"
              title="Techpack"
              subtitle="v1.0 Locked · Complete"
              expanded={expandedSections.techpack}
              onToggle={() => toggleSection("techpack")}
              badge={
                <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                  <CheckCircle2 size={11} /> Locked
                </span>
              }
              icon={Lock}
            >
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 mb-3">Ground truth technical documentation for the active product: <span className="font-semibold text-zinc-700">{activeProduct.name}</span></p>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  {sectionPages.map((page) => (
                    <div key={page.id} className="rounded-lg border border-zinc-200 bg-zinc-50/30 p-3 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-zinc-800">{pageLabels[page.page_type] || page.page_type}</span>
                        <p className="text-[9px] text-zinc-400 mt-0.5">Version 1.0</p>
                      </div>
                      {page.is_complete ? <CheckCircle2 className="text-emerald-500" size={14} /> : <span className="text-[9px] text-zinc-400 font-semibold bg-zinc-100 px-1.5 py-0.5 rounded">Draft</span>}
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>

            {/* 4. Pricing & Terms */}
            <Accordion
              id="pricing"
              title="Pricing & Terms"
              subtitle={`${formatMoney(workspaceOrder.amount)} USD · ${workspaceOrder.incoterms || "Terms pending"}`}
              expanded={expandedSections.pricing}
              onToggle={() => toggleSection("pricing")}
              badge={<CheckCircle2 size={13} className="text-emerald-500" />}
              icon={CircleDollarSign}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-100">
                  <span className="text-xs text-zinc-400">Escrow Value</span>
                  <span className="text-sm font-bold text-zinc-800">{formatMoney(workspaceOrder.amount)} USD</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Payment Milestones Schedule</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">{milestones.map((milestone, index) => <div key={`${milestone.name}-${index}`} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5"><span className="text-zinc-500">M{persistedMilestones[index]?.milestone_number ?? index}: {milestone.name}</span><p className="mt-0.5 font-bold text-zinc-800">{milestone.percent}% ({formatMoney((workspaceOrder.amount * milestone.percent) / 100)})</p></div>)}</div>
                </div>
              </div>
            </Accordion>

            {/* 5. Escrow & Milestones */}
            <Accordion
              id="escrow"
              title="Escrow & Milestones"
              subtitle={isEscrowPending ? "Awaiting funding" : "Active"}
              expanded={expandedSections.escrow}
              onToggle={() => toggleSection("escrow")}
              badge={
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isEscrowPending ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}>
                  {isEscrowPending ? "Pending funding" : "Funded"}
                </span>
              }
              icon={ShieldCheck}
            >
              {session.role === "admin" && <section className="mb-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
                <div className="mb-3"><h4 className="text-sm font-semibold text-violet-950">Record manual escrow</h4><p className="mt-1 text-xs text-violet-700">Every retry uses the payment reference as an idempotency key and writes the audit log.</p></div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <select value={escrowEntryType} onChange={(event) => setEscrowEntryType(event.target.value as EscrowEntryType)} className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs"><option value="manual_funding">Funding</option><option value="milestone_release">Milestone release</option><option value="refund">Refund</option><option value="adjustment">Adjustment</option></select>
                  <input type="number" min="0.01" step="0.01" value={escrowAmount} onChange={(event) => setEscrowAmount(event.target.value)} placeholder="Amount USD" className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs" />
                  <input value={escrowReference} onChange={(event) => setEscrowReference(event.target.value)} placeholder="Bank or USDC reference" className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs" />
                  <input value={escrowNotes} onChange={(event) => setEscrowNotes(event.target.value)} placeholder="Internal note" className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs" />
                  <button type="button" disabled={isSavingEvent} onClick={() => void submitEscrowEntry()} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Record entry</button>
                </div>
              </section>}
              <div className="grid gap-6 md:grid-cols-5">
                <div className="md:col-span-2 space-y-4 bg-zinc-50/50 p-4.5 rounded-xl border border-zinc-150">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Escrow Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-500">Total Escrow</span>
                      <span className="font-bold text-zinc-950">{formatMoney(workspaceOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-500">Funded</span>
                      <span className={`font-bold ${isEscrowPending ? "text-zinc-400" : "text-emerald-600"}`}>
                        {isEscrowPending ? "$0.00" : formatMoney(workspaceOrder.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-500">Released</span>
                      <span className="font-bold text-zinc-700">{formatMoney(releasedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Remaining</span>
                      <span className="font-bold text-zinc-800">{formatMoney(workspaceOrder.amount - releasedAmount)}</span>
                    </div>
                  </div>
                  {isEscrowPending && (
                    <div className="pt-2 text-[10px] text-zinc-400 leading-relaxed italic">
                      * Fund escrow to lock milestones and trigger production start.
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Milestones</h4>
                  <div className="space-y-2.5">
                    {milestones.map((m, index) => {
                      const isDone = m.state === "done"
                      const isCurrent = m.state === "current"
                      const isBlocked = m.state === "blocked"
                      
                      return (
                        <div 
                          key={m.name} 
                          className={`rounded-lg border p-3 flex items-start gap-2.5 transition ${
                            isCurrent 
                              ? "border-[#6E56CF]/30 bg-[#F0EDFF]/10" 
                              : isBlocked 
                                ? "border-amber-200 bg-amber-50/20" 
                                : isDone 
                                  ? "border-emerald-100 bg-emerald-50/10" 
                                  : "border-zinc-200/60 bg-white"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            isDone 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : isCurrent 
                                ? "border-[#6E56CF] bg-[#6E56CF] text-white" 
                                : isBlocked 
                                  ? "border-amber-400 bg-amber-400 text-white" 
                                  : "border-zinc-200 bg-white text-zinc-300"
                          }`}>
                            {isDone ? (
                              <Check size={11} className="stroke-[3]" />
                            ) : (
                              <span className="text-[9px] font-bold">{index}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center gap-2">
                              <span className={`text-xs font-bold ${isCurrent ? "text-zinc-950" : isDone ? "text-zinc-800" : "text-zinc-400"}`}>
                                {m.name}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-500">{m.percent}% ({formatMoney((workspaceOrder.amount * m.percent) / 100)})</span>
                            </div>
                            <p className="text-[10.5px] text-zinc-400 mt-0.5 leading-relaxed truncate">{m.description}</p>
                            
                            {m.action && (isCurrent || isBlocked) && (
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-[#6E56CF]">{m.action}</span>
                                <button
                                  type="button"
                                  disabled={!roleCanPerform(session.role, lifecycleActionForLabel(m.action || m.name))}
                                  onClick={() => confirmAction(m.action || m.name)}
                                  className="rounded bg-[#6E56CF] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#5B3CC4] transition disabled:cursor-not-allowed disabled:bg-zinc-300"
                                >
                                  Record action
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Accordion>

            {/* 6. Quality Check */}
            <Accordion
              id="qc"
              title="Quality Check"
              subtitle="Not submitted yet"
              expanded={expandedSections.qc}
              onToggle={() => toggleSection("qc")}
              icon={ClipboardCheck}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-800">Quality check reports and evidence</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">Submit physical sample photos and techpack checks here before shipping. Releases 30% milestone.</p>
                </div>
                {session.role === "manufacturer" && <button
                  type="button"
                  onClick={() => confirmAction("QC proof submitted")}
                  className="rounded-lg bg-[#6E56CF] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#5B3CC4] transition shadow-sm"
                >
                  Submit attached QC evidence
                </button>}
              </div>
            </Accordion>

            {/* 7. Shipping */}
            <Accordion
              id="shipping"
              title="Shipping"
              subtitle="Not shipped yet"
              expanded={expandedSections.shipping}
              onToggle={() => toggleSection("shipping")}
              icon={Truck}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-800">Tracking information & logistics proof</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">Provide carrier, tracking ID and commercial shipping bill to request final milestone release.</p>
                </div>
                {session.role === "manufacturer" && <button
                  type="button"
                  onClick={() => confirmAction("Add tracking")}
                  className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-sm"
                >
                  Add tracking
                </button>}
              </div>
            </Accordion>

            {/* 8. Files & Attachments */}
            <Accordion
              id="files"
              title="Files & Attachments"
              subtitle={`${conversation.filter((event) => event.attachment).length} files`}
              expanded={expandedSections.files}
              onToggle={() => toggleSection("files")}
              icon={Paperclip}
            >
              <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-4">
                {conversation.filter((event) => event.attachment).map((event) => (
                  <a key={event.id} href={event.attachment} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xs hover:border-[#6E56CF]/40 transition group">
                    <div className="h-20 bg-zinc-50/50 rounded-md border border-zinc-100 flex items-center justify-center text-zinc-400 text-xs mb-2 overflow-hidden relative">
                      <FileText size={24} className="text-zinc-300 group-hover:text-[#6E56CF]/55 transition" />
                      <div className="absolute inset-0 bg-[#6E56CF]/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Download size={16} className="text-[#6E56CF]" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-800 block truncate">{event.attachment?.split("/").pop()}</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 block">Conversation attachment</span>
                  </a>
                ))}
                {!conversation.some((event) => event.attachment) && <p className="col-span-full rounded-lg border border-dashed border-zinc-200 p-6 text-center text-xs text-zinc-400">No files uploaded yet.</p>}
              </div>
            </Accordion>

            {/* 9. Dispute */}
            <Accordion
              id="dispute"
              title="Dispute"
              subtitle="No dispute active"
              expanded={expandedSections.dispute}
              onToggle={() => toggleSection("dispute")}
              icon={AlertCircle}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-800">Secure dispute resolution room</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">If there are quality discrepancies, you can file a dispute to freeze escrow and request arbitration.</p>
                </div>
                <button
                  type="button"
                  onClick={() => confirmAction("Dispute intake opened")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition shadow-sm"
                >
                  File dispute
                </button>
              </div>
            </Accordion>
          </div>
        </section>

        {/* Right Column - Chat Sidebar */}
        <aside id="order-conversation" className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-140px)] sticky top-[80px]">
          {/* Chat Header */}
          <div className="border-b border-zinc-200 px-4.5 py-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                Activity & Conversation
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-zinc-400">● Online</span>
              </div>
            </div>
            <button className="text-zinc-400 hover:text-zinc-700"><MoreVertical size={16} /></button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.map((event) => {
              const isSystem = event.author === "system"
              const isAssistant = event.author === "assistant"
              const isBuyer = event.author === "buyer"
              
              return (
                <div key={event.id} className="flex gap-2.5 items-start">
                  {/* User Initial Avatar */}
                  <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${
                    isSystem 
                      ? "bg-zinc-100 border-zinc-200 text-zinc-500" 
                      : isAssistant 
                        ? "bg-[#F0EDFF] border-[#E1DBFF]/80 text-[#6E56CF]" 
                        : isBuyer 
                          ? "bg-blue-50 border-blue-100 text-blue-600" 
                          : "bg-emerald-50 border-emerald-100 text-emerald-600"
                  }`}>
                    {isSystem ? "S" : isAssistant ? "P" : getInitials(event.title)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[11px] font-bold ${
                        isSystem 
                          ? "text-zinc-500" 
                          : isAssistant 
                            ? "text-[#6E56CF]" 
                            : "text-zinc-800"
                      }`}>
                        {event.title}
                        {!isSystem && !isAssistant && (
                          <span className="ml-1 text-[9px] font-medium text-zinc-400 uppercase tracking-tight">
                            ({isBuyer ? "Buyer" : "Manufacturer"})
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-zinc-400">{event.time}</span>
                    </div>

                    {isSystem ? (
                      <div className="mt-1 bg-zinc-50/80 border border-zinc-150 rounded-lg px-3 py-2 text-xs text-zinc-500 leading-relaxed">
                        {event.body}
                      </div>
                    ) : isAssistant ? (
                      <div className="mt-1 bg-[#F8F7FF] border border-[#E1DBFF]/40 rounded-lg p-3">
                        <p className="text-xs text-[#6E56CF] leading-relaxed font-semibold">{event.body}</p>
                        {event.actions && (
                          <div className="mt-2.5 flex items-center gap-2">
                            {event.actions.map((act, idx) => (
                              <button
                                key={act}
                                type="button"
                                disabled={Boolean(lifecycleActionForLabel(act)) && !roleCanPerform(session.role, lifecycleActionForLabel(act))}
                                onClick={() => confirmAction(act)}
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded ${
                                  idx === 0 
                                    ? "bg-[#6E56CF] text-white hover:bg-[#5B3CC4]" 
                                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                                } transition disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                {act === "Record escrow funding" ? "Fund Escrow" : act === "Confirm production start" ? "Start Production" : act}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 bg-white border border-zinc-100 rounded-lg p-3 shadow-xs">
                        <p className="text-xs text-zinc-600 leading-relaxed">{event.body}</p>
                        
                        {event.attachment && (
                          <div className="mt-2.5 border border-zinc-150 bg-zinc-50 rounded-lg p-2 flex items-center justify-between text-[10px] group">
                            <span className="text-zinc-700 flex items-center gap-1 truncate font-medium">
                              <Paperclip size={11} className="text-[#6E56CF]" /> {event.attachment}
                            </span>
                            <button className="text-zinc-400 group-hover:text-[#6E56CF] transition"><Download size={12} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-zinc-200 p-4 bg-white">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5">
              <textarea
                aria-label="Write a message"
                value={composerValue}
                onChange={(e) => setComposerValue(e.target.value)}
                className="w-full resize-none border-0 bg-transparent px-2.5 py-1 text-xs text-zinc-800 outline-none placeholder:text-zinc-400 min-h-[50px] leading-relaxed"
                placeholder="Type a message..."
              />
              <div className="flex items-center justify-between border-t border-zinc-100 pt-2 px-1">
                <div className="flex items-center gap-3 text-zinc-400">
                  <input ref={attachmentInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" onChange={(event) => void uploadAttachment(event)} />
                  <button type="button" onClick={() => attachmentInputRef.current?.click()} className="hover:text-zinc-700 transition" aria-label="Attach file"><Paperclip size={14.5} /></button>
                  <button type="button" className="hover:text-zinc-700 transition"><Smile size={14.5} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    disabled={isSavingEvent} 
                    onClick={sendMessage} 
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#6E56CF] text-white hover:bg-[#5B3CC4] transition disabled:opacity-50 shadow-sm"
                  >
                    <Send size={12} className="ml-0.5" />
                  </button>
                </div>
              </div>
              {pendingAttachment && <div className="mt-2 flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] text-violet-700"><span className="truncate"><Paperclip size={11} className="mr-1 inline" />{pendingAttachment.name}</span><button onClick={() => setPendingAttachment(null)} aria-label="Remove attachment"><X size={12} /></button></div>}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Files & Attachments Grid */}
      <footer className="border-t border-zinc-200 bg-zinc-50/50 px-6 py-8 mt-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Files & Attachments</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{conversation.filter((event) => event.attachment).length} conversation files uploaded.</p>
            </div>
            <button onClick={() => attachmentInputRef.current?.click()} className="text-xs font-semibold text-[#6E56CF] hover:underline">Upload file</button>
          </div>

          <div className="grid gap-4.5 grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {conversation.filter((event) => event.attachment).map((event) => (
              <a key={event.id} href={event.attachment} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs hover:border-[#6E56CF]/40 transition group">
                <div className="h-24 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-400 text-xs mb-2.5 overflow-hidden relative">
                  <FileText size={28} className="text-zinc-300 group-hover:text-[#6E56CF]/50 transition" />
                  <div className="absolute inset-0 bg-[#6E56CF]/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Download size={18} className="text-[#6E56CF]" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-800 block truncate">{event.attachment?.split("/").pop()}</span>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Conversation attachment</span>
              </a>
            ))}

            {/* Upload File Zone */}
            <button onClick={() => attachmentInputRef.current?.click()} className="rounded-xl border border-dashed border-zinc-300 hover:border-[#6E56CF]/60 bg-zinc-50/50 p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition col-span-2 group min-h-[148px]">
              <UploadCloud size={24} className="text-zinc-400 group-hover:text-[#6E56CF] transition" />
              <span className="text-[10.5px] font-semibold text-zinc-700 mt-2 block">Upload file</span>
              <span className="text-[9px] text-zinc-400 mt-0.5 block">or drag and drop</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p className="flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-500" />
              <span>All order data is secure and encrypted</span>
            </p>
            <p>© {new Date().getFullYear()} proov. Secure manufacturing and design escrows.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
