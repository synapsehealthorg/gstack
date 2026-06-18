# proov — MVP Plan
_Last revised: 2026-06-18_

---

## What We Are Building

proov is the operating system for manufacturing products. Buyers transform ideas into production-ready specifications, source manufacturers, manage orders, and settle payments through escrow — all in one platform.

This is not a pitch document. This is the product we are shipping.

---

## Pilot: Sportswear Manufacturing

The first vertical is **sportswear**. This is a deliberate, relationship-grounded decision:

- Direct access to sportswear manufacturers through existing family network
- Pakistan is one of the world's largest sportswear exporters — jerseys, tracksuits, gym wear, team kits
- Buyers are global (UK, EU, US clubs and brands sourcing from Pakistan)
- Order sizes are predictable: 50–5,000 units, $500–$50,000 GMV per order
- Products are highly configurable (cuts, fabrics, embroidery, printing, sublimation) — perfect for structured techpacks

The pilot manufacturers are onboarded personally. We do not wait for inbound signups to start.

---

## Monetization

### Bidding
Bidding on RFQs is **free for all verified manufacturers**. There is no per-bid paywall.

### Registration Bonus
Every new manufacturer receives **20 AI credits** upon completing their Tier 1 verification as an activation incentive to try Studio and AI features.

### AI Features
AI-powered features (techpack generation, product generation from prompts, mockup generation, AI order assistance) require **credits**. Credits are included in monthly subscription plans.

| Plan | Price | Credits/month | What it includes |
|---|---|---|---|
| Free | $0 | 0 | Browse, submit bids, basic profile, 20 bonus credits at sign-up |
| Starter | $9/month | 50 credits | AI techpack generation, mockup generation, priority placement |
| Studio | $29/month | 200 credits | Full Studio access, AI product generation, brand kit, verified badge, 40% advance payment on M1 |

### Platform Commission
**1% of GMV** deducted from escrow on successful order completion.

### Credit Costs (indicative)
| Action | Credits |
|---|---|
| Generate techpack from prompt | 10 |
| Generate techpack from image | 15 |
| Generate product mockup | 5 |
| AI-assisted order build | 8 |
| Generate logo / brand asset | 5 |

---

## Manufacturer Verification

Verification is progressive. Manufacturers unlock more platform trust as they verify more.

### Tier 1 — Online Identity (Self-serve, immediate)
- Business name and country
- Working website or social profile (Instagram, LinkedIn, Facebook business page)
- WhatsApp business number (verified via OTP)
- At least 3 portfolio images of actual production

On Tier 1 completion: manufacturer is listed, can receive RFQs, can submit bids.

### Tier 2 — Document Verification (Manual, within 48h)
- Business registration document (NTN, SECP, or equivalent)
- Bank account details matching business name
- A short video walkthrough of the factory floor (can be informal)

On Tier 2 completion: manufacturer receives a **Verified** badge, eligible for Studio plan, eligible for M1 advance payments.

### Tier 3 — Ground Inspection (Later stage)
- Physical visit by a proov city ambassador
- Factory capacity audit
- Product quality assessment

On Tier 3 completion: **Certified** badge, eligible for featured placement, higher advance payment ratios.

> City ambassadors are recruited and paid in later stage. Initially, Tier 3 is available only in Lahore, Sialkot, and Faisalabad through personal network.

---

## Product Modules — Build Sequence

### Phase 1: Core Marketplace (Ship First)

Everything needed to run a real RFQ → bid → order → escrow cycle.

**Authentication**
- [ ] Supabase Auth — email + Google
- [ ] Role selection at signup: Buyer or Manufacturer
- [ ] Buyer onboarding: name, company, country
- [ ] Manufacturer onboarding: 5-step profile (company, industries, capabilities, portfolio, verification docs)

**Marketplace — Buyer side**
- [ ] Post inquiry: 4-step wizard (What / Specs / Documents / Terms)
- [ ] Inquiry goes live on sportswear canvas after posting
- [ ] File upload to Cloudflare R2 (reference images, techpacks)
- [ ] Inquiry detail page: full specs visible to verified manufacturers
- [ ] Bid review page: compare bids side by side
- [ ] Accept bid: closes inquiry, creates order, triggers escrow funding step

**Marketplace — Manufacturer side**
- [ ] Browse sportswear canvas (real-time, no page refresh)
- [ ] Click inquiry → view full RFQ details
- [ ] Submit bid form (price, TAT, message, portfolio samples)
- [ ] My bids page: track bid status

**Orders**
- [ ] Order detail page with 3 standard milestones (M1 40%, M2 30%, M3 30%)
- [ ] Optional M0 (sample milestone) for orders requiring pre-production sample
- [ ] Manufacturer: upload proof images at each milestone
- [ ] Buyer: approve or dispute each milestone
- [ ] Order status timeline

**Billing & Payments (Settings)**
- [ ] Buyer billing: attach card via Stripe (converted to USDC for escrow)
- [ ] Manufacturer payouts: attach Solana address or bank details
- [ ] Fasset off-ramp: USDC → PKR bank transfer (1 USDC = 278.55 PKR)
- [ ] Escrow hold on order creation (drawn from buyer card)
- [ ] Milestone release on buyer approval (pushed to manufacturer)
- [ ] Dispute hold (funds locked until resolved)
- [ ] Transactions tab: clear audit trail of all escrows, credits, and payouts

**Notifications**
- [ ] Email via Resend: all events in the email table below
- [ ] In-app notification bell: real-time

**Admin**
- [ ] Manufacturer verification queue: approve / reject Tier 1 and Tier 2
- [ ] Dispute arbitration console
- [ ] Order overview
- [ ] User management

---

### Phase 2: Studio (After first 10 orders)

The creative workspace. Buyers use AI and digital canvases to compose moodboards, logos, marketing assets, and product concepts. Studio is the messy, exploratory phase where ideas are born.

- [ ] Studio canvas (React Flow)
- [ ] AI logo generation (credits)
- [ ] AI mockup generation from prompt (credits)
- [ ] AI product concept from reference image (credits)
- [ ] Brand kit: logo, colors, fonts stored per buyer account
- [ ] Promote studio asset → Product

---

### Phase 3: Products (After Studio ships)

The structured library view. Once a concept is finalized in Studio, it is promoted to a Product—a clean, order-ready, manufacturing-grade techpack. Whether imported directly or born in Studio, Products are the standard unit of commerce on proov. They open into a unified Configurator.

- [ ] Unified Configurator: materials, variants, branding, packaging (one configurator, two entry points: from Studio node or from Products library)
- [ ] AI techpack generation from prompt (credits)
- [ ] AI techpack generation from reference image (credits)
- [ ] Editable techpack (fabric weight, construction, finishing spec)
- [ ] Product → Order: import product into an order directly
- [ ] Product templates: sportswear-specific (sublimation jersey, team kit, gym set)

---

### Phase 4: Library (After Products ships)

The manufacturing knowledge network, segmented into personal and community discovery.

- [ ] My Library: A private tab to browse and manage the user's own finalized products and assets.
- [ ] Community: A public tab for discoverable templates and curated techpacks.
- [ ] Buyer can publish a product to the Community
- [ ] Other users can license a published product (one-click: use this techpack)
- [ ] Creator earns a fee on each license (set by creator)
- [ ] Configurable techpacks: licensee can modify color, size range, branding

---

### Phase 5: Advanced Orders (Parallel to Library)

- [ ] Multi-product orders
- [ ] AI-assisted order creation from a brief
- [ ] Direct manufacturer invitations (skip the RFQ canvas)
- [ ] Shared collaboration: invite team member to an order
- [ ] Freight integration: Shippo for shipping quotes and tracking
- [ ] Board view + List view for orders

---

## Inquiry Posting Form (Spec)

4-step wizard.

**Step 1 — What are you making?**
- Industry selector (sportswear first; others greyed/locked at launch)
- Product title
- Product description
- Reference images (up to 5)

**Step 2 — Specifications**
- Quantity + unit
- Target unit price + currency
- Maximum acceptable price (optional)
- Turnaround time: slider 7–180 days
- Sample required toggle
- Sample TAT if yes
- Destination country

**Step 3 — Documents**
- Techpack upload (PDF, AI, EPS, DXF — up to 50MB)
- Additional reference files (up to 5)
- Special notes for manufacturers

**Step 4 — Terms**
- Inquiry expiry: 7, 14, or 30 days
- Incoterms: FOB, CIF, EXW, DDP
- Review and confirm

---

## Order Milestones (Spec)

| Milestone | Trigger | Escrow % |
|---|---|---|
| M0 — Sample Approved | Buyer approves physical sample (optional) | 0% (sample cost separate) |
| M1 — Production Start | Buyer funds escrow + manufacturer confirms | 40% |
| M2 — Quality Check | Manufacturer uploads QC photos, buyer approves | 30% |
| M3 — Delivery | Tracking confirmed delivery, buyer approves | 30% |

Studio plan manufacturers receive **40% advance at M1** immediately on escrow funding. Free/Starter plan manufacturers receive M1 on buyer approval (not automatically).

---

## Email Notifications (Spec)

All emails via Resend.

| Event | Recipient | Subject line |
|---|---|---|
| Inquiry posted | Buyer | Your inquiry PRV-XXXXX is live |
| First bid received | Buyer | You have your first bid on PRV-XXXXX |
| New bid received | Buyer | New bid from [Manufacturer] on PRV-XXXXX |
| Bid accepted | Manufacturer | Your bid was accepted — order confirmed |
| Inquiry expired | Buyer | PRV-XXXXX expired with N bids |
| Milestone reached | Buyer | [Manufacturer] has reached Milestone 2 |
| Milestone approved | Manufacturer | Milestone 2 approved — payment released |
| Order shipped | Buyer | Your order ORD-XXXXX has shipped |
| Order delivered | Both | ORD-XXXXX delivered — proov complete |
| New message | Both | New message from [Name] on ORD-XXXXX |
| Dispute filed | Both + Admin | Dispute filed on ORD-XXXXX |
| Dispute resolved | Both | Dispute resolved on ORD-XXXXX |

---

## Infrastructure

| Service | Purpose |
|---|---|
| Next.js 16 + Turbopack | Frontend + API routes |
| Supabase | Auth, Postgres, Realtime, Storage |
| Cloudflare R2 | File uploads (techpacks, images, documents) |
| Resend | Transactional email |
| Stripe | Buyer wallet top-ups (card → USDC) |
| Solana | Manufacturer USDC wallets |
| Fasset | USDC → PKR bank off-ramp |
| Vercel | Hosting + edge functions |

---

## Success Metrics — Phase 1

| Metric | 30-day target | 90-day target |
|---|---|---|
| Verified sportswear manufacturers | 10 | 40 |
| Posted inquiries | 5 | 25 |
| Bids submitted | 15 | 100 |
| Completed orders (M3 reached) | 1 | 10 |
| GMV facilitated | $2,000 | $25,000 |
| Studio plan subscriptions | 0 | 5 |

Phase 1 is proven when the first order is completed end-to-end and both the buyer and manufacturer are paid correctly.

---

## What We Are NOT Building Yet

- Mobile app
- WebGL canvas (Three.js / Fabric.js)
- Multi-language support
- Freight insurance
- Automated dispute resolution
- Manufacturer analytics dashboard
- Buyer analytics dashboard
- Enterprise tier / private canvases
- Expanded verticals beyond sportswear

---

## Data Portability & Export Rules

- **Locked to platform:** The editable JSON spec graph (Studio node data, layer data). This is the proprietary asset that only has value inside proov's bidding/escrow engine.
- **Exportable:** Mockup PNGs/JPGs, Marketing assets, PDF techpack (read-only for external manufacturers).

---

## Pilot Manufacturer Onboarding (Manual)

Before launch, we personally onboard 5–10 sportswear manufacturers:

1. WhatsApp them directly
2. Walk them through the manufacturer registration flow
3. Help them upload portfolio images
4. Submit their Tier 1 verification manually if needed
5. Place a test inquiry from a buyer account and ask them to bid on it

The first inquiry posted is a real one. The first bid is from a real manufacturer we know.

---

_proov — Dream it. Price it. Watch the world proov it._