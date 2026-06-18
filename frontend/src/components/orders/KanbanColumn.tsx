"use client"

import React, { useState, useEffect } from "react"

interface KanbanColumnProps {
  id: string
  heading: string
  subtitle: string
  accentColor: string
  count: number
  emptyMessage: string
  children: React.ReactNode
  isActive?: boolean // For mobile view
  isUrgent?: boolean
}

export default function KanbanColumn({ id, heading, subtitle, accentColor, count, emptyMessage, children, isActive = true, isUrgent = false }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const savedState = localStorage.getItem(`proov_kanban_collapse_${id}`)
    if (savedState === "true") {
      setIsCollapsed(true)
    }
  }, [id])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(`proov_kanban_collapse_${id}`, String(newState))
  }

  // If not active (on mobile), don't render it at all
  if (!isActive) return null

  if (isCollapsed) {
    return (
      <div className="kanban-column collapsed" style={{
        width: "48px",
        minWidth: "48px",
        height: "100%",
        borderRight: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        cursor: "pointer",
        transition: "width 0.2s"
      }} onClick={toggleCollapse} title={`Expand ${heading}`}>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: "600", fontSize: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "12px" }}>
          <span>{heading}</span>
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", backgroundColor: "var(--bg-tertiary)", fontSize: "12px", color: "var(--text-primary)", transform: "rotate(90deg)" }}>{count}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="kanban-column expanded" style={{
      width: "280px",
      minWidth: "280px",
      height: "100%",
      borderRight: "1px solid var(--border-primary)",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "var(--bg-primary)",
      transition: "width 0.2s"
    }}>
      {/* Column Header */}
      <div style={{
        padding: "16px",
        borderBottom: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-primary)",
        position: "sticky",
        top: 0,
        zIndex: 2
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: isUrgent ? "var(--color-border-info)" : "var(--text-primary)" }}>{heading}</h3>
            {isUrgent && (
              <span style={{ fontSize: "10px", color: "#E24B4A", fontWeight: "bold", padding: "2px 6px", borderRadius: "10px", backgroundColor: "#FCEBEB" }}>ACTION NEEDED</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", backgroundColor: "var(--bg-tertiary)", fontSize: "12px", fontWeight: "500" }}>{count}</span>
            <button title="Filter" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
            <button onClick={toggleCollapse} title="Collapse" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {subtitle}
        </div>
      </div>

      {/* Column Content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "var(--bg-secondary)"
      }}>
        {count === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--text-secondary)", fontSize: "13px", border: "1px dashed var(--border-primary)", borderRadius: "8px" }}>
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
