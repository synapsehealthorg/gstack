"use client"
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Layers, Eye, Lock } from 'lucide-react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function LayersNode({ id, data }: any) {
  const { selectedItemId, selectItem } = useStudioStore()
  const isSelected = selectedItemId === id

  const layers = [
    { id: 'front', name: 'Front Body', type: 'fabric' },
    { id: 'back', name: 'Back Body', type: 'fabric' },
    { id: 'lsleeve', name: 'Left Sleeve', type: 'fabric' },
    { id: 'rsleeve', name: 'Right Sleeve', type: 'fabric' },
    { id: 'collar', name: 'Collar Ring', type: 'fabric' }
  ]

  return (
    <div 
      onClick={() => selectItem(id)}
      style={{ backgroundColor: '#232427', border: `1px solid ${isSelected ? '#E879F9' : '#2c303a'}`, borderRadius: '12px', width: '260px', cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#E879F9', width: '10px', height: '10px' }} />
      <div style={{ padding: '12px', borderBottom: '1px solid #2c303a', backgroundColor: '#1a1b1e', display: 'flex', alignItems: 'center', gap: '8px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <Layers size={16} color="#a8afbd" />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Layers</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {layers.map((layer, index) => (
          <div key={layer.id} style={{ 
            padding: '10px 12px', 
            borderBottom: index < layers.length - 1 ? '1px solid #2c303a' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}>
            <span style={{ color: '#a8afbd', fontSize: '13px' }}>{layer.name}</span>
            <div style={{ display: 'flex', gap: '8px', color: '#6b7280' }}>
              <Eye size={14} />
              <Lock size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
