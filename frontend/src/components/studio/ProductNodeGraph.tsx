"use client"
import React, { useEffect, useMemo } from 'react'
import { ReactFlow, Background, Controls, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CanvasItem } from '@/lib/store/studioStore'
import { useProductGraphStore } from '@/lib/store/useProductGraphStore'

import ProductRootNode from './nodes/ProductRootNode'
import LayersNode from './nodes/LayersNode'
import SpecsNode from './nodes/SpecsNode'
import ViewNode from './nodes/ViewNode'

interface Props {
  expandedItem: CanvasItem
}

export default function ProductNodeGraph({ expandedItem }: Props) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, initGraph } = useProductGraphStore()

  useEffect(() => {
    initGraph(expandedItem.templateId || 'jersey')
  }, [expandedItem.templateId, initGraph])

  const nodeTypes = useMemo(() => ({
    productRoot: ProductRootNode,
    layersNode: LayersNode,
    specsNode: SpecsNode,
    viewNode: ViewNode
  }), [])

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#16181d' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2c303a" variant={BackgroundVariant.Dots} />
        <Controls style={{ display: 'none' }} />
      </ReactFlow>
    </div>
  )
}
