"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const MOCK_TEMPLATES = [
  {
    id: "t_1",
    name: "Classic Crewneck T-Shirt",
    category: "T-Shirts",
    image: "/assets/proj_belarus.png",
    zones: 5,
    designer: "proov official"
  },
  {
    id: "t_2",
    name: "Heavyweight Boxy Hoodie",
    category: "Hoodies",
    image: "/assets/proj_recraft.png",
    zones: 7,
    designer: "proov official"
  },
  {
    id: "t_3",
    name: "Pro Cycling Jersey",
    category: "Jerseys",
    image: "/assets/proj_icons.png",
    zones: 8,
    designer: "AeroTech"
  },
  {
    id: "t_4",
    name: "Athletic Performance Polo",
    category: "Polos",
    image: "/assets/proj_logos.png",
    zones: 4,
    designer: "proov official"
  },
  {
    id: "t_5",
    name: "Running Compression Shorts",
    category: "Shorts",
    image: "/assets/proj_belarus.png",
    zones: 3,
    designer: "Pace Makers"
  },
  {
    id: "t_6",
    name: "Minimalist Gym Duffel",
    category: "Accessories",
    image: "/assets/proj_recraft.png",
    zones: 6,
    designer: "CarryGear"
  },
  {
    id: "t_7",
    name: "V-Neck Soccer Jersey",
    category: "Jerseys",
    image: "/assets/proj_icons.png",
    zones: 5,
    designer: "proov official"
  },
  {
    id: "t_8",
    name: "Urban Cargo Pants",
    category: "Streetwear",
    image: "/assets/proj_logos.png",
    zones: 9,
    designer: "Retro Fits"
  }
];

const CATEGORIES = ["All", "T-Shirts", "Hoodies", "Jerseys", "Polos", "Shorts", "Streetwear", "Accessories"];

export default function TemplatesLibrary() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === "All" || template.category === activeCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="view-panel active" style={{ padding: "24px", maxWidth: "1200px" }}>
      <div className="panel-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="panel-title">Templates Library</h1>
          <p className="panel-subtitle">Start your next design with a pre-configured 3D template.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="form-input" 
            style={{ width: "240px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display: "flex", backgroundColor: "var(--bg-tertiary)", borderRadius: "6px", padding: "4px" }}>
            <button 
              style={{ padding: "4px 8px", borderRadius: "4px", border: "none", backgroundColor: viewMode === "grid" ? "var(--bg-secondary)" : "transparent", color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: "600", boxShadow: viewMode === "grid" ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button 
              style={{ padding: "4px 8px", borderRadius: "4px", border: "none", backgroundColor: viewMode === "list" ? "var(--bg-secondary)" : "transparent", color: viewMode === "list" ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: "600", boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="filter-pills" style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`tab-pill ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
            style={{ whiteSpace: "nowrap" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {viewMode === "grid" ? (
        <div className="template-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
          {filteredTemplates.length === 0 ? (
            <div className="empty-state-card" style={{ gridColumn: "1 / -1", border: "none" }}>
              <span className="empty-icon">🔍</span>
              <span className="empty-title">No templates found</span>
              <p className="empty-text">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div key={template.id} className="template-card panel-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)" }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div 
                  style={{ 
                    height: "160px", 
                    backgroundColor: "var(--bg-tertiary)", 
                    position: "relative",
                    backgroundImage: `url(${template.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!template.image && (
                     <div style={{ width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(var(--text-primary) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
                  )}
                  <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", backdropFilter: "blur(4px)", textTransform: "uppercase" }}>
                    {template.category}
                  </div>
                </div>
                
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 4px 0" }}>{template.name}</h3>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>By {template.designer} • {template.zones} Zones</div>
                  
                  <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }} onClick={() => router.push('/studio')}>
                    Use Template
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="template-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTemplates.length === 0 ? (
             <div className="empty-state-card" style={{ border: "none" }}>
               <span className="empty-icon">🔍</span>
               <span className="empty-title">No templates found</span>
               <p className="empty-text">Try adjusting your search or category filters.</p>
             </div>
          ) : (
            filteredTemplates.map(template => (
              <div key={template.id} className="panel-card" style={{ padding: "12px", display: "flex", alignItems: "center", gap: "16px", transition: "transform 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)" }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none" }}>
                <div 
                  style={{ 
                    width: "80px",
                    height: "80px", 
                    backgroundColor: "var(--bg-tertiary)", 
                    borderRadius: "8px",
                    backgroundImage: `url(${template.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>{template.name}</h3>
                    <span style={{ fontSize: "10px", backgroundColor: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>{template.category}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>By {template.designer} • {template.zones} Editable Zones</div>
                </div>
                <button className="btn-primary" onClick={() => router.push('/studio')}>
                  Use Template
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
