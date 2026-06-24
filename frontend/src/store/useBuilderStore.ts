import { create } from "zustand";
import type { ProductBuilderDocument, SaveState } from "@/lib/product-builder";

export type ViewMode = "2D_EDIT" | "3D_MOCKUP";
export type StructuralView = "FRONT" | "BACK" | "LEFT_SLEEVE" | "RIGHT_SLEEVE";
export type ElementType = "product_base" | "graphic" | "text";
export type BuilderTab = "layers" | "mockup" | "measurements" | "design";
export type BuilderPerspective = "front" | "mockup" | "back" | "detail";
export type BuilderTool = "select" | "pan" | "measure" | "explode" | "section";

export interface SelectedElement {
  id: string;
  type: ElementType;
}

export interface SelectedProps {
  id: string;
  type: "text" | "image" | "base";
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  opacity?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  blendingMode?: string;
}

export interface CanvasLayer {
  id: string;
  name: string;
  type: "text" | "image" | "base";
  visible: boolean;
  locked: boolean;
}

export interface TechpackSpecs {
  fabricMaterial: string;
  gsm: string;
  printTechnique: string;
  threadColor: string;
  sizeChart: Array<Record<string, string | number>>;
  measurements: Array<Record<string, string | number>>;
  bom: Array<Record<string, string | number>>;
  packaging: Record<string, string>;
}

interface BuilderState {
  activeViewMode: ViewMode;
  selectedElement: SelectedElement | null;
  activeStructuralView: StructuralView;
  techpackSpecs: TechpackSpecs;
  canvasTexture: string | null;
  product: ProductBuilderDocument | null;
  saveState: SaveState;
  saveMessage: string | null;
  zoom: number;
  showGrid: boolean;
  exploded: boolean;
  sectionView: boolean;
  activeTab: BuilderTab;
  activePerspective: BuilderPerspective;
  activeTool: BuilderTool;
  selectedProps: SelectedProps | null;
  activeColorway: { hex: string; name: string };
  activePrintTech: string;
  layers: CanvasLayer[];
  aiPromptText: string;
  colorways: Array<{ hex: string; name: string }>;

  setActiveViewMode: (mode: ViewMode) => void;
  setSelectedElement: (element: SelectedElement | null) => void;
  setActiveStructuralView: (view: StructuralView) => void;
  updateTechpackSpecs: (specs: Partial<TechpackSpecs>) => void;
  setCanvasTexture: (texture: string | null) => void;
  hydrateProduct: (product: ProductBuilderDocument) => void;
  updateProduct: (patch: Partial<ProductBuilderDocument>) => void;
  setSaveState: (state: SaveState, message?: string | null) => void;
  setZoom: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  setExploded: (exploded: boolean) => void;
  setSectionView: (section: boolean) => void;
  resetBuilder: () => void;
  setActiveTab: (tab: BuilderTab) => void;
  setActivePerspective: (perspective: BuilderPerspective) => void;
  setActiveTool: (tool: BuilderTool) => void;
  setSelectedProps: (props: SelectedProps | null) => void;
  setActiveColorway: (colorway: { hex: string; name: string }) => void;
  setActivePrintTech: (tech: string) => void;
  setLayers: (layers: CanvasLayer[] | ((previous: CanvasLayer[]) => CanvasLayer[])) => void;
  setAiPromptText: (text: string) => void;
  addColorway: (colorway: { hex: string; name: string }) => void;
}

const baseLayer: CanvasLayer = { id: "base-layout", name: "Base layout", type: "base", visible: true, locked: true };

const emptySpecs: TechpackSpecs = {
  fabricMaterial: "Polyester Mesh",
  gsm: "180",
  printTechnique: "Sublimation",
  threadColor: "#4B8FD4",
  sizeChart: [],
  measurements: [],
  bom: [],
  packaging: {},
};

export const useBuilderStore = create<BuilderState>((set) => ({
  activeViewMode: "2D_EDIT",
  selectedElement: null,
  activeStructuralView: "FRONT",
  techpackSpecs: emptySpecs,
  canvasTexture: null,
  product: null,
  saveState: "idle",
  saveMessage: null,
  zoom: 1,
  showGrid: true,
  exploded: false,
  sectionView: false,
  activeTab: "mockup",
  activePerspective: "mockup",
  activeTool: "select",
  selectedProps: null,
  activeColorway: { hex: "#4B8FD4", name: "PANTONE 286 C" },
  activePrintTech: "Sublimation",
  layers: [baseLayer],
  aiPromptText: "Display the design on the selected garment with soft natural lighting and preserve every confirmed production detail.",
  colorways: [
    { hex: "#4B8FD4", name: "PANTONE 286 C" },
    { hex: "#F0EDE8", name: "PANTONE 9183 C" },
    { hex: "#1A2233", name: "PANTONE 289 C" },
    { hex: "#E24B4A", name: "PANTONE 185 C" },
    { hex: "#F59E0B", name: "PANTONE 130 C" },
  ],

  setActiveViewMode: (activeViewMode) => set({ activeViewMode }),
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  setActiveStructuralView: (activeStructuralView) => set({ activeStructuralView }),
  updateTechpackSpecs: (specs) => set((state) => ({ techpackSpecs: { ...state.techpackSpecs, ...specs }, saveState: "dirty" })),
  setCanvasTexture: (canvasTexture) => set({ canvasTexture }),
  hydrateProduct: (product) => set({
    product,
    saveState: "idle",
    saveMessage: null,
    activePerspective: product.activePerspective,
    activeColorway: product.activeColorway,
    activePrintTech: product.printTechnique,
    colorways: product.colorways,
    techpackSpecs: product.specs,
    selectedProps: null,
    layers: [baseLayer],
    zoom: 1,
  }),
  updateProduct: (patch) => set((state) => ({ product: state.product ? { ...state.product, ...patch } : null, saveState: "dirty" })),
  setSaveState: (saveState, saveMessage = null) => set({ saveState, saveMessage }),
  setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.35, zoom)) }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setExploded: (exploded) => set({ exploded }),
  setSectionView: (sectionView) => set({ sectionView }),
  resetBuilder: () => set({
    product: null,
    saveState: "idle",
    saveMessage: null,
    selectedProps: null,
    layers: [baseLayer],
    zoom: 1,
    showGrid: true,
    exploded: false,
    sectionView: false,
  }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActivePerspective: (activePerspective) => set({ activePerspective }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setSelectedProps: (selectedProps) => set({ selectedProps }),
  setActiveColorway: (activeColorway) => set({ activeColorway, saveState: "dirty" }),
  setActivePrintTech: (activePrintTech) => set({ activePrintTech, saveState: "dirty" }),
  setLayers: (layersUpdate) => set((state) => ({ layers: typeof layersUpdate === "function" ? layersUpdate(state.layers) : layersUpdate })),
  setAiPromptText: (aiPromptText) => set({ aiPromptText }),
  addColorway: (colorway) => set((state) => ({ colorways: [...state.colorways, colorway], saveState: "dirty" })),
}));
