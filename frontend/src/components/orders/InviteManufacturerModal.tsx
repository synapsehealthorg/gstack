"use client"

import React, { useState } from "react"
import { createClient } from "@supabase/supabase-js" // Mocking logic for now

interface Manufacturer {
  id: string
  name: string
  location?: string
  rating?: number
}

interface InviteManufacturerModalProps {
  isOpen: boolean
  onClose: () => void
  onSendInvites: (invitedIds: string[]) => void
  username?: string
  orderId?: string
}

export default function InviteManufacturerModal({ isOpen, onClose, onSendInvites, username = "user", orderId = "0" }: InviteManufacturerModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Manufacturer[]>([])
  const [selected, setSelected] = useState<Manufacturer[]>([])
  const [linkCopied, setLinkCopied] = useState(false)

  if (!isOpen) return null

  // Mock search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length > 2) {
      setSearchResults([
        { id: "1", name: "Pakistan Apparel Ltd", location: "Sialkot, Pakistan", rating: 4.8 },
        { id: "2", name: "Guangzhou Textiles", location: "Guangzhou, China", rating: 4.5 },
      ])
    } else {
      setSearchResults([])
    }
  }

  const toggleSelect = (m: Manufacturer) => {
    if (selected.find(s => s.id === m.id)) {
      setSelected(selected.filter(s => s.id !== m.id))
    } else {
      if (selected.length < 5) {
        setSelected([...selected, m])
      }
    }
  }

  const handleCopyLink = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://proov.to"
    navigator.clipboard.writeText(`${baseUrl}/${username}/${orderId}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleSend = () => {
    onSendInvites(selected.map(s => s.id))
    onClose()
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "var(--color-background-primary)", borderRadius: "12px", width: "100%", maxWidth: "480px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>Invite manufacturers</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "24px 24px 16px 24px" }}>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by name or company..." 
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: "6px", border: "1px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}
            />
          </div>

          {/* Selected Chips */}
          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {selected.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", backgroundColor: "var(--color-background-info)", borderRadius: "16px", fontSize: "12px", color: "var(--color-text-info)" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold" }}>{s.name[0]}</div>
                  {s.name}
                  <button onClick={() => toggleSelect(s)} style={{ background: "none", border: "none", padding: 0, marginLeft: "4px", cursor: "pointer", color: "currentColor", display: "flex", alignItems: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
              <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", alignSelf: "center", marginLeft: "auto" }}>{selected.length}/5 selected</div>
            </div>
          )}

          {/* Results List */}
          {searchQuery.length > 2 && (
            <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: "8px", overflow: "hidden" }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--color-text-secondary)", fontSize: "13px" }}>No manufacturers found.</div>
              ) : (
                searchResults.map(res => {
                  const isSelected = selected.some(s => s.id === res.id)
                  return (
                    <div 
                      key={res.id} 
                      onClick={() => toggleSelect(res)}
                      style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-tertiary)", cursor: "pointer", backgroundColor: isSelected ? "var(--color-background-info)" : "transparent" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "var(--color-text-secondary)" }}>{res.name[0]}</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "2px" }}>{res.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{res.location} · ★ {res.rating}</div>
                        </div>
                      </div>
                      <div style={{ color: isSelected ? "var(--color-text-info)" : "var(--color-text-tertiary)" }}>
                        {isSelected ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        <div style={{ height: "1px", backgroundColor: "var(--color-border-tertiary)", width: "100%" }} />

        {/* Footer Actions */}
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-background-secondary)" }}>
          <button 
            onClick={handleCopyLink}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: linkCopied ? "#10B981" : "var(--color-text-secondary)", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            {linkCopied ? "Link copied!" : "Copy invite link"}
          </button>
          <button 
            onClick={handleSend}
            disabled={selected.length === 0}
            className="btn-primary" 
            style={{ padding: "8px 16px", opacity: selected.length > 0 ? 1 : 0.5 }}
          >
            Send Invites
          </button>
        </div>
      </div>
    </div>
  )
}
