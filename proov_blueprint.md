# proov.to — Complete Project Blueprint
### Transfer document — everything decided, designed, and reasoned about to date

---

## 1. What proov is

proov.to is a global reverse-auction platform for custom manufacturing. A buyer uploads or designs a product, sets the price and turnaround time (TAT) they're willing to pay, and manufacturers worldwide compete to win the order by bidding. Once a buyer accepts a bid, the two parties communicate and transact entirely inside proov — specs are locked, the full payment is safeguarded by a licensed provider and released in checked milestones, and production is tracked end to end.

The founding insight: global custom manufacturing — sportswear, apparel, leather goods, electronics, packaging, furniture, and eventually any physical product category — runs today on WhatsApp messages, wire transfers, and trust built on nothing but hope. proov replaces that with locked specifications, protected payments, and a transparent bidding marketplace.

**Tagline:** Production. Priced by you.
**Sub-line:** Dream it. Price it. Watch the world proov it.

The wordplay is deliberate and load-bearing: "proov" evokes "prove" — manufacturers prove they can deliver, buyers prove their price is real, and the platform proves the deal happened. It also evokes "production" and "pro," and reads as belonging to both sides simultaneously — buyers think it's built for them, manufacturers think it's built for them. That ambiguity is a feature, not an accident.

---

## 2. Origin story and founder context

The founder is based in Sialkot, Pakistan — the global capital of sportswear and sporting goods manufacturing (soccer balls, gloves, jerseys). The founder personally operates a commercial sublimation printing unit that 10–20 different exporters visit daily, all suffering the same problems: unsafe payment collection, manual order confirmation, chaotic WhatsApp-based customer updates, and general administrative overhead that eats into their margins and reputation.

This is not a cold-start marketplace problem. The founder has a **built-in physical distribution channel** — daily foot traffic of real exporters with a real, shared, provable pain point. The go-to-market motion is: onboard manufacturers from this physical location first, with a simple "create an order, send your buyer a payment link, get paid safely" tool — no bidding required at first — then layer the full reverse-auction marketplace on top once trust and volume exist.

The founder is a solo technical founder building primarily with AI assistance (Claude, Cursor, and similar tools) and is realistic that the technology is the easy part; manufacturer and buyer acquisition is the hard part.

---

## 3. The core product philosophy (read this before designing anything)

Every feature decision in proov is filtered through a small number of non-negotiable principles. When evaluating any new feature request, check it against these first.

### 3.1 Buyers pull, manufacturers compete — never the reverse
Manufacturers can only initiate contact with a buyer by submitting a bid on a public inquiry, or by being explicitly invited. There is no cold-messaging, no "interested" button, no profile-view notifications, no manufacturer-to-buyer push of any kind outside of a submitted bid. This is the single rule that protects proov from becoming "Alibaba with extra steps" — buyers stay in control, manufacturers earn the right to talk.

### 3.2 The techpack is the contract
Every order's specification document (the "techpack") becomes the binding reference the moment it's locked. Disputes are arbitrated against it. Manufacturers can propose edits to a buyer's techpack based on their production capability, but those edits go through an explicit version-controlled review — never silent overwrites.

### 3.3 Money moves only when the order does
The buyer funds the full order, but manufacturer payouts release only in milestones tied to real production events (production start, inline quality check, pre-shipment quality check, delivery) — never as one lump sum. This protects both sides simultaneously and is the single biggest differentiator versus wire-transfer-based trade.

### 3.4 One unambiguous place to "make a thing"
Studio is the only creative/composition surface. Products is a library of finished, order-ready items (born in Studio or imported) — not a second creation tool. Never let two menu items compete for the same "create" intent; this is the single fastest way to confuse first-time users and was caught and corrected during this project's design phase.

### 3.5 AI assists, never silently commits structured data
Anywhere AI fills a structured field that feeds into pricing, specs, or bidding, the result must render as an explicit "AI-suggested — click to confirm" state. AI never auto-saves a structured field as ground truth without human confirmation. Free-text and creative generation (mockups, marketing copy, moodboards) can be fully automatic; anything that becomes a binding number cannot.

### 3.6 Best practice is a nudge, never a rule
Where the product has a strong opinion (e.g., "keep one order to one manufacturer's capability"), it is always expressed as a dismissible, calmly-styled suggestion at the moment of relevance — never a blocking modal, never a hard constraint. The platform earns trust by being honest about trade-offs, not by being paternalistic.

### 3.7 Quality guarantees scale with specification completeness
A fully customized, techpack-complete product carries proov's full quality coverage. A blank/generic template carries an explicit, persistent disclaimer (not a one-time popup) that proov does not guarantee output quality, because there is no locked spec to arbitrate against. This disclaimer travels with the order all the way through to publish, not just at the moment of selection.

### 3.8 What's locked to the platform vs. freely exportable
Mockup images, PDFs of techpacks, and marketing assets generated in Studio are freely exportable and shareable — they're marketing material, not the proprietary asset. The **editable, structured JSON specification graph** (Studio's node data, layer data, the live techpack document) never leaves the platform, because it only has value connected to proov's bidding, escrow, and production infrastructure. This is the actual moat — not an arbitrary "nothing downloads" rule, which was identified during design review as too broad and user-hostile if implemented literally.

---

## 4. Information architecture — the six main menu items

After significant iteration (including catching and correcting a structural flaw where two menu items both claimed to be "where you create a product"), the locked navigation is:

```
Studio      Composition and AI-generation surface. Canvas-based,
            node-based (React Flow). Templates, logo/illustration
            generation, moodboards, marketing asset generation,
            the full product configurator (zoom-in editing).

Products    Library of finished, order-ready items. NOT a second
            creation tool — items arrive here either by being
            finished in Studio or imported/uploaded directly.
            Each product is a complete, navigable techpack.

Orders      Where buyers build and submit orders (one or more
            products, sizing, rosters, pricing) and where both
            sides track production through to delivery. List
            view and kanban board view, switchable.

Market      The public reverse-auction floor (formerly called
            "RFQ/Exchange" during design — final name: Market).
            Live RFQs, bids, "My Offers" (manufacturer-side bid
            tracking), order-won handoff into Orders.

Library     Two tabs: "My Library" (personal saved assets, brand
            kits) and "Community" (other users' shared products/
            templates, purchasable techpacks). Never merged into
            one undifferentiated feed — browsing-to-discover and
            retrieving-to-reuse are different intents.

Wallet      Protected-funds visibility, guaranteed payout quotes,
            milestone releases, payment
            notifications.
```

A global notification bell with dropdown sits in the top navigation across the whole app.

---

## 5. The dual-role mechanic — Sourcing vs. Selling

This is the single mechanic that lets the exact same order-creation flow serve both a brand-new buyer discovering manufacturing for the first time AND a manufacturer onboarding their own existing export client onto proov.

At the very start of every order, the user picks one of two roles:

```
SOURCING                          SELLING
Subtext: "Need this made"         Subtext: "I'll make it"

You don't have a manufacturer     You already manufacture this
yet. Manufacturers compete to     for a buyer. No bidding —
win your order via bidding, OR    you set price/TAT yourself
you invite one directly.          and send a payment link.
```

Both paths use the **identical** techpack builder, the same Products library, the same Orders tracking system, and the same protected-payment/milestone engine underneath. The only thing that changes downstream of this single choice is whether the order opens to public bidding or goes straight to one named counterparty. This is also the exact mechanism by which a Sialkot manufacturer onboards their own long-standing buyer relationship onto proov without ever touching the Market.

**Naming history:** earlier explored as "Demand vs. Supply" and other pairs; "Sourcing/Selling" with the plain-English subtext was the version locked in, because the industry terms alone weren't immediately clear to first-time users, and the subtext alone lost the professional framing.

---

## 6. The Studio canvas — full architecture

### 6.1 Concept
Studio is a Figma-meets-Replit-style infinite canvas where every item is a node: products, inspiration/reference images, and generated marketing assets, connected by visible flow lines. Studio is for composition and exploration. It is explicitly NOT where final commerce decisions (pricing, order assembly) happen.

### 6.2 Two zoom levels, one canvas — the core interaction model
This was the key conceptual breakthrough in this project's design phase, resolving confusion about how a "macro" composition canvas and a "zoomed-in" detailed product editor could coexist without feeling like two different apps.

```
ZOOM LEVEL 1 — Canvas (macro)
Many nodes visible: products, inspiration, marketing assets,
connected by flow lines. Composition mode.
Tools: pan, connect, group, generate marketing, add to order.

ZOOM LEVEL 2 — Product (micro)
Double-clicking a product node triggers a CAMERA ZOOM
(not a page navigation — this distinction matters enormously
for perceived coherence). The macro canvas dims/blurs behind
it but is never destroyed or unmounted. A four-tab editor
opens, anchored to the top of the now-expanded product view.
```

The existing canvas chrome (left sidebar, toolbars) is **re-skinned**, not replaced, when zoomed in — the same physical UI regions show different content depending on zoom level, exactly like Figma's component-editing mode reusing the same panels as the page view.

### 6.3 The four-tab product editor (inside zoom level 2)
These four tabs are structurally fixed across every product category; only their internal content adapts per category.

```
Tab 1 — Mockup    Lifestyle/flat-lay/ghost-mannequin render.
                   AI-generated via IDM-VTON-class virtual
                   try-on models. The "does it look good" view.

Tab 2 — Layers     Printful-style zone editor. Front/back/side
                   panels, color fills (Pantone), logo placement,
                   print method per zone. The actual editing
                   surface — most work happens here.

Tab 3 — Specs       Material, GSM, sizing, print technique,
                   fabric texture. Every field here writes
                   DIRECTLY into the product's techpack data —
                   no re-entry, ever.

Tab 4 — 3D          Real-time WebGL preview (React Three Fiber).
                   Textures baked live from the Layers tab.
                   Orbit/zoom/capture-view-to-PDF.
```

### 6.4 The empty artboard → AI generation flow
```
1. User clicks "+ Product" → modal: pick product category
2. An empty/dashed artboard node appears on the canvas
3. User clicks the generate sparkle → AI produces a basic
   3D base mesh + 2D silhouette for that category (fast,
   generic starting point)
4. Artboard now shows a real thumbnail
5. Double-click → zoom into the four-tab configurator to refine
```
**OPEN QUESTION (flagged, never resolved):** should AI generation ask one clarifying question (target audience/style) before generating, or generate immediately and let the user refine? Trade-off is momentum vs. first-draft quality. Founder leaned toward deciding this empirically once usage data exists.

### 6.5 Branding copy-paste between products
A structured `BrandingProfile` object (logos with placement/print-method/size/position, Pantone colors mapped to zones, fonts, patterns) can be copied from one product node and pasted onto another. Zones that don't exist on the target product are flagged amber ("Left chest zone not available on this product — adjust manually") rather than silently failing or silently force-mapping.

### 6.6 Marketing asset generation, in-canvas
Selecting a product node and triggering "Generate Marketing" produces a new Marketing Node positioned beside the source product, connected by a faint dotted line (mirroring Figma's component-to-instance visual language). Options: Product Mockup (IDM-VTON), Social Post, Banner, Lookbook Page — the latter three driven by the Anthropic API for copy/layout, rendered to PNG/PDF.

### 6.7 Multi-select and Add to Order from the canvas
Shift-click selects multiple product nodes; a floating bottom action bar appears (mirroring the design system's existing contextual bottom-bar pattern) offering Copy Branding, Paste Branding, Group, and Add to Order.

---

## 7. The techpack — structure and behavior

### 7.1 Why it exists
The techpack is the bridge between a creative idea and a factory-floor-executable specification. It must be detailed enough to be a binding contract and structured enough to auto-populate from Studio.

### 7.2 Multi-page structure (six pages, navigated as top tabs)
```
1. Cover         Style name/code, category, base size, size
                  range, basic quantity, delivery info.
2. Flats          Front/back/detail images — uploaded or
                  pulled from Studio's mockup/3D exports.
3. Bill of        Every fabric, trim, label, hardware component
   Materials      with composition % and supplier notes.
4. Measurements   Point-of-measure values for base size; graded
                  chart auto-calculated across the full size run.
5. Colorways      Every color variant mapped to Pantone codes —
                  pulled directly from Studio's colorway nodes
                  when the product was imported from Studio.
6. Packaging      Poly bag, hang tag, carton specs, units/carton,
                  handling instructions.
```

### 7.3 Partial completion, never full assumption
When a product is imported from Studio, Cover/Flats/BOM/Colorways arrive substantially pre-filled (Studio has certain knowledge of these). Measurements and Packaging arrive empty with a clear "Not started" indicator — Studio has no way to know body measurements or packaging preferences, and the product must never pretend otherwise. A completion indicator (checkmark/circle) sits on every page tab and, for multi-product orders, on every product tab too.

### 7.4 Multi-product orders — one techpack per product, not one shared document
An order is a container; each product inside it gets its own complete six-page techpack, because a jersey and a pair of shorts cannot share a BOM or a measurement chart. The editor shows a product-selector row above the page-tab row when an order contains more than one product.

### 7.5 Version control and the pre-funding review screen
This is one of the most carefully designed screens in the project, because it is the exact moment a verbal agreement becomes a binding financial contract.

```
Buyer's original techpack         = Version 1
Manufacturer's proposed edits     = Version 2 (with a
                                     plain-language note
                                     explaining WHY each
                                     field changed)
```

The review screen renders this as a **diff, not two separate documents** — changed fields show the old value struck through directly above the new value; unchanged fields show plainly with no tag. The manufacturer's reasoning note sits directly beneath the diff. This single design choice — diff-with-reasoning instead of side-by-side comparison — is what turns "the manufacturer altered my spec" into "the manufacturer used their expertise."

Four actions are available, deliberately ranked by visual weight:
```
1. Accept & fund order      (solid primary — the default path)
2. Message about changes    (outlined, info-colored — soft, non-destructive)
3. Revert to v1 & request redo  (neutral grey — reversible, low-stakes)
4. Cancel this order        (red-outlined, physically last — destructive)
```

Cancelling before any payment has moved is explicitly communicated as free for both sides. This contrast is intentional — it sets up the later understanding that cancelling AFTER the order is funded has real consequences (see Section 9).

A version history timeline with two distinct dot colors (blue = buyer actions, amber = manufacturer actions) shows the back-and-forth at a glance.

**OPEN QUESTION (flagged, never resolved):** should there be a hard cap on how many revision rounds are allowed before someone must accept or cancel? Founder did not commit to an answer; left for v2 refinement based on real dispute data.

---

## 8. Order creation flow — final, corrected version

This flow went through a major correction during design. The first version was an incorrect five-step linear wizard (visibility → pricing → terms → review → publish) that artificially separated things that should be one workspace. The corrected, locked version is below.

### 8.1 The Order Canvas (one screen, not a wizard)
Mirrors Studio's pattern directly: a board of product cards, each card self-contained with everything that product needs.

```
┌─────────────────────────────────────┐
│ ORDER NAME (editable inline)          Role pill: Sourcing/Selling
├─────────────────────────────────────┤
│ Best-practice nudge (dismissible,
│ green, non-blocking): "orders work
│ best when all products can be made
│ by one manufacturer"
├─────────────────────────────────────┤
│ [Product Card 1]  [Product Card 2]  [+ Add product]
└─────────────────────────────────────┘
```

Each product card contains, all visible at once with no further navigation:
- Thumbnail, name, badge (Customized / Blank template)
- Quantity-by-size grid (per size, editable)
- Running total quantity for that product
- Roster toggle (collapsed by default — most products don't need one)
  - When expanded: Download roster template / Upload filled roster / Edit on page (inline spreadsheet-style table)
- **Blank template disclaimer**, if applicable, shown permanently inside that card's body (not a one-time popup) — proov does not guarantee output quality for blank templates
- Target price per unit input, with a **proov AI price recommendation widget** directly beneath: three tappable tiers (Budget / Recommended / Premium) each showing expected bid-count impact, plus a live-updating plain-language note ("Based on 47 similar orders from Sialkot. $8.00 likely attracts 6–9 bids.")

An order-total bar sums all product targets live. "Save as draft" and "Continue to publish" are the only two exit actions from this screen.

### 8.2 The Logistics screen (only appears at publish time)
This screen shows up **only** once the user clicks "Continue to publish," and covers exactly two things: how the order is distributed, and the logistics needed to fulfill it. Nothing about products, pricing, or sizing reappears here.

```
Publish method (pick one):
  Post to Market        — visible to all verified manufacturers
                            in the category
  Invite directly       — specific manufacturer or private link

Logistics fields:
  Turnaround time (TAT)
  Sample required (yes/no + sample TAT if yes)
  Delivery address (from saved addresses, or add new)
  Incoterms (FOB / CIF / EXW / DDP)

Summary line: order total, product/quantity counts, and an
explicit flag if any product in the order carries partial
quality coverage due to a blank template.
```

"Back to order" returns to the canvas with nothing lost. "Publish order" is the final action.

### 8.3 Split bidding (an order-level option, not a default)
Founder's explicit policy: buyers will mostly NOT create orders spanning multiple manufacturer specialties, and this is reinforced via the best-practice nudge rather than via hard restriction. Split bidding exists as an opt-in toggle for the genuine edge case (e.g., a jersey from a sportswear specialist and a leather bag from a different specialist in one order).

```
OFF (default)   One manufacturer bids on and wins the whole
                order as a package. One bid list, one protected
                funds balance, one milestone timeline.

ON (opt-in)     Bid comparison splits into per-product tabs.
                Buyer can accept different winning manufacturers
                per product. Each product gets its OWN protected
                funds allocation and OWN milestone timeline, funded
                independently as each product's bid is accepted.
                Order-level status reflects the LEAST advanced
                product among all included — never overstates
                progress.
```

---

## 9. Protected payments and milestones

### 9.1 The milestone structure (per product, or per whole order if not split)
```
M0 — Design/sample approved         0%
M1 — Materials/production started  40%
M2 — Inline production check       30%
M3 — Pre-shipment quality check    20%
M4 — Delivery and claim window     10%
```
Evidence and approval requirements are defined in Section 20.4.

### 9.2 Cancellation economics
Cancelling before the order is funded is free for both sides and explicitly stated in the UI. After funding, released work, provider costs, protected balances, and refunds follow the rules in Section 20.8.

### 9.3 Payment rails (superseded and locked June 22, 2026)

The product promise is **Proov Protected Payment**, not legal escrow unless
Proov's licensed provider and counsel explicitly approve that term.

```
Buyer payment in:         Stripe marketplace checkout. The buyer pays the
                          manufacturing order price plus the exact, separately
                          displayed Stripe card-processing fee. ACH or bank
                          payment is preferred when available.

Custody:                  A licensed marketplace payment provider safeguards
                          the funds. Proov controls milestone instructions but
                          does not withdraw customer money into its ordinary
                          operating bank account.

Manufacturer promise:    A guaranteed net PKR amount, agreed before the buyer
                          funds the order and locked when payment succeeds.

Proov revenue:            The manufacturer-facing PKR quote includes a disclosed
                          service/FX margin. Proov retains the residual between
                          the USD order price and the all-in cost of delivering
                          the guaranteed PKR payout. There is no buyer commission.

Payout:                   A licensed provider pays the verified manufacturer.
                          Fiat-to-PKR is the baseline rail. USD-to-USDC-to-PKR
                          may be used only through an approved provider and an
                          authorized Pakistan corridor. USDC is backend treasury
                          infrastructure, not an unlicensed Proov remittance flow.
```

Stripe's stablecoin payouts do not currently provide a dependable Pakistan
manufacturer corridor. Binance's Pakistan NOC and local partnerships are useful
signals, but they do not authorize Proov to arrange stablecoin transfers. Proov
must obtain provider underwriting and the relevant PVARA approval, or use a
partner whose authorization explicitly covers the complete flow.

---

## 10. Market (the bidding floor)

### 10.1 Naming history
Went through several names during design — "RFQ," "Exchange" — before landing on **Market**, chosen because it's universally understood across every manufacturing culture (Sialkot, Dhaka, Guangzhou, London) without translation friction, and because it captures the bidirectional nature (you go to market to buy or to sell) better than "Exchange," which read slightly too financial/cold for non-native English speakers reviewed during design.

### 10.2 RFQ card design (for the bidding feed)
Each live RFQ card on Market shows, top to bottom: a live/closing-soon/hot status badge with appropriate color and animation (pulsing green for live, amber for closing, static red for unusually high bid volume); buyer identity row (avatar, name, country, verified badge, "sample needed" chip if applicable); a **multi-product thumbnail strip** (small square thumbnails per product in the order, with category-icon placeholders — never grey boxes — for products with no image); the order title; a three-cell spec grid (quantity / budget / TAT); material/method/incoterm tags; a manufacturer-demand bar (a proov-exclusive signal showing how many manufacturers are competing relative to order complexity); stacked bidder avatars with overflow count and average bid price; a countdown timer (color-shifts to red under 6 hours); and two CTAs — "Place bid" (primary, full-width) and "Details" (secondary).

### 10.3 Buyer-side Market view ("My RFQs")
A two-panel layout: left panel lists the buyer's own live RFQs as compact cards (selecting one highlights it); right panel shows the full bid comparison for the selected RFQ, with each bid card showing manufacturer name/verified badge/location, price with a delta-from-target indicator (color-coded), star rating + completed-order count + average TAT + on-time percentage as four stat chips, offered TAT with a "days faster/slower than average" note, sample availability, the manufacturer's message, portfolio thumbnails, and Accept / Message / Pass actions. A "Production history" panel (toggleable) shows the buyer's own track record — total orders, GMV, completion rate, and a list of past productions — both for the buyer's own reference and as a trust signal manufacturers can see.

### 10.4 Manufacturer-side "My Offers" view
Stats bar up top: total offers made, win rate with trend, revenue won, response time benchmarked against other manufacturers. Filter pills for status (Pending / Countered / Won / Lost / Withdrawn), each color-matched to a left-border accent on the corresponding cards so the list is scannable without reading. Selecting an offer opens a detail panel that adapts by status:
- **Countered**: shows the buyer's counter-offer in a clearly boxed callout, with Accept counter / Send revised bid / Message buyer actions, plus the manufacturer's anonymized competitive position (1st/2nd/3rd place chips with prices).
- **Won**: shows WHY they won (fastest TAT, highest rating, portfolio relevance) — coaching, not just confirmation.
- **Lost**: shows exactly how far off they were on price/TAT and gives specific, actionable advice for next time — turning a loss into a learning moment.

### 10.5 RFQ creation flow (buyer-facing, four steps)
```
1. Visibility    Post to Market vs. Private invite link
                  (both are always available regardless of
                  which is chosen — even a public RFQ gets
                  a shareable private link)
2. Pricing       Target price input + a "proov AI" recommendation
                  card showing Budget/Recommended/Premium tiers,
                  each with a live-updating bid-count forecast
3. Terms         TAT (chip selector with a recommended option
                  visually distinguished, plus an AI explanation
                  of why unrealistic TATs get 62% fewer bids),
                  deposit %, Incoterms, RFQ expiry
4. Review        Locked summary with an explicit "specs lock
                  on submission" warning; dual CTAs for posting
                  publicly and/or copying the private link
```

---

## 11. Orders system — tracking and views

### 11.1 View switcher
A single segmented control (List / Board) in the Orders top bar, preference persisted in localStorage, filters applying identically to both views.

### 11.2 List view
Linear-inbox-density rows: status dot, multi-product thumbnail stack, order name + ID, status badge, source tag (My order / Shared by me / Shared with me), counterparty avatar+name, value, last-updated timestamp.

### 11.3 Kanban board — final column structure
This went through explicit refinement to make column headings self-explanatory without training. Each column has an emoji/icon, a one-line subtitle, and a count badge:

```
✏️  Draft         "Building your brief"
📣  Brief Out     "Waiting for bids"           — green pulsing
                                                  live indicator
🤝  Matched       "Bid accepted — let's go"
🧵  Making        "Your order is being built"
🔍  Checking      "Quality review underway"
🚢  Shipped       "On its way to you"
📦  Arrived       "Confirm your delivery"       — shows a 7-day
                                                  auto-release
                                                  countdown
✅  Done          "Order complete"
```

Cards are explicitly **not draggable** — stage transitions only happen via real actions with real consequences (approvals, payments, confirmations) — dragging a card to "Shipped" must never be how shipping actually gets marked, since that could imply triggering escrow logic accidentally. Each column shows a tailored empty-state message rather than just being blank.

### 11.4 Filters
My orders / Shared by me / Shared with me / Archived — as pill filters above both the list and board views, plus a sort dropdown (last updated / newest / value / delivery date).

---

## 12. Manufacturer-side order detail (post-bid-acceptance)

The page a manufacturer sees once they've won a bid. Three-column layout:

```
LEFT: Products list (click to switch) → that product's
      read-only, locked techpack (six-page tabs, Export PDF
      action) → Production milestones (completed = solid
      green check, current = blue/expanded with the actual
      action needed — e.g. "Upload QC photos" — future
      milestones = greyed and collapsed)

RIGHT: Protected payment panel (per-milestone breakdown with
       color-coded status dots matching the milestone dots,
       progress bar) → Buyer trust-snapshot card (orders
       placed, completion rate, link to full profile) →
       Direct chat thread with the buyer, where SYSTEM
       MESSAGES (e.g. "M1 released — $1,470") are interleaved
       directly in the same thread as human messages — making
       the chat the de facto audit trail of the relationship,
       not just a messaging tool
```

---

## 13. Visual/technical design system

### 13.1 Brand voice and copywriting patterns established
- Three-word punchy step phrases: "Dream it. Price it. Watch the world proov it."
- Feature taglines follow a bold-claim-then-one-sentence-explanation rhythm (matches a reference SaaS landing page pattern studied during design): e.g. **"You set the price."** Post your product, name what you'll pay, and watch manufacturers globally compete to win your order.
- The word "proov" is used verbally as a stand-in for "prove" in copy ("Watch the world proov it") — intentional, load-bearing wordplay, not a typo to be corrected.

### 13.2 Comparison positioning
proov is positioned against Alibaba and Global Sources (NOT IndiaMART, which was identified as too India-specific to be a fair global comparator) — winning on: reverse-auction pricing, locked spec contracts, protected milestone payments, South Asia-specific payout rails, built-in dispute arbitration, non-Chinese manufacturer visibility, and zero listing fees.

### 13.3 The Studio/Products Builder visual language (locked, implemented as a working HTML/CSS prototype)
- Near-black canvas backgrounds (`#0D0D0C`–`#161614` range), warm parchment accent (`#E8E0CF`) standing in for "the color of a real techpack" — a deliberate, defensible departure from generic SaaS blue-on-dark
- `Inter` for UI chrome, `DM Mono` for product names/specs/headers — monospace specifically chosen to evoke factory-document precision
- The selected-layer state in the bottom filmstrip uses a warm parchment glow unused anywhere else on screen, making the active edit target unmistakable
- Bottom contextual bar appears ONLY when a layer/item is selected, hidden otherwise — global structure (right panel: layer tree, global product settings) is always visible; per-item editable properties (bottom bar) are ephemeral. This Figma/Photoshop-style split was explicitly identified as the only way to support 60+ possible configurator tools without ever showing more than 4–6 at once.

### 13.4 Full tool inventory for the Layers/Specs configurator (organized by category — reference list, build incrementally)
```
Material & Fabric: material type library, GSM/weight input,
  composition blend builder, texture preview swatch, finish
  selector, stretch/recovery rating, certification tagging

Color & Pattern: Pantone picker w/ library search, multi-
  colorway builder, color-to-zone mapping, gradient/ombre tool,
  pattern upload (seamless/placement), scale & rotation,
  sublimation full-bleed toggle

Logo & Branding: file upload (vector/raster detection), placement
  library + custom drop, scale/rotate/position, print method
  selector (embroidery, screen print, sublimation, heat transfer,
  rubber patch, woven label, laser etch, debossing), thread color
  + stitch density (embroidery-conditional), multi-logo management

Text & Personalization: font library, curved/arc text, roster-
  linked text (auto-populate name/number per unit), letter
  spacing/line height, outline/stroke

Construction: stitch type selector, seam allowance, lining
  toggle+material, padding/foam insert, reinforcement points,
  closures library

Sizing: size system selector, size run builder, per-size
  measurement table (dynamic columns), grading increment
  calculator, fit type selector

Packaging: poly bag toggle, hang tag designer, carton spec
  builder, folding/presentation style, special handling notes

View & Output: mockup style + background selectors, 3D orbit/
  zoom/capture-to-PDF, layer visibility/lock/duplicate/delete/
  reorder
```

### 13.5 Inspiration sources explicitly studied and mapped to specific features
```
Nike By You, Adidas Uniforms     → zone-based configurator UX
VPersonalize / LaunchMyWear      → roster + 3D builder combined flow
Zakeke, Kickflip                 → dynamic pricing as options change
CustomInk Design Lab              → canvas + roster in one flow (the
                                    direct precedent for the
                                    "two-tab canvas: Design / Roster"
                                    decision)
Linear                            → triage-inbox list density, status
                                    dots, sidebar nav pattern
Mercury                           → financial-list calm aesthetic
Superhuman                        → preview-line-under-row pattern
Stripe Dashboard                  → right-side detail panel on row
                                    click, no page navigation
Vercel                            → real-time status pulse animation
Loom                              → live activity sidebar feed
Google Flights / Booking.com      → bid comparison table format
ProcureFlow.ai                    → RFQ reference-number model, BAFO
                                    (Best & Final Offer) round concept
                                    (flagged as a possible v2 feature
                                    to increase GMV via price
                                    sharpening), audit-trail-for-
                                    dispute-evidence pattern
AI Tech Packs (Y Combinator)      → studied in deep technical detail
                                    as a possible techpack-generation
                                    partner/inspiration; DECISION:
                                    build proov's own lightweight
                                    Claude-Vision-powered structured
                                    form for v1 rather than integrate
                                    or fully clone their 8-stage AI
                                    pipeline — re-evaluate partnership
                                    or in-house build at month 2–6
                                    based on real usage
```

---

## 14. Technology stack (locked recommendation)

```
Framework         Next.js 14, App Router, TypeScript strict mode
Styling           Tailwind CSS + shadcn/ui
Canvas/Node graph React Flow (@xyflow/react) v12 — chosen as the
                  SINGLE graph engine for Studio: zones, assets,
                  spec cards, and connections are ALL React Flow
                  nodes/edges. Modularity principle explicitly
                  modeled on Google Stitch — adding a new node
                  type means one new file + one registry line,
                  nothing else changes.
3D rendering      React Three Fiber + @react-three/drei (WebGL,
                  via Three.js) — for the 3D preview tab and
                  product configurator 3D mode
State             Zustand + Immer — Studio and Orders maintain
                  COMPLETELY SEPARATE Zustand stores; they only
                  ever communicate by writing/reading the
                  product-snapshot row in the database, never
                  directly
Database/Auth/    Supabase (Postgres + Realtime + Auth + Storage)
Realtime          — explicitly replacing an earlier Firebase-based
                  setup found in the existing codebase, which was
                  identified as a core blocker (no Postgres, no
                  realtime subscriptions for live bid feeds)
File storage      Cloudflare R2 + CDN
Email             Resend
Payments          Stripe marketplace checkout for buyer funding;
                  licensed, replaceable payout provider for PKR.
                  USDC only through an approved provider corridor.
PDF generation    React-PDF or Puppeteer-based server-side render
                  for techpack export
Deployment        Vercel
Monorepo          Turborepo (recommended for scaling cleanly)
AI/vision         Anthropic Claude API (vision for spec extraction
                  from uploaded reference images; text for
                  marketing copy generation)
AI image/try-on   IDM-VTON-class models via Replicate API (NOT
                  self-hosted — licensing on the open weights is
                  CC BY-NC-SA, non-commercial; Replicate's hosted
                  commercial API or FASHN.ai avoids this entirely).
                  Image2LineDrawing (HuggingFace) for raster-to-
                  technical-flat conversion. Cost modeled at
                  roughly $0.028 per fully AI-assisted techpack
                  generation at v1 scale.
```

### 14.1 Critical engineering corrections made during this project
The existing codebase (found mid-project) was a bare Express.js + Firebase backend with a plain HTML/vanilla-JS frontend — **incompatible** with React Flow, React Three Fiber, or any planned interactive feature, because those are React/Node-module-based and cannot run in a CDN-script-tag HTML page. Full migration path specified: scaffold Next.js fresh, preserve the old HTML purely as a visual reference (not functional code), rebuild section-by-section, and enforce three non-negotiable rules on every interactive component going forward:
```
1. 'use client' as the literal first line of any file using
   hooks, browser APIs, or third-party UI libraries
2. dynamic() with ssr:false for any component using React Flow,
   Three.js, or drag-and-drop libraries
3. Never import React Flow or Three.js in a server component
   or layout file — only inside Client Components
```
These three rules were identified as the root cause of "interactive elements fail to render" issues reported earlier in the project and must be treated as permanent team convention, not a one-time fix.

### 14.2 Infrastructure (cloud/hosting) decision
Vercel + Supabase + Cloudflare R2 is sufficient through roughly the first 10,000 users / $1M GMV — no GCP or AWS needed at launch. GCP Cloud Run specifically (chosen over AWS Lambda for simplicity and better GPU pricing) is reserved for exactly three future-state workloads: 3D mesh processing jobs, high-volume PDF generation, and AI model inference if/when an in-house AI techpack generator is built. AWS was explicitly ruled out as unnecessary added complexity at this stage.

---

## 15. Brutal competitive/adoption self-test (run during this project — read before adding any new feature)

A structured test against platforms that achieved real adoption (Figma, Canva, Notion, Linear, Shopify, Stripe, Alibaba) surfaced these corrections, all of which are now reflected as locked decisions elsewhere in this document:

```
CRITICAL  Studio and Products both claiming to "create products"
          → Fixed: Studio composes/generates, Products is a
            finished-item library only.

HIGH      Products' described editor was identical to Studio's
          configurator, just relocated
          → Fixed: one configurator component, multiple entry
            points (open from Studio canvas zoom, or open
            directly from the Products library).

MEDIUM    AI silently filling structured order fields from a
          prompt is a liability (wrong GSM/Pantone slipping
          through unnoticed)
          → Fixed: AI suggests, user explicitly confirms every
            structured field; never auto-saved as ground truth.

MEDIUM    Merging personal library and community marketplace
          into one feed
          → Fixed: Library has two clearly separated tabs (My
            Library / Community) — no major adopted platform
            fully merges these, because discovery-browsing and
            retrieval-of-your-own-stuff are different intents.

LOW       "Nothing is ever downloadable" stated too broadly
          → Fixed: mockups/PDFs are freely exportable; only the
            EDITABLE JSON SPEC GRAPH stays platform-locked,
            because that's the actual proprietary asset, not
            an arbitrary file-export restriction.
```

---

## 16. Business model and unit economics

### 16.1 Pricing (as currently modeled)
```
Buyers:            No listing fee and no Proov commission. At checkout the
                   buyer pays the order price plus the exact, separately
                   displayed Stripe card-processing fee. ACH/bank payment
                   should be the lower-cost default where available.
Manufacturers:     Free tier (3 bids/month) / Starter $9/mo
                   (unlimited bids) / Premium $29/mo (unlimited
                   bids, 40-50% advance on M1, verified badge,
                   priority placement)
Platform take:     Proov quotes and guarantees the manufacturer a net PKR
                   payout. The quote includes a disclosed service/FX margin.
                   Proov retains the residual after provider, conversion,
                   payout, and risk-reserve costs. A hidden fee or falsely
                   advertised zero-fee conversion is not permitted.
```

### 16.2 Revenue modeling (illustrative, not a forecast commitment)
The previous 2.5% GMV forecast is superseded. Revenue must now be modeled from
the actual quoted-payout spread after payment, payout, FX hedge, inspection,
support, refund, and chargeback-reserve costs. A 1–2% gross spread alone is
unlikely to fund the full protection promise at low volume; the first 10 orders
must measure contribution margin rather than assume it.

### 16.3 Market sizing (context, not a claim of capture)
Global custom manufacturing ~$1.8T; cross-border textile manufacturing ~$180B; Sialkot sportswear exports alone ~$4.2B/year. No existing platform combines reverse-auction pricing + locked spec contracts + protected milestone payments + South Asia-specific payout rails + dispute arbitration in one product — this combination, not any single feature, is the defensible position.

### 16.4 Go-to-market sequencing (explicit, founder-committed)
```
Phase 1   Manual onboarding of manufacturers physically visiting
          the founder's Sialkot sublimation unit. No bidding —
          just safe payment collection + order tracking tool.
          Use provider-safeguarded full buyer funding, a guaranteed
          manufacturer PKR quote, manual milestone approvals, and
          provider-executed payouts. Do not manually custody funds.

Phase 2   Layer in the reverse-auction Market once trust and
          volume exist from Phase 1's manufacturer base.

Phase 3   Expand beyond sportswear into other industries (each
          gets its own dedicated Market category) only after
          Sialkot sportswear is proven and dominant — explicitly
          NOT launching six industries simultaneously, despite
          earlier MVP planning documents suggesting six at once;
          this was later refined toward depth-first, one category
          fully proven before expansion.
```

---

## 17. Identified risks and open policy gaps (explicitly flagged during this project, NOT yet resolved — highest priority for next phase)

```
1. Dispute resolution policy        Baseline freeze, evidence,
                                    approval, refund, and audit
                                    rules are defined in Section
                                    20.8. Detailed outcome matrices
                                    for quality, delay, customs,
                                    and ambiguous specs still need
                                    counsel and pilot validation.

2. Legal/regulatory exposure        Licensed-provider custody is
                                    locked. Provider underwriting,
                                    entity formation, PVARA corridor
                                    approval, terminology, and legal
                                    review remain launch gates; see
                                    Section 20.10.

3. Fraud prevention                 KYB, payout allowlisting,
                                    evidence, and chargeback freeze
                                    rules are defined in Section 20.
                                    The reserve percentage and loss
                                    underwriting model remain open.

4. Shipping/customs/"delivered"     No defined policy for what
   definition                       "delivered" means for milestone-
                                    release purposes beyond a
                                    tracking-number check — does
                                    not yet address customs holds,
                                    damaged-in-transit liability,
                                    or who arranges/pays duties.

5. Payout-margin economics          Guaranteed net PKR with an
                                    embedded, disclosed service/FX
                                    margin is locked. The minimum
                                    viable spread is not; determine
                                    it from the first 10 orders.

6. Quality/rating system depth      "Verified" currently only means
                                    documents were checked, not
                                    that output quality is good.
                                    No defined minimum portfolio
                                    requirement, first-order
                                    guarantee, or removal criteria
                                    yet.

7. Language/translation layer       No defined solution yet for
                                    English-proficiency variance
                                    across the global manufacturer
                                    base (Sialkot/Dhaka/Guangzhou/
                                    Ho Chi Minh City) — flagged as
                                    a likely source of spec
                                    misunderstanding and disputes
                                    if left unaddressed.

8. Onboarding "aha moment" design   Not yet designed in detail for
                                    either buyer or manufacturer
                                    first-session experience —
                                    flagged as needing as much
                                    design care as the canvas
                                    itself, not yet done.

9. Revision-round cap on techpack   Open question, never resolved
   version control (Section 7.5)    — unlimited back-and-forth
                                    vs. a hard cap before forced
                                    accept/cancel.

10. Roster lock timing               Open question, never resolved
    (Section 8.1)                    — should a roster lock with
                                    the techpack at publish, or
                                    stay editable later (e.g.
                                    swapping an injured player's
                                    number) even after a
                                    manufacturer is confirmed.

11. Draft-save validation             Open question, never resolved
    (Section 8.1)                    — should "Save as draft"
                                    require every product to have
                                    a price set, or allow fully
                                    incomplete drafts to be saved
                                    as-is.

12. AI generation friction            Open question, never resolved
    (Section 6.4)                    — clarifying question before
                                    generation vs. immediate
                                    generation with refinement
                                    after.
```

---

## 18. Domain, brand, and naming decisions already locked

```
Domain            proov.to (rated highly defensible — short,
                  meaningful, ownable spelling; .to is an accepted
                  modern startup TLD; recommend acquiring proov.com
                  opportunistically at Series A stage for enterprise
                  trust signaling, not urgent before then)

Tagline           "Production. Priced by you."
Sub-line          "Dream it. Price it. Watch the world proov it."

Role names        Sourcing ("Need this made") / Selling
                  ("I'll make it")

Order submission  "Brief" was explored and considered (industry-
flow name         native, globally understood) but the final
                  locked terminology across the product is simply
                  "Order" / "RFQ" within the Market context —
                  treat "Brief" as a discarded alternative, not
                  the final name, to avoid inconsistency.

Market naming     "Market" — final. ("Exchange" and "RFQ" as a
                  standalone tab name were both explored and
                  superseded.)

Comparison set    Alibaba + Global Sources (NOT IndiaMART)
```

---

## 19. Summary — what a new Claude session needs to internalize immediately

If you are picking up this project fresh, the five things to hold in mind before doing anything else:

1. **The Sourcing/Selling fork is the spine of the whole product.** Every flow downstream of order creation depends on which one was picked at the start, and both paths share the exact same underlying systems.
2. **Studio composes, Products holds finished things, Orders is where commerce happens.** Never let any two of these compete for the same job again — that exact mistake was caught and corrected once already in this project.
3. **The techpack is sacred.** It's a binding contract the moment it's locked, version-controlled when manufacturers propose edits, and the founder has explicitly chosen to build a lightweight Claude-Vision-powered version in-house rather than integrate a third party, at least for v1.
4. **The buyer funds the full order, but the manufacturer is paid only in checked milestones.** A licensed provider safeguards and moves the money; Proov controls the release rules and guarantees the agreed net PKR payout.
5. **The founder's actual unfair advantage is physical, not technical** — daily foot traffic of real Sialkot exporters with a shared, provable pain point. Every technical decision should be weighed against whether it helps get those specific people transacting safely, faster.

---

## 20. Proov Protected Payment v1 (locked June 22, 2026)

### 20.1 The narrow product

The first commercial product is not the public Market or the full Studio. It is
a manufacturer-created order link for an existing buyer relationship:

```
Manufacturer creates order -> buyer reviews contract and milestones ->
buyer funds 100% -> manufacturer produces -> Proov checks evidence ->
licensed provider releases milestone payouts -> order is delivered
```

The first pilot is the founder's sister's live 100-piece, $1,900 order. Success
means the buyer accepts full protected funding, the order advances through real
production evidence, and the manufacturer receives exactly the PKR amount shown
before the buyer paid.

### 20.2 Non-negotiable money-flow rules

1. Proov never treats protected customer funds as operating cash.
2. A licensed provider safeguards funds and executes transfers or payouts.
3. Proov records release instructions and an internal double-entry ledger; it
   does not represent a database status as proof that money moved.
4. Production cannot begin until the provider reports cleared or sufficiently
   guaranteed funds.
5. Manufacturer payouts require milestone evidence and the configured approval.
6. USDC can be an approved provider's settlement rail; Proov does not privately
   cash out Stripe proceeds, trade them, and remit them from its own wallet.
7. The manufacturer receives the guaranteed PKR amount regardless of the
   provider's internal fiat or USDC routing.

### 20.3 Quote and revenue model

The order has three distinct prices:

```
buyer_order_amount_usd       The manufacturing contract price
buyer_processing_fee_usd     The exact separately displayed Stripe fee
manufacturer_net_pkr         The guaranteed amount the manufacturer receives
```

Before publishing a payment link, Proov requests an executable payout quote from
the provider and shows the manufacturer the guaranteed PKR amount and quote
expiry. The manufacturer accepts that amount. When the buyer funds the order,
Proov locks or hedges the conversion immediately; it does not speculate on the
USD/PKR rate during production.

```
gross_proov_margin_usd = buyer_order_amount_usd
                       - provider_cost_to_deliver_manufacturer_net_pkr
                       - payout_and_network_costs
                       - allocated_risk_reserve
```

The manufacturer's terms state that the Proov exchange quote includes Proov's
service margin. The wholesale FX rate need not be displayed, but Proov must not
claim that the conversion is free or use an undisclosed deduction after the
manufacturer accepted the guaranteed net amount.

Margin is recognized proportionally as milestones become irreversible, not in
full when the buyer first pays. Refundable and disputed amounts remain liabilities.

### 20.4 Default milestone template

The buyer funds 100% at checkout. The default sportswear template is:

```
M0  Design and sample approved          0%   Required before paid production
M1  Materials and production started   40%  Evidence: materials, count, start
M2  Inline production check            30%  Evidence: completed-unit sample,
                                             quantity progress, defect log
M3  Pre-shipment quality check          20%  Evidence: final QC, packing count,
                                             buyer or inspector approval
M4  Delivery and claim window           10%  Tracking delivery plus claim window
```

Material-heavy orders may use 50/25/15/10, but the percentages are locked in the
contract before funding. No user can drag an order card to trigger a release.

For the first 10 orders, M0 through M3 require explicit human approval. M4
auto-releases seven calendar days after confirmed delivery unless the buyer opens
a claim. Automated approvals can be introduced only after real dispute data.

### 20.5 Buyer experience

The payment page must show, before confirmation:

```
Order price                       $1,900.00
Stripe card-processing fee          [exact]
Total charged                       [exact]

Protected by Proov
[ ] Full order funded now
[ ] Manufacturer paid only after checked milestones
[ ] Disputed milestone funds remain paused during review
```

The buyer can inspect the locked techpack, delivery terms, milestone percentages,
evidence requirements, refund rules, and dispute window before paying. After
funding, the buyer sees a timeline with `Awaiting evidence`, `Awaiting approval`,
`Release processing`, `Paid`, `Paused`, or `Refunded` for each milestone.

### 20.6 Manufacturer experience

Before sending the payment link, the manufacturer sees:

```
Buyer order price                 $1,900.00
You will receive                  PKR [guaranteed amount]
Quote expires                     [timestamp]
Payout schedule                   40% / 30% / 20% / 10%
Payout destination                [verified bank/provider account]
```

The manufacturer accepts the guaranteed net PKR amount, not an indicative rate.
After funding, every milestone shows its exact PKR payout. Failed payouts remain
owed at that PKR amount; Proov or its provider bears retry-routing differences.

### 20.7 Payout adapter and USDC

Proov uses one payout interface with replaceable licensed providers:

```
quote(usd_amount, recipient) -> guaranteed_pkr, fees, expiry
lock(quote_id, order_id) -> locked_conversion
release(lock_id, milestone_amount_pkr) -> provider_transfer_id
status(provider_transfer_id) -> processing | paid | failed | returned
refund(lock_id, amount) -> provider_refund_id
```

Supported implementations can include:

1. USD directly converted and paid to a Pakistan bank account.
2. USD converted to USDC by the licensed provider, transferred through an
   authorized corridor, converted to PKR, and paid to a verified bank account.

A Binance partnership becomes usable only when Proov has a commercial API path,
KYB onboarding, payout limits, conversion pricing, reconciliation records, and
written confirmation that the complete Proov transaction is covered by provider
and PVARA authorization. An exchange account and wallet address alone are not a
production payout integration.

### 20.8 Disputes, refunds, and cancellations

1. Before funding: either party can cancel without a Proov penalty.
2. After funding but before M1: refund the order amount, less only provider costs
   that were disclosed as non-refundable.
3. After a milestone is paid: completed milestone payments are not automatically
   clawed back. Unreleased funds remain protected.
4. A dispute pauses only the contested milestone and dependent future releases;
   uncontested completed work remains payable.
5. Evidence is judged against the locked techpack, approved revisions, quantity,
   QC requirements, Incoterm, and delivery definition.
6. Proov records every approval, reminder, evidence upload, status transition,
   provider event, and administrator decision in an immutable audit history.
7. An administrator must state a reason and attach evidence when overriding a
   release or refund. The affected parties are notified immediately.

### 20.9 Failure and risk handling

- **Expired FX quote:** block checkout and request a new manufacturer-approved
  guaranteed PKR quote.
- **Payment pending or failed:** do not mark the order funded or permit M1.
- **Provider webhook missing:** reconcile from the provider API; never infer
  payment success from the browser redirect.
- **Payout failed:** keep the milestone in `Release failed`, retain the liability,
  retry or switch an approved rail, and show the manufacturer the real failure.
- **Chargeback:** freeze unreleased funds, preserve evidence, notify both parties,
  and use the risk reserve. Released manufacturer earnings are not silently
  removed from a later order.
- **FX movement after lock:** Proov/provider absorbs it. The manufacturer's PKR
  promise does not change.
- **Provider outage:** queue no duplicate transfers; use idempotency keys and
  reconcile before retrying.
- **Wrong wallet or account:** only previously verified and allowlisted payout
  destinations can receive releases; destination changes require step-up review.

Card chargebacks can occur after manufacturer payouts. Card-processing cost paid
by the buyer does not fund this risk. Proov therefore needs a separately modeled
risk reserve and should prefer ACH or bank payment for high-value US orders.

### 20.10 Compliance gates before the first live payment

1. Form the entity accepted by the marketplace payment provider.
2. Obtain written provider approval for Proov's manufacturing marketplace,
   delayed milestone releases, fee model, chargeback ownership, and Pakistan
   payout corridor.
3. Confirm whether Proov may use `protected payment` and whether `escrow` is
   prohibited in product copy.
4. Complete manufacturer KYB, beneficial-owner verification, sanctions screening,
   bank-account verification, and export-business documentation.
5. For USDC, use a provider whose authorization covers conversion, transfer,
   custody, and Pakistan off-ramp; obtain PVARA NOC, sandbox/no-action relief, or
   written confirmation that Proov operates wholly under the provider's license.
6. Retain contracts, identity records, quotes, wallet/bank destinations, provider
   events, and transaction evidence for the legally required period.
7. Have Pakistan and entity-jurisdiction counsel review the flow before launch.

### 20.11 Pilot scope and acceptance criteria

The $1,900 sister order is a concierge pilot. Proov may operate milestone review
manually, but payment status, guaranteed PKR amount, approvals, and payout evidence
must be real and auditable.

The pilot passes only when:

1. The customer agrees to fund the full $1,900 order through Proov.
2. The customer sees and accepts the separate Stripe processing fee.
3. The manufacturer accepts a guaranteed net PKR quote before funding.
4. The complete order terms and milestone percentages are locked.
5. Each release is backed by required evidence and a provider transaction ID.
6. The manufacturer receives the exact total promised PKR amount.
7. Proov can reconcile buyer payment, provider fees, manufacturer payouts,
   refunds/reserves, and its realized margin to zero unexplained difference.
8. Both parties complete a post-order interview about trust, friction, and whether
   they would use Proov for the next order.

### 20.12 Explicit v1 non-goals

- No public bidding marketplace is required for the first protected order.
- No BNPL until the core full-funding flow works and a B2B-compatible provider is
  approved.
- No Proov-operated exchange, omnibus crypto wallet, or informal OTC conversion.
- No claim that funds are legally escrowed without provider and counsel approval.
- No automated AI release or dispute decision.
- No payout rail is labeled supported until a real end-to-end test reaches the
  manufacturer's verified destination.

---

*End of blueprint. proov.to — Production. Priced by you.*
