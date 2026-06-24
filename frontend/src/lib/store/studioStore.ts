import { create } from 'zustand'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react'

export type CanvasItemType = 'product' | 'reference' | 'text' | 'configurable-product' | 'productRoot' | 'layersNode' | 'specsNode' | 'viewNode'

export interface CanvasItem {
  id: string
  type?: CanvasItemType
  templateId?: string
  url?: string
  [key: string]: unknown
}

export const getProductName = (urlOrId: string | undefined | null) => {
  if (!urlOrId) return "Proov Brand System";
  if (urlOrId.includes("baseball_jersey") || urlOrId === "mock_1" || urlOrId === "mock_5") {
    return "Custom Baseball Jersey";
  }
  if (urlOrId.includes("tracksuit") || urlOrId === "mock_2" || urlOrId === "mock_7") {
    return "Custom Tracksuit";
  }
  if (urlOrId.includes("polo_shirt") || urlOrId === "mock_3" || urlOrId === "mock_6") {
    return "Custom Polo Shirt";
  }
  if (urlOrId.includes("streetwear_hoodie") || urlOrId === "mock_4" || urlOrId === "mock_8") {
    return "Custom Streetwear Hoodie";
  }
  if (urlOrId.startsWith("product_")) {
    return `New Product (${urlOrId.split('_')[1]?.slice(-4) || ''})`;
  }
  return "Custom Apparel Product";
};

export interface ReferenceImage {
  id: string
  url: string
  thumbnailUrl: string
  file: File
}

export interface StudioStore {
  // Project
  projectTitle: string

  // React Flow state
  nodes: Node[]
  edges: Edge[]
  selectedItemId: string | null
  selectedItemType: string | null

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // Tool state
  activeTool: 'select' | 'layers' | 'models' | 'remix' | 'crop' | 'text' | 'upload' | 'regenerate'
  rightPanelMode: 'hidden' | 'product-tools' | 'reference-tools'
  
  // Reference thumbnails
  referenceImages: ReferenceImage[]

  // Prompt
  promptText: string
  promptModel: string
  promptStyle: string
  promptRatio: string
  promptCount: number

  // Actions
  selectItem: (id: string | null) => void
  addProduct: (item: any) => void
  addReference: (file: File, url: string) => void
  addText: (x: number, y: number) => void
  removeItem: (id: string) => void
  updateNodeData: (id: string, data: any) => void
  setActiveTool: (tool: StudioStore['activeTool']) => void
  setPromptText: (text: string) => void
  
  // Preview Mode
  isPreviewMode: boolean
  previewItemId: string | null
  enterPreviewMode: (id: string) => void
  exitPreviewMode: () => void

  // Left Sidebar / Chat
  isLeftSidebarOpen: boolean
  toggleLeftSidebar: () => void

  // Create Overlay
  showCreateOverlay: boolean
  setShowCreateOverlay: (show: boolean) => void
  clearCanvas: () => void

  // Node Expansion (Double Click)
  expandedNodeId: string | null
  expandNode: (id: string | null) => void
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  projectTitle: "New Project",
  
  nodes: [
    {
      id: "root_1",
      type: "productRoot",
      position: { x: 100, y: 300 },
      data: { templateId: "Oversized Heavyweight T-Shirt" }
    },
    {
      id: "layers_1",
      type: "layersNode",
      position: { x: 450, y: 150 },
      data: { 
        layers: [
          { id: "front", name: "Front Body", visible: true, locked: false },
          { id: "back", name: "Back Body", visible: true, locked: false },
          { id: "neck", name: "Neck Ribbing", visible: true, locked: false }
        ]
      }
    },
    {
      id: "specs_1",
      type: "specsNode",
      position: { x: 450, y: 550 },
      data: {
        specs: [
          { name: "Fit", value: "Boxy / Drop Shoulder" },
          { name: "Material", value: "100% Combed Cotton" },
          { name: "Weight", value: "280 GSM" }
        ]
      }
    },
    {
      id: "view_1",
      type: "viewNode",
      position: { x: 800, y: 100 },
      data: { name: "Flatlay View", type: "flatlay", image: "/assets/tshirt_flatlay.png" }
    },
    {
      id: "view_2",
      type: "viewNode",
      position: { x: 800, y: 350 },
      data: { name: "3D Viewer", type: "3d", image: "/assets/tshirt_3d.png" }
    },
    {
      id: "view_3",
      type: "viewNode",
      position: { x: 800, y: 600 },
      data: { name: "Studio Mockup", type: "mockup", image: "/assets/tshirt_mockup.png" }
    }
  ],
  edges: [
    { id: "e-root-layers", source: "root_1", target: "layers_1", animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } },
    { id: "e-root-specs", source: "root_1", target: "specs_1", animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } },
    { id: "e-layers-v1", source: "layers_1", target: "view_1", sourceHandle: "right", animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } },
    { id: "e-layers-v2", source: "layers_1", target: "view_2", sourceHandle: "right", animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } },
    { id: "e-layers-v3", source: "layers_1", target: "view_3", sourceHandle: "right", animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } }
  ],
  selectedItemId: null,
  selectedItemType: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } }, get().edges),
    });
  },

  activeTool: 'select',
  rightPanelMode: 'hidden',
  
  referenceImages: [],

  promptText: "",
  promptModel: "dall-e-3",
  promptStyle: "vivid",
  promptRatio: "1:1",
  promptCount: 4,

  isPreviewMode: false,
  previewItemId: null,
  isLeftSidebarOpen: true,
  showCreateOverlay: false,
  expandedNodeId: null,

  expandNode: (id) => set({ expandedNodeId: id }),

  setShowCreateOverlay: (show) => set({ showCreateOverlay: show }),
  
  clearCanvas: () => set({ 
    nodes: [], 
    edges: [],
    selectedItemId: null, 
    selectedItemType: null, 
    rightPanelMode: 'hidden',
    showCreateOverlay: true,
    expandedNodeId: null
  }),

  selectItem: (id) => {
    const node = get().nodes.find(i => i.id === id)
    set({ 
      selectedItemId: id, 
      selectedItemType: node ? node.type : null,
      rightPanelMode: node ? (node.type === 'product' ? 'product-tools' : node.type === 'reference' ? 'reference-tools' : 'hidden') : 'hidden'
    })
  },
  
  addProduct: (item) => {
    const { nodes } = get()
    const newNode: Node = {
      id: 'product_' + Date.now(),
      type: 'product',
      position: { x: item.x || 100, y: item.y || 100 },
      data: { ...item, width: item.width || 400, height: item.height || 500 }
    }
    set({ nodes: [...nodes, newNode] })
  },

  addReference: (file, url) => {
    const { nodes, referenceImages } = get()
    const id = 'ref_' + Date.now()
    
    // Add to thumbnail strip
    set({
      referenceImages: [...referenceImages, { id, file, url, thumbnailUrl: url }]
    })

    // Add to canvas
    const newNode: Node = {
      id,
      type: 'reference',
      position: { x: 100, y: 100 },
      data: { url, width: 300, height: 400 }
    }
    set({ nodes: [...nodes, newNode] })
  },

  addText: (x, y) => {
    const { nodes } = get()
    const id = 'text_' + Date.now()
    const newNode: Node = {
      id,
      type: 'text',
      position: { x, y },
      data: { content: 'New Text', width: 200, height: 50 }
    }
    set({ nodes: [...nodes, newNode], activeTool: 'select' })
    get().selectItem(id)
  },

  removeItem: (id) => {
    const { nodes, edges, selectedItemId } = get()
    set({ 
      nodes: nodes.filter(i => i.id !== id),
      edges: edges.filter(e => e.source !== id && e.target !== id),
      ...(selectedItemId === id ? { selectedItemId: null, selectedItemType: null, rightPanelMode: 'hidden' } : {})
    })
  },

  updateNodeData: (id, data) => {
    const { nodes } = get()
    set({
      nodes: nodes.map(node => node.id === id ? { ...node, data: { ...node.data, ...data } } : node)
    })
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setPromptText: (text) => set({ promptText: text }),

  enterPreviewMode: (id) => set({ isPreviewMode: true, previewItemId: id }),
  exitPreviewMode: () => set({ isPreviewMode: false, previewItemId: null }),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
}))
