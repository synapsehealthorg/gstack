"use client"

import React, { useEffect } from "react"

interface ViewSwitcherProps {
  view: "list" | "board"
  onChange: (view: "list" | "board") => void
}

export default function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  useEffect(() => {
    // Load preference from local storage on mount
    const savedView = localStorage.getItem("proov_orders_view") as "list" | "board" | null
    if (savedView && savedView !== view) {
      onChange(savedView)
    }
  }, [])

  const handleSwitch = (newView: "list" | "board") => {
    localStorage.setItem("proov_orders_view", newView)
    onChange(newView)
  }

  return (
    <div className="view-switcher" style={{
      display: "flex",
      backgroundColor: "var(--bg-secondary)",
      padding: "4px",
      borderRadius: "8px",
      gap: "4px",
      border: "1px solid var(--border-primary)"
    }}>
      <button
        onClick={() => handleSwitch("list")}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          backgroundColor: view === "list" ? "var(--accent-primary)" : "transparent",
          color: view === "list" ? "white" : "var(--text-secondary)",
          transition: "all 0.2s"
        }}
      >
        List
      </button>
      <button
        onClick={() => handleSwitch("board")}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          backgroundColor: view === "board" ? "var(--accent-primary)" : "transparent",
          color: view === "board" ? "white" : "var(--text-secondary)",
          transition: "all 0.2s"
        }}
      >
        Board
      </button>
    </div>
  )
}
