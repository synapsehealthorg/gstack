"use client"
import React, { useState } from 'react'

interface TechpackViewerProps {
  techpackData: any;
}

export default function TechpackViewer({ techpackData }: TechpackViewerProps) {
  const [activeTab, setActiveTab] = useState<"cover" | "flats" | "bom" | "pom" | "grading">("cover");

  const MOCK_BOM = [
    { id: 1, category: "Fabric", name: techpackData?.fabric || "Polyester Mesh", spec: "180 GSM", placement: "Main Body" },
    { id: 2, category: "Trim", name: "Rib Knit", spec: "1x1 Elastane", placement: "Collar, Cuffs" },
    { id: 3, category: "Hardware", name: "Zipper", spec: "YKK #5 Nylon Coil", placement: "Center Front" },
  ];

  const MOCK_POM = [
    { id: 1, code: "POM_01", desc: "Chest Width (1\" below armhole)", base: "22.5", tol: "0.5" },
    { id: 2, code: "POM_02", desc: "Body Length (HPS to Hem)", base: "28.0", tol: "0.5" },
    { id: 3, code: "POM_03", desc: "Sleeve Length (Center Back to Cuff)", base: "34.5", tol: "0.25" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
      
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
        {["cover", "flats", "bom", "pom", "grading"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: "12px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--accent-violet)" : "2px solid transparent",
              color: activeTab === tab ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === tab ? "600" : "500",
              cursor: "pointer",
              fontSize: "13px",
              textTransform: "capitalize"
            }}
          >
            {tab === "bom" ? "Bill of Materials" : tab === "pom" ? "Points of Measure" : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
        
        {activeTab === "cover" && (
          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ flex: "0 0 200px" }}>
              <img src={techpackData?.assetUrl || "/assets/proj_belarus.png"} alt="Techpack Cover" style={{ width: "100%", borderRadius: "8px", border: "1px solid var(--border-primary)" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Style Category</div>
                <div style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: "500", textTransform: "capitalize" }}>{techpackData?.category || "Apparel"}</div>
              </div>
              <div style={{ display: "flex", gap: "40px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Base Size</div>
                  <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "500" }}>{techpackData?.baseSize || "M"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Size Range</div>
                  <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "500" }}>{techpackData?.sizeRange || "XS-XXL"}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Primary Fabric</div>
                <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "500" }}>{techpackData?.fabric || "100% Polyester Mesh"}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Revision Status</div>
                <div style={{ display: "inline-block", padding: "4px 8px", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", borderRadius: "4px", fontSize: "12px", fontWeight: "600", marginTop: "4px" }}>
                  Draft Verified by AI
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "flats" && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto", border: "1px dashed var(--border-primary)", padding: "20px", borderRadius: "8px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>2D Vector Flat Rendering</div>
              <img src={techpackData?.assetUrl || "/assets/proj_belarus.png"} style={{ width: "100%", filter: "grayscale(100%) contrast(150%) brightness(1.2)" }} alt="Flat Sketch" />
            </div>
          </div>
        )}

        {activeTab === "bom" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "15px" }}>Bill of Materials (BOM)</h4>
              <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>+ Add Row</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Category</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Item Name</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Specification</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Placement</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BOM.map(item => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.category} style={{ background: "transparent", border: "none", color: "inherit", width: "100%" }} /></td>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.name} style={{ background: "transparent", border: "none", color: "inherit", width: "100%", fontWeight: "500" }} /></td>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.spec} style={{ background: "transparent", border: "none", color: "inherit", width: "100%" }} /></td>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.placement} style={{ background: "transparent", border: "none", color: "inherit", width: "100%" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "pom" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "15px" }}>Points of Measure (POM)</h4>
              <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: "12px" }}>+ Add POM</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Code</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Description</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Base ({techpackData?.baseSize || "M"})</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid var(--border-primary)", fontWeight: "500" }}>Tol (+/-)</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_POM.map(item => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
                    <td style={{ padding: "10px", fontWeight: "600", color: "var(--text-secondary)" }}>{item.code}</td>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.desc} style={{ background: "transparent", border: "none", color: "inherit", width: "100%" }} /></td>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.base} style={{ background: "transparent", border: "none", color: "inherit", width: "100%", fontWeight: "500" }} /></td>
                    <td style={{ padding: "10px" }}><input type="text" defaultValue={item.tol} style={{ background: "transparent", border: "none", color: "inherit", width: "100%" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "grading" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary)", fontSize: "13px", border: "1px dashed var(--border-primary)", borderRadius: "8px" }}>
            Grading matrix automatically scaled based on {techpackData?.baseSize || "M"} base spec.
          </div>
        )}
      </div>
    </div>
  )
}
