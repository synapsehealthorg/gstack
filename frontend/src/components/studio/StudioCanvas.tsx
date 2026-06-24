"use client"
import React, { useMemo, useState } from 'react'
import { ReactFlow, Background, BackgroundVariant, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStudioStore } from '@/lib/store/studioStore'
import { JsonValue, proovDb } from '@/lib/db'
import StudioPromptBar from './StudioPromptBar'
import ProductRootNode from './nodes/ProductRootNode'
import LayersNode from './nodes/LayersNode'
import SpecsNode from './nodes/SpecsNode'
import ViewNode from './nodes/ViewNode'

import TopContextTileStrip from './TopContextTileStrip'
import ActiveViewPanel from './ActiveViewPanel'
import LayerPropertyPanel from './LayerPropertyPanel'
import { X } from 'lucide-react'

// Standard elements like reference images or text can be nodes too
const ReferenceNode = ({ data }: { data: any }) => {
  return (
    <div style={{ padding: 10, background: '#1e1e1e', border: '1px solid #333', borderRadius: 8 }}>
      <img src={data.url} style={{ width: data.width, height: data.height, objectFit: 'contain' }} />
    </div>
  )
}

const TextNode = ({ data }: { data: any }) => {
  return (
    <div style={{ padding: 10, background: 'transparent', color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
      {data.content}
    </div>
  )
}

export default function StudioCanvas() {
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null)
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    selectItem,
    expandNode,
    expandedNodeId,
    activeTool
  } = useStudioStore()

  const saveProductSnapshot = async () => {
    setSnapshotStatus("Saving...")
    const rootNode = nodes.find((node) => node.type === "productRoot") || nodes.find((node) => node.type === "product")
    const specsNode = nodes.find((node) => node.type === "specsNode")
    const layersNode = nodes.find((node) => node.type === "layersNode")

    const snapshot = await proovDb.saveProductSnapshot({
      name: String(rootNode?.data?.templateId || rootNode?.data?.name || "Studio product"),
      category: "sportswear",
      source: "studio",
      is_blank_template: false,
      layers: (Array.isArray(layersNode?.data?.layers) ? layersNode.data.layers : []) as JsonValue[],
      specs: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        specs: (Array.isArray(specsNode?.data?.specs) ? specsNode.data.specs : []) as JsonValue,
        canvasState: { nodes, edges } as unknown as JsonValue,
      },
      colorways: [],
      branding_profile: {},
    })

    setSnapshotStatus(snapshot ? "Saved to Products" : "Sign in to save")
    window.setTimeout(() => setSnapshotStatus(null), 2600)
  }

  // Register custom node types
  const nodeTypes = useMemo(() => ({
    productRoot: ProductRootNode,
    layersNode: LayersNode,
    specsNode: SpecsNode,
    viewNode: ViewNode,
    reference: ReferenceNode,
    text: TextNode
  }), [])

  // If a node is expanded, we render it full screen instead of the graph
  // (We will implement the full screen view for double-clicked nodes in Phase 3)
  if (expandedNodeId) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #2c303a' }}>
          <TopContextTileStrip />
          <button 
            onClick={() => expandNode(null)} 
            style={{ 
              padding: '8px', 
              background: 'transparent', 
              color: '#a8afbd', 
              borderRadius: '4px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <ActiveViewPanel />
          </div>
          <div style={{ width: '320px', borderLeft: '1px solid #2c303a', backgroundColor: '#1a1b1e' }}>
            <LayerPropertyPanel />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => selectItem(node.id)}
        onNodeDoubleClick={(_, node) => expandNode(node.id)}
        onPaneClick={() => selectItem(null)}
        fitView
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{ animated: true, style: { stroke: '#E879F9', strokeWidth: 2 } }}
      >
        <Background color="#333" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} style={{ display: 'none' }} />
      </ReactFlow>

      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        {snapshotStatus && (
          <span style={{ color: '#d1d5db', background: '#232427', border: '1px solid #2c303a', borderRadius: 6, padding: '7px 10px', fontSize: 12 }}>
            {snapshotStatus}
          </span>
        )}
        <button
          onClick={saveProductSnapshot}
          style={{
            border: '1px solid #E8E0CF',
            background: '#E8E0CF',
            color: '#161614',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Save product snapshot
        </button>
      </div>

      {/* Floating Prompt Bar at the bottom */}
      <StudioPromptBar />
    </div>
  )
}
