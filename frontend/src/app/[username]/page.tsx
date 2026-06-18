import React from "react";
import Link from "next/link";
import { proovDb } from "@/lib/db";
import { ShieldCheck, MapPin, Tag, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PublicProfilePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;
  
  // Fetch user matching the username
  const user = await proovDb.getUserByUsername(username);
  
  if (!user) {
    return notFound();
  }

  const isManufacturer = user.role === "manufacturer" || user.role === "admin";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none -z-10" />

      {/* Top Banner Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-xl tracking-tighter text-indigo-400">proov.</span>
          </Link>
          <div className="flex items-center gap-4">
             <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-400 bg-slate-800 rounded-md border border-slate-700">PROFILE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl space-y-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-400 shrink-0 shadow-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">{user.name}</h1>
                {isManufacturer && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Manufacturer
                  </span>
                )}
              </div>
              <p className="text-indigo-400 font-medium">@{username}</p>
              
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-500" />
                  <span className="capitalize">{user.role}</span>
                </div>
                {/* Location if available - normally fetched from profile table */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Global</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-3">About</h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              {user.bio || (isManufacturer 
                ? "This manufacturer is part of the Proov network, ready to accept orders and bid on incoming demands." 
                : "This buyer uses Proov to securely source and track custom manufacturing orders.")}
            </p>
          </div>

          {isManufacturer && user.specialties && user.specialties.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Capabilities & Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {user.specialties.map((spec: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {isManufacturer && user.portfolio_samples && user.portfolio_samples.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Portfolio Samples</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.portfolio_samples.map((url: string, i: number) => (
                  <div key={i} className="aspect-square bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative group">
                    {/* Placeholder for actual images */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium">
                      Sample {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 mt-12 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} proov. Secure manufacturing and design escrows.</p>
      </footer>
    </div>
  );
}
