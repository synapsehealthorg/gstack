"use client"
import React, { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'

interface CreateTechpackModalProps {
  onClose: () => void;
  onPublish: (data: any) => void;
  initialAsset?: string;
}

export default function CreateTechpackModal({ onClose, onPublish, initialAsset }: CreateTechpackModalProps) {
  const [step, setStep] = useState(initialAsset ? 2 : 1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [assetUrl, setAssetUrl] = useState<string | null>(initialAsset || null);
  const [category, setCategory] = useState("sportswear");
  const [fabric, setFabric] = useState("poly_mesh");
  const [baseSize, setBaseSize] = useState("M");
  const [sizeRange, setSizeRange] = useState("XS-XXL");
  const [qty, setQty] = useState(100);
  
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(15.00);
  const [tat, setTat] = useState(21);

  // Mock auto-generate step
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStep(4);
      // Auto-fill title based on category/fabric
      if (!title) {
        const catName = category === "sportswear" ? "Apparel" : "Accessories";
        setTitle(`${qty}x Custom ${catName} Production`);
      }
    }, 2000);
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    
    onPublish({
      title,
      category,
      fabric,
      baseSize,
      sizeRange,
      qty,
      budget,
      tat,
      assetUrl
    });
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#111111', border: '1px solid #333', borderRadius: '12px',
        width: '100%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFF', margin: 0 }}>Techpack Generator</h3>
            <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '4px' }}>
              {step === 1 && "Step 1: Upload Source Visual"}
              {step === 2 && "Step 2: Configuration"}
              {step === 3 && "Step 3: AI Generation"}
              {step === 4 && "Step 4: Finalize & Publish"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>&times;</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', maxHeight: '70vh' }}>
          
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{ 
                  border: '2px dashed #333', borderRadius: '8px', padding: '40px 20px', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#18181A', cursor: 'pointer', transition: 'border-color 0.2s'
                }}
                onClick={() => {
                  setAssetUrl("/assets/proj_belarus.png");
                  setStep(2);
                }}
              >
                <Upload size={32} color="#A1A1AA" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '15px', color: '#FFF', fontWeight: '500', marginBottom: '4px' }}>Upload Product Image or Sketch</div>
                <div style={{ fontSize: '13px', color: '#A1A1AA' }}>PNG, JPG, or SVG up to 10MB</div>
              </div>
              <div style={{ textAlign: 'center', color: '#A1A1AA', fontSize: '13px' }}>
                Or export directly from the Studio canvas.
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {assetUrl && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#18181A', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                  <img src={assetUrl} alt="Asset" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#27272A' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#FFF', fontWeight: '500' }}>Source Visual Attached</div>
                    <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Ready for segmentation and extraction</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Product Category</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }}>
                    <option value="sportswear">Sportswear / Apparel</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="equipment">Custom Accessories</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Base Size</label>
                    <select className="form-select" value={baseSize} onChange={(e) => setBaseSize(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }}>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="OS">One Size (OS)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Size Range</label>
                    <input type="text" className="form-input" value={sizeRange} onChange={(e) => setSizeRange(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }} placeholder="e.g., XS-XXL" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Target Fabric / Material</label>
                  <select className="form-select" value={fabric} onChange={(e) => setFabric(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }}>
                    <option value="poly_mesh">100% Polyester Mesh (180 GSM)</option>
                    <option value="fleece">Polyester Fleece (280 GSM)</option>
                    <option value="interlock">Polyester Interlock (140 GSM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Target Quantity (Units)</label>
                  <input type="number" className="form-input" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '24px' }}>
              <div style={{ position: 'relative' }}>
                <Loader2 size={48} color="#8B5CF6" className="spin-animation" style={{ animation: 'spin 2s linear infinite' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <FileText size={20} color="#C4B5FD" />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', color: '#FFF', marginBottom: '8px' }}>Generating Techpack...</h3>
                <p style={{ fontSize: '14px', color: '#A1A1AA', margin: 0 }}>Parsing visual structure, extracting POMs, and generating Bill of Materials.</p>
              </div>
              
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}} />
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#10B981' }}>
                <CheckCircle size={24} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Techpack Draft Generated Successfully</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>You and the manufacturer can refine details inline during verification.</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Order Title</label>
                <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }} placeholder="e.g. 500x Sublimated Jerseys" />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Target Budget (per unit)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#A1A1AA' }}>$</span>
                    <input type="number" className="form-input" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '10px 10px 10px 24px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Turnaround Time (Days)</label>
                  <input type="number" className="form-input" value={tat} onChange={(e) => setTat(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '10px', backgroundColor: '#18181A', border: '1px solid #333', borderRadius: '6px', color: '#FFF' }} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', backgroundColor: '#18181A' }}>
          {step > 1 && step < 3 && (
            <button 
              onClick={() => setStep(step - 1)}
              style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#FFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              Back
            </button>
          )}
          {step === 1 && <div />} {/* spacer */}
          {step === 4 && (
            <button 
              onClick={() => setStep(2)}
              style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#FFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              Edit Config
            </button>
          )}

          {step === 1 && (
            <button 
              onClick={() => setStep(2)}
              style={{ padding: '8px 16px', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '6px', color: '#FFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              Skip Upload
            </button>
          )}
          
          {step === 2 && (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{ padding: '8px 16px', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '6px', color: '#FFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isGenerating ? 'Processing...' : 'Generate Techpack'}
            </button>
          )}

          {step === 4 && (
            <button 
              onClick={handlePublish}
              style={{ padding: '8px 16px', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '6px', color: '#FFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              Publish to Board
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
