export type ProductTemplateCategory =
  | "Sportswear"
  | "Tops"
  | "Outerwear"
  | "Bottoms"
  | "Accessories";

export interface ProductTemplateDefinition {
  id: string;
  name: string;
  category: ProductTemplateCategory;
  description: string;
  imageUrl: string;
  tags: string[];
  editableZones: string[];
  perspectives: Array<"front" | "mockup" | "back" | "detail">;
  defaultSpecs: {
    fabricMaterial: string;
    gsm: string;
    printTechnique: string;
    threadColor: string;
    sizeChart: Array<Record<string, string | number>>;
    bom: Array<Record<string, string | number>>;
    packaging: Record<string, string>;
    measurements: Array<Record<string, string | number>>;
  };
  featured?: boolean;
  blank?: boolean;
}

const standardMeasurements = [
  { point: "Chest width", S: 48, M: 51, L: 54, XL: 57, unit: "cm" },
  { point: "Body length", S: 68, M: 70, L: 72, XL: 74, unit: "cm" },
  { point: "Sleeve length", S: 22, M: 23, L: 24, XL: 25, unit: "cm" },
];

const standardSizeChart = [
  { size: "S", quantity: 12 },
  { size: "M", quantity: 24 },
  { size: "L", quantity: 24 },
  { size: "XL", quantity: 12 },
];

function specs(material: string, gsm: string, technique: string) {
  return {
    fabricMaterial: material,
    gsm,
    printTechnique: technique,
    threadColor: "#F0EDE8",
    sizeChart: standardSizeChart,
    measurements: standardMeasurements,
    bom: [
      { item: "Main fabric", material, usage: "1.15 m" },
      { item: "Sewing thread", material: "Core-spun polyester", usage: "110 m" },
      { item: "Care label", material: "Recycled satin", usage: 1 },
    ],
    packaging: {
      fold: "Retail fold with tissue insert",
      bag: "Recycled LDPE garment bag",
      carton: "5-ply export carton",
      unitsPerCarton: "25",
    },
  };
}

export const PRODUCT_TEMPLATES: ProductTemplateDefinition[] = [
  {
    id: "blank-product",
    name: "Blank Product",
    category: "Tops",
    description: "Start with an editable garment base and define every production detail.",
    imageUrl: "/assets/baseball_jersey.png",
    tags: ["blank", "custom", "manual"],
    editableZones: ["Front", "Back", "Left sleeve", "Right sleeve"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Not specified", "180", "Sublimation"),
    blank: true,
  },
  {
    id: "home-jersey",
    name: "Match Jersey",
    category: "Sportswear",
    description: "Performance jersey with complete sublimation and team-branding zones.",
    imageUrl: "/assets/baseball_jersey.png",
    tags: ["football", "teamwear", "sublimation"],
    editableZones: ["Front body", "Back body", "Sleeves", "Collar", "Player name"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Bird-eye polyester mesh", "160", "Sublimation"),
    featured: true,
  },
  {
    id: "performance-polo",
    name: "Performance Polo",
    category: "Sportswear",
    description: "Technical polo with embroidery, placket, collar, and sponsor placements.",
    imageUrl: "/assets/polo_shirt.png",
    tags: ["polo", "uniform", "embroidery"],
    editableZones: ["Front", "Back", "Chest logo", "Sleeves"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Polyester pique", "200", "Embroidery"),
  },
  {
    id: "premium-hoodie",
    name: "Heavyweight Hoodie",
    category: "Outerwear",
    description: "Oversized hoodie with rib, drawcord, embroidery, and screen-print zones.",
    imageUrl: "/assets/streetwear_hoodie.png",
    tags: ["hoodie", "streetwear", "heavyweight"],
    editableZones: ["Front", "Back", "Hood", "Sleeves", "Pocket"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Brushed cotton fleece", "420", "Screen Print"),
    featured: true,
  },
  {
    id: "essential-tshirt",
    name: "Essential T-Shirt",
    category: "Tops",
    description: "Regular-fit tee ready for print, embroidery, labels, and packaging specs.",
    imageUrl: "/assets/create/fashion_photo.png",
    tags: ["t-shirt", "merchandise", "cotton"],
    editableZones: ["Front", "Back", "Sleeves", "Neck label"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Combed cotton jersey", "220", "Screen Print"),
  },
  {
    id: "tracksuit-set",
    name: "Technical Tracksuit",
    category: "Sportswear",
    description: "Coordinated jacket and trouser set with panel, piping, and logo controls.",
    imageUrl: "/assets/tracksuit.png",
    tags: ["tracksuit", "teamwear", "set"],
    editableZones: ["Jacket front", "Jacket back", "Sleeves", "Trouser legs"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Interlock polyester", "260", "Heat Transfer"),
    featured: true,
  },
  {
    id: "cycling-jersey",
    name: "Pro Cycling Jersey",
    category: "Sportswear",
    description: "Race-fit jersey with mapped panels, full print coverage, and pocket specs.",
    imageUrl: "/assets/proj_belarus.png",
    tags: ["cycling", "racewear", "sublimation"],
    editableZones: ["Front panels", "Back panel", "Sleeves", "Rear pockets"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Moisture-wicking micro mesh", "145", "Sublimation"),
  },
  {
    id: "training-shorts",
    name: "Training Shorts",
    category: "Bottoms",
    description: "Lightweight shorts with waistband, side-panel, hem, and logo controls.",
    imageUrl: "/assets/create/apparel_mockups.png",
    tags: ["shorts", "training", "sportswear"],
    editableZones: ["Front legs", "Back legs", "Side panels", "Waistband"],
    perspectives: ["front", "mockup", "back", "detail"],
    defaultSpecs: specs("Mechanical-stretch polyester", "140", "Heat Transfer"),
  },
];

export const PRODUCT_CATEGORIES = [
  "All",
  ...Array.from(new Set(PRODUCT_TEMPLATES.map((template) => template.category))),
] as const;

export function getProductTemplate(id: string) {
  return PRODUCT_TEMPLATES.find((template) => template.id === id) || PRODUCT_TEMPLATES[0];
}

