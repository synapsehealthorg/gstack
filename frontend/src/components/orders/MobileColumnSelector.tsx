"use client"

import React from "react"

interface ColumnInfo {
  id: string
  heading: string
  count: number
}

interface MobileColumnSelectorProps {
  columns: ColumnInfo[]
  activeColumnId: string
  onSelect: (id: string) => void
}

export default function MobileColumnSelector({ columns, activeColumnId, onSelect }: MobileColumnSelectorProps) {
  return (
    <div className="mobile-column-selector" style={{
      display: "none", // Will be shown via CSS media query
      overflowX: "auto",
      padding: "16px 24px",
      gap: "12px",
      borderBottom: "1px solid var(--border-primary)",
      backgroundColor: "var(--bg-primary)",
      whiteSpace: "nowrap",
      scrollbarWidth: "none"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-column-selector {
            display: flex !important;
          }
        }
      `}} />
      {columns.map(col => (
        <button
          key={col.id}
          onClick={() => onSelect(col.id)}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: activeColumnId === col.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-primary)",
            backgroundColor: activeColumnId === col.id ? "var(--bg-secondary)" : "transparent",
            color: activeColumnId === col.id ? "var(--text-primary)" : "var(--text-secondary)",
            fontSize: "14px",
            fontWeight: activeColumnId === col.id ? 600 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {col.heading}
          <span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "10px",
            backgroundColor: "var(--bg-tertiary)",
            fontSize: "12px"
          }}>
            {col.count}
          </span>
        </button>
      ))}
    </div>
  )
}
