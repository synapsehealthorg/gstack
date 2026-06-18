import React from "react";
import Link from "next/link";
import { proovDb } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { CheckCircle2, Package, Calendar, Tag, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

export default async function SharedOrderPage(props: {
  params: Promise<{ username: string; orderId: string }>;
}) {
  const { username, orderId } = await props.params;
  
  // Fetch order matching user handle
  const order = await proovDb.getOrderByUsernameAndId(username, orderId);
  
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl text-indigo-400">?</span>
          </div>
          <h2 className="text-xl font-bold">Shared Order Not Found</h2>
          <p className="text-slate-400 text-sm">
            This shared link might be invalid, or the order is no longer accessible by user <span className="text-indigo-400">@{username}</span>.
          </p>
          <div className="pt-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch products associated with this order
  const orderWithProducts = await proovDb.getOrderWithProducts(order.id);
  const products = orderWithProducts?.products || [];

  // Determine current timeline status index
  const statusList = ["confirmed", "production", "shipped", "received"];
  const currentStatusIndex = statusList.indexOf(order.status) !== -1 
    ? statusList.indexOf(order.status) 
    : (order.status === "released" || order.status === "completed" ? 3 : 1);

  // Check if visitor is logged in
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const isLoggedIn = !!authUser;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none -z-10" />

      {/* Top Banner Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-tighter text-indigo-400">proov.</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-400 bg-slate-800 rounded-md border border-slate-700">SHARED</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="text-xs font-semibold px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all rounded-lg"
              >
                Go to Workspace
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all rounded-lg shadow-sm"
              >
                Log In / Register
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Order Info & Timeline) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Overview Header Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{order.fabric || "Custom Apparel"}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">Shared by @{username}</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{order.title}</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Total Quantity</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-400" />
                  {order.quantity || 1} pcs
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Target Turnaround</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {order.turnaround_time || "Negotiated"}
                </p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 font-medium">Escrow Status</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  {order.escrow_status === "funded" ? "Funded & Secured" : "Pending Funding"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 md:p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Order Status & Milestones</h3>
            
            <div className="relative pl-8 space-y-8 border-l border-slate-800">
              {/* Step 1: Confirmed */}
              <div className="relative">
                <span className={`absolute -left-11 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                  currentStatusIndex >= 0 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}>
                  {currentStatusIndex >= 0 ? "✓" : "1"}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${currentStatusIndex >= 0 ? "text-white" : "text-slate-500"}`}>Order Confirmed</h4>
                  <p className="text-xs text-slate-400 mt-1">Agreement locked and milestones scheduled.</p>
                </div>
              </div>

              {/* Step 2: Production */}
              <div className="relative">
                <span className={`absolute -left-11 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                  currentStatusIndex >= 1 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}>
                  {currentStatusIndex >= 1 ? (currentStatusIndex > 1 ? "✓" : "•") : "2"}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${currentStatusIndex >= 1 ? "text-white" : "text-slate-500"}`}>In Production</h4>
                  <p className="text-xs text-slate-400 mt-1">Manufacturer cutting, sewing, and preparing batches.</p>
                </div>
              </div>

              {/* Step 3: Shipped */}
              <div className="relative">
                <span className={`absolute -left-11 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                  currentStatusIndex >= 2 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-900 border-slate-700 text-slate-400"
                }`}>
                  {currentStatusIndex >= 2 ? (currentStatusIndex > 2 ? "✓" : "•") : "3"}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${currentStatusIndex >= 2 ? "text-white" : "text-slate-500"}`}>Shipped & Tracking</h4>
                  <p className="text-xs text-slate-400 mt-1">Order leaves the manufacturing unit. Awaiting cargo arrival.</p>
                  {order.tracking_number && (
                    <div className="mt-2 text-xs bg-slate-800 border border-slate-700 inline-block px-3 py-1.5 rounded-lg text-slate-300">
                      Tracking ID: <span className="font-semibold">{order.tracking_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="relative">
                <span className={`absolute -left-11 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                  currentStatusIndex >= 3 
                    ? "bg-green-600 border-green-500 text-white shadow-md shadow-green-600/30" 
                    : "bg-slate-900 border-slate-700 text-slate-500"
                }`}>
                  {currentStatusIndex >= 3 ? "✓" : "4"}
                </span>
                <div>
                  <h4 className={`text-sm font-bold ${currentStatusIndex >= 3 ? "text-white" : "text-slate-500"}`}>Delivered & Released</h4>
                  <p className="text-xs text-slate-400 mt-1">Funds released to supplier Solana wallet address.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Product Details & CTA) */}
        <div className="space-y-6">
          
          {/* Products Summary Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" /> Style & Product Details
            </h4>
            
            <div className="divide-y divide-slate-800">
              {products.length > 0 ? (
                products.map((p) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      <span className="text-xs text-slate-500">Qty: {p.quantity}</span>
                    </div>
                    {p.style_code && (
                      <span className="text-xs bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">
                        {p.style_code}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-2 text-sm text-slate-500 italic">
                  No products attached. Displaying order brief context.
                </div>
              )}
            </div>
          </div>

          {/* Collaboration CTA Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-indigo-800/30 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl" />
            
            <h3 className="text-base font-bold text-white">Collaborate on this Order</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Log in to access complete design assets, upload final techpacks, submit bids, or manage funds in secure escrow.
            </p>
            
            <div className="pt-2 space-y-2">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold text-xs rounded-xl shadow-lg"
                >
                  Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold text-xs rounded-xl shadow-lg"
                  >
                    Log In / Sign Up <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href="/"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 border border-slate-700 font-semibold text-xs rounded-xl"
                  >
                    About proov <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 mt-12 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} proov. Secure manufacturing and design escrows.</p>
      </footer>
    </div>
  );
}
