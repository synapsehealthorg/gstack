"use client"
import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

// Define a unified favorite item interface
interface FavoriteItem {
  id: string;
  type: "project" | "template" | "manufacturer" | "community";
  title: string;
  subtitle: string;
  image: string;
}

const DEFAULT_MOCK_FAVORITES: FavoriteItem[] = [
  {
    id: "f1",
    type: "template",
    title: "Heavyweight Boxy Hoodie",
    subtitle: "By proov official",
    image: "/assets/proj_recraft.png"
  },
  {
    id: "f2",
    type: "manufacturer",
    title: "Neon Stitch Co.",
    subtitle: "Streetwear • 500 MOQ",
    image: "/assets/proj_belarus.png"
  },
  {
    id: "f3",
    type: "community",
    title: "Minimalist Gym Duffel",
    subtitle: "156 Likes",
    image: "/assets/proj_icons.png"
  }
];

export default function FavoritesPanel() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    // Load from localStorage or set defaults
    const stored = localStorage.getItem("proov_favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        setFavorites(DEFAULT_MOCK_FAVORITES);
      }
    } else {
      setFavorites(DEFAULT_MOCK_FAVORITES);
      localStorage.setItem("proov_favorites", JSON.stringify(DEFAULT_MOCK_FAVORITES));
    }
  }, []);

  const removeFavorite = (idToRemove: string) => {
    const updated = favorites.filter(f => f.id !== idToRemove);
    setFavorites(updated);
    localStorage.setItem("proov_favorites", JSON.stringify(updated));
  };

  const filteredFavorites = favorites.filter(fav => {
    if (activeFilter === "All") return true;
    return fav.type.toLowerCase() === activeFilter.toLowerCase();
  });

  const FILTERS = ["All", "Projects", "Templates", "Manufacturers", "Community"];

  return (
    <section className="view-panel active" style={{ padding: "24px", maxWidth: "1200px" }}>
      <div className="panel-header" style={{ marginBottom: "24px" }}>
        <h1 className="panel-title">Saved Favorites</h1>
        <p className="panel-subtitle">Your personal collection of inspiring designs, templates, and partners.</p>
      </div>

      <div className="filter-pills" style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
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

      <div className="favorites-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
        {filteredFavorites.length === 0 ? (
          <div className="empty-state-card" style={{ gridColumn: "1 / -1", border: "none" }}>
            <span className="empty-icon">
              <Heart size={32} color="var(--text-muted)" />
            </span>
            <span className="empty-title">No {activeFilter !== "All" ? activeFilter.toLowerCase() : "favorites"} found</span>
            <p className="empty-text">You haven't saved any {activeFilter !== "All" ? activeFilter.toLowerCase() : "items"} yet. Browse around to find inspiration.</p>
          </div>
        ) : (
          filteredFavorites.map(fav => (
            <div key={fav.id} className="favorites-card panel-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              <div 
                style={{ 
                  height: "160px", 
                  backgroundColor: "var(--bg-tertiary)", 
                  position: "relative",
                  backgroundImage: `url(${fav.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!fav.image && (
                   <div style={{ width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(var(--text-primary) 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
                )}
                
                {/* Type Badge */}
                <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "rgba(0,0,0,0.6)", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", backdropFilter: "blur(4px)", textTransform: "uppercase" }}>
                  {fav.type}
                </div>

                {/* Heart Button */}
                <button 
                  onClick={() => removeFavorite(fav.id)}
                  style={{ 
                    position: "absolute", 
                    top: "12px", 
                    right: "12px", 
                    backgroundColor: "rgba(255,255,255,0.9)", 
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <Heart size={14} fill="#EF4444" color="#EF4444" />
                </button>
              </div>
              
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 4px 0" }}>{fav.title}</h3>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>{fav.subtitle}</div>
                
                <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>
                  View {fav.type.charAt(0).toUpperCase() + fav.type.slice(1)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
