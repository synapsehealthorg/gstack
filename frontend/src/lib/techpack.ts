// src/lib/techpack.ts — Rules-based pricing floor matrix and tech pack upload simulator

export interface FabricRule {
  name: string
  baseCost: number
  stitchingCost: number
  description: string
}

export const FABRIC_RULES: Record<string, FabricRule> = {
  poly_mesh: {
    name: "100% Polyester Mesh (180 GSM)",
    baseCost: 8.50,
    stitchingCost: 3.50,
    description: "Lightweight, breathable, ideal for baseball/basketball jerseys."
  },
  fleece: {
    name: "Polyester Fleece (280 GSM)",
    baseCost: 15.00,
    stitchingCost: 5.50,
    description: "Thick, warm, brushed back fabric for tracksuits and hoodies."
  },
  interlock: {
    name: "Polyester Interlock (140 GSM)",
    baseCost: 6.00,
    stitchingCost: 3.00,
    description: "Soft, smooth face, durable drape, perfect for soccer jerseys."
  }
}

export interface UploadedFile {
  name: string
  size: string
  uploaded_at: string
}

export function calculatePriceFloor(qty: number, fabricType: string) {
  const rule = FABRIC_RULES[fabricType] || FABRIC_RULES.poly_mesh
  
  // Volume discount calculation
  let volumeDiscountFactor = 1.0
  if (qty >= 1000) {
    volumeDiscountFactor = 0.75 // 25% discount for bulk enterprise runs
  } else if (qty >= 500) {
    volumeDiscountFactor = 0.82 // 18% discount
  } else if (qty >= 200) {
    volumeDiscountFactor = 0.90 // 10% discount
  } else if (qty < 50) {
    volumeDiscountFactor = 1.20 // 20% small-run premium
  }
  
  const baseCost = rule.baseCost * volumeDiscountFactor
  const stitchingCost = rule.stitchingCost * volumeDiscountFactor
  const totalFloor = baseCost + stitchingCost
  
  return {
    baseCost,
    stitchingCost,
    totalFloor
  }
}

export function generateTechPackDescription(
  category: string,
  qty: number,
  fabricType: string,
  uploadedFile: UploadedFile | null
): string {
  const fabric = FABRIC_RULES[fabricType] || FABRIC_RULES.poly_mesh
  const logoText = uploadedFile 
    ? `Attached Art Assets: ${uploadedFile.name} (${uploadedFile.size})` 
    : "No direct files attached. Default mockup templates used."
  
  return `# PROOV-LOCKED TECHPACK
  
## 1. Product Summary
- **Category:** ${category.toUpperCase()}
- **Sourcing Quantity:** ${qty} units
- **Target Fabric:** ${fabric.name}
- **Fabric Detail:** ${fabric.description}

## 2. Stitching & Trim Specifications
- **Stitch Style:** Flatlock flat seam, heavy-duty core spun polyester thread (24/2).
- **Collars/Cuffs:** Double-needle ribbing to prevent warping under sweat.
- **Inner Lining:** Heat-seal satin size labels to prevent chafing during matches.

## 3. Graphics & Embellishments
- **Technique:** Premium sublimation printing (no cracking, peeling, or fading).
- **Ink Grade:** Eco-friendly Italian Kiian sublimation inks for high-saturation color.
- **Logos:** ${logoText}

## 4. Packaging Requirements
- Individual compostable bio-polybags with size stickers.
- Carton boxing: Maximum 50 pieces per heavy-grade export box.

## 5. QC Approval Parameters
- Tolerance: Width and length measurements must fall within +/- 1.5 cm of standard size charts.
- Color Matching: Standard delta E limit < 2.0 under daylight D65 simulator.
`
}
