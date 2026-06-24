"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronLeft, FileText, PackagePlus, Sparkles, Users } from "lucide-react"
import { OrderProduct, TechpackPage, TechpackPageType, proovDb } from "@/lib/db"
import { useOrderCreation } from "./OrderCreationContext"
import InviteManufacturerModal from "./InviteManufacturerModal"

const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "XXL"]
const TECHPACK_PAGES: Array<{ id: TechpackPageType; label: string }> = [
  { id: "cover", label: "Cover" },
  { id: "flats", label: "Flats" },
  { id: "bom", label: "BOM" },
  { id: "measurements", label: "Measurements" },
  { id: "colorways", label: "Colorways" },
  { id: "packaging", label: "Packaging" },
]

const defaultSizeGrid = () => ({ XS: 0, S: 12, M: 24, L: 24, XL: 12, XXL: 0 })

function totalFromGrid(sizeGrid: Record<string, number> | undefined) {
  return Object.values(sizeGrid || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)
}

function buildTechpackPage(product: OrderProduct, pageType: TechpackPageType, isComplete = false): TechpackPage {
  const common = {
    styleName: product.name,
    category: product.category || "Sportswear",
    quantity: product.quantity || 0,
    material: product.primary_material || "",
  }

  return {
    id: crypto.randomUUID(),
    order_product_id: product.id,
    page_type: pageType,
    content: pageType === "cover" ? common : { ...common, status: isComplete ? "confirmed" : "not_started" },
    image_urls: product.thumbnail_url ? [product.thumbnail_url] : [],
    is_complete: isComplete,
    version: 1,
  }
}

function priceTiers(product: OrderProduct) {
  const base = Math.max(4, Math.round(((product.target_unit_price || 8) || 8) * 100) / 100)
  return [
    { id: "budget", label: "Budget", price: Math.max(1, base * 0.86), impact: "More bids, tighter margins" },
    { id: "recommended", label: "Recommended", price: base, impact: "Balanced bid volume" },
    { id: "premium", label: "Premium", price: base * 1.18, impact: "Fewer bids, stronger factories" },
  ]
}

export default function OrderCreationWizard() {
  const router = useRouter()
  const { state, dispatch } = useOrderCreation()
  const [manualName, setManualName] = useState("")
  const [manualCategory, setManualCategory] = useState("Sportswear")
  const [manualMaterial, setManualMaterial] = useState("Polyester mesh")
  const [manualBlank, setManualBlank] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invitedManufacturerIds, setInvitedManufacturerIds] = useState<string[]>([])

  const orderTotal = useMemo(
    () => state.products.reduce((sum, product) => sum + ((product.target_unit_price || 0) * (product.quantity || 0)), 0),
    [state.products]
  )

  const hasPartialCoverage = state.products.some((product) => product.is_blank_template || product.quality_coverage === "partial")
  const canContinue = Boolean(state.role && state.products.length > 0)

  const addProduct = () => {
    if (!manualName.trim()) return
    const id = crypto.randomUUID()
    const sizeGrid = defaultSizeGrid()
    const product: OrderProduct = {
      id,
      order_id: "",
      name: manualName.trim(),
      category: manualCategory,
      primary_material: manualMaterial,
      quantity: totalFromGrid(sizeGrid),
      unit: "pieces",
      target_unit_price: 8,
      sort_order: state.products.length,
      is_blank_template: manualBlank,
      quality_coverage: manualBlank ? "partial" : "full",
      size_grid: sizeGrid,
      roster_enabled: false,
      roster_rows: [],
      specs_snapshot: {
        source: manualBlank ? "blank_template" : "manual",
        aiConfirmation: "pending",
      },
      techpack_pages: [],
    }

    dispatch({ type: "ADD_PRODUCT", payload: product })
    TECHPACK_PAGES.forEach((page, index) => {
      dispatch({
        type: "SET_TECHPACK_PAGE",
        payload: { productId: id, page: buildTechpackPage(product, page.id, index === 0 && !manualBlank) },
      })
    })
    setManualName("")
    setManualMaterial("Polyester mesh")
    setManualBlank(false)
  }

  const updateProduct = (product: OrderProduct, patch: Partial<OrderProduct>) => {
    dispatch({ type: "UPDATE_PRODUCT", payload: { ...product, ...patch } })
  }

  const updateSize = (product: OrderProduct, size: string, value: number) => {
    const nextGrid = { ...(product.size_grid || {}), [size]: Math.max(0, value || 0) }
    updateProduct(product, { size_grid: nextGrid, quantity: totalFromGrid(nextGrid) })
  }

  const markPageComplete = (product: OrderProduct, pageType: TechpackPageType) => {
    dispatch({
      type: "SET_TECHPACK_PAGE",
      payload: { productId: product.id, page: buildTechpackPage(product, pageType, true) },
    })
  }

  const publish = async (saveAsDraft = false) => {
    setLastError(null)
    if (!state.role || state.products.length === 0) {
      setLastError("Choose Sourcing or Selling and add at least one product.")
      return
    }

    setIsPosting(true)
    const result = await proovDb.publishOrderCanvas({
      orderName: state.orderName,
      role: state.role,
      visibility: state.visibility,
      splitBidding: state.splitBidding,
      products: state.products,
      techpackData: state.techpackData,
      logistics: state.logistics,
      saveAsDraft,
      invitedManufacturerIds,
    })
    setIsPosting(false)

    if (!result) {
      setLastError("Could not save this order. Check Supabase env vars and migrations.")
      return
    }

    if (saveAsDraft) {
      router.push("/orders?view=list")
      return
    }

    if (result.orderId) {
      router.push(`/orders/${result.orderId}`)
    } else {
      router.push("/dashboard?panel=market")
    }
  }

  if (state.screen === "logistics") {
    return (
      <div className="min-h-screen bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
        <div className="border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-8 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button className="btn-secondary" onClick={() => dispatch({ type: "SET_SCREEN", payload: "canvas" })}>
              <ChevronLeft size={16} /> Back to order
            </button>
            <div className="text-sm text-[var(--color-text-secondary)]">
              Specs lock when this order is published.
            </div>
          </div>
        </div>

        <main className="mx-auto grid max-w-6xl grid-cols-[1fr_360px] gap-6 px-8 py-8">
          <section className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-6">
            <h1 className="mb-2 text-2xl font-semibold">Publish logistics</h1>
            <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
              Choose how this order is distributed and provide the fulfillment details manufacturers need.
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4">
              {[
                { id: "market", title: "Post to Market", text: "Visible to verified manufacturers in the category." },
                { id: "private", title: "Invite directly", text: "Private order link or selected manufacturers only." },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => dispatch({ type: "SET_VISIBILITY", payload: option.id as "market" | "private" })}
                  className={`rounded-lg border p-5 text-left ${
                    state.visibility === option.id
                      ? "border-[var(--color-border-info)] bg-[var(--color-background-info)]"
                      : "border-[var(--color-border-tertiary)] bg-white"
                  }`}
                >
                  <div className="mb-1 font-semibold">{option.title}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{option.text}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Turnaround time
                <input
                  type="number"
                  min={1}
                  value={state.logistics.tatDays || 0}
                  onChange={(event) => dispatch({ type: "UPDATE_LOGISTICS", payload: { tatDays: Number(event.target.value) } })}
                  className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Incoterms
                <select
                  value={state.logistics.incoterms || "FOB"}
                  onChange={(event) => dispatch({ type: "UPDATE_LOGISTICS", payload: { incoterms: event.target.value as "FOB" | "CIF" | "EXW" | "DDP" } })}
                  className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2"
                >
                  <option>FOB</option>
                  <option>CIF</option>
                  <option>EXW</option>
                  <option>DDP</option>
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-md border border-[var(--color-border-tertiary)] px-3 py-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={state.logistics.sampleRequired || false}
                  onChange={(event) => dispatch({ type: "UPDATE_LOGISTICS", payload: { sampleRequired: event.target.checked } })}
                />
                Sample required
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Sample TAT
                <input
                  type="number"
                  min={0}
                  value={state.logistics.sampleTatDays || 0}
                  disabled={!state.logistics.sampleRequired}
                  onChange={(event) => dispatch({ type: "UPDATE_LOGISTICS", payload: { sampleTatDays: Number(event.target.value) } })}
                  className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2 disabled:opacity-50"
                />
              </label>
              <label className="col-span-2 flex flex-col gap-2 text-sm font-medium">
                Delivery address
                <textarea
                  value={state.logistics.deliveryAddressText || ""}
                  onChange={(event) => dispatch({ type: "UPDATE_LOGISTICS", payload: { deliveryAddressText: event.target.value } })}
                  placeholder="Warehouse, city, country, contact details"
                  className="min-h-24 rounded-md border border-[var(--color-border-tertiary)] px-3 py-2"
                />
              </label>
            </div>
            {state.visibility === "private" && (
              <div className="mt-6 rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div><p className="text-sm font-semibold">Invited manufacturers</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{invitedManufacturerIds.length ? `${invitedManufacturerIds.length} selected` : "Choose at least one manufacturer before publishing privately."}</p></div>
                  <button className="btn-secondary" onClick={() => setInviteOpen(true)}><Users size={15} />Select manufacturers</button>
                </div>
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Role</span><strong>{state.role === "selling" ? "Selling" : "Sourcing"}</strong></div>
                <div className="flex justify-between"><span>Products</span><strong>{state.products.length}</strong></div>
                <div className="flex justify-between"><span>Units</span><strong>{state.products.reduce((sum, product) => sum + product.quantity, 0)}</strong></div>
                <div className="flex justify-between"><span>Target</span><strong>${orderTotal.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Split bidding</span><strong>{state.splitBidding ? "On" : "Off"}</strong></div>
              </div>
              {hasPartialCoverage && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  One or more blank templates has partial quality coverage until its spec is completed.
                </div>
              )}
            </div>
            {lastError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{lastError}</div>}
            <button className="btn-primary justify-center" disabled={isPosting || (state.visibility === "private" && invitedManufacturerIds.length === 0)} onClick={() => publish(false)}>
              {isPosting ? "Publishing..." : "Publish order"}
            </button>
          </aside>
        </main>
        <InviteManufacturerModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} onSendInvites={setInvitedManufacturerIds} orderId="draft" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]">
      <div className="sticky top-0 z-20 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FileText size={22} />
            <div>
              <div className="text-sm font-semibold">proov Order Canvas</div>
              <div className="text-xs text-[var(--color-text-secondary)]">Build the order first. Publish logistics second.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" disabled={isPosting} onClick={() => publish(true)}>Save draft</button>
            <button
              className="btn-primary"
              disabled={!canContinue}
              onClick={() => dispatch({ type: "SET_SCREEN", payload: "logistics" })}
              style={{ opacity: canContinue ? 1 : 0.45 }}
            >
              Continue to publish
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl grid-cols-[1fr_340px] gap-6 px-8 py-8">
        <section className="flex flex-col gap-5">
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
            <div className="flex items-start justify-between gap-4">
              <input
                value={state.orderName}
                onChange={(event) => dispatch({ type: "SET_ORDER_NAME", payload: event.target.value })}
                className="w-full border-none bg-transparent text-2xl font-semibold outline-none"
              />
              <div className="flex rounded-md bg-[var(--color-background-secondary)] p-1">
                {[
                  { id: "sourcing", title: "Sourcing", sub: "Need this made" },
                  { id: "selling", title: "Selling", sub: "I'll make it" },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => dispatch({ type: "SET_ROLE", payload: role.id as "sourcing" | "selling" })}
                    className={`rounded px-4 py-2 text-left text-sm ${
                      state.role === role.id ? "bg-white text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    <div className="font-semibold">{role.title}</div>
                    <div className="text-xs">{role.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {state.products.length > 1 && (
              <div className="mt-5 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                Orders work best when all products can be made by one manufacturer. Split bidding stays off unless you enable it at publish.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Add product</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Products can come from Studio snapshots, imports, or a manual placeholder.</p>
              </div>
              <PackagePlus size={20} />
            </div>
            <div className="grid grid-cols-[1.3fr_1fr_1fr_auto] items-end gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Product name
                <input value={manualName} onChange={(event) => setManualName(event.target.value)} className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2" placeholder="Football jersey kit" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Category
                <input value={manualCategory} onChange={(event) => setManualCategory(event.target.value)} className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Material
                <input value={manualMaterial} onChange={(event) => setManualMaterial(event.target.value)} className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2" />
              </label>
              <button className="btn-primary" onClick={addProduct}>Add</button>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input type="checkbox" checked={manualBlank} onChange={(event) => setManualBlank(event.target.checked)} />
              This is a blank/generic template
            </label>
          </div>

          {state.products.map((product, index) => {
            const pages = state.techpackData[product.id] || []
            const completePages = pages.filter((page) => page.is_complete).length
            return (
              <article key={product.id} className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]">
                    <PackagePlus size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <span className="rounded-full bg-[var(--color-background-secondary)] px-2 py-1 text-xs">
                        {product.is_blank_template ? "Blank template" : "Customized"}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {product.category} · {product.primary_material || "Material TBD"}
                    </p>
                    <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      Techpack completion: {completePages}/{TECHPACK_PAGES.length}
                    </div>
                  </div>
                  <button className="text-sm text-[var(--color-text-secondary)]" onClick={() => dispatch({ type: "REMOVE_PRODUCT", payload: product.id })}>
                    Remove
                  </button>
                </div>

                {product.is_blank_template && (
                  <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    This blank template has partial quality coverage. Proov cannot fully guarantee output quality until a complete techpack is locked.
                  </div>
                )}

                <div className="grid grid-cols-[1fr_260px] gap-5">
                  <div>
                    <div className="mb-2 text-sm font-semibold">Quantity by size</div>
                    <div className="grid grid-cols-6 gap-2">
                      {SIZE_KEYS.map((size) => (
                        <label key={size} className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)]">
                          {size}
                          <input
                            type="number"
                            min={0}
                            value={product.size_grid?.[size] || 0}
                            onChange={(event) => updateSize(product, size, Number(event.target.value))}
                            className="rounded-md border border-[var(--color-border-tertiary)] px-2 py-2 text-sm text-[var(--color-text-primary)]"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 text-sm">Total quantity: <strong>{product.quantity}</strong></div>
                  </div>

                  <div>
                    <label className="mb-2 flex flex-col gap-2 text-sm font-semibold">
                      Target unit price
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={product.target_unit_price || 0}
                        onChange={(event) => updateProduct(product, { target_unit_price: Number(event.target.value) })}
                        className="rounded-md border border-[var(--color-border-tertiary)] px-3 py-2"
                      />
                    </label>
                    <div className="rounded-md border border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        <Sparkles size={13} /> AI suggested
                      </div>
                      <div className="grid gap-2">
                        {priceTiers(product).map((tier) => (
                          <button
                            key={tier.id}
                            className="rounded border border-[var(--color-border-tertiary)] bg-white px-3 py-2 text-left text-xs"
                            onClick={() => updateProduct(product, {
                              target_unit_price: Number(tier.price.toFixed(2)),
                              specs_snapshot: { ...(product.specs_snapshot || {}), aiConfirmation: tier.id },
                            })}
                          >
                            <strong>{tier.label}: ${tier.price.toFixed(2)}</strong>
                            <div className="text-[var(--color-text-secondary)]">{tier.impact}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_1fr] gap-5">
                  <div className="rounded-md border border-[var(--color-border-tertiary)] p-4">
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={product.roster_enabled || false}
                        onChange={(event) => updateProduct(product, {
                          roster_enabled: event.target.checked,
                          roster_rows: event.target.checked && !product.roster_rows?.length
                            ? [{ name: "Player 1", number: "10", size: "M" }]
                            : product.roster_rows || [],
                        })}
                      />
                      Roster personalization
                    </label>
                    {product.roster_enabled ? (
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        <Users className="mr-2 inline" size={15} />
                        {product.roster_rows?.length || 0} roster row ready. CSV upload and spreadsheet edit are next.
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--color-text-secondary)]">Collapsed by default for products that do not need names or numbers.</div>
                    )}
                  </div>

                  <div className="rounded-md border border-[var(--color-border-tertiary)] p-4">
                    <div className="mb-3 text-sm font-semibold">Six-page techpack</div>
                    <div className="grid grid-cols-2 gap-2">
                      {TECHPACK_PAGES.map((page) => {
                        const isComplete = pages.some((candidate) => candidate.page_type === page.id && candidate.is_complete)
                        return (
                          <button
                            key={page.id}
                            onClick={() => markPageComplete(product, page.id)}
                            className="flex items-center justify-between rounded border border-[var(--color-border-tertiary)] px-3 py-2 text-xs"
                          >
                            {page.label}
                            {isComplete ? <CheckCircle2 size={14} color="#059669" /> : <span className="h-2 w-2 rounded-full bg-[var(--color-border-tertiary)]" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-between border-t border-[var(--color-border-tertiary)] pt-4 text-sm">
                  <span className="text-[var(--color-text-secondary)]">Product {index + 1}</span>
                  <strong>${((product.target_unit_price || 0) * (product.quantity || 0)).toLocaleString()}</strong>
                </div>
              </article>
            )
          })}

          {state.products.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-12 text-center text-[var(--color-text-secondary)]">
              Add at least one product to start building the order.
            </div>
          )}
        </section>

        <aside className="sticky top-24 flex h-max flex-col gap-4">
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Order total</h2>
            <div className="mb-4 text-3xl font-semibold">${orderTotal.toLocaleString()}</div>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex justify-between"><span>Products</span><strong>{state.products.length}</strong></div>
              <div className="flex justify-between"><span>Units</span><strong>{state.products.reduce((sum, product) => sum + product.quantity, 0)}</strong></div>
              <div className="flex justify-between"><span>Role</span><strong>{state.role ? state.role : "Choose"}</strong></div>
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-4 text-sm">
            <input
              type="checkbox"
              checked={state.splitBidding}
              onChange={(event) => dispatch({ type: "SET_SPLIT_BIDDING", payload: event.target.checked })}
              className="mt-1"
            />
            <span>
              <strong className="block">Allow split bidding</strong>
              <span className="text-[var(--color-text-secondary)]">Off by default. Enable only when products may need different manufacturers.</span>
            </span>
          </label>
          {lastError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{lastError}</div>}
        </aside>
      </main>
    </div>
  )
}
