"use client"
import React, { useState } from 'react'

const MOCK_COMMUNITY_POSTS = [
  {
    id: 1,
    title: "Neon Cyberpunk Windbreaker",
    manufacturer: "Neon Stitch Co.",
    manufacturerAvatar: "N",
    likes: 342,
    image: "/assets/proj_belarus.png",
    category: "Photorealism",
    description: "High-visibility reflective windbreaker designed for urban environments."
  },
  {
    id: 2,
    title: "Pro Cycling Jersey V2",
    manufacturer: "AeroTech Apparel",
    manufacturerAvatar: "A",
    likes: 89,
    image: "/assets/proj_recraft.png",
    category: "Vector art",
    description: "Aerodynamic cycling jersey with moisture-wicking technology."
  },
  {
    id: 3,
    title: "Minimalist Gym Duffel",
    manufacturer: "CarryGear",
    manufacturerAvatar: "C",
    likes: 156,
    image: "/assets/proj_icons.png",
    category: "Icon",
    description: "Durable and waterproof minimalist duffel bag for everyday gym use."
  },
  {
    id: 4,
    title: "Vintage Washed Hoodie",
    manufacturer: "Retro Fits",
    manufacturerAvatar: "R",
    likes: 421,
    image: "/assets/proj_logos.png",
    category: "Illustration",
    description: "Premium heavy-weight hoodie with a vintage acid wash finish."
  },
  {
    id: 5,
    title: "Elite Soccer Cleats concept",
    manufacturer: "KickStart Labs",
    manufacturerAvatar: "K",
    likes: 210,
    image: "/assets/proj_belarus.png",
    category: "Photorealism",
    description: "Concept design for ultra-lightweight carbon fiber soccer cleats."
  },
  {
    id: 6,
    title: "Breathable Running Shorts",
    manufacturer: "Pace Makers",
    manufacturerAvatar: "P",
    likes: 120,
    image: "/assets/proj_recraft.png",
    category: "Vector art",
    description: "Lightweight running shorts with built-in compression liner."
  },
  {
    id: 7,
    title: "Eco-Friendly Tote",
    manufacturer: "Green Stitch",
    manufacturerAvatar: "G",
    likes: 56,
    image: "/assets/proj_icons.png",
    category: "Icon",
    description: "100% recycled materials used in this minimalist tote."
  },
  {
    id: 8,
    title: "Abstract Gradient Print",
    manufacturer: "PrintWorks",
    manufacturerAvatar: "P",
    likes: 301,
    image: "/assets/proj_logos.png",
    category: "Illustration",
    description: "High quality DTG abstract gradient prints on heavy cotton."
  }
];

const CATEGORIES = ["All", "Photorealism", "Illustration", "Vector art", "Icon"];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("My Library");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Most Liked");
  const [creatorFilter, setCreatorFilter] = useState("All");

  let filteredPosts = MOCK_COMMUNITY_POSTS.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Mock creator filter logic
    let matchesCreatorFilter = true;
    if (creatorFilter === "Manufacturers") {
      // Mock logic: say anything ending in "Co." or "Labs" or "Apparel" is a manufacturer
      matchesCreatorFilter = post.manufacturer.includes("Co.") || post.manufacturer.includes("Labs") || post.manufacturer.includes("Apparel") || post.manufacturer.includes("Makers");
    } else if (creatorFilter === "Verified") {
      matchesCreatorFilter = post.likes > 150; // Mock: consider > 150 likes as verified creators
    }

    return matchesCategory && matchesSearch && matchesCreatorFilter;
  });

  if (sortBy === "Most Liked") {
    filteredPosts.sort((a, b) => b.likes - a.likes);
  } else if (sortBy === "Newest") {
    // Mock newest by using id descending
    filteredPosts.sort((a, b) => b.id - a.id);
  } else if (sortBy === "A-Z") {
    filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
  }

  const manufacturers = [
    {
      id: 'm1',
      name: 'Neon Stitch Co.',
      initials: 'NS',
      type: 'Manufacturer',
      is_premium: true,
      specialties: ['Outerwear', 'Reflective'],
      moq: 50
    },
    {
      id: 'm2',
      name: 'AeroTech Apparel',
      initials: 'AA',
      type: 'Manufacturer',
      is_premium: false,
      specialties: ['Athleisure', 'Seamless'],
      moq: 100
    }
  ];

  const creators = [
    { id: 'c1', name: 'Design Studio X', initials: 'DX', type: 'Creator', is_premium: true, specialties: ["Streetwear", "Techwear"] },
    { id: 'c2', name: 'Nova Concepts', initials: 'NC', type: 'Creator', is_premium: false, specialties: ["3D Modeling", "Footwear"] },
    ...manufacturers
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#111827', minHeight: '100%', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Level Tabs: My Library vs Community */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E5E7EB', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab("My Library")}
          style={{
            paddingBottom: '12px',
            fontSize: '18px',
            fontWeight: '800',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === "My Library" ? '#111827' : '#9CA3AF',
            borderBottom: activeTab === "My Library" ? '2px solid #111827' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          My Library
        </button>
        <button
          onClick={() => setActiveTab("Community")}
          style={{
            paddingBottom: '12px',
            fontSize: '18px',
            fontWeight: '800',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === "Community" ? '#111827' : '#9CA3AF',
            borderBottom: activeTab === "Community" ? '2px solid #111827' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Community
        </button>
      </div>

      {activeTab === "My Library" ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB', padding: '60px' }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📂</span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Your raw assets and moodboards</h3>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px', maxWidth: '400px', textAlign: 'center' }}>
            This is where you store reference images, raw assets, moodboards, and saved manufacturer profiles before turning them into production-ready Products.
          </p>
          <button style={{ marginTop: '24px', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
            Upload Asset
          </button>
        </div>
      ) : (
        <>
          {/* Top Header: Search and Categories */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search product or creator" 
            style={{ 
              width: "100%", 
              padding: "10px 16px 10px 40px", 
              borderRadius: "8px", 
              border: "1px solid #E5E7EB", 
              backgroundColor: "#F9FAFB",
              color: "#111827",
              outline: "none",
              fontSize: "14px"
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              style={{ 
                whiteSpace: "nowrap",
                padding: "8px 20px",
                borderRadius: "24px",
                border: "none",
                backgroundColor: activeCategory === cat ? "#111827" : "#F3F4F6",
                color: activeCategory === cat ? "#FFFFFF" : "#4B5563",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Creators & Manufacturers Horizontal Bar */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#111827' }}>Creators & Manufacturers</h2>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'thin' }}>
          {creators.map(creator => (
            <div key={creator.id} style={{ 
              minWidth: '320px', 
              border: '1px solid #E5E7EB', 
              borderRadius: '16px', 
              padding: '20px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: "56px", height: "56px", backgroundColor: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", color: "#374151", flexShrink: 0 }}>
                  {creator.initials}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#111827", margin: 0, paddingBottom: '6px', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{creator.name}</h3>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", backgroundColor: "#F3F4F6", padding: "4px 8px", borderRadius: "6px", color: "#4B5563", fontWeight: "600" }}>{creator.type}</span>
                    {creator.is_premium && <span style={{ fontSize: "11px", backgroundColor: "#ECFDF5", padding: "4px 8px", borderRadius: "6px", color: "#047857", fontWeight: '700' }}>Verified</span>}
                  </div>
                </div>
              </div>
              
              {creator.specialties && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {creator.specialties.map((s: string) => <span key={s} style={{ fontSize: "11px", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", padding: "4px 8px", borderRadius: "6px", color: "#6B7280", fontWeight: "500" }}>{s}</span>)}
                </div>
              )}
              
              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                 <button style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#111827', color: '#fff', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                   View Profile
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid (Pure Image Gallery Style) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111827' }}>Community Products</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={creatorFilter} 
              onChange={(e) => setCreatorFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '13px', color: '#374151', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Creators</option>
              <option value="Verified">Verified Only</option>
              <option value="Manufacturers">Manufacturers</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '13px', color: '#374151', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Most Liked">Most Liked</option>
              <option value="Newest">Newest</option>
              <option value="A-Z">A-Z</option>
            </select>
          </div>
        </div>
        
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🔍</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>No products found</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '8px' }}>Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
            gap: "20px" 
          }}>
            {filteredPosts.map(post => (
              <div key={post.id} style={{ 
                position: "relative",
                aspectRatio: "4/5",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
              }}
              className="community-image-card"
              >
                {/* Product Image */}
                <div style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#F3F4F6",
                  backgroundImage: `url(${post.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "transform 0.3s ease"
                }} />
                
                {/* Fallback pattern */}
                {!post.image && (
                   <div style={{ position: 'absolute', top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(#111827 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
                )}

                {/* Hover overlay with minimal details */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "24px 16px 16px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>by {post.manufacturer}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      {post.likes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .community-image-card:hover > div:first-child {
          transform: scale(1.05);
        }
      `}} />
    </div>
  )
}
