"use client"
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function ProductRootNode({ id, data }: any) {
  const { selectedItemId, selectItem } = useStudioStore()
  const isSelected = selectedItemId === id

  return (
    <div 
      onClick={() => selectItem(id)}
      style={{ backgroundColor: '#232427', border: `1px solid ${isSelected ? '#E879F9' : '#2c303a'}`, borderRadius: '12px', width: '220px', overflow: 'hidden', cursor: 'pointer' }}
    >
      <div style={{ padding: '12px', borderBottom: '1px solid #2c303a', backgroundColor: '#1a1b1e', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E879F9' }}></div>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Product Base</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '120px', backgroundColor: '#16181d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/images/logo_white.png" alt="Product Thumbnail" style={{ maxWidth: '80%', maxHeight: '80%', opacity: 0.3 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Configurable Template</span>
          <span style={{ color: '#a8afbd', fontSize: '12px' }}>{data.templateId || 'Elite Football Jersey'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#E879F9', width: '10px', height: '10px' }} />
    </div>
  )
}
