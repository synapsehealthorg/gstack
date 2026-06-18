"use client"
import React, { useState, useEffect } from 'react'
import { proovDb, LogEntry } from '@/lib/db'
import { Activity, Edit3, MessageSquare, DollarSign, CheckCircle } from 'lucide-react'

export default function HistoryPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      const data = await proovDb.getLogs();
      setLogs(data);
      setIsLoading(false);
    }
    loadLogs();
  }, []);

  const FILTERS = ["All", "Briefs", "Bids", "Orders", "Payments"];

  // Helper to categorize log messages for filtering
  const getLogCategory = (action: string): string => {
    const text = action.toLowerCase();
    if (text.includes("brief")) return "Briefs";
    if (text.includes("bid")) return "Bids";
    if (text.includes("order") || text.includes("production")) return "Orders";
    if (text.includes("escrow") || text.includes("payment") || text.includes("wallet")) return "Payments";
    return "Other";
  };

  // Helper to pick an icon based on category
  const getLogIcon = (category: string) => {
    switch (category) {
      case "Briefs": return <Edit3 size={16} color="#A1A1AA" />;
      case "Bids": return <MessageSquare size={16} color="#A1A1AA" />;
      case "Orders": return <CheckCircle size={16} color="#A1A1AA" />;
      case "Payments": return <DollarSign size={16} color="#A1A1AA" />;
      default: return <Activity size={16} color="#A1A1AA" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (activeFilter === "All") return true;
    return getLogCategory(log.action) === activeFilter;
  });

  return (
    <section className="view-panel active" style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="panel-header" style={{ marginBottom: "24px" }}>
        <h1 className="panel-title">Activity History</h1>
        <p className="panel-subtitle">A chronological record of your actions on proov.to.</p>
      </div>

      <div className="filter-pills" style={{ display: "flex", gap: "8px", marginBottom: "32px", overflowX: "auto", paddingBottom: "4px" }}>
        {FILTERS.map(filter => (
          <button 
            key={filter} 
            className={`tab-pill ${activeFilter === filter ? "active" : ""}`}
            onClick={() => setActiveFilter(filter)}
            style={{ whiteSpace: "nowrap" }}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="history-timeline panel-card" style={{ padding: "24px", position: "relative" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>Loading history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state-card" style={{ border: "none", padding: "40px" }}>
            <span className="empty-icon"><Activity size={32} color="var(--text-muted)" /></span>
            <span className="empty-title">No history found</span>
            <p className="empty-text">There are no records matching the "{activeFilter}" filter.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
            {/* Vertical connector line */}
            <div style={{ position: "absolute", left: "15px", top: "0", bottom: "0", width: "2px", backgroundColor: "var(--border-primary)", zIndex: 0 }}></div>
            
            {filteredLogs.map(log => {
              const category = getLogCategory(log.action);
              return (
                <div key={log.id} style={{ display: "flex", gap: "16px", position: "relative", zIndex: 1 }}>
                  {/* Timeline Node */}
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--bg-secondary)", border: "2px solid var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {getLogIcon(category)}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{log.action}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "16px" }}>
                        {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {log.details && (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", backgroundColor: "var(--bg-tertiary)", padding: "8px 12px", borderRadius: "6px", marginTop: "8px" }}>
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  )
}
