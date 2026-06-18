"use client"
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { MonitorPlay } from 'lucide-react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function ViewNode({ id, data }: any) {
  const { selectedItemId, selectItem } = useStudioStore()
  const isSelected = selectedItemId === id

  return (
    <div 
      onClick={() => selectItem(id)}
      style={{ backgroundColor: '#232427', border: `1px solid ${isSelected ? '#E879F9' : '#2c303a'}`, borderRadius: '12px', width: '260px', cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#E879F9', width: '10px', height: '10px' }} />
      <div style={{ padding: '12px', borderBottom: '1px solid #2c303a', backgroundColor: '#1a1b1e', display: 'flex', alignItems: 'center', gap: '8px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <MonitorPlay size={16} color="#a8afbd" />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Output Views</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ padding: '6px 12px', backgroundColor: '#1a1b1e', borderRadius: '4px', color: '#a8afbd', fontSize: '12px', cursor: 'pointer', flex: '1 1 calc(50% - 4px)', textAlign: 'center' }}>Flatlay</div>
        <div style={{ padding: '6px 12px', backgroundColor: '#1a1b1e', borderRadius: '4px', color: '#a8afbd', fontSize: '12px', cursor: 'pointer', flex: '1 1 calc(50% - 4px)', textAlign: 'center' }}>3D Model</div>
        <div style={{ padding: '6px 12px', backgroundColor: '#1a1b1e', borderRadius: '4px', color: '#a8afbd', fontSize: '12px', cursor: 'pointer', flex: '1 1 calc(50% - 4px)', textAlign: 'center' }}>Mockup</div>
        <div style={{ padding: '6px 12px', backgroundColor: '#1a1b1e', borderRadius: '4px', color: '#a8afbd', fontSize: '12px', cursor: 'pointer', flex: '1 1 calc(50% - 4px)', textAlign: 'center' }}>AI Generation</div>
      </div>
    </div>
  )
}
