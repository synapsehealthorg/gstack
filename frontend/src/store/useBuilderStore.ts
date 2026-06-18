import { create } from 'zustand';

export type ViewMode = '2D_EDIT' | '3D_MOCKUP';
export type StructuralView = 'FRONT' | 'BACK' | 'LEFT_SLEEVE' | 'RIGHT_SLEEVE';
export type ElementType = 'product_base' | 'graphic' | 'text';

export interface SelectedElement {
  id: string;
  type: ElementType;
}

export interface TechpackSpecs {
  fabricMaterial: string;
  gsm: string;
  printTechnique: string;
  threadColor: string;
  sizeChart: any[];
}

interface BuilderState {
  activeViewMode: ViewMode;
  selectedElement: SelectedElement | null;
  activeStructuralView: StructuralView;
  techpackSpecs: TechpackSpecs;
  canvasTexture: string | null;

  // Setters
  setActiveViewMode: (mode: ViewMode) => void;
  setSelectedElement: (element: SelectedElement | null) => void;
  setActiveStructuralView: (view: StructuralView) => void;
  updateTechpackSpecs: (specs: Partial<TechpackSpecs>) => void;
  setCanvasTexture: (texture: string | null) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  activeViewMode: '2D_EDIT',
  selectedElement: null,
  activeStructuralView: 'FRONT',
  techpackSpecs: {
    fabricMaterial: '',
    gsm: '',
    printTechnique: '',
    threadColor: '',
    sizeChart: [],
  },
  canvasTexture: null,

  setActiveViewMode: (mode) => set({ activeViewMode: mode }),
  setSelectedElement: (element) => set({ selectedElement: element }),
  setActiveStructuralView: (view) => set({ activeStructuralView: view }),
  updateTechpackSpecs: (specs) => 
    set((state) => ({
      techpackSpecs: { ...state.techpackSpecs, ...specs },
    })),
  setCanvasTexture: (texture) => set({ canvasTexture: texture }),
}));
