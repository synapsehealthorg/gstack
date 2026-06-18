"use client"
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Shirt, Briefcase, Search, Zap, ChevronRight, Lock, Shield, AlertCircle } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';

export default function MarketBrowse() {
  const [verificationTier, setVerificationTier] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkVerification() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('manufacturer_profiles')
          .select('verification_tier')
          .eq('id', user.id)
          .single();
        if (data) {
          setVerificationTier(data.verification_tier || 0);
        }
      }
      setLoading(false);
    }
    checkVerification();
  }, [supabase.auth]);

  const canBid = verificationTier > 0;

  const handleBid = () => {
    if (canBid) {
      alert("Bid placement flow initiated");
    } else {
      router.push('/onboarding'); // Redirect to verification flow
    }
  };

  return (
    <div className="market-wrap">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-background-primary: #ffffff;
          --color-background-secondary: #f8fafc;
          --color-text-primary: #0f1117;
          --color-text-secondary: #475569;
          --color-text-tertiary: #94a3b8;
          --color-border-secondary: #cbd5e1;
          --color-border-tertiary: #e2e8f0;
          --border-radius-md: 8px;
          --border-radius-lg: 12px;
          --font-sans: ui-sans-serif, system-ui, sans-serif;
          --font-mono: ui-monospace, SFMono-Regular, monospace;
        }
        .market-wrap { padding: 1rem 0; font-family: var(--font-sans); }
        .search-bar-wrap { margin-bottom: 1.25rem; }
        .search-input { width: 100%; padding: 10px 14px 10px 38px; font-size: 14px; border-radius: var(--border-radius-lg); border: 0.5px solid var(--color-border-secondary); background: var(--color-background-primary); color: var(--color-text-primary); transition: border-color 0.15s, box-shadow 0.15s; }
        .search-input:focus { outline: none; border-color: var(--color-text-primary); box-shadow: 0 0 0 1px var(--color-text-primary); }
        .search-input::placeholder { color: var(--color-text-tertiary); }
        .top-bar-browse { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .top-left-browse { display: flex; align-items: center; gap: 12px; }
        .filter-pills { display: flex; gap: 6px; }
        .pill { font-size: 12px; padding: 4px 12px; border-radius: 20px; border: 0.5px solid var(--color-border-secondary); color: var(--color-text-secondary); cursor: pointer; background: var(--color-background-primary); }
        .pill.active { background: var(--color-text-primary); color: var(--color-background-primary); border-color: var(--color-text-primary); }
        .sort-select { font-size: 12px; color: var(--color-text-secondary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 4px 8px; background: var(--color-background-primary); }
        .browse-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
        .rfq-card-browse { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; transition: border-color 0.15s; }
        .rfq-card-browse:hover { border-color: var(--color-border-secondary); }
        .card-top { padding: 14px 14px 10px; }
        .card-header-browse { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
        .status-row-browse { display: flex; align-items: center; gap: 6px; }
        .live-dot-browse { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; flex-shrink: 0; }
        .status-badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 20px; }
        .badge-live { background: #dcfce7; color: #15803d; }
        .badge-closing { background: #fef9c3; color: #854d0e; }
        .badge-hot { background: #fee2e2; color: #b91c1c; }
        .rfq-id-browse { font-size: 11px; font-weight: 500; font-family: var(--font-mono); color: var(--color-text-tertiary); }
        .card-title-browse { font-size: 14px; font-weight: 500; color: var(--color-text-primary); line-height: 1.35; margin-bottom: 10px; }
        .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
        .spec-item { background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 6px 8px; }
        .spec-label { font-size: 10px; color: var(--color-text-tertiary); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
        .spec-val { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .spec-val.green { color: #15803d; }
        .spec-val.amber { color: #92400e; }
        .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
        .tag { font-size: 11px; padding: 2px 8px; border-radius: 20px; border: 0.5px solid var(--color-border-tertiary); color: var(--color-text-secondary); }
        .demand-bar-wrap { margin-bottom: 10px; }
        .demand-label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between; }
        .demand-bar { height: 3px; background: var(--color-border-tertiary); border-radius: 2px; overflow: hidden; }
        .demand-fill { height: 100%; border-radius: 2px; }
        .fill-high { background: #22c55e; }
        .fill-med { background: #f59e0b; }
        .fill-low { background: #3b82f6; }
        .card-divider { height: 0.5px; background: var(--color-border-tertiary); margin: 0 14px; }
        .card-bottom { padding: 10px 14px; }
        .bidders-row-browse { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .bidders-left { display: flex; align-items: center; gap: 8px; }
        .avatar-stack { display: flex; }
        .avatar { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--color-background-primary); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 500; margin-left: -6px; flex-shrink: 0; }
        .avatar:first-child { margin-left: 0; }
        .av-blue { background: #dbeafe; color: #1d4ed8; }
        .av-green { background: #dcfce7; color: #15803d; }
        .av-amber { background: #fef3c7; color: #92400e; }
        .av-purple { background: #ede9fe; color: #6d28d9; }
        .av-red { background: #fee2e2; color: #b91c1c; }
        .av-more { background: var(--color-background-secondary); color: var(--color-text-secondary); }
        .bid-meta { display: flex; flex-direction: column; gap: 1px; }
        .bid-count { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .bid-avg { font-size: 11px; color: var(--color-text-secondary); }
        .timer-browse { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-secondary); }
        .timer-browse.urgent { color: #b91c1c; }
        .cta-row { display: flex; gap: 8px; }
        .btn-primary-browse { flex: 1; background: var(--color-text-primary); color: var(--color-background-primary); border: none; border-radius: var(--border-radius-md); font-size: 12px; font-weight: 500; padding: 7px 12px; cursor: pointer; text-align: center; }
        .btn-secondary-browse { flex: 0 0 auto; background: transparent; color: var(--color-text-secondary); border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); font-size: 12px; padding: 7px 12px; cursor: pointer; }
        .btn-primary-browse:hover { opacity: 0.88; }
        .btn-secondary-browse:hover { background: var(--color-background-secondary); }
        .buyer-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .buyer-avatar { width: 20px; height: 20px; border-radius: 50%; background: var(--color-background-secondary); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 500; color: var(--color-text-secondary); flex-shrink: 0; }
        .buyer-name { font-size: 11px; color: var(--color-text-secondary); }
        .verified { color: #2563eb; font-size: 11px; margin-left: 2px; display: flex; align-items: center; }
        .sample-chip { font-size: 10px; padding: 1px 6px; border-radius: 20px; background: #ede9fe; color: #6d28d9; margin-left: auto; }
        .thumb-strip { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .thumb-box { width: 36px; height: 36px; border-radius: 6px; border: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-more { font-size: 11px; font-weight: 500; color: var(--color-text-secondary); background: var(--color-background-secondary); border-radius: 12px; padding: 4px 8px; border: 0.5px solid var(--color-border-tertiary); margin-left: 2px; }
        .fallback-sportswear { background: #eff6ff; color: #2563eb; }
        .fallback-apparel { background: #ccfbf1; color: #0d9488; }
        .fallback-leather { background: #fef3c7; color: #d97706; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}} />

      {/* Verification notification bar */}
      {!loading && !canBid && (
        <div style={{
          background: 'linear-gradient(135deg, #0f1117 0%, #1e293b 100%)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock size={14} color="#94a3b8" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Verify your manufacturer account to start bidding
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Complete onboarding to unlock access to buyer RFQs.</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              background: '#fff', color: '#0f1117', border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <Shield size={13} /> Verify Account <ChevronRight size={13} />
          </button>
        </div>
      )}

      <div className="search-bar-wrap">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Search keywords, categories, or RFQ IDs..." 
          />
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div className="top-bar-browse">
        <div className="top-left-browse">
          <div className="filter-pills">
            <span className="pill active">All</span>
            <span className="pill">Sportswear</span>
            <span className="pill">Apparel</span>
            <span className="pill">Leather</span>
            <span className="pill">Electronics</span>
          </div>
        </div>
        <select className="sort-select">
          <option>Newest first</option>
          <option>Most bids</option>
          <option>Closing soon</option>
          <option>Highest value</option>
        </select>
      </div>

      <div className="browse-grid">

        <div className="rfq-card-browse">
          <div className="card-top">
            <div className="card-header-browse">
              <div className="status-row-browse">
                <span className="live-dot-browse"></span>
                <span className="status-badge badge-live">Live</span>
              </div>
              <span className="rfq-id-browse">PRV-2026-00431</span>
            </div>
            <div className="buyer-row">
              <div className="buyer-avatar">JM</div>
              <span className="buyer-name">James Mitchell · UK</span>
              <span className="verified"><CheckCircle2 size={12} /></span>
              <span className="sample-chip">Sample needed</span>
            </div>
            <div className="thumb-strip">
              <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
              <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
              <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
              <div className="thumb-more">+2 products</div>
            </div>
            <div className="card-title-browse">Football Jersey Kit — Full Team Set with Sublimation Print</div>
            <div className="specs-grid">
              <div className="spec-item">
                <div className="spec-label">Quantity</div>
                <div className="spec-val">500 sets</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">Budget</div>
                <div className="spec-val green">$8 / set</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">TAT</div>
                <div className="spec-val">21 days</div>
              </div>
            </div>
            <div className="tags">
              <span className="tag">Polyester</span>
              <span className="tag">Sublimation</span>
              <span className="tag">FOB</span>
              <span className="tag">Sialkot</span>
            </div>
            <div className="demand-bar-wrap">
              <div className="demand-label">
                <span>Manufacturer demand</span>
                <span style={{fontWeight: 500, color: 'var(--color-text-primary)'}}>High</span>
              </div>
              <div className="demand-bar"><div className="demand-fill fill-high" style={{width: '82%'}}></div></div>
            </div>
          </div>
          <div className="card-divider"></div>
          <div className="card-bottom">
            <div className="bidders-row-browse">
              <div className="bidders-left">
                <div className="avatar-stack">
                  <div className="avatar av-blue">AS</div>
                  <div className="avatar av-green">PK</div>
                  <div className="avatar av-amber">MF</div>
                  <div className="avatar av-purple">SF</div>
                  <div className="avatar av-more">+3</div>
                </div>
                <div className="bid-meta">
                  <span className="bid-count">7 bids</span>
                  <span className="bid-avg">avg $7.40 / set</span>
                </div>
              </div>
              <div className="timer-browse">
                <Clock size={12} />
                <span>2d 14h left</span>
              </div>
            </div>
            <div className="cta-row">
              <button className="btn-primary-browse" onClick={handleBid}>
                Place bid
              </button>
              <button className="btn-secondary-browse">Details</button>
            </div>
          </div>
        </div>

        <div className="rfq-card-browse">
          <div className="card-top">
            <div className="card-header-browse">
              <div className="status-row-browse">
                <span className="live-dot-browse" style={{background: '#f59e0b'}}></span>
                <span className="status-badge badge-closing">Closing soon</span>
              </div>
              <span className="rfq-id-browse">PRV-2026-00418</span>
            </div>
            <div className="buyer-row">
              <div className="buyer-avatar">SA</div>
              <span className="buyer-name">Sport Arabia · UAE</span>
              <span className="verified"><CheckCircle2 size={12} /></span>
            </div>
            <div className="thumb-strip">
              <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
            </div>
            <div className="card-title-browse">Goalkeeper Gloves — Latex Palm, Wrist Strap, Adult Sizes</div>
            <div className="specs-grid">
              <div className="spec-item">
                <div className="spec-label">Quantity</div>
                <div className="spec-val">1,200 pairs</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">Budget</div>
                <div className="spec-val green">$12 / pair</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">TAT</div>
                <div className="spec-val amber">14 days</div>
              </div>
            </div>
            <div className="tags">
              <span className="tag">Latex</span>
              <span className="tag">Neoprene</span>
              <span className="tag">CIF</span>
              <span className="tag">Dubai port</span>
            </div>
            <div className="demand-bar-wrap">
              <div className="demand-label">
                <span>Manufacturer demand</span>
                <span style={{fontWeight: 500, color: 'var(--color-text-primary)'}}>Very high</span>
              </div>
              <div className="demand-bar"><div className="demand-fill fill-high" style={{width: '94%'}}></div></div>
            </div>
          </div>
          <div className="card-divider"></div>
          <div className="card-bottom">
            <div className="bidders-row-browse">
              <div className="bidders-left">
                <div className="avatar-stack">
                  <div className="avatar av-red">GK</div>
                  <div className="avatar av-blue">AL</div>
                  <div className="avatar av-green">PM</div>
                  <div className="avatar av-amber">SZ</div>
                  <div className="avatar av-purple">KF</div>
                  <div className="avatar av-more">+7</div>
                </div>
                <div className="bid-meta">
                  <span className="bid-count">12 bids</span>
                  <span className="bid-avg">avg $11.20 / pair</span>
                </div>
              </div>
              <div className="timer-browse urgent">
                <Clock size={12} />
                <span>4h 22m left</span>
              </div>
            </div>
            <div className="cta-row">
              <button className="btn-primary-browse" onClick={handleBid}>
                Place bid
              </button>
              <button className="btn-secondary-browse">Details</button>
            </div>
          </div>
        </div>

        <div className="rfq-card-browse">
          <div className="card-top">
            <div className="card-header-browse">
              <div className="status-row-browse">
                <span className="live-dot-browse" style={{background: '#ef4444', animation: 'none'}}></span>
                <span className="status-badge badge-hot">Hot</span>
              </div>
              <span className="rfq-id-browse">PRV-2026-00409</span>
            </div>
            <div className="buyer-row">
              <div className="buyer-avatar">TF</div>
              <span className="buyer-name">TrendForce Berlin · DE</span>
              <span className="verified"><CheckCircle2 size={12} /></span>
              <span className="sample-chip">Sample needed</span>
            </div>
            <div className="thumb-strip">
              <div className="thumb-box fallback-leather"><Briefcase size={18} /></div>
            </div>
            <div className="card-title-browse">Premium Leather Holdall — Full Grain, Metal Zip, Shoulder Strap</div>
            <div className="specs-grid">
              <div className="spec-item">
                <div className="spec-label">Quantity</div>
                <div className="spec-val">300 pcs</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">Budget</div>
                <div className="spec-val green">$45 / pc</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">TAT</div>
                <div className="spec-val">30 days</div>
              </div>
            </div>
            <div className="tags">
              <span className="tag">Full grain leather</span>
              <span className="tag">YKK zip</span>
              <span className="tag">DDP</span>
            </div>
            <div className="demand-bar-wrap">
              <div className="demand-label">
                <span>Manufacturer demand</span>
                <span style={{fontWeight: 500, color: 'var(--color-text-primary)'}}>Medium</span>
              </div>
              <div className="demand-bar"><div className="demand-fill fill-med" style={{width: '54%'}}></div></div>
            </div>
          </div>
          <div className="card-divider"></div>
          <div className="card-bottom">
            <div className="bidders-row-browse">
              <div className="bidders-left">
                <div className="avatar-stack">
                  <div className="avatar av-amber">LG</div>
                  <div className="avatar av-purple">KP</div>
                  <div className="avatar av-blue">MT</div>
                  <div className="avatar av-more">+2</div>
                </div>
                <div className="bid-meta">
                  <span className="bid-count">5 bids</span>
                  <span className="bid-avg">avg $41.80 / pc</span>
                </div>
              </div>
              <div className="timer-browse">
                <Clock size={12} />
                <span>6d 8h left</span>
              </div>
            </div>
            <div className="cta-row">
              <button className="btn-primary-browse" onClick={handleBid}>
                Place bid
              </button>
              <button className="btn-secondary-browse">Details</button>
            </div>
          </div>
        </div>

        <div className="rfq-card-browse">
          <div className="card-top">
            <div className="card-header-browse">
              <div className="status-row-browse">
                <span className="live-dot-browse"></span>
                <span className="status-badge badge-live">Live</span>
              </div>
              <span className="rfq-id-browse">PRV-2026-00397</span>
            </div>
            <div className="buyer-row">
              <div className="buyer-avatar">RK</div>
              <span className="buyer-name">RunKit Sports · US</span>
              <span className="verified"><CheckCircle2 size={12} /></span>
            </div>
            <div className="thumb-strip">
              <div className="thumb-box fallback-apparel"><Shirt size={18} /></div>
            </div>
            <div className="card-title-browse">Compression Running Tights — Women's, 4-way Stretch, Reflective Strip</div>
            <div className="specs-grid">
              <div className="spec-item">
                <div className="spec-label">Quantity</div>
                <div className="spec-val">800 pcs</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">Budget</div>
                <div className="spec-val green">$14 / pc</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">TAT</div>
                <div className="spec-val">28 days</div>
              </div>
            </div>
            <div className="tags">
              <span className="tag">80% Nylon</span>
              <span className="tag">20% Spandex</span>
              <span className="tag">220 GSM</span>
              <span className="tag">FOB</span>
            </div>
            <div className="demand-bar-wrap">
              <div className="demand-label">
                <span>Manufacturer demand</span>
                <span style={{fontWeight: 500, color: 'var(--color-text-primary)'}}>Low</span>
              </div>
              <div className="demand-bar"><div className="demand-fill fill-low" style={{width: '28%'}}></div></div>
            </div>
          </div>
          <div className="card-divider"></div>
          <div className="card-bottom">
            <div className="bidders-row-browse">
              <div className="bidders-left">
                <div className="avatar-stack">
                  <div className="avatar av-green">VN</div>
                  <div className="avatar av-blue">BD</div>
                </div>
                <div className="bid-meta">
                  <span className="bid-count">2 bids</span>
                  <span className="bid-avg">avg $13.50 / pc</span>
                </div>
              </div>
              <div className="timer-browse">
                <Clock size={12} />
                <span>11d 3h left</span>
              </div>
            </div>
            <div className="cta-row">
              <button className="btn-primary-browse" onClick={handleBid}>
                Place bid
              </button>
              <button className="btn-secondary-browse">Details</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
