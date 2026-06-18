import React, { useState } from 'react';
import { Trophy, Clock, Check, TrendingUp } from 'lucide-react';

const offersData = [
  {
    title:'Football Jersey Kit — Full Team Set',
    rfq:'PRV-2026-00431 · Sportswear',
    status:'Countered',
    statusClass:'sb-countered',
    bid:'$7.35/set', target:'$8.00/set', tat:'18 days',
    buyer:'James Mitchell, UK', buyerAv:'JM', time:'Countered 2h ago',
    detailHtml: `<div class="dp-header"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div class="dp-title">Football Jersey Kit — Full Team Set</div><span class="status-badge sb-countered" style="font-size:11px;padding:3px 10px">Countered</span></div><div class="dp-sub">PRV-2026-00431 · Sportswear · James Mitchell, UK</div><div class="dp-status-row"><i class="ti ti-clock" style="font-size:13px;color:var(--color-text-secondary)" aria-hidden="true"></i><span style="font-size:12px;color:var(--color-text-secondary)">Buyer countered your offer</span><span style="font-size:11px;color:var(--color-text-tertiary);margin-left:auto">2 hours ago</span></div></div><div class="dp-section"><div class="dp-section-title">Your offer</div><div class="dp-row"><span class="dp-label">Bid price</span><span class="dp-val g">$7.35 per set</span></div><div class="dp-row"><span class="dp-label">Total value</span><span class="dp-val g">$3,675</span></div><div class="dp-row"><span class="dp-label">TAT offered</span><span class="dp-val">18 days</span></div><div class="message-preview">"We have extensive experience with sublimation kits for European clubs. FIFA licensed facility. Can provide 3 samples within 5 days."</div></div><div class="dp-section"><div class="dp-section-title">Buyer counter offer</div><div class="counter-box"><div class="counter-title"><i class="ti ti-arrows-exchange" style="font-size:12px" aria-hidden="true"></i> Counter received from James Mitchell</div><div class="counter-text">Buyer wants <strong>$7.60/set</strong> and TAT reduced to <strong>16 days</strong>. Ready to accept immediately if you agree.</div></div></div><div class="dp-section"><div class="dp-section-title">Your position</div><div class="competition-bar"><div class="comp-label"><span>Lowest</span><span>Your bid $7.35</span><span>Highest</span></div><div class="bar-track"><div class="bar-fill" style="width:100%"></div><div class="bar-marker" style="left:22%"></div></div></div><div class="position-chips"><span class="pos-chip">1st $7.10</span><span class="pos-chip you">2nd — you $7.35</span><span class="pos-chip">3rd $7.80</span><span class="pos-chip">+4 more</span></div></div><div class="dp-actions"><button class="btn-full-purple"><i class="ti ti-check" style="font-size:12px" aria-hidden="true"></i> Accept counter</button><button class="btn-full-primary">Send revised bid</button><button class="btn-full">Message buyer</button></div>`
  },
  {
    title:'Goalkeeper Gloves — Latex Palm',
    rfq:'PRV-2026-00418 · Sportswear',
    status:'Pending',statusClass:'sb-pending',
    bid:'$11.20/pair',target:'$12.00/pair',tat:'13 days',
    buyer:'Sport Arabia, UAE',buyerAv:'SA',time:'4h 22m left',
    detailHtml:`<div class="dp-header"><div class="dp-title">Goalkeeper Gloves — Latex Palm, Wrist Strap</div><div class="dp-sub">PRV-2026-00418 · Sportswear · Sport Arabia, UAE</div><div class="dp-status-row"><span class="status-badge sb-pending">Pending</span><span style="font-size:11px;color:#b91c1c;margin-left:auto;font-weight:500">Closes in 4h 22m</span></div></div><div class="dp-section"><div class="dp-section-title">Your offer</div><div class="dp-row"><span class="dp-label">Bid price</span><span class="dp-val g">$11.20 per pair</span></div><div class="dp-row"><span class="dp-label">Total value</span><span class="dp-val g">$13,440</span></div><div class="dp-row"><span class="dp-label">TAT offered</span><span class="dp-val a">13 days</span></div><div class="message-preview">"Specialising in latex palm gloves for professional goalkeepers. Finger protection and roll finger cuts available."</div></div><div class="dp-section"><div class="dp-section-title">Your position in 12 bids</div><div class="position-chips"><span class="pos-chip">1st $10.80</span><span class="pos-chip">2nd $11.00</span><span class="pos-chip you">3rd — you $11.20</span><span class="pos-chip">+9 more</span></div></div><div class="dp-section"><div class="dp-section-title">RFQ details</div><div class="dp-row"><span class="dp-label">Quantity</span><span class="dp-val">1,200 pairs</span></div><div class="dp-row"><span class="dp-label">Buyer target</span><span class="dp-val">$12.00/pair</span></div><div class="dp-row"><span class="dp-label">Destination</span><span class="dp-val">Dubai — CIF</span></div></div><div class="dp-actions"><button class="btn-full-primary">Edit bid</button><button class="btn-full">Message buyer</button><button class="btn-full" style="color:#b91c1c;border-color:#fca5a5">Withdraw</button></div>`
  },
  {
    title:'Training Shorts × 300',
    rfq:'PRV-2026-00391 · Sportswear',
    status:'Won',statusClass:'sb-won',
    bid:'$4.20/pc',target:'$1,260 total',tat:'16 days',
    buyer:'RunKit Sports, US',buyerAv:'RK',time:'Won 3 days ago',
    detailHtml:`<div class="dp-header"><div class="dp-title">Training Shorts × 300 — Mesh Lined</div><div class="dp-sub">PRV-2026-00391 · Sportswear · RunKit Sports, US</div><div class="dp-status-row"><span class="status-badge sb-won"><i class="ti ti-trophy" style="font-size:11px" aria-hidden="true"></i> Won</span><span style="font-size:11px;color:var(--color-text-secondary);margin-left:auto">Order confirmed — ORD-2026-00091</span></div></div><div class="dp-section"><div class="dp-section-title">Winning offer</div><div class="dp-row"><span class="dp-label">Winning bid</span><span class="dp-val g">$4.20 per piece</span></div><div class="dp-row"><span class="dp-label">Order value</span><span class="dp-val g">$1,260</span></div><div class="dp-row"><span class="dp-label">TAT agreed</span><span class="dp-val">16 days</span></div><div class="dp-row"><span class="dp-label">Deposit received</span><span class="dp-val g">$630 in escrow</span></div></div><div class="dp-section"><div class="dp-section-title">Why you won</div><div style="font-size:12px;color:var(--color-text-secondary);line-height:1.6;padding:4px 0">You had the fastest TAT at 16 days against an average of 22 days. Your rating of 4.9 was the highest among all bidders. Buyer noted your previous sportswear portfolio as a deciding factor.</div></div><div class="dp-actions"><button class="btn-full-primary">Go to order</button><button class="btn-full">View order details</button></div>`
  },
  {
    title:'Premium Leather Holdall — Full Grain',
    rfq:'PRV-2026-00409 · Leather goods',
    status:'Not selected',statusClass:'sb-lost',
    bid:'$43.00/pc',target:'Won at $39.50',tat:'32 days',
    buyer:'TrendForce, DE',buyerAv:'TF',time:'Closed 1 day ago',
    detailHtml:`<div class="dp-header"><div class="dp-title">Premium Leather Holdall — Full Grain, Metal Zip</div><div class="dp-sub">PRV-2026-00409 · Leather goods · TrendForce, DE</div><div class="dp-status-row"><span class="status-badge sb-lost">Not selected</span><span style="font-size:11px;color:var(--color-text-tertiary);margin-left:auto">Closed June 14, 2026</span></div></div><div class="dp-section"><div class="dp-section-title">Your offer</div><div class="dp-row"><span class="dp-label">Your bid</span><span class="dp-val">$43.00 per piece</span></div><div class="dp-row"><span class="dp-label">Your TAT</span><span class="dp-val">32 days</span></div><div class="dp-row"><span class="dp-label">Winning bid</span><span class="dp-val g">$39.50 per piece</span></div><div class="dp-row"><span class="dp-label">Winning TAT</span><span class="dp-val g">26 days</span></div></div><div class="dp-section"><div class="dp-section-title">Why you were not selected</div><div style="font-size:12px;color:var(--color-text-secondary);line-height:1.6;padding:4px 0">Your price was <strong style="color:var(--color-text-primary)">8.9% above</strong> the winning bid and your TAT was <strong style="color:var(--color-text-primary)">6 days slower</strong>. The winning manufacturer had 3 completed leather holdall orders on proov which gave the buyer extra confidence.</div></div><div class="dp-section"><div class="dp-section-title">Improve for next time</div><div style="font-size:12px;color:var(--color-text-secondary);line-height:1.5">Add completed leather goods orders to your portfolio. Consider pricing between $38–$41 for full grain holdalls at this quantity.</div></div><div class="dp-actions"><button class="btn-full-primary">Find similar RFQs</button><button class="btn-full">View winning bid</button></div>`
  },
  {
    title:'Compression Running Tights',
    rfq:'PRV-2026-00397 · Apparel',
    status:'Withdrawn',statusClass:'sb-withdrawn',
    bid:'$13.50/pc',target:'—',tat:'24 days',
    buyer:'RunKit Sports, US',buyerAv:'RK',time:'Withdrawn 5 days ago',
    detailHtml:`<div class="dp-header"><div class="dp-title">Compression Running Tights — Women's</div><div class="dp-sub">PRV-2026-00397 · Apparel · RunKit Sports, US</div><div class="dp-status-row"><span class="status-badge sb-withdrawn">Withdrawn</span><span style="font-size:11px;color:var(--color-text-tertiary);margin-left:auto">June 10, 2026</span></div></div><div class="dp-section"><div class="dp-section-title">Withdrawn offer</div><div class="dp-row"><span class="dp-label">Your bid</span><span class="dp-val" style="opacity:0.6">$13.50 per piece</span></div><div class="dp-row"><span class="dp-label">Reason</span><span class="dp-val">Capacity full</span></div><div class="dp-row"><span class="dp-label">Withdrawn on</span><span class="dp-val">June 10, 2026</span></div></div><div class="dp-section"><div class="dp-section-title">RFQ still active</div><div style="font-size:12px;color:var(--color-text-secondary);line-height:1.5">This RFQ is still open with 6 days remaining. If your capacity opens up you can re-submit a bid.</div></div><div class="dp-actions"><button class="btn-full-primary">Re-submit bid</button><button class="btn-full">View RFQ</button></div>`
  }
];

export default function MarketOffers() {
  const [selectedOffer, setSelectedOffer] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="offers-wrap">
      <style dangerouslySetInnerHTML={{__html: `
        .offers-wrap { padding: 1rem 0; font-family: var(--font-sans); }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 1.25rem; }
        .stat-card { background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 12px 14px; }
        .stat-label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; }
        .stat-val { font-size: 22px; font-weight: 500; color: var(--color-text-primary); }
        .stat-sub { font-size: 11px; color: var(--color-text-secondary); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
        .stat-sub.up { color: #15803d; }
        .stat-sub.down { color: #b91c1c; }
        .filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
        .filter-pills { display: flex; gap: 5px; flex: 1; flex-wrap: wrap; }
        .pill { font-size: 12px; padding: 4px 12px; border-radius: 20px; border: 0.5px solid var(--color-border-secondary); color: var(--color-text-secondary); cursor: pointer; background: var(--color-background-primary); }
        .pill.active { background: var(--color-text-primary); color: var(--color-background-primary); border-color: var(--color-text-primary); }
        .pill.pending { background: #fef9c3; color: #854f0b; border-color: #fbbf24; }
        .pill.won { background: #dcfce7; color: #15803d; border-color: #86efac; }
        .pill.lost { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
        .pill.withdrawn { background: var(--color-background-secondary); color: var(--color-text-tertiary); border-color: var(--color-border-tertiary); }
        .layout-offers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .offers-list { display: flex; flex-direction: column; gap: 8px; }
        .offer-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; cursor: pointer; transition: border-color 0.15s; }
        .offer-card:hover { border-color: var(--color-border-secondary); }
        .offer-card.selected { border: 1.5px solid var(--color-border-info); }
        .offer-card.won-card { border-left: 3px solid #22c55e; border-radius: var(--border-radius-lg); }
        .offer-card.lost-card { border-left: 3px solid #f87171; border-radius: var(--border-radius-lg); }
        .offer-card.pending-card { border-left: 3px solid #fbbf24; border-radius: var(--border-radius-lg); }
        .offer-card.withdrawn-card { border-left: 3px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); opacity: 0.7; }
        .oc-inner { padding: 11px 12px; }
        .oc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
        .oc-title { font-size: 13px; font-weight: 500; color: var(--color-text-primary); line-height: 1.3; }
        .status-badge { font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; margin-left: 8px; }
        .sb-pending { background: #fef9c3; color: #854f0b; }
        .sb-won { background: #dcfce7; color: #15803d; display: flex; align-items: center; gap: 4px; }
        .sb-lost { background: #fee2e2; color: #b91c1c; }
        .sb-withdrawn { background: var(--color-background-secondary); color: var(--color-text-tertiary); }
        .sb-countered { background: #ede9fe; color: #6d28d9; }
        .oc-meta { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
        .oc-specs { display: flex; gap: 6px; margin-bottom: 8px; }
        .oc-spec { background: var(--color-background-secondary); border-radius: 6px; padding: 4px 7px; flex: 1; }
        .oc-spec-label { font-size: 9px; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1px; }
        .oc-spec-val { font-size: 11px; font-weight: 500; color: var(--color-text-primary); }
        .oc-spec-val.g { color: #15803d; }
        .oc-spec-val.a { color: #92400e; }
        .oc-footer { display: flex; align-items: center; justify-content: space-between; }
        .oc-buyer { font-size: 11px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; }
        .buyer-av { width: 16px; height: 16px; border-radius: 50%; background: var(--color-background-info); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 500; color: var(--color-text-info); flex-shrink: 0; }
        .oc-time { font-size: 11px; color: var(--color-text-tertiary); }
        .oc-divider { height: 0.5px; background: var(--color-border-tertiary); margin: 0 12px; }
        .oc-actions { padding: 8px 12px; display: flex; gap: 6px; }
        .btn-sm { font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: 0.5px solid var(--color-border-secondary); background: transparent; color: var(--color-text-secondary); }
        .btn-sm-primary { font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: none; background: var(--color-text-primary); color: var(--color-background-primary); }
        .btn-sm-danger { font-size: 11px; padding: 4px 10px; border-radius: 6px; cursor: pointer; border: 0.5px solid #fca5a5; background: transparent; color: #b91c1c; }
        .detail-panel { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; }
        .dp-header { padding: 14px; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .dp-title { font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin-bottom: 4px; }
        .dp-sub { font-size: 12px; color: var(--color-text-secondary); }
        .dp-status-row { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
        .dp-section { padding: 12px 14px; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .dp-section:last-child { border-bottom: none; }
        .dp-section-title { font-size: 10px; font-weight: 500; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .dp-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; }
        .dp-label { font-size: 12px; color: var(--color-text-secondary); }
        .dp-val { font-size: 12px; font-weight: 500; color: var(--color-text-primary); }
        .dp-val.g { color: #15803d; }
        .dp-val.info { color: var(--color-text-info); }
        .dp-val.a { color: #92400e; }
        .competition-bar { margin-top: 8px; }
        .comp-label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between; }
        .bar-track { height: 6px; background: var(--color-background-secondary); border-radius: 3px; overflow: hidden; position: relative; }
        .bar-fill { height: 100%; border-radius: 3px; background: #22c55e; }
        .bar-marker { position: absolute; top: -2px; width: 2px; height: 10px; background: var(--color-text-primary); border-radius: 1px; }
        .position-chips { display: flex; gap: 5px; margin-top: 8px; flex-wrap: wrap; }
        .pos-chip { font-size: 11px; padding: 3px 8px; border-radius: 20px; border: 0.5px solid var(--color-border-tertiary); color: var(--color-text-secondary); }
        .pos-chip.you { background: var(--color-text-primary); color: var(--color-background-primary); border-color: var(--color-text-primary); }
        .message-preview { background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 8px 10px; font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; margin-top: 6px; font-style: italic; }
        .counter-box { background: #f5f3ff; border: 0.5px solid #c4b5fd; border-radius: var(--border-radius-md); padding: 10px 12px; margin-top: 6px; }
        .counter-title { font-size: 11px; font-weight: 500; color: #6d28d9; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
        .counter-text { font-size: 12px; color: #4c1d95; line-height: 1.5; }
        .dp-actions { padding: 12px 14px; display: flex; gap: 6px; flex-wrap: wrap; }
        .btn-full { flex: 1; font-size: 12px; font-weight: 500; padding: 7px; border-radius: var(--border-radius-md); cursor: pointer; text-align: center; border: 0.5px solid var(--color-border-secondary); background: transparent; color: var(--color-text-primary); }
        .btn-full-primary { flex: 1; font-size: 12px; font-weight: 500; padding: 7px; border-radius: var(--border-radius-md); cursor: pointer; text-align: center; border: none; background: var(--color-text-primary); color: var(--color-background-primary); }
        .btn-full-purple { flex: 1; font-size: 12px; font-weight: 500; padding: 7px; border-radius: var(--border-radius-md); cursor: pointer; text-align: center; border: none; background: #6d28d9; color: #fff; }
      `}} />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total offers made</div>
          <div className="stat-val">24</div>
          <div className="stat-sub">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win rate</div>
          <div className="stat-val">38%</div>
          <div className="stat-sub up"><TrendingUp size={11} /> Up 6% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue won</div>
          <div className="stat-val">$42k</div>
          <div className="stat-sub up"><TrendingUp size={11} /> $8k more than last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg response time</div>
          <div className="stat-val">1.4h</div>
          <div className="stat-sub">Faster than 82% of manufacturers</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-pills">
          <span className={`pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All <span style={{opacity: 0.6}}>24</span></span>
          <span className={`pill pending ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => setActiveFilter('pending')}>Pending <span style={{opacity: 0.7}}>8</span></span>
          <span className={`pill ${activeFilter === 'countered' ? 'active' : ''}`} style={{background: activeFilter === 'countered' ? '#6d28d9' : '#ede9fe', color: activeFilter === 'countered' ? '#fff' : '#6d28d9', borderColor: '#c4b5fd'}} onClick={() => setActiveFilter('countered')}>Countered <span style={{opacity: 0.7}}>2</span></span>
          <span className={`pill won ${activeFilter === 'won' ? 'active' : ''}`} onClick={() => setActiveFilter('won')}>Won <span style={{opacity: 0.7}}>9</span></span>
          <span className={`pill lost ${activeFilter === 'lost' ? 'active' : ''}`} onClick={() => setActiveFilter('lost')}>Lost <span style={{opacity: 0.7}}>4</span></span>
          <span className={`pill withdrawn ${activeFilter === 'withdrawn' ? 'active' : ''}`} onClick={() => setActiveFilter('withdrawn')}>Withdrawn <span style={{opacity: 0.7}}>1</span></span>
        </div>
      </div>

      <div className="layout-offers">
        <div className="offers-list">

          <div className={`offer-card countered-card pending-card ${selectedOffer === 0 ? 'selected' : ''}`} style={{borderLeft: '3px solid #7c3aed'}} onClick={() => setSelectedOffer(0)}>
            <div className="oc-inner">
              <div className="oc-header">
                <div className="oc-title">Football Jersey Kit — Full Team Set</div>
                <span className="status-badge sb-countered">Countered</span>
              </div>
              <div className="oc-meta">PRV-2026-00431 · Sportswear</div>
              <div className="oc-specs">
                <div className="oc-spec"><div className="oc-spec-label">Your bid</div><div className="oc-spec-val g">$7.35/set</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Buyer target</div><div className="oc-spec-val">$8.00/set</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Your TAT</div><div className="oc-spec-val">18 days</div></div>
              </div>
              <div className="oc-footer">
                <div className="oc-buyer"><div className="buyer-av">JM</div> James Mitchell · UK</div>
                <span className="oc-time">Countered 2h ago</span>
              </div>
            </div>
            <div className="oc-divider"></div>
            <div className="oc-actions">
              <button className="btn-sm-primary">Review counter</button>
              <button className="btn-sm">Message</button>
            </div>
          </div>

          <div className={`offer-card pending-card ${selectedOffer === 1 ? 'selected' : ''}`} onClick={() => setSelectedOffer(1)}>
            <div className="oc-inner">
              <div className="oc-header">
                <div className="oc-title">Goalkeeper Gloves — Latex Palm, Wrist Strap</div>
                <span className="status-badge sb-pending">Pending</span>
              </div>
              <div className="oc-meta">PRV-2026-00418 · Sportswear</div>
              <div className="oc-specs">
                <div className="oc-spec"><div className="oc-spec-label">Your bid</div><div className="oc-spec-val g">$11.20/pair</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Buyer target</div><div className="oc-spec-val">$12.00/pair</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Your TAT</div><div className="oc-spec-val a">13 days</div></div>
              </div>
              <div className="oc-footer">
                <div className="oc-buyer"><div className="buyer-av" style={{background:'#fef3c7', color:'#92400e'}}>SA</div> Sport Arabia · UAE</div>
                <span className="oc-time"><span style={{color:'#b91c1c', fontWeight:500}}>4h 22m</span> left</span>
              </div>
            </div>
            <div className="oc-divider"></div>
            <div className="oc-actions">
              <button className="btn-sm">View RFQ</button>
              <button className="btn-sm">Edit bid</button>
              <button className="btn-sm-danger">Withdraw</button>
            </div>
          </div>

          <div className={`offer-card won-card ${selectedOffer === 2 ? 'selected' : ''}`} onClick={() => setSelectedOffer(2)}>
            <div className="oc-inner">
              <div className="oc-header">
                <div className="oc-title">Training Shorts × 300 — Mesh Lined</div>
                <span className="status-badge sb-won"><Trophy size={10} /> Won</span>
              </div>
              <div className="oc-meta">PRV-2026-00391 · Sportswear</div>
              <div className="oc-specs">
                <div className="oc-spec"><div className="oc-spec-label">Winning bid</div><div className="oc-spec-val g">$4.20/pc</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Order value</div><div className="oc-spec-val g">$1,260</div></div>
                <div className="oc-spec"><div className="oc-spec-label">TAT agreed</div><div className="oc-spec-val">16 days</div></div>
              </div>
              <div className="oc-footer">
                <div className="oc-buyer"><div className="buyer-av" style={{background:'#dcfce7', color:'#15803d'}}>RK</div> RunKit Sports · US</div>
                <span className="oc-time">Won 3 days ago</span>
              </div>
            </div>
            <div className="oc-divider"></div>
            <div className="oc-actions">
              <button className="btn-sm-primary">Go to order</button>
              <button className="btn-sm">View details</button>
            </div>
          </div>

          <div className={`offer-card lost-card ${selectedOffer === 3 ? 'selected' : ''}`} onClick={() => setSelectedOffer(3)}>
            <div className="oc-inner">
              <div className="oc-header">
                <div className="oc-title">Premium Leather Holdall — Full Grain</div>
                <span className="status-badge sb-lost">Not selected</span>
              </div>
              <div className="oc-meta">PRV-2026-00409 · Leather goods</div>
              <div className="oc-specs">
                <div className="oc-spec"><div className="oc-spec-label">Your bid</div><div className="oc-spec-val">$43.00/pc</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Winning bid</div><div className="oc-spec-val g">$39.50/pc</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Your TAT</div><div className="oc-spec-val">32 days</div></div>
              </div>
              <div className="oc-footer">
                <div className="oc-buyer"><div className="buyer-av" style={{background:'#ede9fe', color:'#6d28d9'}}>TF</div> TrendForce · DE</div>
                <span className="oc-time">Closed 1 day ago</span>
              </div>
            </div>
            <div className="oc-divider"></div>
            <div className="oc-actions">
              <button className="btn-sm">View breakdown</button>
              <button className="btn-sm">Similar RFQs</button>
            </div>
          </div>

          <div className={`offer-card withdrawn-card ${selectedOffer === 4 ? 'selected' : ''}`} onClick={() => setSelectedOffer(4)}>
            <div className="oc-inner">
              <div className="oc-header">
                <div className="oc-title">Compression Running Tights — Women's</div>
                <span className="status-badge sb-withdrawn">Withdrawn</span>
              </div>
              <div className="oc-meta">PRV-2026-00397 · Apparel</div>
              <div className="oc-specs">
                <div className="oc-spec"><div className="oc-spec-label">Your bid</div><div className="oc-spec-val">$13.50/pc</div></div>
                <div className="oc-spec"><div className="oc-spec-label">Reason</div><div className="oc-spec-val">Capacity full</div></div>
                <div className="oc-spec"><div className="oc-spec-label">TAT</div><div className="oc-spec-val">24 days</div></div>
              </div>
              <div className="oc-footer">
                <div className="oc-buyer"><div className="buyer-av" style={{background:'#fee2e2', color:'#b91c1c'}}>RK</div> RunKit Sports · US</div>
                <span className="oc-time">Withdrawn 5 days ago</span>
              </div>
            </div>
          </div>

        </div>

        <div className="detail-panel">
          <div dangerouslySetInnerHTML={{ __html: offersData[selectedOffer].detailHtml }} />
        </div>

      </div>
    </div>
  );
}
