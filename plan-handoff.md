**The sections below are binding.** The approach, spec, and every resolved decision are checkpoints the implementation MUST hit exactly; the preview is the visual contract you MUST reproduce. Do not deviate, re-design, or skip sections. Rejected options are listed as one-liners for context only — they were considered and rejected, do not revive them.

### Approach

**Selected: B. One hospital, one builder, one passport** _(recommended)_

The focused wedge described above: one design-partner hospital, CMIO gatekeeper, live shadow-mode pipeline in-VPC, 1–3 models scored on finalized outcomes, one paid verifiable passport, thin reverse-reimbursement loop. Defers marketplace, dossiers, deployment, and the SynapseCare/Aria vision. Proves the core claim end-to-end.

_Other approaches considered:_

- **A. Prove the score before the VPC** — _Smallest cut: build the HL7→FHIR scoring + attestation engine against a retrospective / de-identified dataset (or one research-partnership extract). No live shadow-mode, no clinician micro-incentives, no CMIO sale yet. Answers "is our sc…_
- **C. Wedge + the augmentation handoff** — _Option B, plus the two extensions you flagged in Q5: a deployment path for models that are augmentation tools (the "expand to C") and a lightweight RWE-dossier template seeded from the score (early "move to B"). Still one hospital, no ma…_
- **D. The marketplace from day one** — _The full Clinical Intelligence Marketplace: multi-hospital network, two-sided rent-to-validate, auto-generated regulatory-grade RWE dossiers, plus seeds of SynapseCare / Aria / Teleradiology. Highest ceiling, but assumes liquidity, deman…_

### Scoping answers

- **1. Demand reality** → **D. Hypothesis only**
- **2. Status quo** → _B and also that we are not only targetting opensource models, many models that are built by teams the teams get stuck as the clearance and validation pathways are time taking, tiring and costly most of them die or either they make them opensource, while infact all developers want their hardwork to be apid and there is no infratructure that lets them speed up the validation process and have a credible scoring that they can show_
- **3. Champion specificity** → **A. CMIO**
- **4. Who bleeds first** → **A. Model builder pays**
- **5. The thing they walk away with** → _A but we will expand to C for the models that are actually augmentation tools not final tools, we will also move to B in time as our credibility grows_

### Decisions

#### Decision 1: HL7→FHIR mapping engine

_The pipeline's first job is silently mapping the hospital's HL7 v2 feed to FHIR R4 JSON. Mapping is notoriously messy (site-specific Z-segments, dialects). Do we build our own mappers or stand on a proven open-source converter?_

**Selected: C. OSS core + config-driven overrides**

Adopt the engine but invest early in a declarative mapping-config layer so each new hospital is config, not code. More upfront work; pays off only if you believe in multi-hospital soon (Q1 says not yet).

_Other options considered:_

- **A. Adopt an OSS converter** — _Use a battle-tested engine (HAPI FHIR, LinuxForHealth/whistle, or MS FHIR Converter) and write only the site-specific overrides. Fastest credible path; mapping is undifferentiated plumbing, not our moat._
- **B. Build custom mappers** — _Hand-roll mappers tuned to this one hospital's feed. Maximal control and clean IP, but slow, and you re-solve a solved problem before proving the wedge._

---

#### Decision 3: Ground-truth outcome labeling

_A credible score needs a trustworthy label — the finalized clinical outcome the model is graded against. Forge "reconciles queries with finalized outcomes," but where does the ground truth actually come from?_

**Selected: A. Automated from existing HL7 outcome feeds** _(recommended)_

Derive labels from the data already flowing — final ORU results, discharge diagnoses, ADT, coded outcomes — with time-delayed linkage to the original query. No new clinician burden; scales silently. Edge/ambiguous cases flagged for review.

_Other options considered:_

- **B. Clinician adjudication** — _A clinician confirms the ground-truth label per case. Highest label quality, but adds workflow burden (contradicting the "unaltered workflow" promise) and won't scale._
- **C. Registry / outcome-data linkage** — _Link to an external gold-standard registry (e.g. tumor registry, mortality index). Very credible for specific conditions, but narrow coverage and slow data availability._

---

#### Decision 5: What makes the passport trustworthy

_The passport's entire value is that a builder can wave it at a hospital or investor and be believed. What's the trust mechanism in v1 — credible now, without over-engineering?_

**Selected: A. Signed attestation + published methodology** _(recommended)_

Forge cryptographically signs each passport (tamper-evident: model hash, dataset window, sample size, metric, CI) and publishes the scoring methodology openly. Verifiable today; leaves a clean path to third-party audit later.

_Other options considered:_

- **B. Third-party auditor in the loop** — _An external auditor co-signs every passport. Maximum credibility, but adds cost, latency, and a dependency before you've proven anyone wants the passport._
- **C. Hash-anchored public ledger** — _Anchor passport hashes to a public ledger for immutability. Strong tamper-evidence story, but ledger mechanics are a distraction from the core proof and can spook conservative hospital counsel._

---

#### Decision 7: The validation passport artifact

_The passport is the one thing a builder walks away holding and shows to hospitals and investors — it IS the product surface. What form does it take? (Trust mechanism — signed attestation — was already chosen in decision 5; this is purely how it looks and travels.)_

**Selected: A. Credential card — score front and center** _(recommended)_

```html
<div style="font-family:system-ui,sans-serif;width:300px;border:1px solid #d9e2ec;border-radius:14px;padding:22px;background:linear-gradient(160deg,#ffffff,#eef6f6);box-shadow:0 4px 16px rgba(20,70,160,.08)">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:10px;letter-spacing:.1em;color:#0E7C7B;font-weight:700">FORGE VALIDATION PASSPORT</span>
    <span style="font-size:16px">🛡️</span>
  </div>
  <div style="margin:18px 0;text-align:center">
    <div style="font-size:46px;font-weight:800;color:#1546A0;line-height:1">0.94</div>
    <div style="font-size:11px;color:#627d98;margin-top:4px">ROC-AUC · finalized local outcomes</div>
  </div>
  <div style="font-size:11px;color:#334e68;border-top:1px solid #e3eaf2;padding-top:10px;line-height:1.5">
    <b>Sepsis-Onset v2</b> · n = 4,182<br>Signed &amp; ZK-verified · 2026-05
  </div>
</div>
```

A clean, shareable certificate: the score is the hero, provenance is a quiet footer. Reads as "credential," screenshots well, instantly legible to a non-technical CMIO or investor.

_Other options considered:_

- **B. Evidence report — metrics in full** — _A data-rich panel: every metric, CI, sample size, and subgroup laid out. Maximally credible to a technical reviewer, but dense and less shareable as a single glance._
- **C. Embeddable badge + verify link** — _A compact badge the builder drops on a repo README or pitch deck, linking out to the full signed record. Lowest friction to share, but the proof lives one click away rather than on the artifact._

---

#### Decision 8: The CMIO's shadow-mode console

_The CMIO is the gatekeeper who lets Forge into the VPC and defends it to security and legal (decision 3). What is the one screen that reassures them daily? The emotional job here is "prove to me, at a glance, that nothing is leaking and nothing is touching care."_

**Selected: A. Assurance panel — boundary status first** _(recommended)_

```html
<div style="font-family:system-ui,sans-serif;width:330px;border:1px solid #d9e2ec;border-radius:12px;padding:16px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.05)">
  <div style="font-size:12px;font-weight:700;color:#1A2B3C;margin-bottom:12px">Forge · Shadow-Mode Status</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:10px"><div style="font-size:18px;font-weight:800;color:#047857">0</div><div style="font-size:10px;color:#065f46">PHI records egressed</div></div>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:10px"><div style="font-size:18px;font-weight:800;color:#047857">100%</div><div style="font-size:10px;color:#065f46">ZK proofs verified</div></div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px"><div style="font-size:18px;font-weight:800;color:#1546A0">OFF</div><div style="font-size:10px;color:#1e40af">Clinical influence</div></div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px"><div style="font-size:18px;font-weight:800;color:#334e68">1,204</div><div style="font-size:10px;color:#627d98">Queries scored today</div></div>
  </div>
  <div style="margin-top:10px;font-size:10px;color:#0E7C7B">● All boundary invariants holding · last check 30s ago</div>
</div>
```

Leads with the guarantees the CMIO is accountable for: zero PHI egress, proofs verified, shadow-mode (no clinical influence). Reassurance over analytics — exactly what a nervous gatekeeper checks each morning.

_Other options considered:_

- **B. Operations dashboard — activity first** — _Leads with throughput: queries scored, models active, reconciliation progress, with boundary status as a secondary strip. Better for an engaged data-officer, but answers "what's happening" before "is it safe."_
- **C. Audit-trail first — the evidence ledger** — _Leads with an immutable, exportable event log of every query, proof, and access. Built for the compliance/security review, but reads as a forensic tool rather than a daily reassurance glance._

---

#### Decision 9: The builder's live score view

_The paying customer is the model builder (decision Q4). Between landing the pilot and the passport being issued, they watch their model's score form in real time as outcomes finalize. What's the shape of that view — the thing that keeps them engaged and paying?_

**Selected: B. Scorecard — the metrics that pass or fail you** _(recommended)_

```html
<div style="font-family:system-ui,sans-serif;width:300px;border:1px solid #d9e2ec;border-radius:12px;padding:16px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.05)">
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
    <span style="font-size:12px;font-weight:700;color:#1A2B3C">Sepsis-Onset v2 · live</span>
    <span style="font-size:10px;color:#047857">● on track</span>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:12px;color:#334e68;padding:6px 0;border-bottom:1px solid #eef2f7"><span>ROC-AUC</span><b style="color:#047857">0.94 ✓</b></div>
  <div style="display:flex;justify-content:space-between;font-size:12px;color:#334e68;padding:6px 0;border-bottom:1px solid #eef2f7"><span>Sensitivity</span><b style="color:#047857">0.89 ✓</b></div>
  <div style="display:flex;justify-content:space-between;font-size:12px;color:#334e68;padding:6px 0;border-bottom:1px solid #eef2f7"><span>Specificity</span><b>0.91</b></div>
  <div style="display:flex;justify-content:space-between;font-size:12px;color:#334e68;padding:6px 0"><span>Subgroup fairness</span><b style="color:#b45309">Δ −0.03 ⚠</b></div>
  <div style="margin-top:10px;font-size:10px;color:#627d98">n = 4,182 · passport issues at full reconciliation</div>
</div>
```

The headline score plus the supporting metrics (sensitivity, specificity, subgroup fairness) that determine whether the passport actually issues. Honest about what "passing" requires; the builder learns where they stand, not just a single number.

_Other options considered:_

- **A. Hero gauge against the bar** — _One number, dramatized: the live score as a gauge with the deployment threshold marked. Maximum emotional pull ("am I over the line yet?"), minimal detail._
- **C. Trend — the score earning itself over time** — _A time-series of the score climbing toward stability as outcomes finalize, with a confidence band narrowing. Tells the story of evidence accumulating; great for trust, heavier to read at a glance._

---

#### Decision 10: How builders package &amp; submit a model

_The model builder is the paying customer, and this is their very first touch with Forge — packaging a model and getting it into a hospital VPC they can't see into. The submission surface sets the tone for the whole relationship. What's the primary interface?_

**Selected: A. CLI — `forge submit`** _(recommended)_

A scriptable command-line tool that scaffolds, seals, and ships. Familiar to any ML engineer, automatable in CI, minimal magic. The lowest-friction first run.

_Other options considered:_

- **B. Git-push — Forge as a remote** — _Builders commit a config and git push forge ; Forge builds and submits server-side, like a PaaS. Elegant for repo-centric teams, but hides the seal/upload steps a security-conscious hospital may want explicit._
- **C. SDK — programmatic submission** — _A Python SDK for teams that want to drive Forge from inside their own training/eval pipelines. Most flexible, but more to learn than one command, and couples submission to their codebase._

---

#### Decision 11: The model adapter contract

_Forge has to wire the hospital's FHIR fields into the builder's model inputs and read its outputs back as flags — across the ZK boundary, without anyone seeing PHI. How does the builder declare that contract? This is also what the CMIO reviews to approve a model, so legibility matters on both sides._

**Selected: A. Declarative manifest (`forge.yaml`)** _(recommended)_

The builder declares input FHIR codes, output type, and entrypoint in a static file. No code to execute to understand the contract — the hospital can read and approve it directly, and it diffs cleanly in review.

_Other options considered:_

- **B. Python adapter class** — _The builder implements a small adapter interface that transforms a FHIR bundle into features. Maximally expressive for messy feature engineering, but it's code the hospital must trust and Forge must sandbox._
- **C. Auto-inferred from the container** — _Forge introspects the model's input signature and proposes FHIR mappings for the builder to confirm. Magical first run, but inference errors on clinical codes are subtle and dangerous — needs careful human review anyway._

---

#### Decision 12: Pre-submission local test loop

_The builder can never see the hospital's PHI, so they can't debug against real data. Before their container goes live in the VPC, how do they confirm it actually runs and maps correctly? A bad first submission that silently fails inside an opaque VPC is the worst DevEx outcome._

**Selected: A. Synthetic FHIR sandbox — `forge test`** _(recommended)_

Ship a local harness with realistic synthetic FHIR bundles (zero PHI) so the builder validates outputs, mappings, and latency before submitting. Fast inner loop, fully offline, nothing to approve.

_Other options considered:_

- **B. In-VPC dry-run on de-identified sample** — _A --dryrun mode executes the container against a small de-identified slice inside the real VPC, returning validity (but not scores). Closest to production, but requires hospital sign-off and round-trips for every iteration._
- **C. Submit-and-iterate (no local harness)** — _No local testing — the first signal is live scoring. Least to build, but turns every bug into a slow VPC round-trip and erodes trust on the very first run._

---

#### Decision 13: How results &amp; the passport reach the builder

_Scoring runs continuously in the VPC and the passport issues once outcomes reconcile. How does the builder receive progress and the final credential? This is the heartbeat that keeps a paying customer engaged through the reconciliation wait._

**Selected: A. Webhook + live dashboard** _(recommended)_

Push events (score updates, threshold crossed, passport issued) to a builder webhook, backed by the live scorecard from the design lens. Real-time, integrates with their tooling, no polling.

_Other options considered:_

- **B. Poll via CLI / API** — _Builder runs forge status or hits an endpoint on their own cadence. Simple and stateless, but they have to remember to check — weaker engagement during the wait._
- **C. Email / Slack milestones** — _Notifications only at key moments (threshold crossed, passport ready). Low-effort and human-friendly, but coarse and not machine-consumable for CI gating._

### Spec

### Forge v1 — Shadow-Mode Validation Rail — Spec

### Overview

**What it is.** Forge is the wedge product for Synapse: a private, shadow-mode pipeline that runs inside a hospital VPC, silently maps the hospital's HL7 v2 feed to FHIR R4, runs a model builder's sealed model against that data through a zero-knowledge boundary, scores its predictions against finalized clinical outcomes, and issues a **signed validation passport** (e.g. local ROC-AUC ≥ 0.93). PHI never leaves the hospital — only flags, the score, and a correctness proof egress.

**Why now / the bet.** Demand is still a hypothesis (no hospital has committed yet), so v1's entire job is to manufacture the first paid "yes," not to scale. The desperate, paying party is the **model builder** (open-source *and* proprietary teams whose models die in slow, costly clearance); the hospital's **CMIO** is the gatekeeper who lets Forge into the VPC. The atomic unit of value is a portable, credible score a builder can show any hospital or investor.

**Scope (approach B — "one hospital, one builder, one passport").** Land one design-partner hospital (academic medical center preferred, for clean IRB / non-interventional-research exemption and credibility), score 1–3 builder models, issue one paid passport. The reverse-reimbursement micro-incentive loop is instrumented but not paid out. Marketplace, RWE dossiers, deployment handoff, and the broader SynapseCare / Aria vision are explicitly deferred. Regulatory posture: exemption-anchored, shadow-only (never influences care), backed by a formal legal opinion. Pricing v1: per-passport fee (cleanest willingness-to-pay signal). Moat: the proprietary outcome-linked RWE dataset **plus** a builder-seeded two-sided network (each builder onboards a hospital they already validate with manually, solving cold-start).

---

### Decision 1: HL7→FHIR mapping engine
**Chosen:** OSS core + config-driven overrides.
**Rationale:** Stand on a battle-tested converter (HAPI FHIR / LinuxForHealth-whistle / MS FHIR Converter) rather than re-solving a solved problem, but invest early in a declarative per-site mapping-config layer so each new hospital is config, not code — paying forward the builder-seeded multi-hospital network (moat) without hand-rolling mappers.

### Decision 3: Ground-truth outcome labeling
**Chosen:** Automated from existing HL7 outcome feeds.
**Rationale:** Derive labels from data already flowing (final ORU results, discharge diagnoses, ADT, coded outcomes) with time-delayed linkage to the original prediction. Adds zero clinician burden — preserving the "unaltered workflow" promise — and scales silently. Ambiguous cases are flagged to a review queue rather than silently mislabeled.

### Decision 5: What makes the passport trustworthy
**Chosen:** Signed attestation + published methodology.
**Rationale:** Forge cryptographically signs each passport (model hash, dataset window, sample size, metric, CI) and publishes the scoring methodology openly. Verifiable today with no external dependency, and leaves a clean upgrade path to a third-party auditor as credibility grows. Avoids ledger mechanics that spook conservative hospital counsel.

### Decision 7: The validation passport artifact
**Chosen:** Credential card — score front and center.
**Rationale:** The passport is the product surface the builder shows hospitals and investors. A clean, screenshot-able credential with the score as hero and provenance as a quiet footer is instantly legible to a non-technical CMIO or investor. Fuller evidence report and embeddable badge are follow-on formats.

### Decision 8: The CMIO's shadow-mode console
**Chosen:** Assurance panel — boundary status first.
**Rationale:** The CMIO's daily emotional job is "prove nothing is leaking and nothing is touching care." Lead with the invariants they're accountable for — **0 PHI egressed, 100% proofs verified, clinical influence OFF** — over throughput analytics. Reassurance is the gatekeeper's morning glance.

### Decision 9: The builder's live score view
**Chosen:** Scorecard — the metrics that pass or fail you.
**Rationale:** Show the headline score plus the supporting metrics (sensitivity, specificity, subgroup fairness) that actually gate passport issuance. Honest about what "passing" requires; a builder learns where they stand, not just a single number — and the subgroup-fairness gate can hold a model even when AUC clears the bar.

### Decision 10: How builders package & submit a model
**Chosen:** CLI — `forge submit`.
**Rationale:** A scriptable, CI-automatable command-line tool is familiar to any ML engineer and keeps the seal/upload steps explicit (which a security-conscious hospital wants visible). Git-push and SDK paths can follow; the CLI is the lowest-friction first run.

### Decision 11: The model adapter contract
**Chosen:** Declarative manifest (`forge.yaml`).
**Rationale:** The builder declares input FHIR codes, output type, and entrypoint in a static, reviewable file — no code to execute to understand the contract. Critically, this is also the artifact the CMIO reviews to approve a model, and it diffs cleanly in review. Python adapter and auto-inference are riskier (executable trust surface; subtle clinical-code mis-mappings).

### Decision 12: Pre-submission local test loop
**Chosen:** Synthetic FHIR sandbox — `forge test`.
**Rationale:** Builders can never see PHI, so they need a fast, offline inner loop. Ship a local harness with realistic synthetic FHIR bundles to validate outputs, feature mapping, and latency before submitting — avoiding the worst DevEx outcome (a silent failure inside an opaque VPC).

### Decision 13: How results & the passport reach the builder
**Chosen:** Webhook + live dashboard.
**Rationale:** Push events (`score.updated`, `threshold.crossed`, `case.quarantined`, `passport.issued`) to a builder webhook, backed by the live scorecard. Real-time and machine-consumable (CI-gating friendly), keeping a paying customer engaged through the reconciliation wait — no polling required.

---

### Open Decisions (not yet locked — must close before build)

- **Decision 2 — VPC topology & data boundary.** Leading intent from later lenses is *hybrid: scoring workers in-VPC, Forge cloud control plane, with a ZK query layer so only flags + proofs (never PHI) cross the boundary.* Drawn dashed in the preview architecture. **Blocks** the deployment/security design and the CMIO security review.
- **Decision 4 — How the builder's model runs.** Leading intent is *Forge-provided runtime container running the sealed builder model in-VPC, with every inference mediated by the ZK query system.* **Blocks** the runtime container spec and the `forge submit` sealing format.
- **Decision 6 — Reverse-reimbursement loop in v1.** Leading intent is *instrument now, pay later* — log the full query→outcome reconciliation loop but defer cash payments until AKS/Stark counsel clears the structure. **Blocks** anything that would move money to clinicians.

These three are interdependent (all hinge on the ZK boundary) and should be closed together with security/legal input before implementation starts.

---

### Implementation Notes

This is a greenfield repo (single initial commit). The build creates a small monorepo; representative paths the change will introduce:

**In-VPC pipeline (deployed inside the hospital VPC)**
- `services/ingest/hl7_listener.*` — MLLP listener for the HL7 v2 feed; idempotency keyed on encounter id (handles duplicate/replayed messages).
- `services/mapping/` — wraps the chosen OSS FHIR converter (**D1**); `mapping/config/<site>.yaml` holds the declarative per-site overrides (Z-segment / dialect handling). Unmapped segments route to a mapping-review queue.
- `services/zk/` — ZK query engine + flag/proof emission at the data boundary (**leading intent for D2/D4 — confirm before building**).
- `services/runtime/` — Forge-provided container that loads a sealed builder model and runs inference through the ZK layer (**D4, open**).
- `services/reconciler/` — links predictions to finalized outcomes from ORU/discharge/ADT feeds with a time window; drops + logs label gaps; quarantines cases on proof-verification failure (**D3**).
- `services/scoring/` — rolling ROC-AUC, sensitivity/specificity, subgroup-fairness gate; emits score events.

**Forge cloud (control plane)**
- `cloud/control-plane/` — orchestration, fleet config, receives only flags + score + proof.
- `cloud/passport/` — passport signing service (model hash, window, n, metric, CI) + published methodology doc (**D5**); passport payload schema per the preview contract table.
- `cloud/webhooks/` — builder webhook dispatch + event schema (**D13**).

**Builder-facing**
- `cli/forge/` — `forge init | build | test | submit | status` (**D10, D12**); `forge test` ships a `cli/forge/fixtures/synthetic_fhir/` bundle set (zero PHI).
- `schema/forge.yaml.schema.json` — manifest contract validated at `forge build` and surfaced for CMIO approval (**D11**).

**Web surfaces** (style tokens per the Phase 4 preview `:root`)
- `web/cmio-console/` — assurance panel: PHI-egress=0, proofs-verified, clinical-influence-OFF, queries-scored (**D8**).
- `web/builder-dashboard/` — live scorecard + passport credential card (**D9, D7**).

**Cross-cutting invariants to enforce in code & audited continuously**
- Shadow-mode: no code path returns model output to the care workflow ("clinical influence: OFF").
- Boundary: nothing but flags, score, and proof leaves the VPC; a failed proof never counts toward a score.
- Reverse-reimbursement: log-only until counsel clears payouts (**D6, open**).

### Verification
1. **Local**: `forge test` against synthetic FHIR — assert 100% bundles produce valid probabilities and all manifest features map; check est. in-VPC latency.
2. **Pipeline integration**: replay a synthetic HL7 stream through ingest→mapping→zk→runtime→reconciler→scoring; assert idempotency on duplicate messages, correct linkage on out-of-order outcomes, and quarantine on forced proof failure.
3. **Passport**: issue a passport on a synthetic cohort; verify signature, payload fields, and that the subgroup-fairness gate withholds issuance when Δ breaches threshold even with AUC ≥ 0.93.
4. **Boundary audit**: assert egress contains zero PHI (only flags/score/proof) and that the CMIO console reflects `PHI egressed = 0`.
5. **Webhooks**: confirm `score.updated`, `threshold.crossed`, `case.quarantined`, and `passport.issued` fire with the documented payloads.

### Preview

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Forge v1 — Plan Preview</title>
<style>
:root{
  --bg:#F7FAFC; --surface:#FFFFFF; --surface-alt:#EEF6F6; --panel:#FCFEFE;
  --border:#D9E2EC; --border-strong:#CBD6E2;
  --primary:#0E7C7B; --primary-ink:#085E5D; --primary-soft:#E6F4F4;
  --accent:#1546A0; --accent-soft:#EFF6FF; --accent-border:#BFDBFE;
  --ok:#047857; --ok-soft:#ECFDF5; --ok-border:#A7F3D0;
  --warn:#B45309; --warn-soft:#FFFBEB; --warn-border:#FDE68A;
  --ink:#1A2B3C; --muted:#627D98; --faint:#94A3B8;
  --radius:14px; --radius-sm:8px; --radius-xs:6px;
  --shadow:0 4px 16px rgba(20,70,160,.08); --shadow-sm:0 2px 10px rgba(0,0,0,.05);
  --font:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --sp:16px; --sp-lg:24px;
}
*{box-sizing:border-box}
html,body{margin:0;width:100%}
body{
  background:var(--bg); color:var(--ink); font-family:var(--font);
  line-height:1.5; container-type:inline-size; container-name:plan-preview; display:block;
}
.page{max-width:1100px;margin-inline:auto;padding:var(--sp-lg) var(--sp)}
h1,h2,h3{margin:0;line-height:1.2}
h1{font-size:24px;font-weight:800;letter-spacing:-.01em}
h2{font-size:16px;font-weight:700;color:var(--ink)}
.sub{color:var(--muted);font-size:13px;margin-top:4px}
.eyebrow{font-size:10px;letter-spacing:.12em;font-weight:700;color:var(--primary);text-transform:uppercase}

/* header */
.head{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:var(--sp-lg);box-shadow:var(--shadow);margin-bottom:var(--sp-lg)}
.ships{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ship{font-size:12px;color:var(--ink);background:var(--surface-alt);
  border:1px solid var(--border);border-radius:999px;padding:5px 12px}
.ship b{color:var(--primary-ink)}

/* section shell */
section{margin-bottom:var(--sp-lg)}
.shead{display:flex;align-items:baseline;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.shead .n{font-family:var(--mono);font-size:12px;color:var(--accent);
  background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:var(--radius-xs);padding:2px 8px}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  padding:var(--sp);box-shadow:var(--shadow-sm)}
figure{margin:0}
figcaption{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}

/* decision chips */
.chip{font-size:11px;color:var(--primary-ink);background:var(--primary-soft);
  border:1px solid var(--primary);border-radius:999px;padding:3px 10px;font-weight:600}
.chip.pending{color:var(--warn);background:var(--warn-soft);border-color:var(--warn-border)}
.chip .k{font-family:var(--mono);opacity:.7;margin-right:4px}

/* open-decisions banner */
.open{display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:var(--warn-soft);
  border:1px dashed var(--warn-border);border-radius:var(--radius-sm);padding:12px 14px;font-size:12px;color:var(--warn)}
.open strong{color:var(--ink)}

/* surfaces grid */
.surfaces{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sp)}
@container plan-preview (min-width:640px){.surfaces{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container plan-preview (min-width:980px){.surfaces{grid-template-columns:repeat(3,minmax(0,1fr))}}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  box-shadow:var(--shadow-sm);min-width:0;display:flex;flex-direction:column;overflow:hidden}
.card .cap{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:8px}
.card .cap .t{font-size:12px;font-weight:700}
.card .body{padding:16px;flex:1 1 auto}

/* passport credential */
.passport{border:1px solid var(--border);border-radius:var(--radius);
  background:linear-gradient(160deg,var(--surface),var(--surface-alt));box-shadow:var(--shadow);padding:20px}
.passport .row{display:flex;justify-content:space-between;align-items:center}
.passport .score{font-size:46px;font-weight:800;color:var(--accent);line-height:1;text-align:center;margin:14px 0 2px}
.passport .scl{font-size:11px;color:var(--muted);text-align:center}
.passport .meta{font-size:11px;color:var(--ink);border-top:1px solid var(--border);padding-top:10px;margin-top:14px;line-height:1.6}

/* assurance grid */
.assure{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat{border-radius:var(--radius-sm);padding:10px}
.stat .v{font-size:18px;font-weight:800}
.stat .l{font-size:10px}
.stat.good{background:var(--ok-soft);border:1px solid var(--ok-border)}
.stat.good .v{color:var(--ok)} .stat.good .l{color:var(--primary-ink)}
.stat.info{background:var(--accent-soft);border:1px solid var(--accent-border)}
.stat.info .v{color:var(--accent)} .stat.info .l{color:var(--accent)}
.stat.neutral{background:var(--bg);border:1px solid var(--border)}
.stat.neutral .v{color:var(--ink)} .stat.neutral .l{color:var(--muted)}
.pulse{margin-top:10px;font-size:10px;color:var(--primary)}

/* scorecard */
.metric{display:flex;justify-content:space-between;font-size:12px;color:var(--ink);padding:7px 0;border-bottom:1px solid var(--border)}
.metric:last-child{border-bottom:0}
.metric b.ok{color:var(--ok)} .metric b.warn{color:var(--warn)}
.scnote{font-size:10px;color:var(--muted);margin-top:10px}
.live{font-size:10px;color:var(--ok)}

/* code */
pre.code{background:#0F2230;color:#D7E3EC;border-radius:var(--radius-sm);padding:14px;overflow:auto;
  font-family:var(--mono);font-size:12px;line-height:1.7;margin:0}
pre.code .c{color:#7FA8B8} pre.code .ok{color:#6EE7B7} pre.code .p{color:#7FB2FF}

/* tables */
table.t{width:100%;border-collapse:collapse;font-size:12px}
table.t th,table.t td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--border);vertical-align:top}
table.t th{background:var(--surface-alt);color:var(--primary-ink);font-size:11px;letter-spacing:.03em}
table.t td code{font-family:var(--mono);font-size:11px;background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:4px;padding:1px 5px;color:var(--accent)}
.twrap{border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden}

/* two-col helper */
.cols{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sp)}
@container plan-preview (min-width:820px){.cols{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* edge list */
ul.edges{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
@container plan-preview (min-width:760px){ul.edges{grid-template-columns:repeat(2,minmax(0,1fr))}}
ul.edges li{background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--primary);
  border-radius:var(--radius-xs);padding:10px 12px;font-size:12px;min-width:0}
ul.edges li b{display:block;color:var(--ink);font-size:12px;margin-bottom:2px}
ul.edges li span{color:var(--muted)}

pre.mermaid{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin:0}
.legend-note{font-size:11px;color:var(--muted);margin-top:8px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div class="page">

  <header class="head">
    <div class="eyebrow">Forge v1 · Synapse</div>
    <h1>Shadow-mode validation rail — one hospital, one builder, one passport</h1>
    <p class="sub">A builder seals a model → Forge runs it inside the hospital VPC through a ZK boundary → scores it against finalized HL7 outcomes → issues a signed validation passport. PHI never leaves; only flags, the score, and a proof do.</p>
    <div class="ships">
      <span class="ship"><b>Ships:</b> in-VPC HL7→FHIR scoring pipeline</span>
      <span class="ship">ZK flag-only egress boundary</span>
      <span class="ship"><b>forge</b> CLI + SDK</span>
      <span class="ship">Signed passport + builder dashboard</span>
      <span class="ship">CMIO assurance console</span>
    </div>
  </header>

  <!-- OPEN DECISIONS -->
  <section>
    <div class="open">
      <strong>Still open:</strong>
      <span class="chip pending" data-decision="2"><span class="k">D2</span>VPC topology &amp; data boundary</span>
      <span class="chip pending" data-decision="4"><span class="k">D4</span>How the builder's model runs</span>
      <span class="chip pending" data-decision="6"><span class="k">D6</span>Reverse-reimbursement loop</span>
      <span>— shown below as the leading ZK path, drawn dashed until confirmed.</span>
    </div>
  </section>

  <!-- IN-APP SURFACES -->
  <section>
    <div class="shead"><span class="n">A</span><h2>What users see</h2></div>
    <div class="surfaces">

      <!-- Passport (D7) -->
      <div class="card" data-decision="7">
        <div class="cap"><span class="t">Builder — Validation Passport</span><span class="chip"><span class="k">D7</span>Credential</span></div>
        <div class="body">
          <div class="passport">
            <div class="row"><span class="eyebrow">Forge Validation Passport</span><span aria-hidden="true">🛡️</span></div>
            <div class="score">0.94</div>
            <div class="scl">ROC-AUC · finalized local outcomes</div>
            <div class="meta"><b>Sepsis-Onset v2</b> · n = 4,182<br>Signed &amp; ZK-verified · 2026-05 · methodology v1.2</div>
          </div>
        </div>
      </div>

      <!-- CMIO console (D8) -->
      <div class="card" data-decision="8">
        <div class="cap"><span class="t">CMIO — Shadow-Mode Status</span><span class="chip"><span class="k">D8</span>Assurance</span></div>
        <div class="body">
          <div class="assure">
            <div class="stat good"><div class="v">0</div><div class="l">PHI records egressed</div></div>
            <div class="stat good"><div class="v">100%</div><div class="l">ZK proofs verified</div></div>
            <div class="stat info"><div class="v">OFF</div><div class="l">Clinical influence</div></div>
            <div class="stat neutral"><div class="v">1,204</div><div class="l">Queries scored today</div></div>
          </div>
          <div class="pulse">● All boundary invariants holding · last check 30s ago</div>
        </div>
      </div>

      <!-- Builder scorecard (D9) -->
      <div class="card" data-decision="9">
        <div class="cap"><span class="t">Builder — Live Scorecard</span><span class="chip"><span class="k">D9</span>Scorecard</span></div>
        <div class="body">
          <div class="metric"><span>ROC-AUC</span><b class="ok">0.94 ✓</b></div>
          <div class="metric"><span>Sensitivity</span><b class="ok">0.89 ✓</b></div>
          <div class="metric"><span>Specificity</span><b>0.91</b></div>
          <div class="metric"><span>Subgroup fairness</span><b class="warn">Δ −0.03 ⚠</b></div>
          <div class="scnote">n = 4,182 · <span class="live">● on track</span> · passport issues at full reconciliation</div>
        </div>
      </div>

    </div>
  </section>

  <!-- ARCHITECTURE -->
  <section>
    <div class="shead"><span class="n">B</span><h2>Architecture — what runs where</h2></div>
    <div class="panel">
      <figure>
        <pre class="mermaid">
flowchart LR
  subgraph H["Hospital VPC — PHI never leaves"]
    direction LR
    HL7["HL7 v2 feed"]:::src --> MAP["FHIR R4 mapper<br/>OSS + config overrides"]:::d1
    MAP --> ZK{"ZK query engine<br/>flags only"}:::bound
    MC["Forge runtime container<br/>sealed builder model"]:::pending --> ZK
    ZK --> REC["Outcome reconciler<br/>from HL7 result / discharge"]:::d3
    REC --> SCORE["Scoring engine<br/>rolling ROC-AUC"]
  end
  SCORE -->|"flags + score + ZK proof"| CP["Forge cloud<br/>control plane"]:::cloud
  CP --> PASS["Signed passport"]:::d5
  CP --> WH["Builder webhook<br/>+ dashboard"]:::d13
  classDef src fill:#F7FAFC,stroke:#627D98,color:#1A2B3C;
  classDef d1 fill:#EFF6FF,stroke:#1546A0,color:#1A2B3C;
  classDef d3 fill:#EFF6FF,stroke:#1546A0,color:#1A2B3C;
  classDef d5 fill:#E6F4F4,stroke:#0E7C7B,color:#085E5D;
  classDef d13 fill:#E6F4F4,stroke:#0E7C7B,color:#085E5D;
  classDef bound fill:#E6F4F4,stroke:#0E7C7B,color:#085E5D,stroke-width:2px;
  classDef cloud fill:#FFFFFF,stroke:#1546A0,color:#1A2B3C;
  classDef pending fill:#FFFBEB,stroke:#B45309,color:#B45309,stroke-dasharray:5 5;
        </pre>
        <figcaption>
          <span class="chip" data-decision="1"><span class="k">D1</span>OSS mapper + overrides</span>
          <span class="chip pending" data-decision="2"><span class="k">D2</span>topology (open)</span>
          <span class="chip pending" data-decision="4"><span class="k">D4</span>ZK runtime container (open)</span>
          <span class="chip" data-decision="3"><span class="k">D3</span>HL7 outcome reconciler</span>
          <span class="chip" data-decision="5"><span class="k">D5</span>signed passport</span>
          <span class="chip" data-decision="13"><span class="k">D13</span>webhook + dashboard</span>
        </figcaption>
        <p class="legend-note">Dashed nodes correspond to decisions not yet locked; the ZK boundary is drawn as the leading intent from the Design/DevEx lenses.</p>
      </figure>
    </div>
  </section>

  <!-- FLOW -->
  <section>
    <div class="shead"><span class="n">C</span><h2>Lifecycle — query to passport (with failure paths)</h2></div>
    <div class="panel">
      <figure>
        <pre class="mermaid">
sequenceDiagram
  autonumber
  participant C as Clinician (unaltered)
  participant V as Forge in-VPC
  participant Z as ZK engine
  participant R as Reconciler
  participant F as Forge cloud
  C->>V: Encounter → HL7 event
  V->>V: Map HL7 → FHIR R4
  V->>Z: Run sealed model on FHIR
  Z-->>V: Flag + ZK proof (no PHI)
  Note over V,R: prediction stored, outcome pending
  R->>R: Await final ORU / discharge code
  alt outcome finalized in window
    R->>F: (prediction, outcome) + proof
    F->>F: Update rolling ROC-AUC
  else outcome missing past window
    R-->>R: Drop case · log label gap
  end
  Note over Z,F: proof fails → quarantine case, alert CMIO
  Note over F: n ≥ target AND AUC ≥ 0.93 → issue passport
  F-->>C: shadow-mode — nothing returned to care
        </pre>
        <figcaption>
          <span class="chip" data-decision="3"><span class="k">D3</span>automated outcome linkage</span>
          <span class="chip" data-decision="5"><span class="k">D5</span>proof-gated scoring</span>
          <span class="chip pending" data-decision="6"><span class="k">D6</span>query logged for reverse-reimbursement (pay later)</span>
        </figcaption>
      </figure>
    </div>
  </section>

  <!-- STATE -->
  <section>
    <div class="shead"><span class="n">D</span><h2>Model &amp; passport state machine</h2></div>
    <div class="panel">
      <figure>
        <pre class="mermaid">
stateDiagram-v2
  [*] --> Submitted
  Submitted --> Validating: container sealed & CMIO-approved
  Validating --> Accruing: scoring live in VPC
  Accruing --> Accruing: outcomes reconciling
  Accruing --> Passed: n≥target & AUC≥0.93 & fairness OK
  Accruing --> BelowBar: window closed, bar not met
  Passed --> PassportIssued: signed & published
  BelowBar --> Resubmittable: builder iterates
  Resubmittable --> Submitted
  PassportIssued --> [*]
        </pre>
        <p class="legend-note">Subgroup-fairness gate (see scorecard ⚠) can hold a model in <b>Accruing</b> even when headline AUC clears 0.93.</p>
      </figure>
    </div>
  </section>

  <!-- DEVEX -->
  <section>
    <div class="shead"><span class="n">E</span><h2>Builder developer experience</h2></div>
    <div class="cols">
      <div class="panel" data-decision="10">
        <div class="shead" style="margin-bottom:8px"><span class="chip"><span class="k">D10</span>CLI submit</span><span class="chip" data-decision="12"><span class="k">D12</span>local test</span></div>
        <pre class="code"><span class="c"># validate locally on synthetic FHIR (no PHI)</span>
$ forge test
<span class="ok">✓</span> 200/200 synthetic encounters scored
<span class="ok">✓</span> adapter mapped 3/3 FHIR features
ℹ est. in-VPC latency: 42 ms/query

<span class="c"># seal &amp; ship into the hospital VPC</span>
$ forge submit <span class="p">--pilot</span> mercy-general
<span class="ok">✓</span> container sealed  sha256:9f2a…
<span class="ok">✓</span> pushed to Mercy General VPC registry
→ scoring begins on next matching encounter</pre>
      </div>
      <div class="panel" data-decision="11">
        <div class="shead" style="margin-bottom:8px"><span class="chip"><span class="k">D11</span>forge.yaml manifest</span></div>
        <pre class="code"><span class="c"># declares how FHIR maps to your model</span>
task: sepsis-onset
inputs:
  - fhir: Observation.code=2160-0   <span class="c"># creatinine</span>
  - fhir: Observation.code=2524-7   <span class="c"># lactate</span>
  - fhir: Patient.age
output:
  type: probability                  <span class="c"># 0..1 vs outcome</span>
entrypoint: python predict.py</pre>
        <p class="legend-note">Static &amp; reviewable — this is also the artifact the CMIO approves before a model goes live.</p>
      </div>
    </div>
  </section>

  <!-- CONTRACTS -->
  <section>
    <div class="shead"><span class="n">F</span><h2>Shapes that change — key contracts</h2></div>

    <div class="cols">
      <div>
        <h3 style="font-size:13px;margin-bottom:8px">Signed passport payload <span class="chip" data-decision="5"><span class="k">D5</span></span></h3>
        <div class="twrap">
          <table class="t">
            <tr><th>Field</th><th>Example</th></tr>
            <tr><td><code>model_hash</code></td><td>sha256:9f2a…</td></tr>
            <tr><td><code>task</code></td><td>sepsis-onset</td></tr>
            <tr><td><code>metric</code></td><td>ROC-AUC = 0.94 (0.91–0.96)</td></tr>
            <tr><td><code>n</code></td><td>4,182</td></tr>
            <tr><td><code>window</code></td><td>2026-02-01 … 2026-05-01</td></tr>
            <tr><td><code>site</code></td><td>Mercy General (academic)</td></tr>
            <tr><td><code>proof</code></td><td>zk-bundle ref + Forge signature</td></tr>
          </table>
        </div>
      </div>

      <div>
        <h3 style="font-size:13px;margin-bottom:8px">Webhook event <span class="chip" data-decision="13"><span class="k">D13</span></span></h3>
        <div class="twrap">
          <table class="t">
            <tr><th>Event</th><th>Payload</th></tr>
            <tr><td><code>score.updated</code></td><td>auc, n, ci, fairness_delta</td></tr>
            <tr><td><code>threshold.crossed</code></td><td>metric, value, bar</td></tr>
            <tr><td><code>case.quarantined</code></td><td>reason=proof_fail</td></tr>
            <tr><td><code>passport.issued</code></td><td>passport_id, signed_url</td></tr>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- EDGE CASES -->
  <section>
    <div class="shead"><span class="n">G</span><h2>Edge cases &amp; failure modes</h2></div>
    <ul class="edges">
      <li><b>Outcome never finalizes</b><span>Label gap past the reconciliation window → case dropped, logged; never silently counted as negative.</span></li>
      <li><b>HL7 dialect / Z-segment miss</b><span>Mapper override missing → case routed to mapping-review queue, excluded from scoring until resolved.</span></li>
      <li><b>ZK proof verification fails</b><span>Case quarantined, excluded from the score, CMIO alerted — a failed proof never inflates results.</span></li>
      <li><b>Model container crash / timeout</b><span>Per-query timeout; failures retried then skipped, surfaced on the builder scorecard as coverage &lt; 100%.</span></li>
      <li><b>Duplicate / replayed HL7 message</b><span>Idempotency key on encounter id — re-delivery does not double-count a prediction.</span></li>
      <li><b>Late-arriving outcomes (ordering)</b><span>Reconciler keyed on encounter, not arrival order; out-of-order finals still link correctly.</span></li>
      <li><b>Subgroup fairness below bar</b><span>Headline AUC ≥ 0.93 but Δ breaches fairness gate → passport withheld, model stays Accruing.</span></li>
      <li><b>Shadow-mode invariant</b><span>No path returns model output to care; "Clinical influence: OFF" is asserted and audited continuously.</span></li>
    </ul>
  </section>

</div>

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad:true,
    theme:'base',
    themeVariables:{
      primaryColor:'#E6F4F4', primaryBorderColor:'#0E7C7B', primaryTextColor:'#1A2B3C',
      lineColor:'#627D98', secondaryColor:'#EFF6FF', tertiaryColor:'#F7FAFC',
      fontFamily:'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', fontSize:'13px'
    }
  });
</script>
</body>
</html>
```

### Metadata

- Source plan: `zuuumVSK80sVSYDWKdgkn`
- Resolved decisions: 10
- Generated at: 2026-06-07T12:20:14.771Z