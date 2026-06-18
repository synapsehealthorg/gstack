"use client"
import React from 'react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function LayerPropertyPanel() {
  const { selectedItemId } = useStudioStore()

  if (selectedItemId === 'specs') {
    return (
      <div style={{ padding: '16px', color: '#a8afbd', height: '100%', overflowY: 'auto' }}>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Specification Details</p>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: 500, color: '#fff', marginBottom: '12px' }}>Garment Profile</div>
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#a8afbd' }}>
            This configurable product has 4 linked nodes. Changes made to specifications will propagate to 3D view and flatlay view automatically.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', color: '#a8afbd', height: '100%', overflowY: 'auto' }}>
      <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Properties</p>
      
      {/* Fabric / Color Properties */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontWeight: 500, color: '#fff', marginBottom: '12px' }}>Fabric & Color</div>
        <div style={{ padding: '12px', backgroundColor: '#232427', borderRadius: '8px', border: '1px solid #2c303a', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#F9F9FB', border: '1px solid #3d414a' }}></div>
          <span style={{ fontSize: '14px', color: '#fff' }}>Bright White</span>
          <span style={{ fontSize: '12px', color: '#a8afbd', marginLeft: 'auto' }}>11-0601</span>
        </div>
      </div>
      
      {/* Material Type */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontWeight: 500, color: '#fff', marginBottom: '12px' }}>Material</div>
        <select style={{ width: '100%', padding: '8px 12px', backgroundColor: '#232427', border: '1px solid #2c303a', borderRadius: '8px', color: '#fff', outline: 'none' }}>
          <option>100% Polyester Mesh (180 GSM)</option>
          <option>Polyester Fleece (280 GSM)</option>
        </select>
      </div>
    </div>
  )
}
