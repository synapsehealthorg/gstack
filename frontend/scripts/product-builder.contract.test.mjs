import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PRODUCT_CATEGORIES, PRODUCT_TEMPLATES, getProductTemplate } from "../src/lib/product-templates.ts";
import { buildOrderProductPrefill } from "../src/lib/product-order-handoff.ts";

const frontendRoot = fileURLToPath(new URL("../", import.meta.url));

test("product template ids and names are unique", () => {
  assert.equal(new Set(PRODUCT_TEMPLATES.map(({ id }) => id)).size, PRODUCT_TEMPLATES.length);
  assert.equal(new Set(PRODUCT_TEMPLATES.map(({ name }) => name)).size, PRODUCT_TEMPLATES.length);
});

test("every product template has a local asset and complete production defaults", () => {
  for (const template of PRODUCT_TEMPLATES) {
    assert.ok(template.imageUrl.startsWith("/"), `${template.id} must use a local asset`);
    assert.ok(existsSync(`${frontendRoot}public${template.imageUrl}`), `${template.id} asset is missing`);
    assert.equal(template.perspectives.length, 4, `${template.id} must support every canvas perspective`);
    assert.ok(template.editableZones.length > 0, `${template.id} needs editable zones`);
    assert.ok(template.defaultSpecs.fabricMaterial);
    assert.ok(template.defaultSpecs.gsm);
    assert.ok(template.defaultSpecs.printTechnique);
    assert.ok(template.defaultSpecs.sizeChart.length > 0);
    assert.ok(template.defaultSpecs.measurements.length > 0);
    assert.ok(template.defaultSpecs.bom.length > 0);
    assert.ok(Object.keys(template.defaultSpecs.packaging).length > 0);
  }
});

test("catalog lookup and category filters stay coherent", () => {
  for (const template of PRODUCT_TEMPLATES) {
    assert.equal(getProductTemplate(template.id), template);
    assert.ok(PRODUCT_CATEGORIES.includes(template.category));
  }
  assert.equal(getProductTemplate("missing-template").id, "blank-product");
});

test("product handoff carries the complete production contract into an order", () => {
  const template = getProductTemplate("home-jersey");
  const product = {
    version: 1,
    id: crypto.randomUUID(),
    templateId: template.id,
    name: "Home Kit 2027",
    category: template.category,
    status: "ready",
    favorite: false,
    archivedAt: null,
    thumbnailUrl: template.imageUrl,
    mockupUrls: [template.imageUrl],
    canvasByPerspective: { front: { objects: [] } },
    activePerspective: "front",
    colorways: [{ hex: "#1d4ed8", name: "Royal blue" }],
    activeColorway: { hex: "#1d4ed8", name: "Royal blue" },
    printTechnique: template.defaultSpecs.printTechnique,
    specs: structuredClone(template.defaultSpecs),
    brandingProfile: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handoff = buildOrderProductPrefill(product, 240, false);
  assert.equal(handoff.product_snapshot_id, product.id);
  assert.equal(handoff.quantity, 240);
  assert.equal(handoff.primary_material, product.specs.fabricMaterial);
  assert.equal(handoff.quality_coverage, "full");
  assert.deepEqual(handoff.specs_snapshot, product.specs);
  assert.deepEqual(handoff.size_grid, { S: 12, M: 24, L: 24, XL: 12 });
  assert.deepEqual(handoff.techpack_pages.map(({ page_type }) => page_type), ["cover", "flats", "bom", "measurements", "colorways", "packaging"]);
  assert.ok(handoff.techpack_pages.every(({ is_complete }) => is_complete));
});
