"use client"
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { ClipboardList } from 'lucide-react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function SpecsNode({ id, data }: any) {
  const { selectedItemId, selectItem } = useStudioStore()
  const isSelected = selectedItemId === id

  return (
    <div 
      onClick={() => selectItem(id)}
      style={{ backgroundColor: '#232427', border: `1px solid ${isSelected ? '#E879F9' : '#2c303a'}`, borderRadius: '12px', width: '260px', cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#E879F9', width: '10px', height: '10px' }} />
      <div style={{ padding: '12px', borderBottom: '1px solid #2c303a', backgroundColor: '#1a1b1e', display: 'flex', alignItems: 'center', gap: '8px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <ClipboardList size={16} color="#a8afbd" />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Specifications</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#a8afbd', marginBottom: '4px' }}>Garment Cut</div>
          <div style={{ fontSize: '14px', color: '#fff' }}>Athletic Fit</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#a8afbd', marginBottom: '4px' }}>Size Run</div>
          <div style={{ fontSize: '14px', color: '#fff' }}>S to XXL</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#a8afbd', marginBottom: '4px' }}>Construction</div>
          <div style={{ fontSize: '14px', color: '#fff' }}>Cut & Sew</div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#a8afbd' }}>Techpack Progress</span>
            <span style={{ fontSize: '12px', color: '#E879F9' }}>45%</span>
          </div>
          <div style={{ height: '4px', backgroundColor: '#1a1b1e', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '45%', height: '100%', backgroundColor: '#E879F9' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
