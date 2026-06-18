"use client"
import React, { useState } from 'react'
import { useStudioStore } from '@/lib/store/studioStore'

export default function TopContextTileStrip() {
  const { selectedItemId } = useStudioStore()
  const [activeTile, setActiveTile] = useState('0')

  let tiles: string[] = []

  if (selectedItemId === 'layers') {
    tiles = ['Front Body', 'Back Body', 'Left Sleeve', 'Right Sleeve', 'Collar']
  } else if (selectedItemId === 'specs') {
    tiles = ['General', 'Sizing', 'Materials', 'Costing']
  } else {
    // Default / View Node / Root Node
    tiles = ['Flatlay', '3D View', 'Mockup', 'AI Generation']
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {tiles.map((tile, index) => {
        const isActive = activeTile === index.toString()
        return (
          <div 
            key={index}
            onClick={() => setActiveTile(index.toString())}
            style={{ 
              padding: '6px 16px', 
              borderRadius: '16px', 
              backgroundColor: isActive ? '#E879F9' : 'transparent', 
              color: isActive ? '#1a1b1e' : '#a8afbd', 
              fontSize: '14px', 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            {tile}
          </div>
        )
      })}
    </div>
  )
}
