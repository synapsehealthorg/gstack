import type { ProductBuilderDocument } from "./product-builder";

export function buildOrderProductPrefill(product: ProductBuilderDocument, quantity: number, isBlankTemplate: boolean) {
  return {
    id: crypto.randomUUID(),
    order_id: "",
    product_snapshot_id: product.id,
    name: product.name,
    category: product.category,
    primary_material: product.specs.fabricMaterial,
    quantity,
    unit: "pieces",
    target_unit_price: 8,
    thumbnail_url: product.thumbnailUrl,
    is_blank_template: isBlankTemplate,
    quality_coverage: isBlankTemplate ? "partial" : "full",
    size_grid: Object.fromEntries(product.specs.sizeChart.map((row) => [String(row.size), Number(row.quantity) || 0])),
    specs_snapshot: product.specs,
    sort_order: 0,
    techpack_pages: [
      { id: crypto.randomUUID(), order_product_id: "", page_type: "cover", content: { styleName: product.name, category: product.category, colorway: product.activeColorway }, image_urls: [product.thumbnailUrl], is_complete: true, version: 1 },
      { id: crypto.randomUUID(), order_product_id: "", page_type: "flats", content: { perspectives: product.canvasByPerspective }, image_urls: product.mockupUrls, is_complete: Object.keys(product.canvasByPerspective).length > 0, version: 1 },
      { id: crypto.randomUUID(), order_product_id: "", page_type: "bom", content: { items: product.specs.bom }, image_urls: [], is_complete: product.specs.bom.length > 0, version: 1 },
      { id: crypto.randomUUID(), order_product_id: "", page_type: "measurements", content: { measurements: product.specs.measurements, sizeChart: product.specs.sizeChart }, image_urls: [], is_complete: product.specs.measurements.length > 0, version: 1 },
      { id: crypto.randomUUID(), order_product_id: "", page_type: "colorways", content: { colorways: product.colorways, printTechnique: product.printTechnique }, image_urls: [], is_complete: product.colorways.length > 0, version: 1 },
      { id: crypto.randomUUID(), order_product_id: "", page_type: "packaging", content: product.specs.packaging, image_urls: [], is_complete: Object.keys(product.specs.packaging).length > 0, version: 1 },
    ],
  };
}
