import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import test from "node:test"

const migrationsUrl = new URL("../supabase/migrations/", import.meta.url)
const pilotSql = readFileSync(new URL("00009_pilot_transaction_spine.sql", migrationsUrl), "utf8")

test("migration versions are unique, numeric, and ordered", () => {
  const migrations = readdirSync(migrationsUrl).filter((name) => name.endsWith(".sql")).sort()
  const versions = migrations.map((name) => name.split("_", 1)[0])
  assert.equal(new Set(versions).size, versions.length)
  for (const version of versions) assert.match(version, /^\d+$/)
  assert.deepEqual(migrations, [
    "00000_initial_schema.sql",
    "00001_admin_tables.sql",
    "00002_orders_multiproduct.sql",
    "00003_mvp_align.sql",
    "00004_add_username_to_profiles.sql",
    "00005_core_lifecycle.sql",
    "00006_order_workspace_policies.sql",
    "00007_product_builder.sql",
    "00008_marketplace_lifecycle.sql",
    "00009_pilot_transaction_spine.sql",
  ])
})

test("pilot lifecycle removes broad writes and exposes role-checked commands", () => {
  for (const contract of [
    'drop policy if exists "Order parties update workspace state"',
    "complete_pilot_onboarding",
    "transition_order_lifecycle",
    "Only the manufacturer can start production",
    "Only the buyer can approve QC",
    "Buyer QC approval is required",
    "Only the buyer can confirm a shipped delivery",
  ]) assert.match(pilotSql, new RegExp(contract, "i"))
})

test("manual escrow is admin-only, idempotent, audited, and notifies both parties", () => {
  for (const contract of [
    "record_manual_escrow",
    "Admin access required",
    "escrow_ledger_reference_unique",
    "on conflict (order_id, entry_type, reference)",
    "insert into public.admin_actions",
    "target_order.buyer_id",
    "target_order.manufacturer_id",
  ]) assert.match(pilotSql, new RegExp(contract.replace(/[()]/g, "\\$&"), "i"))
})

test("accepted orders receive persistent milestone rows", () => {
  assert.match(pilotSql, /initialize_pilot_order_milestones/i)
  assert.match(pilotSql, /Production start/)
  assert.match(pilotSql, /Quality check/)
  assert.match(pilotSql, /Delivery/)
})
