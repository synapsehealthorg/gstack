"use client"
import React, { useState } from 'react';
import { History, Clock, Eye, Trophy, BadgeCheck, MapPin, Package, ThumbsUp, Shirt, MessageSquare, X, Briefcase } from "lucide-react";

import MarketBrowse from './MarketBrowse';
import MarketOffers from './MarketOffers';

export default function MarketBoardHome() {
  const [selectedRFQ, setSelectedRFQ] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  const rfqData = [
    { id: 'PRV-2026-00431', title: 'Football Jersey Kit — Bids', count: 7 },
    { id: 'PRV-2026-00418', title: 'Goalkeeper Gloves — Bids', count: 12 },
    { id: 'PRV-2026-00409', title: 'Premium Leather Holdall — Bids', count: 5 }
  ];

  return (
    <section className="view-panel active wrap" style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '32px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-background-primary: #ffffff;
          --color-background-secondary: #f8fafc;
          --color-background-info: #eff6ff;
          --color-text-primary: #0f1117;
          --color-text-secondary: #475569;
          --color-text-tertiary: #94a3b8;
          --color-text-info: #3b82f6;
          --color-border-secondary: #cbd5e1;
          --color-border-tertiary: #e2e8f0;
          --color-border-info: #bfdbfe;
          --border-radius-md: 8px;
          --border-radius-lg: 12px;
          --font-sans: ui-sans-serif, system-ui, sans-serif;
          --font-mono: ui-monospace, SFMono-Regular, monospace;
        }
        .wrap { font-family: var(--font-sans); }
        .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .page-title { font-size: 18px; font-weight: 500; color: var(--color-text-primary); }
        .tabs { display: flex; gap: 2px; background: var(--color-background-secondary); padding: 3px; border-radius: var(--border-radius-md); }
        .tab { font-size: 12px; padding: 5px 14px; border-radius: 6px; cursor: pointer; color: var(--color-text-secondary); border: none; background: transparent; }
        .tab.active { background: var(--color-background-primary); color: var(--color-text-primary); font-weight: 500; border: 0.5px solid var(--color-border-tertiary); }
        .top-right { display: flex; align-items: center; gap: 8px; }
        .avatar-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--color-background-info); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; color: var(--color-text-info); cursor: pointer; border: 0.5px solid var(--color-border-tertiary); }
        .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .panel { display: flex; flex-direction: column; gap: 10px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .panel-title { font-size: 13px; font-weight: 500; color: var(--color-text-primary); display: flex; align-items: center; gap: 6px; }
        .count-badge { font-size: 11px; background: var(--color-background-secondary); color: var(--color-text-secondary); padding: 1px 7px; border-radius: 20px; }
        .panel-action { font-size: 11px; color: var(--color-text-info); cursor: pointer; }
        .rfq-mini-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; cursor: pointer; transition: border-color 0.15s; }
        .rfq-mini-card:hover { border-color: var(--color-border-secondary); }
        .rfq-mini-card.selected { border: 1.5px solid var(--color-border-info); }
        .mini-top { padding: 12px 12px 8px; }
        .mini-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; flex-shrink: 0; }
        .status-row { display: flex; align-items: center; gap: 5px; }
        .sbadge { font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 20px; }
        .s-live { background: #dcfce7; color: #15803d; }
        .s-hot { background: #fee2e2; color: #b91c1c; }
        .s-closing { background: #fef9c3; color: #854d0e; }
        .rfq-id { font-size: 10px; font-family: var(--font-mono); color: var(--color-text-tertiary); }
        .mini-title { font-size: 13px; font-weight: 500; color: var(--color-text-primary); line-height: 1.3; margin-bottom: 8px; }
        .mini-specs { display: flex; gap: 6px; margin-bottom: 8px; }
        .mspec { background: var(--color-background-secondary); border-radius: 6px; padding: 4px 7px; flex: 1; }
        .mspec-label { font-size: 9px; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1px; }
        .mspec-val { font-size: 11px; font-weight: 500; color: var(--color-text-primary); }
        .mspec-val.g { color: #15803d; }
        .mini-divider { height: 0.5px; background: var(--color-border-tertiary); margin: 0 12px; }
        .mini-bottom { padding: 8px 12px; }
        .mini-bids-row { display: flex; align-items: center; justify-content: space-between; }
        .avatar-stack { display: flex; }
        .av { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--color-background-primary); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 500; margin-left: -5px; flex-shrink: 0; }
        .av:first-child { margin-left: 0; }
        .av-b { background: #dbeafe; color: #1d4ed8; }
        .av-g { background: #dcfce7; color: #15803d; }
        .av-a { background: #fef3c7; color: #92400e; }
        .av-p { background: #ede9fe; color: #6d28d9; }
        .av-r { background: #fee2e2; color: #b91c1c; }
        .av-m { background: var(--color-background-secondary); color: var(--color-text-secondary); }

        .thumb-strip { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; margin-top: 8px; }
        .thumb-box { width: 36px; height: 36px; border-radius: 6px; border: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-more { font-size: 11px; font-weight: 500; color: var(--color-text-secondary); background: var(--color-background-secondary); border-radius: 12px; padding: 4px 8px; border: 0.5px solid var(--color-border-tertiary); margin-left: 2px; }
        .fallback-sportswear { background: #eff6ff; color: #2563eb; }
        .fallback-apparel { background: #ccfbf1; color: #0d9488; }
        .fallback-leather { background: #fef3c7; color: #d97706; }

        .bids-meta { display: flex; flex-direction: column; gap: 1px; margin-left: 8px; }
        .bids-count { font-size: 11px; font-weight: 500; color: var(--color-text-primary); }
        .bids-avg { font-size: 10px; color: var(--color-text-secondary); }
        .timer { font-size: 10px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 3px; }
        .timer.urgent { color: #b91c1c; }
        .timer i { font-size: 11px; }
        .view-bids-btn { font-size: 10px; color: var(--color-text-info); border: 0.5px solid var(--color-border-info); border-radius: 6px; padding: 3px 8px; background: transparent; cursor: pointer; }
        .selected-label { font-size: 11px; color: var(--color-text-info); font-weight: 500; display: flex; align-items: center; gap: 4px; }
        .bid-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; }
        .bid-card.top-bid { border: 1.5px solid #22c55e; }
        .top-bid-label { background: #dcfce7; padding: 4px 12px; font-size: 10px; font-weight: 500; color: #15803d; display: flex; align-items: center; gap: 4px; }
        .bid-inner { padding: 12px; }
        .bid-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .mfr-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; flex-shrink: 0; }
        .mfr-info { flex: 1; min-width: 0; }
        .mfr-name-row { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }
        .mfr-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
        .verified-icon { font-size: 12px; color: #2563eb; }
        .mfr-location { font-size: 11px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 2px; }
        .bid-price { text-align: right; flex-shrink: 0; }
        .price-val { font-size: 16px; font-weight: 500; color: #15803d; }
        .price-label { font-size: 10px; color: var(--color-text-secondary); }
        .price-delta { font-size: 10px; color: #15803d; font-weight: 500; }
        .stats-row { display: flex; gap: 6px; margin-bottom: 10px; }
        .stat-chip { flex: 1; background: var(--color-background-secondary); border-radius: 6px; padding: 5px 7px; text-align: center; }
        .stat-val { font-size: 12px; font-weight: 500; color: var(--color-text-primary); display: flex; align-items: center; justify-content: center; gap: 3px; }
        .stat-label { font-size: 9px; color: var(--color-text-tertiary); margin-top: 1px; }
        .stars { color: #f59e0b; font-size: 11px; letter-spacing: -1px; }
        .rating-num { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .message-box { background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 8px 10px; margin-bottom: 10px; }
        .message-label { font-size: 10px; color: var(--color-text-tertiary); margin-bottom: 3px; }
        .message-text { font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; }
        .tat-row { display: flex; gap: 6px; margin-bottom: 10px; }
        .tat-item { flex: 1; background: var(--color-background-secondary); border-radius: 6px; padding: 5px 8px; }
        .tat-label { font-size: 9px; color: var(--color-text-tertiary); margin-bottom: 2px; }
        .tat-val { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .tat-val.fast { color: #15803d; }
        .portfolio-row { display: flex; gap: 5px; margin-bottom: 10px; }
        .port-thumb { width: 44px; height: 44px; border-radius: 6px; background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; justify-content: center; color: var(--color-text-tertiary); font-size: 14px; }
        .port-more { font-size: 10px; color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center; flex: 1; }
        .bid-actions { display: flex; gap: 6px; }
        .btn-accept { flex: 1; background: var(--color-text-primary); color: var(--color-background-primary); border: none; border-radius: var(--border-radius-md); font-size: 12px; font-weight: 500; padding: 7px; cursor: pointer; }
        .btn-msg { background: transparent; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); font-size: 12px; color: var(--color-text-secondary); padding: 7px 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .btn-pass { background: transparent; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); font-size: 12px; color: var(--color-text-secondary); padding: 7px 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; }
        .profile-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 14px; margin-bottom: 10px; }
        .profile-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .profile-av { width: 40px; height: 40px; border-radius: 50%; background: var(--color-background-info); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; color: var(--color-text-info); }
        .profile-name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
        .profile-sub { font-size: 11px; color: var(--color-text-secondary); }
        .profile-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 12px; }
        .pstat { text-align: center; background: var(--color-background-secondary); border-radius: 6px; padding: 6px; }
        .pstat-val { font-size: 15px; font-weight: 500; color: var(--color-text-primary); }
        .pstat-label { font-size: 9px; color: var(--color-text-tertiary); margin-top: 1px; }
        .history-title { font-size: 11px; font-weight: 500; color: var(--color-text-primary); margin-bottom: 6px; }
        .history-item { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .history-item:last-child { border-bottom: none; }
        .history-name { font-size: 11px; color: var(--color-text-primary); }
        .history-meta { font-size: 10px; color: var(--color-text-secondary); }
        .history-status { font-size: 10px; font-weight: 500; color: #15803d; }
        .empty-bids { text-align: center; padding: 2rem 1rem; color: var(--color-text-tertiary); font-size: 13px; }
        .section-divider { height: 0.5px; background: var(--color-border-tertiary); margin: 4px 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}} />

      <h2 className="sr-only">proov Exchange — buyer view showing live RFQs, incoming bids with manufacturer details, ratings and order history</h2>

      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="page-title">Exchange</span>
          <div className="tabs">
            <button className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>Browse</button>
            <button className={`tab ${activeTab === 'my-rfqs' ? 'active' : ''}`} onClick={() => setActiveTab('my-rfqs')}>My RFQs</button>
            <button className={`tab ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>Offers</button>
          </div>
        </div>
        <div className="top-right">
          <button 
            onClick={() => setShowProfile(true)} 
            style={{ fontSize: '12px', color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '5px 10px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <History size={14} /> Production history
          </button>
          <div className="avatar-btn">JM</div>
        </div>
      </div>

      <div className="layout" id="main-layout" style={{ display: activeTab === 'my-rfqs' ? 'grid' : 'none' }}>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">
              My live RFQs
              <span className="count-badge">3 active</span>
            </span>
            <span className="panel-action">+ New RFQ</span>
          </div>

          {/* RFQ 1 */}
          <div className={`rfq-mini-card ${selectedRFQ === 0 ? 'selected' : ''}`} onClick={() => setSelectedRFQ(0)}>
            <div className="mini-top">
              <div className="mini-header">
                <div className="status-row"><span className="live-dot"></span><span className="sbadge s-live">Live</span></div>
                <span className="rfq-id">PRV-2026-00431</span>
              </div>
              <div className="thumb-strip">
                <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
                <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
                <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
                <div className="thumb-more">+2 products</div>
              </div>
              <div className="mini-title">Football Jersey Kit — Full Team Set with Sublimation Print</div>
              <div className="mini-specs">
                <div className="mspec"><div className="mspec-label">Qty</div><div className="mspec-val">500 sets</div></div>
                <div className="mspec"><div className="mspec-label">Budget</div><div className="mspec-val g">$8/set</div></div>
                <div className="mspec"><div className="mspec-label">TAT</div><div className="mspec-val">21d</div></div>
              </div>
            </div>
            <div className="mini-divider"></div>
            <div className="mini-bottom">
              <div className="mini-bids-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="avatar-stack">
                    <div className="av av-b">AS</div><div className="av av-g">PK</div><div className="av av-a">MF</div><div className="av av-p">SF</div><div className="av av-m">+3</div>
                  </div>
                  <div className="bids-meta"><span className="bids-count">7 bids</span><span className="bids-avg">avg $7.40/set</span></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="timer"><Clock size={11} /> 2d 14h</div>
                  {selectedRFQ === 0 && <span className="selected-label"><Eye size={11} /> Viewing</span>}
                </div>
              </div>
            </div>
          </div>

          {/* RFQ 2 */}
          <div className={`rfq-mini-card ${selectedRFQ === 1 ? 'selected' : ''}`} onClick={() => setSelectedRFQ(1)}>
            <div className="mini-top">
              <div className="mini-header">
                <div className="status-row"><span className="live-dot" style={{ background: '#f59e0b' }}></span><span className="sbadge s-closing">Closing</span></div>
                <span className="rfq-id">PRV-2026-00418</span>
              </div>
              <div className="thumb-strip">
                <div className="thumb-box fallback-sportswear"><Shirt size={18} /></div>
              </div>
              <div className="mini-title">Goalkeeper Gloves — Latex Palm, Wrist Strap</div>
              <div className="mini-specs">
                <div className="mspec"><div className="mspec-label">Qty</div><div className="mspec-val">1,200 pairs</div></div>
                <div className="mspec"><div className="mspec-label">Budget</div><div className="mspec-val g">$12/pair</div></div>
                <div className="mspec"><div className="mspec-label">TAT</div><div className="mspec-val">14d</div></div>
              </div>
            </div>
            <div className="mini-divider"></div>
            <div className="mini-bottom">
              <div className="mini-bids-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="avatar-stack">
                    <div className="av av-r">GK</div><div className="av av-b">AL</div><div className="av av-g">PM</div><div className="av av-m">+9</div>
                  </div>
                  <div className="bids-meta"><span className="bids-count">12 bids</span><span className="bids-avg">avg $11.20/pair</span></div>
                </div>
                <div className="timer urgent"><Clock size={11} /> 4h 22m</div>
              </div>
            </div>
          </div>

          {/* RFQ 3 */}
          <div className={`rfq-mini-card ${selectedRFQ === 2 ? 'selected' : ''}`} onClick={() => setSelectedRFQ(2)}>
            <div className="mini-top">
              <div className="mini-header">
                <div className="status-row"><span className="live-dot"></span><span className="sbadge s-live">Live</span></div>
                <span className="rfq-id">PRV-2026-00409</span>
              </div>
              <div className="thumb-strip">
                <div className="thumb-box fallback-leather"><Briefcase size={18} /></div>
              </div>
              <div className="mini-title">Premium Leather Holdall — Full Grain, Metal Zip</div>
              <div className="mini-specs">
                <div className="mspec"><div className="mspec-label">Qty</div><div className="mspec-val">300 pcs</div></div>
                <div className="mspec"><div className="mspec-label">Budget</div><div className="mspec-val g">$45/pc</div></div>
                <div className="mspec"><div className="mspec-label">TAT</div><div className="mspec-val">30d</div></div>
              </div>
            </div>
            <div className="mini-divider"></div>
            <div className="mini-bottom">
              <div className="mini-bids-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="avatar-stack">
                    <div className="av av-a">LG</div><div className="av av-p">KP</div><div className="av av-b">MT</div><div className="av av-m">+2</div>
                  </div>
                  <div className="bids-meta"><span className="bids-count">5 bids</span><span className="bids-avg">avg $41.80/pc</span></div>
                </div>
                <div className="timer"><Clock size={11} /> 6d 8h</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel" id="right-panel">
          <div className="panel-header">
            <span className="panel-title">
              Bids on {rfqData[selectedRFQ].id}
              <span className="count-badge">{rfqData[selectedRFQ].count} bids</span>
            </span>
            <select style={{ fontSize: '11px', color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '6px', padding: '3px 6px', background: 'var(--color-background-primary)' }}>
              <option>Best price</option>
              <option>Fastest TAT</option>
              <option>Highest rated</option>
            </select>
          </div>

          <div className="bid-card top-bid">
            <div className="top-bid-label">
              <Trophy size={11} /> Best bid — 8% below your target
            </div>
            <div className="bid-inner">
              <div className="bid-header">
                <div className="mfr-avatar av-b" style={{ width: '36px', height: '36px', borderRadius: '50%', fontSize: '13px', fontWeight: 500 }}>AS</div>
                <div className="mfr-info">
                  <div className="mfr-name-row">
                    <span className="mfr-name">Ali Sports Mfg.</span>
                    <BadgeCheck size={14} className="verified-icon" />
                  </div>
                  <span className="mfr-location">
                    <MapPin size={10} /> Sialkot, Pakistan
                  </span>
                </div>
                <div className="bid-price">
                  <div className="price-val">$7.35</div>
                  <div className="price-label">per set</div>
                  <div className="price-delta">↓ 8% below target</div>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-chip">
                  <div className="stat-val"><span className="stars">★★★★★</span></div>
                  <div className="stat-label">4.9 rating</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-val"><Package size={12} color="var(--color-text-secondary)" /> 214</div>
                  <div className="stat-label">orders done</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-val"><Clock size={12} color="#15803d" /> 17d</div>
                  <div className="stat-label">avg TAT</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-val"><ThumbsUp size={12} color="#15803d" /> 98%</div>
                  <div className="stat-label">on time</div>
                </div>
              </div>
              <div className="tat-row">
                <div className="tat-item">
                  <div className="tat-label">Offered TAT</div>
                  <div className="tat-val fast">18 days <span style={{ fontSize: '10px', color: '#15803d' }}>3d faster</span></div>
                </div>
                <div className="tat-item">
                  <div className="tat-label">Sample available</div>
                  <div className="tat-val">Yes — 5 days</div>
                </div>
                <div className="tat-item">
                  <div className="tat-label">Min order</div>
                  <div className="tat-val">100 sets</div>
                </div>
              </div>
              <div className="message-box">
                <div className="message-label">Message from manufacturer</div>
                <div className="message-text">"We have extensive experience with sublimation kits for European clubs. Can provide 3 referee samples within 5 days. Our Sialkot facility is FIFA licensed."</div>
              </div>
              <div className="portfolio-row">
                <div className="port-thumb"><Shirt size={16} /></div>
                <div className="port-thumb"><Shirt size={16} /></div>
                <div className="port-thumb"><Shirt size={16} /></div>
                <span className="port-more">+11 portfolio items</span>
              </div>
              <div className="bid-actions">
                <button className="btn-accept">Accept bid</button>
                <button className="btn-msg"><MessageSquare size={12} /> Message</button>
                <button className="btn-pass"><X size={12} /> Pass</button>
              </div>
            </div>
          </div>

          <div className="bid-card">
            <div className="bid-inner">
              <div className="bid-header">
                <div className="mfr-avatar av-g" style={{ width: '36px', height: '36px', borderRadius: '50%', fontSize: '13px', fontWeight: 500 }}>PK</div>
                <div className="mfr-info">
                  <div className="mfr-name-row">
                    <span className="mfr-name">ProKit Sportswear</span>
                    <BadgeCheck size={14} className="verified-icon" />
                  </div>
                  <span className="mfr-location">
                    <MapPin size={10} /> Lahore, Pakistan
                  </span>
                </div>
                <div className="bid-price">
                  <div className="price-val" style={{ fontSize: '14px' }}>$7.80</div>
                  <div className="price-label">per set</div>
                  <div className="price-delta" style={{ color: '#92400e' }}>↓ 2.5% below target</div>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-chip">
                  <div className="stat-val"><span className="stars">★★★★</span><span className="stars" style={{ color: 'var(--color-text-tertiary)' }}>★</span></div>
                  <div className="stat-label">4.6 rating</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-val"><Package size={12} color="var(--color-text-secondary)" /> 87</div>
                  <div className="stat-label">orders done</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-val"><Clock size={12} color="#92400e" /> 23d</div>
                  <div className="stat-label">avg TAT</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-val"><ThumbsUp size={12} color="#15803d" /> 91%</div>
                  <div className="stat-label">on time</div>
                </div>
              </div>
              <div className="message-box">
                <div className="message-label">Message from manufacturer</div>
                <div className="message-text">"Specialise in sublimation jerseys for UK and European markets. Can match Pantone exactly. References available on request."</div>
              </div>
              <div className="bid-actions">
                <button className="btn-accept">Accept bid</button>
                <button className="btn-msg"><MessageSquare size={12} /> Message</button>
                <button className="btn-pass"><X size={12} /> Pass</button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <button style={{ fontSize: '12px', color: 'var(--color-text-info)', background: 'transparent', border: '0.5px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', padding: '6px 16px', cursor: 'pointer' }}>View all {rfqData[selectedRFQ].count} bids</button>
          </div>
        </div>
      </div>

      {activeTab === 'browse' && (
        <MarketBrowse />
      )}

      {activeTab === 'offers' && (
        <MarketOffers />
      )}

      <div id="profile-panel" style={{ display: showProfile ? 'block' : 'none', marginTop: '14px' }}>
        <div className="panel-header" style={{ marginBottom: '10px' }}>
          <span className="panel-title">Production history</span>
          <span className="panel-action" onClick={() => setShowProfile(false)} style={{ cursor: 'pointer' }}>Close</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-av">JM</div>
              <div>
                <div className="profile-name">James Mitchell</div>
                <div className="profile-sub">RunKit Sports · UK</div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="pstat"><div className="pstat-val">24</div><div className="pstat-label">Orders placed</div></div>
              <div className="pstat"><div className="pstat-val">$142k</div><div className="pstat-label">Total GMV</div></div>
              <div className="pstat"><div className="pstat-val">96%</div><div className="pstat-label">Completion</div></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}><span>Avg order value</span><span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>$5,917</span></div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}><span>Favourite region</span><span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Sialkot, PK</span></div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}><span>Member since</span><span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Jan 2026</span></div>
            </div>
          </div>
          <div className="profile-card">
            <div className="history-title">Recent productions</div>
            <div className="history-item">
              <div><div className="history-name">Football Jersey Kit × 500</div><div className="history-meta">Ali Sports Mfg. · Sialkot · 21 days</div></div>
              <span className="history-status">Completed</span>
            </div>
            <div className="history-item">
              <div><div className="history-name">Training Shorts × 300</div><div className="history-meta">ProKit Sportswear · Lahore · 18 days</div></div>
              <span className="history-status">Completed</span>
            </div>
            <div className="history-item">
              <div><div className="history-name">Goalkeeper Gloves × 200</div><div className="history-meta">Sialkot Gloves Co. · Sialkot · 14 days</div></div>
              <span className="history-status">Completed</span>
            </div>
            <div className="history-item">
              <div><div className="history-name">Leather Holdall × 150</div><div className="history-meta">Karachi Leather Works · Karachi · 28 days</div></div>
              <span className="history-status" style={{ color: '#92400e' }}>Disputed</span>
            </div>
            <div className="history-item">
              <div><div className="history-name">Compression Tights × 800</div><div className="history-meta">BD Sportswear · Dhaka · 24 days</div></div>
              <span className="history-status">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
