"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { proovDb, User, Demand, Bid, Order, Transaction, LogEntry, MOCK_USERS } from "@/lib/db"
import { whopSimulator } from "@/lib/whop"
import { solanaSimulator, FASSET_PKR_RATE } from "@/lib/solana"
import { calculatePriceFloor, generateTechPackDescription, FABRIC_RULES } from "@/lib/techpack"
import { useStudioStore } from "@/lib/store/studioStore"
import { createClient } from "@/utils/supabase/client"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"

// Dynamically import interactive panels to prevent SSR errors
import dynamic from "next/dynamic"

const BriefBoardHome = dynamic(() => import("@/components/orders/BriefBoardHome"), { ssr: false })
const MarketBoardHome = dynamic(() => import("@/components/market/MarketBoardHome"), { ssr: false })
const CommunityPage = dynamic(() => import("@/components/community/CommunityPage"), { ssr: false })
const PaymentsDashboard = dynamic(() => import("@/components/payments/PaymentsDashboard"), { ssr: false })
const CreateTechpackModal = dynamic(() => import("@/components/orders/CreateTechpackModal"), { ssr: false })
const ProductsDashboard = dynamic(() => import("@/components/products/ProductsDashboard"), { ssr: false })
const StudioCreateOverlay = dynamic(() => import("@/components/studio/StudioCreateOverlay"), { ssr: false })
const KanbanBoardView = dynamic(() => import("@/components/orders/KanbanBoardView"), { ssr: false })
const BriefBoard = dynamic(() => import("@/components/orders/BriefBoard"), { ssr: false })
const NotificationFlybox = dynamic(() => import("@/components/dashboard/NotificationFlybox"), { ssr: false })

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCanvas } = useStudioStore()
  const [currentUserRole, setCurrentUserRole] = useState<"buyer" | "manufacturer" | "admin">("buyer")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [activePanel, setActivePanel] = useState<string>("view-buyer-dashboard")
  
  // Data State
  const [demands, setDemands] = useState<Demand[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [pendingPayout, setPendingPayout] = useState<any>(null)
  
  // UI State
  const [activeTab, setActiveTab] = useState<"my-orders" | "active-orders" | "shared-with-me" | "featured-projects">("my-orders")
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [isFlyboxOpen, setIsFlyboxOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showTechpackModal, setShowTechpackModal] = useState(false)
  const [techpackInitialAsset, setTechpackInitialAsset] = useState<string | undefined>(undefined)
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null)
  const [promoVisible, setPromoVisible] = useState(true)
  const [bannerVisible, setBannerVisible] = useState(true)
  
  // Form States
  const [briefTitle, setBriefTitle] = useState("")
  const [briefDesc, setBriefDesc] = useState("")
  const [briefQty, setBriefQty] = useState(100)
  const [briefFabric, setBriefFabric] = useState("poly_mesh")
  const [briefBudget, setBriefBudget] = useState(15.00)
  const [briefTat, setBriefTat] = useState(21)
  const [briefCategory, setBriefCategory] = useState("sportswear")
  const [uploadStatus, setUploadStatus] = useState("Drag files here or click to browse")
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  
  // Bid Form States
  const [bidPrice, setBidPrice] = useState(14.50)
  const [bidTat, setBidTat] = useState(20)
  const [bidComments, setBidComments] = useState("")
  
  // Template Submission States
  const [templateName, setTemplateName] = useState("")
  const [templateCategory, setTemplateCategory] = useState("sportswear")
  const [templateZones, setTemplateZones] = useState("")
  const [templateUploadStatus, setTemplateUploadStatus] = useState("Browse GLB files")
  
  // Direct Invoice States
  const [invoiceTitleInput, setInvoiceTitleInput] = useState("")
  const [invoiceAmountInput, setInvoiceAmountInput] = useState("")
  const [invoiceDescInput, setInvoiceDescInput] = useState("")
  const [invoiceGeneratedLink, setInvoiceGeneratedLink] = useState("")
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const templateFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    const hydrateSession = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, user_type")
        .eq("id", user.id)
        .maybeSingle()
      if (cancelled) return
      setCurrentUserId(user.id)
      setCurrentUserName(profile?.full_name || user.email?.split("@")[0] || "")
      if (profile?.user_type === "buyer" || profile?.user_type === "manufacturer" || profile?.user_type === "admin") {
        setCurrentUserRole(profile.user_type)
      }
    }
    void hydrateSession()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    // Load local storage values if browser
    if (typeof window !== "undefined") {
      const storedBalance = parseFloat(localStorage.getItem("proov_wallet_balance") || "0")
      setWalletBalance(storedBalance)
      
      const storedPayout = localStorage.getItem("proov_pending_payout")
      if (storedPayout) setPendingPayout(JSON.parse(storedPayout))
    }
    
    loadAllData()
    
    // Check for exportToTechpack query param
    if (searchParams?.get("exportToTechpack") === "true") {
      setShowTechpackModal(true);
      setTechpackInitialAsset('/assets/proj_belarus.png');
      // Replace URL without reloading
      router.replace("/dashboard");
    }
    
    // Bind listeners
    const handleOrderUpdated = () => loadAllData()
    const handleWalletUpdated = (e: any) => {
      if (e.detail?.balance !== undefined) setWalletBalance(e.detail.balance)
    }
    const handlePayoutUpdated = () => {
      const storedPayout = localStorage.getItem("proov_pending_payout")
      if (storedPayout) setPendingPayout(JSON.parse(storedPayout))
    }
    const handleLogAdded = (e: any) => {
      setLogs(prev => [e.detail, ...prev].slice(0, 50))
    }
    
    window.addEventListener("proov_order_updated", handleOrderUpdated)
    window.addEventListener("proov_wallet_updated", handleWalletUpdated)
    window.addEventListener("proov_payout_updated", handlePayoutUpdated)
    window.addEventListener("proov_log", handleLogAdded)
    
    return () => {
      window.removeEventListener("proov_order_updated", handleOrderUpdated)
      window.removeEventListener("proov_wallet_updated", handleWalletUpdated)
      window.removeEventListener("proov_payout_updated", handlePayoutUpdated)
      window.removeEventListener("proov_log", handleLogAdded)
    }
  }, [searchParams])

  const loadAllData = async () => {
    const d = await proovDb.getDemands()
    const o = await proovDb.getOrders(currentUserId, currentUserRole)
    const fetchedLogs = await proovDb.getLogs()
    
    setDemands(d)
    setLogs(fetchedLogs)
    
    // fetch all orders for admin dispute check
    const allOrders = await proovDb.getOrders(currentUserId, currentUserRole)
    setOrders(allOrders)
  }

  // Reload data when active role changes
  useEffect(() => {
    loadAllData()
  }, [currentUserRole, currentUserId])

  // Recalculate price floor
  const floorDetails = calculatePriceFloor(briefQty, briefFabric)

  useEffect(() => {
    // If budget is less than calculated floor, update budget
    if (briefBudget < floorDetails.totalFloor) {
      setBriefBudget(parseFloat((floorDetails.totalFloor * 1.15).toFixed(2)))
    }
  }, [briefQty, briefFabric])

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "sb-bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "dev_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  }

  // Forms Actions
  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadStatus("Uploading...")
      
      const formData = new FormData()
      formData.append("file", file)
      
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })
        const data = await res.json()
        if (res.ok && data.url) {
          setUploadedFile({
            name: data.filename || file.name,
            url: data.url,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            uploaded_at: new Date().toISOString()
          })
          setUploadStatus(`${data.filename || file.name} uploaded successfully.`)
          proovDb.logDebug("UPLOAD", `Art asset uploaded: ${data.filename || file.name}`)
        } else {
          setUploadStatus(data.error || "Upload failed.")
        }
      } catch (err) {
        setUploadStatus("Upload failed.")
        console.error(err)
      }
    }
  }  
  
  const handlePublishTechpack = async (data: any) => {
    // We are converting the techpack configuration into a structured JSON string to save in description
    const techpackDoc = {
      isTechpack: true,
      category: data.category,
      baseSize: data.baseSize,
      sizeRange: data.sizeRange,
      fabric: data.fabric,
      assetUrl: data.assetUrl
    };

    const demandId = "demand_" + Date.now()
    const newDemand: Demand = {
      id: demandId,
      buyer_id: currentUserId,
      buyer_name: "Phantom Sports (Miami)",
      title: data.title,
      description: JSON.stringify(techpackDoc),
      category: data.category,
      quantity: data.qty,
      fabric: FABRIC_RULES[data.fabric]?.name || data.fabric,
      budget_range: `$${data.budget.toFixed(2)} / piece`,
      budget_min: data.budget,
      turnaround_time: `${data.tat} days`,
      status: "open",
      techpack_url: data.assetUrl || "techpack_phantom_sports_v2.pdf",
      created_at: new Date().toISOString()
    }

    await proovDb.saveDemand(newDemand)
    setShowTechpackModal(false)
    setTechpackInitialAsset(undefined)
    
    // Refresh
    loadAllData()
  }

  // Bidding Actions
  const handleOpenPlaceBid = (demandId: string) => {
    setSelectedDemandId(demandId)
    const d = demands.find(dem => dem.id === demandId)
    if (d) {
      setBidPrice(d.budget_min - 0.5 > 0 ? d.budget_min - 0.5 : d.budget_min)
      setBidTat(20)
      setBidComments("")
    }
    setActiveModal("modal-place-bid")
  }

  const handleSubmitBid = async () => {
    if (!selectedDemandId) return
    const demand = demands.find(d => d.id === selectedDemandId)
    if (!demand) return

    const bidId = "bid_" + Date.now()
    const newBid: Bid = {
      id: bidId,
      demand_id: selectedDemandId,
      manufacturer_id: currentUserId,
      manufacturer_name: currentUserId === "pak_apparel" ? "Pakistan Apparel Ltd" : "Sialkot Stitch Group",
      bid_price: bidPrice,
      turnaround_time: `${bidTat} days`,
      comments: bidComments || "Can start immediately.",
      status: "submitted",
      created_at: new Date().toISOString()
    }

    await proovDb.saveBid(newBid)
    setActiveModal(null)
    loadAllData()
  }

  const handleOpenBidsReview = (demandId: string) => {
    setSelectedDemandId(demandId)
    setActiveModal("modal-review-bids")
  }

  const handleAcceptBid = async (bid: Bid) => {
    if (!confirm("Are you ready to accept this offer and initiate the escrow contract?")) return

    const demand = demands.find(d => d.id === bid.demand_id)
    if (!demand) return

    const orderAmount = bid.bid_price * demand.quantity
    const orderId = "order_" + Date.now()

    await proovDb.acceptBid(bid.id)

    // Save order
    const newOrder: Order = {
      id: orderId,
      demand_id: bid.demand_id,
      buyer_id: demand.buyer_id,
      manufacturer_id: bid.manufacturer_id,
      manufacturer_name: bid.manufacturer_name,
      title: demand.title,
      amount: orderAmount,
      status: "payment_pending",
      tracking_number: "",
      shipping_invoice_url: "",
      milestone_advance_paid: false,
      fabric: demand.fabric,
      quantity: demand.quantity,
      turnaround_time: bid.turnaround_time,
      description: demand.description,
      remarks: "",
      created_at: new Date().toISOString()
    }

    await proovDb.saveOrder(newOrder)
    setActiveModal(null)
    loadAllData()

    // Simulate Whop checkout
    const checkoutUrl = await whopSimulator.createCheckoutSession(orderId, orderAmount, "buyer@phantom-sports.com")
    
    const payNow = confirm(`Invoice generated for $${orderAmount.toLocaleString()} USD.\n\nOpening Whop Checkout Simulator Page:\n${checkoutUrl}\n\nClick OK to simulate credit card payment success.`)
    if (payNow) {
      await whopSimulator.processWebhookEvent("payment_succeeded", { orderId, amount: orderAmount })
      loadAllData()
    }
  }

  // Order Payout / Dispute Actions
  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm("Are you sure you want to confirm receipt? This will unlock escrow funds directly to the manufacturer's Solana wallet.")) return
    
    const order = await proovDb.getOrder(orderId)
    if (order) {
      order.status = "released"
      await proovDb.saveOrder(order)

      let releaseAmount = order.amount
      if (order.milestone_advance_paid) {
        releaseAmount = order.amount / 2
      }

      await solanaSimulator.executePayout(orderId, releaseAmount, "escrow_release")
      await proovDb.logDebug("ESCROW", `Remaining payment of $${releaseAmount} USDC released to Manufacturer for Order ${orderId}.`)
      loadAllData()
    }
  }

  const handleDisputeOrder = async (orderId: string) => {
    const reason = prompt("Describe your dispute reason to lock in the Arbitration Console:")
    if (!reason) return

    await whopSimulator.processWebhookEvent("payment_disputed", { orderId })
    loadAllData()
  }

  const handleShipOrder = async (orderId: string) => {
    const tracking = prompt("Enter courier tracking number (e.g. DHL-9981-XX):", "DHL-" + Math.floor(Math.random()*9000 + 1000) + "-SLK")
    if (!tracking) return
    
    const order = await proovDb.getOrder(orderId)
    if (order) {
      order.status = "shipped"
      order.tracking_number = tracking
      await proovDb.saveOrder(order)
      await proovDb.logDebug("SHIPPING", `Order ${orderId} marked as shipped. Tracking: ${tracking}`)
      loadAllData()
    }
  }

  // Template Submission Actions
  const handleTemplateUpload = () => {
    setTemplateUploadStatus("Vectorizing GLB mesh bounds...")
    setTimeout(() => {
      setTemplateUploadStatus("elite_futsal_mesh_v1.glb")
      proovDb.logDebug("UPLOAD", "Custom 3D GLB template uploaded successfully to library queue.")
    }, 1000)
  }

  const handleSubmitTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name.")
      return
    }
    
    await proovDb.logDebug("TEMPLATE_QUEUE", `Submitted template "${templateName}" (${templateCategory}) to Review Queue.`)
    alert("Template submitted successfully to proov review queue. Our QC Officers will review the GLB bounds.")
    
    // Reset
    setTemplateName("")
    setTemplateZones("")
    setTemplateUploadStatus("Browse GLB files")
  }

  // Direct Invoice Generation
  const handleGenerateInvoice = async () => {
    if (!invoiceTitleInput.trim() || !invoiceAmountInput) {
      alert("Please enter brief details and total USD contract amount.")
      return
    }
    
    const amount = parseFloat(invoiceAmountInput)
    const invoiceId = "invoice_" + Date.now()
    const link = `http://localhost:3000/#invoice?id=${invoiceId}&amount=${amount}`
    setInvoiceGeneratedLink(link)
    
    await proovDb.logDebug("INVOICE", `Direct Invoice Link generated: $${amount} for ${invoiceTitleInput}`)
  }

  // Payout Portal Offramp
  const handleInitiateOfframp = async () => {
    const res = await solanaSimulator.withdrawToBank()
    if (res.status === "success") {
      loadAllData()
    }
  }

  // Developer Simulator Webhooks
  const simulateWhopWebhook = async (type: string) => {
    // Find a pending/draft order
    const pendingOrder = orders.find(o => o.status === "payment_pending" || o.status === "draft")
    const orderId = pendingOrder ? pendingOrder.id : "order_payment"
    const amount = pendingOrder ? pendingOrder.amount : 2800
    
    if (type === "payment_succeeded") {
      await whopSimulator.processWebhookEvent("payment_succeeded", { orderId, amount })
    } else if (type === "payment_disputed") {
      await whopSimulator.processWebhookEvent("payment_disputed", { orderId })
    }
    loadAllData()
  }

  const simulateSolanaTx = async () => {
    const heldOrder = orders.find(o => o.status === "held" || o.status === "shipped")
    const orderId = heldOrder ? heldOrder.id : "order_todo"
    
    await solanaSimulator.executePayout(orderId, 500, "manual_payout_test")
    loadAllData()
  }

  const simulateFassetWebhook = async () => {
    await solanaSimulator.confirmBankSettlement()
    loadAllData()
  }

  const handleResetDatabase = async () => {
    if (confirm("Reset local sandbox database to original YC mock state?")) {
      await proovDb.reset()
      localStorage.setItem("proov_wallet_balance", "0")
      localStorage.removeItem("proov_pending_payout")
      setWalletBalance(0)
      setPendingPayout(null)
      loadAllData()
    }
  }

  return (
    <div className="flex h-screen w-full bg-app-bg overflow-hidden text-default">
      <DashboardSidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        roleDropdownOpen={roleDropdownOpen}
        setRoleDropdownOpen={setRoleDropdownOpen}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        clearCanvas={clearCanvas}
        handleLogout={handleLogout}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent py-4 pr-4">
        <main className="flex-1 overflow-auto bg-sidebar-bg rounded-[24px] border border-border-subtle shadow-sm relative">
        <header className="flex justify-end items-center gap-6 px-8 py-4 bg-app-bg border-b border-border-subtle">
          {/* Upgrade Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border-subtle rounded-lg bg-sidebar-bg text-default font-semibold text-sm cursor-pointer">
            <div style={{ width: '22px', height: '22px', backgroundColor: '#FBBF24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            Upgrade
          </button>
          
          {/* Points */}
          <div className="flex items-center gap-2 font-semibold text-base text-subtle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l1.5 3h3.5l-2.5 2.5 1 3.5-3.5-2-3.5 2 1-3.5-2.5-2.5h3.5z"></path></svg>
            185
          </div>

          {/* Notification Bell */}
          <button onClick={() => setIsFlyboxOpen(true)} className="relative flex items-center bg-transparent border-none cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-lg">
            M
          </div>
        </header>
        
        <NotificationFlybox isOpen={isFlyboxOpen} onClose={() => setIsFlyboxOpen(false)} />

        {/* Conditionally render panels */}
        {activePanel === "studio-create" && (
          <div style={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <StudioCreateOverlay />
          </div>
        )}

        {/* View Panel: Buyer Dashboard */}
        {activePanel === "view-buyer-dashboard" && (
          <section className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1200px] w-full mx-auto">
            {/* Redesigned Orange Banner */}
            {bannerVisible && (
              <div className="relative flex justify-between items-center bg-[#FF5E00] text-white rounded-[24px] p-8 mb-8 overflow-hidden shadow-sm">
                <div className="flex flex-col gap-4 relative z-10">
                  <span className="bg-white text-black px-2 py-1 rounded text-xs font-bold w-fit uppercase tracking-wide">NEW</span>
                  <h2 className="text-3xl font-semibold leading-tight">Meet Proov V0.1:<br/>Design canvas is here</h2>
                  <p className="text-sm opacity-90 max-w-md">design in 3D Build your product zone by zone, see it in 3D, and post a manufacturer-ready techpack in minutes.</p>
                  <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg w-fit font-medium hover:bg-zinc-800 transition-colors" onClick={() => router.push("/studio")}>
                    Try Canvas
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
                <div className="relative flex items-center justify-end">
                  <button className="absolute top-0 right-0 -mt-4 -mr-4 text-white opacity-50 hover:opacity-100 text-2xl z-20" onClick={() => setBannerVisible(false)}>&times;</button>
                  <img src="/assets/banner_woman.png" className="relative z-10 w-64 h-auto object-cover" alt="Meet Proov" />
                  <span className="absolute bottom-0 right-0 text-white opacity-20 text-xs font-mono font-bold tracking-widest z-10">V4.1</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex gap-2">
                <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "my-orders" ? "bg-selected text-strong" : "text-subtle hover:bg-selected"}`} onClick={() => setActiveTab("my-orders")}>My orders</button>
                <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "active-orders" ? "bg-selected text-strong" : "text-subtle hover:bg-selected"}`} onClick={() => setActiveTab("active-orders")}>Active Orders</button>
                <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "shared-with-me" ? "bg-selected text-strong" : "text-subtle hover:bg-selected"}`} onClick={() => setActiveTab("shared-with-me")}>Shared with me</button>
                <button className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "featured-projects" ? "bg-selected text-strong" : "text-subtle hover:bg-selected"}`} onClick={() => setActiveTab("featured-projects")}>
                  Featured projects <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">NEW</span>
                </button>
              </div>
              
              <div>
                <button className="flex items-center gap-2 text-sm font-medium text-subtle hover:text-default transition-colors" onClick={() => alert("Recent projects menu")}>
                  Last opened
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            {/* My Orders Cards Grid */}
            {activeTab === "my-orders" && (
              <div id="tab-content-my-orders" className="px-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {/* Create new product card */}
                  <div className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] bg-selected border border-border-subtle rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-subtle transition-colors" onClick={() => { clearCanvas(); setActivePanel("studio-create") }}>
                      <div className="w-10 h-10 rounded-full bg-app-bg flex items-center justify-center text-xl text-subtle shadow-sm group-hover:scale-105 transition-transform">+</div>
                      <span className="text-sm font-medium text-default">Create New Product</span>
                    </div>
                    <div className="px-1">
                      <h3 className="text-sm font-semibold text-strong truncate">Create New Product</h3>
                    </div>
                  </div>

                  {/* Belarus Tshirts */}
                  <div className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] bg-selected border border-border-subtle rounded-2xl overflow-hidden cursor-pointer hover:border-subtle transition-colors" onClick={() => router.push("/studio")}>
                      <img src="/assets/proj_belarus.png" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Belarus Tshirts" />
                    </div>
                    <div className="px-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-strong truncate">Belarus Tshirts</h3>
                      <span className="text-[12px] text-subtle">modified 5 minutes ago</span>
                    </div>
                  </div>

                  {/* Copy of Meet Recraft V4 */}
                  <div className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] bg-selected border border-border-subtle rounded-2xl overflow-hidden cursor-pointer hover:border-subtle transition-colors" onClick={() => router.push("/studio")}>
                      <img src="/assets/proj_recraft.png" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Copy of Meet Recraft V4" />
                    </div>
                    <div className="px-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-strong truncate">Copy of Meet Recraft V4</h3>
                      <span className="text-[12px] text-subtle">modified 8 days ago</span>
                    </div>
                  </div>

                  {/* Copy of Icons */}
                  <div className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] bg-selected border border-border-subtle rounded-2xl overflow-hidden cursor-pointer hover:border-subtle transition-colors" onClick={() => router.push("/studio")}>
                      <img src="/assets/proj_icons.png" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Copy of Icons" />
                    </div>
                    <div className="px-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-strong truncate">Copy of Icons</h3>
                      <span className="text-[12px] text-subtle">modified 12 days ago</span>
                    </div>
                  </div>

                  {/* Copy of Logos & Posters */}
                  <div className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] bg-selected border border-border-subtle rounded-2xl overflow-hidden cursor-pointer hover:border-subtle transition-colors" onClick={() => router.push("/studio")}>
                      <img src="/assets/proj_logos.png" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Copy of Logos & Posters" />
                    </div>
                    <div className="px-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-strong truncate">Copy of Logos & Posters</h3>
                      <span className="text-[12px] text-subtle">modified 12 days ago</span>
                    </div>
                  </div>

                  {/* Untitled */}
                  <div className="flex flex-col gap-3 group">
                    <div className="aspect-[4/3] bg-selected border border-border-subtle rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-subtle transition-colors" onClick={() => router.push("/studio")}>
                      <span className="text-sm font-medium text-subtle">No images</span>
                    </div>
                    <div className="px-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-strong truncate">Untitled</h3>
                      <span className="text-[12px] text-subtle">modified 12 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Orders & Escrow Tab */}
            {activeTab === "active-orders" && (
              <div id="tab-content-active-orders">
                <div className="dashboard-grid">
                  {/* Active Demands */}
                  <div className="panel-card">
                    <h2 className="card-title">My Active Demands</h2>
                    <div className="item-list">
                      {demands.filter(d => d.buyer_id === currentUserId).length === 0 ? (
                        <div className="empty-state-card" style={{ border: "none", padding: "20px 0" }}>
                          <span className="empty-icon">📁</span>
                          <span className="empty-title" style={{ fontSize: "14px" }}>No active briefs</span>
                          <p className="empty-text" style={{ fontSize: "12px" }}>Create a manufacturing brief to receive bids from Sialkot factories.</p>
                        </div>
                      ) : (
                        demands.filter(d => d.buyer_id === currentUserId).map(d => (
                          <div className="list-item-card" key={d.id} onClick={() => handleOpenBidsReview(d.id)}>
                            <div className="item-header">
                              <h3 className="item-title">{d.title}</h3>
                              <span className={`badge ${d.status === 'open' ? 'badge-violet' : 'badge-success'}`}>{d.status}</span>
                            </div>
                            <div className="item-meta">
                              <span>Fabric: <strong>{d.fabric}</strong></span>
                              <span>Qty: <strong>{d.quantity}</strong></span>
                            </div>
                            <p className="item-desc">{d.description.substring(0, 100)}...</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Escrow Tracker */}
                  <div className="panel-card">
                    <h2 className="card-title">Active Orders & Escrow</h2>
                    <div className="item-list">
                      {orders.filter(o => o.buyer_id === currentUserId).length === 0 ? (
                        <div className="empty-state-card" style={{ border: "none", padding: "20px 0" }}>
                          <span className="empty-icon">🤝</span>
                          <span className="empty-title" style={{ fontSize: "14px" }}>No active escrow contracts</span>
                          <p className="empty-text" style={{ fontSize: "12px" }}>Locked order milestones and fund distributions appear here.</p>
                        </div>
                      ) : (
                        orders.filter(o => o.buyer_id === currentUserId).map(o => (
                          <div className="list-item-card" key={o.id} style={{ cursor: "default" }}>
                            <div className="item-header">
                              <div>
                                <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>ORDER: {o.id}</span>
                                <h3 className="item-title" style={{ marginTop: "2px" }}>${o.amount.toLocaleString()} USD</h3>
                              </div>
                              <span className={`badge ${
                                o.status === 'held' ? 'badge-warning' : 
                                o.status === 'shipped' ? 'badge-violet' : 
                                o.status === 'released' ? 'badge-success' : 'badge-danger'
                              }`}>
                                {o.status === 'held' ? 'Held in Escrow' : o.status}
                              </span>
                            </div>
                            <div className="item-meta">
                              <span>Factory: <strong>{o.manufacturer_name}</strong></span>
                              <span>Advance: <strong>{o.milestone_advance_paid ? 'Paid (50%)' : 'None'}</strong></span>
                            </div>
                            
                            {o.status === "shipped" && (
                              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                <button className="btn-primary teal" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => handleConfirmDelivery(o.id)}>Confirm Delivery</button>
                                <button className="btn-secondary" style={{ fontSize: "11px", padding: "4px 8px", borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => handleDisputeOrder(o.id)}>Dispute</button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for placeholders */}
            {activeTab === "shared-with-me" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
                <div className="panel-card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--accent-violet)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>NT</div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>Team Soccer Jerseys v2</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Shared by Neon Threads • 2 days ago</div>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => router.push('/studio')}>Open in Studio</button>
                </div>
                
                <div className="panel-card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>P</div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>proov official templates</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Shared by proov official • 1 week ago</div>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => setActivePanel('view-templates')}>View Templates</button>
                </div>
              </div>
            )}

            {activeTab === "featured-projects" && (
              <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", marginTop: "24px" }}>
                <div className="project-card panel-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ height: "180px", backgroundImage: "url(/assets/proj_belarus.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0", color: "var(--text-primary)" }}>Elite Running Collection</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Featured Community Project</p>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setActivePanel('view-community')}>View in Community</button>
                  </div>
                </div>
                
                <div className="project-card panel-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ height: "180px", backgroundImage: "url(/assets/proj_icons.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0", color: "var(--text-primary)" }}>Pro Cycling Kit Template</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Verified Proov Template</p>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setActivePanel('view-templates')}>Use Template</button>
                  </div>
                </div>
                
                <div className="project-card panel-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ height: "180px", backgroundImage: "url(/assets/proj_recraft.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 4px 0", color: "var(--text-primary)" }}>Urban Streetwear Bundle</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Featured Community Project</p>
                    <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setActivePanel('view-community')}>View in Community</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}



        {/* View Panel: Market */}
        {activePanel === "view-market" && (
          <MarketBoardHome currentUserId={currentUserId} currentUserRole={currentUserRole} currentUserName={currentUserName} />
        )}

        {/* View Panel: Products */}
        {activePanel === "view-products" && (
          <ProductsDashboard />
        )}

        {/* View Panel: Order Board (Kanban) */}
        {activePanel === "view-order-board" && (
          <BriefBoardHome onNavigateBack={() => setActivePanel("view-buyer-dashboard")} currentUserId={currentUserId} currentUserRole={currentUserRole} />
        )}

        {/* View Panel: Product Canvas removed */}

        {/* View Panel: Community */}
        {activePanel === "view-community" && (
          <CommunityPage />
        )}

        {/* View Panel: Payments */}
        {activePanel === "view-payments" && (
          <PaymentsDashboard onBack={() => setActivePanel("view-buyer-dashboard")} />
        )}

        {/* View Panel: Bidding Feed (Manufacturer) */}
        {activePanel === "view-manufacturer-feed" && (
          <section className="view-panel active">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Bidding Feed</h1>
                <p className="panel-subtitle">Browse active custom sportswear briefs and submit competitive bids.</p>
              </div>
              <div id="premium-upgrade-widget" className="role-switcher-container" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", padding: "0 12px" }}>Premium Vetted (Unlimited Bids)</span>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Sourcing Demands Feed */}
              <div className="panel-card">
                <h2 className="card-title">Active Sourcing Demands</h2>
                <div className="item-list">
                  {demands.filter(d => d.status === "open").length === 0 ? (
                    <div className="empty-state-card" style={{ border: "none" }}>
                      <span className="empty-icon">🛰</span>
                      <span className="empty-title">Sourcing feed is empty</span>
                      <p className="empty-text">Check back later for new B2B custom sportswear RFQs.</p>
                    </div>
                  ) : (
                    demands.filter(d => d.status === "open").map(d => (
                      <div className="list-item-card teal" key={d.id} style={{ cursor: "default" }}>
                        <div className="item-header">
                          <h3 className="item-title">{d.title}</h3>
                          <span className="badge badge-teal">{d.budget_range}</span>
                        </div>
                        <div className="item-meta">
                          <span>Buyer: <strong>{d.buyer_name}</strong></span>
                          <span>Qty: <strong>{d.quantity}</strong></span>
                          <span>Fabric: <strong>{d.fabric}</strong></span>
                          <span>TAT: <strong>{d.turnaround_time}</strong></span>
                        </div>
                        <p className="item-desc">{d.description}</p>
                        <button className="btn-primary teal" style={{ fontSize: "11px", padding: "6px 12px", alignSelf: "flex-start" }} onClick={() => handleOpenPlaceBid(d.id)}>
                          Place Bidding Offer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Bids Tracker */}
              <div className="panel-card">
                <h2 className="card-title">My Submitted Bids</h2>
                <div className="item-list">
                  {orders.filter(o => o.manufacturer_id === currentUserId).length === 0 && (
                    <div className="empty-state-card" style={{ border: "none", padding: "20px 0" }}>
                      <span className="empty-icon">📊</span>
                      <span className="empty-title" style={{ fontSize: "14px" }}>No bids submitted yet</span>
                      <p className="empty-text" style={{ fontSize: "12px" }}>Submit offers on active briefs in the feed to capture orders.</p>
                    </div>
                  )}
                  {orders.filter(o => o.manufacturer_id === currentUserId).map(o => (
                    <div className="list-item-card" key={o.id} style={{ cursor: "default" }}>
                      <div className="item-header">
                        <h4 className="item-title" style={{ fontSize: "14px" }}>{o.title}</h4>
                        <span className={`badge ${o.status === 'held' || o.status === 'processing' || o.status === 'production' || o.status === 'stitching' || o.status === 'shipping' ? 'badge-warning' : o.status === 'released' ? 'badge-success' : 'badge-teal'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="item-meta" style={{ marginTop: "2px" }}>
                        <span>Amount: <strong>${o.amount.toLocaleString()} USD</strong></span>
                      </div>
                      <p className="item-desc" style={{ fontSize: "12px", marginTop: "4px" }}>{o.description}</p>
                      
                      {o.status === "held" && (
                        <div style={{ borderTop: "1px dashed var(--border-primary)", marginTop: "10px", paddingTop: "10px" }}>
                          <p style={{ fontSize: "12px", color: "var(--accent-teal)", fontWeight: "600", marginBottom: "5px" }}>✓ Payment Secured in Escrow</p>
                          <button className="btn-primary teal" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => handleShipOrder(o.id)}>Mark as Shipped</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit template */}
            <div className="panel-card" style={{ marginTop: "24px" }}>
              <h2 className="card-title">Submit Custom Product Template</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "-10px" }}>
                Submit custom design templates (zone configurations & base meshes) to the proov library.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Sialkot Pro Compression Shirt" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)}>
                    <option value="sportswear">Apparel / Sportswear</option>
                    <option value="equipment">Accessories & Equipment</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Zone Definitions (JSON Format)</label>
                  <textarea className="form-textarea" placeholder='{"front-body": {"name": "Front Body", "acceptsLogo": true, "acceptsText": true}, ...}' value={templateZones} onChange={(e) => setTemplateZones(e.target.value)} style={{ fontFamily: "monospace", fontSize: "12px", minHeight: "80px" }}></textarea>
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">3D Base Mesh (Upload GLB/OBJ)</label>
                  <div className="upload-zone" onClick={handleTemplateUpload} style={{ padding: "12px" }}>
                    <span style={{ fontSize: "18px" }}>↑</span>
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>{templateUploadStatus}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary teal" onClick={handleSubmitTemplate} style={{ marginTop: "10px" }}>Submit Template to Review Queue</button>
            </div>
          </section>
        )}

        {/* View Panel: Direct Invoice */}
        {activePanel === "view-direct-invoice" && (
          <section className="view-panel active">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Direct Invoice Link Generator</h1>
                <p className="panel-subtitle">Lock in a contract with your external client and get paid securely.</p>
              </div>
            </div>

            <div className="panel-card" style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
              <div className="form-group">
                <label className="form-label">Contract / Brief Title</label>
                <input type="text" className="form-input" placeholder="e.g. 500x Custom Sublimated Vests" value={invoiceTitleInput} onChange={(e) => setInvoiceTitleInput(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Budget (Total USD amount)</label>
                <input type="number" className="form-input" placeholder="e.g. 4500" value={invoiceAmountInput} onChange={(e) => setInvoiceAmountInput(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Brief & Design Requirements</label>
                <textarea className="form-textarea" placeholder="Include collars, sleeves, packaging terms..." value={invoiceDescInput} onChange={(e) => setInvoiceDescInput(e.target.value)}></textarea>
              </div>
              <button className="btn-primary teal" onClick={handleGenerateInvoice}>Generate Escrow Invoice Link</button>
              
              {invoiceGeneratedLink && (
                <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-primary)" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-teal)" }}>✓ Generated Invoice Link</p>
                  <p style={{ fontSize: "12px", fontFamily: "monospace", margin: "6px 0", wordBreak: "break-all", color: "var(--text-primary)" }}>{invoiceGeneratedLink}</p>
                  <button className="btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => {
                    navigator.clipboard.writeText(invoiceGeneratedLink)
                    alert("Link copied to clipboard!")
                  }}>
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* View Panel: Payout Portal */}
        {activePanel === "view-payout-portal" && (
          <section className="view-panel active">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Solana USDC Payout Portal</h1>
                <p className="panel-subtitle">Convert released escrow payments to Solana USDC and off-ramp via Fasset to PKR.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Wallet Balance */}
              <div className="panel-card">
                <h2 className="card-title">My Connected Wallet</h2>
                <div className="price-breakdown-card">
                  <div className="price-row" style={{ borderBottom: "none" }}>
                    <span>Solana Wallet Address:</span>
                    <span className="user-role" style={{ fontFamily: "monospace" }}>Fass...9xP6</span>
                  </div>
                  <div className="price-row" style={{ borderBottom: "none", marginTop: "10px" }}>
                    <span>USDC Balance:</span>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-teal)" }}>${walletBalance.toFixed(2)} USDC</span>
                  </div>
                  <div className="price-row" style={{ borderBottom: "none" }}>
                    <span>Estimated PKR (Fasset Rate):</span>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>{(walletBalance * FASSET_PKR_RATE).toLocaleString(undefined, {maximumFractionDigits:2})} PKR</span>
                  </div>
                </div>
                <button className="btn-primary teal" onClick={handleInitiateOfframp}>Initiate Payout to Local Bank (PKR)</button>
              </div>

              {/* Active Payout Tracker */}
              <div className="panel-card">
                <h2 className="card-title">Payout Steps Tracker</h2>
                <div className="progress-list">
                  {pendingPayout ? (
                    <>
                      <div className={`progress-step ${pendingPayout.status === "completed" ? "completed" : "active"}`}>
                        <div className="step-indicator">1</div>
                        <div className="step-details">
                          <span className="step-title">Converted to PKR</span>
                          <span className="step-desc">Rate: {FASSET_PKR_RATE} | Total: {pendingPayout.amountPkr.toLocaleString()} PKR</span>
                        </div>
                      </div>
                      <div className={`progress-step ${pendingPayout.status === "completed" ? "completed" : ""}`}>
                        <div className="step-indicator">2</div>
                        <div className="step-details">
                          <span className="step-title">Cleared by Exchange</span>
                          <span className="step-desc">Fasset clearing house check completed.</span>
                        </div>
                      </div>
                      <div className={`progress-step ${pendingPayout.status === "completed" ? "completed" : ""}`}>
                        <div className="step-indicator">3</div>
                        <div className="step-details">
                          <span className="step-title">Bank Settlement</span>
                          <span className="step-desc">{pendingPayout.status === "completed" ? `Settled in HBL account: ${pendingPayout.accountNumber}` : 'Processing bank settlement...'}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state-card" style={{ border: "none", padding: "12px 0" }}>
                      <span className="empty-icon">✓</span>
                      <span className="empty-title" style={{ fontSize: "14px" }}>No pending payouts</span>
                      <p className="empty-text" style={{ fontSize: "12px" }}>Completed payouts will settle directly in your Pakistani bank account.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* View Panel: Admin Console */}
        {activePanel === "view-admin-console" && (
          <section className="view-panel active">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">QC & Arbitration Console</h1>
                <p className="panel-subtitle">Review active disputes, inspect locked techpacks, and authorize escrow releases.</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {/* Dispute Queue */}
              <div className="panel-card">
                <h2 className="card-title">Disputed Orders Queue</h2>
                <div className="item-list">
                  {orders.filter(o => o.status === "disputed").length === 0 ? (
                    <div className="empty-state-card" style={{ border: "none" }}>
                      <span className="empty-icon">⚖</span>
                      <span className="empty-title">Queue is empty</span>
                      <p className="empty-text">No active disputes require resolution.</p>
                    </div>
                  ) : (
                    orders.filter(o => o.status === "disputed").map(o => (
                      <div className="list-item-card" key={o.id} onClick={() => setSelectedOrderId(o.id)}>
                        <div className="item-header">
                          <h3 className="item-title">{o.title}</h3>
                          <span className="badge badge-danger">Disputed</span>
                        </div>
                        <div className="item-meta">
                          <span>Amount: <strong>${o.amount.toLocaleString()} USD</strong></span>
                        </div>
                        <p className="item-desc">{(o.description || "").substring(0, 100)}...</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dispute Workspace */}
              <div className="panel-card">
                <h2 className="card-title">Arbitration Workspace</h2>
                {selectedOrderId && orders.find(o => o.id === selectedOrderId) ? (
                  (() => {
                    const order = orders.find(o => o.id === selectedOrderId)!
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{order.title}</h3>
                        <p style={{ fontSize: "13px" }}><strong>Buyer ID:</strong> {order.buyer_id} | <strong>Manufacturer:</strong> {order.manufacturer_name}</p>
                        <p style={{ fontSize: "13px" }}><strong>Escrow Amount:</strong> ${order.amount.toLocaleString()} USD</p>
                        <div style={{ padding: "10px", backgroundColor: "var(--bg-tertiary)", borderRadius: "6px", fontSize: "12px" }}>
                          <strong>Dispute details:</strong><br/>
                          {order.remarks || "No remarks loaded."}
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <button className="btn-primary teal" style={{ fontSize: "12px" }} onClick={async () => {
                            order.status = "released"
                            await proovDb.saveOrder(order)
                            await solanaSimulator.executePayout(order.id, order.amount, "arbitration_release")
                            setSelectedOrderId(null)
                            loadAllData()
                          }}>
                            Authorize Release to Manufacturer
                          </button>
                          <button className="btn-secondary" style={{ fontSize: "12px", color: "var(--danger)", borderColor: "var(--danger)" }} onClick={async () => {
                            order.status = "todo" // refund back
                            await proovDb.saveOrder(order)
                            await proovDb.logDebug("ARBITRATION", `Order ${order.id} refunded back to Buyer.`)
                            setSelectedOrderId(null)
                            loadAllData()
                          }}>
                            Refund to Buyer
                          </button>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="empty-state-card" style={{ border: "none" }}>
                    <span className="empty-icon">⚖</span>
                    <span className="empty-title">No Active Dispute Selected</span>
                    <p className="empty-text">Select an order from the queue to review evidence and lock a decision.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* View Panel: Orders (Kanban / List) */}
        {activePanel === "view-orders" && (
          <section style={{
            background: "#fff",
            display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
            padding: "24px 28px",
          }}>
            {/* Top bar — exactly matching screenshot */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", fontWeight: 500, color: "#09090B", letterSpacing: "-0.3px" }}>Orders</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* List / Board toggle — matches screenshot exactly */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => setActiveTab("active-orders" as any)}
                    style={{
                      fontSize: "13px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                      border: "1px solid rgba(9,9,11,0.15)",
                      background: activeTab === "active-orders" ? "#09090B" : "#fff",
                      color: activeTab === "active-orders" ? "#fff" : "#09090B",
                      fontWeight: 500, display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "11px" }}>☰</span> List
                  </button>
                  <button
                    onClick={() => setActiveTab("my-orders" as any)}
                    style={{
                      fontSize: "13px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                      border: "1px solid rgba(9,9,11,0.15)",
                      background: activeTab !== "active-orders" ? "#09090B" : "#fff",
                      color: activeTab !== "active-orders" ? "#fff" : "#09090B",
                      fontWeight: 500, display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "11px" }}>⊞</span> Board
                  </button>
                </div>
              </div>
            </div>

            {/* Board or List */}
            <div style={{ flex: 1, overflow: activeTab !== "active-orders" ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
              {activeTab === "active-orders" ? (
                <BriefBoard />
              ) : (
                <div style={{ flex: 1, overflow: "auto" }}>
                  <KanbanBoardView />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Developer Sandbox & Webhook Simulator Footer */}
        <footer className="debug-console">
          <div className="debug-header">
            <span>proov.io Developer Sandbox & Webhook Simulator</span>
            <span style={{ fontSize: "10px", opacity: 0.8 }}>Local Database: Supabase / LocalState</span>
          </div>
          <div className="debug-logs" id="debug-logs-area">
            {logs.map(log => (
              <div key={log.id} style={{ color: log.category === "ERROR" ? "var(--danger)" : "#6ee7b7" }}>
                [{new Date(log.timestamp).toLocaleTimeString()}] [{log.category}] {log.message}
              </div>
            ))}
          </div>
          <div className="debug-actions">
            <button className="btn-debug" onClick={() => simulateWhopWebhook("payment_succeeded")}>Simulate Whop: Payment Succeeded</button>
            <button className="btn-debug" onClick={() => simulateWhopWebhook("payment_disputed")}>Simulate Whop: Payment Disputed</button>
            <button className="btn-debug" onClick={simulateSolanaTx}>Simulate Solana: USDC Escrow Payout</button>
            <button className="btn-debug" onClick={simulateFassetWebhook}>Simulate Fasset: PKR Settle Webhook</button>
            <button className="btn-debug" style={{ borderColor: "var(--danger)", color: "var(--danger)" }} onClick={handleResetDatabase}>Reset Database</button>
          </div>
        </footer>
        </main>
      </div>

      {showTechpackModal && (
        <CreateTechpackModal 
          onClose={() => {
            setShowTechpackModal(false);
            setTechpackInitialAsset(undefined);
          }} 
          onPublish={handlePublishTechpack} 
          initialAsset={techpackInitialAsset}
        />
      )}

      {/* Modal: Place Bidding Offer */}
      {activeModal === "modal-place-bid" && selectedDemandId && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: "20px" }}>Submit Bidding Offer</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {(() => {
                const d = demands.find(dem => dem.id === selectedDemandId)
                if (!d) return null
                return (
                  <div className="price-breakdown-card" style={{ backgroundColor: "var(--bg-primary)", marginBottom: "12px" }}>
                    <strong>Demand:</strong> {d.title}<br/>
                    <strong>Qty:</strong> {d.quantity} | <strong>Fabric:</strong> {d.fabric}<br/>
                    <strong>Target Budget:</strong> {d.budget_range}
                  </div>
                )
              })()}
              <div className="form-group">
                <label className="form-label">Bid Price (Per Piece in USD)</label>
                <input type="number" step="0.01" className="form-input" value={bidPrice} onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label className="form-label">Production Turnaround Time (Days)</label>
                <input type="number" className="form-input" value={bidTat} onChange={(e) => setBidTat(parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label className="form-label">Manufacturer Proposal / Message</label>
                <textarea className="form-textarea" placeholder="Highlight fabric selection, print capacity, and packaging details..." value={bidComments} onChange={(e) => setBidComments(e.target.value)}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="btn-primary teal" onClick={handleSubmitBid}>Submit Bid Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bids Review */}
      {activeModal === "modal-review-bids" && selectedDemandId && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: "20px" }}>Review Manufacturing Offers</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {(() => {
                const d = demands.find(dem => dem.id === selectedDemandId)
                if (!d) return null
                return (
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", marginBottom: "12px" }}>
                    Offers for: {d.title}
                  </div>
                )
              })()}
              
              {/* Bids list */}
              <div className="item-list">
                {bids.filter(b => b.demand_id === selectedDemandId).length === 0 ? (
                  <div className="empty-state-card" style={{ border: "none" }}>
                    <span className="empty-icon">📭</span>
                    <span className="empty-title">No bids received yet</span>
                    <p className="empty-text">Factories are reviewing technical specs. Bids will load here.</p>
                  </div>
                ) : (
                  bids.filter(b => b.demand_id === selectedDemandId).map(b => (
                    <div className="list-item-card" key={b.id} style={{ cursor: "default", backgroundColor: "var(--bg-primary)" }}>
                      <div className="item-header">
                        <div>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{b.manufacturer_name}</span>
                          {b.manufacturer_id === 'pak_apparel' && (
                            <span className="badge badge-teal" style={{ fontSize: "9px", marginLeft: "8px" }}>Premium Vetted</span>
                          )}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-violet)" }}>${b.bid_price.toFixed(2)}/pc</div>
                      </div>
                      <div className="item-meta">
                        <span>Production Turnaround: <strong>{b.turnaround_time}</strong></span>
                      </div>
                      <p className="item-desc" style={{ fontSize: "13px", margin: "6px 0" }}>&quot;{b.comments}&quot;</p>
                      
                      <div style={{ marginTop: "6px" }}>
                        {b.status === "submitted" ? (
                          <button className="btn-primary" style={{ fontSize: "11px", padding: "5px 10px" }} onClick={() => handleAcceptBid(b)}>
                            Accept Offer & Settle Escrow
                          </button>
                        ) : (
                          <span className="badge badge-success">Accepted & Contracted</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Upgrade */}
      {activeModal === "modal-upgrade" && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: "18px" }}>Upgrade to Premium</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Get unlimited WebGL 3D Prototype rendering, Pantone TCX direct matching, and export-ready techpack PDFs.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-primary)", paddingBottom: "10px", marginTop: "10px" }}>
                <span>Premium Access:</span>
                <strong>$49.00 / month</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                alert("Subscription activated!")
                setActiveModal(null)
              }}>
                Pay via Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0D0D0C', color: '#F0EDE8', fontFamily: 'monospace' }}>Loading dashboard...</div>}>
      <DashboardContent />
    </React.Suspense>
  );
}
