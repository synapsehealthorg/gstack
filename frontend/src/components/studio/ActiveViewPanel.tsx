"use client"
import React from 'react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function ActiveViewPanel() {
  const { selectedItemId } = useStudioStore()

  const getViewContent = () => {
    if (selectedItemId === 'layers') {
      return 'Layer Editing Engine (SVG / Canvas)'
    } else if (selectedItemId === 'specs') {
      return 'Specification Forms & Charts'
    } else {
      return 'Canvas Engine View (Flatlay / 3D / Mockup)'
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#16181d',
      backgroundImage: 'radial-gradient(circle at center, #2c303a 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <div style={{ color: '#a8afbd', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div>{getViewContent()}</div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>Selected Node: {selectedItemId || 'None'}</div>
      </div>
    </div>
  )
}
