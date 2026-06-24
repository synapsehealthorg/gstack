import { create } from 'zustand'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'

interface ProductGraphState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  initGraph: (templateId: string) => void
}

const buildNodes = (templateId: string): Node[] => [
  {
    id: 'root',
    type: 'productRoot',
    position: { x: 80, y: 260 },
    data: { templateId },
  },
  {
    id: 'layers',
    type: 'layersNode',
    position: { x: 420, y: 120 },
    data: {
      layers: [
        { id: 'front', name: 'Front Body', visible: true, locked: false },
        { id: 'back', name: 'Back Body', visible: true, locked: false },
        { id: 'trim', name: 'Trim', visible: true, locked: false },
      ],
    },
  },
  {
    id: 'specs',
    type: 'specsNode',
    position: { x: 420, y: 420 },
    data: {
      specs: [
        { name: 'Material', value: 'Poly mesh' },
        { name: 'Print', value: 'Sublimation' },
        { name: 'Fit', value: 'Athletic' },
      ],
    },
  },
  {
    id: 'mockup',
    type: 'viewNode',
    position: { x: 760, y: 260 },
    data: { name: 'Mockup', type: 'mockup' },
  },
]

const buildEdges = (): Edge[] => [
  { id: 'root-layers', source: 'root', target: 'layers', animated: true },
  { id: 'root-specs', source: 'root', target: 'specs', animated: true },
  { id: 'layers-mockup', source: 'layers', target: 'mockup', animated: true },
  { id: 'specs-mockup', source: 'specs', target: 'mockup', animated: true },
]

export const useProductGraphStore = create<ProductGraphState>((set, get) => ({
  nodes: buildNodes('jersey'),
  edges: buildEdges(),
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),
  initGraph: (templateId) => set({ nodes: buildNodes(templateId), edges: buildEdges() }),
}))
