"use client"
import React from 'react'
import { useStudioStore } from '@/lib/store/studioStore'
import { Globe, Maximize, ZoomIn, Hexagon, Grid, MoveUpRight, ArrowUp, ArrowDown } from 'lucide-react'

export default function StudioPreviewOverlay() {
  const { isPreviewMode, previewItemId, nodes } = useStudioStore()

  if (!isPreviewMode || !previewItemId) return null

  const node = nodes.find(i => i.id === previewItemId)
  if (!node || node.type !== 'product') return null

  return (
    <div style={{
      position: 'absolute',
      top: '56px', // Below top bar
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#111111',
      zIndex: 100, // Above everything except top bar
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      
      {/* Central Product Image */}
      <img 
        src={node.data.url} 
        alt="Preview" 
        style={{
          width: '80%',
          height: '80%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))'
        }}
        draggable={false}
      />

      {/* Top Left Specs Box */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        backgroundColor: 'rgba(30,30,30,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '16px',
        color: '#A1A1AA',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '220px'
      }}>
        <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>File:</span> <span style={{ color: '#F59E0B' }}>Synapse_Brand.step</span></div>
        <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>Faces:</span> <span style={{ color: '#F59E0B' }}>48,291</span></div>
        <div style={{ display: 'flex' }}><span style={{ width: '60px' }}>GPU:</span> <span style={{ color: '#F59E0B' }}>Accelerated</span></div>
      </div>

      {/* Top Center Tabs */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(30,30,30,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
        borderRadius: '8px',
        display: 'flex',
        padding: '4px',
        gap: '4px'
      }}>
        <div style={{ backgroundColor: '#B45309', color: '#FFF', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Rev C</div>
        <div style={{ color: '#A1A1AA', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>Wireframe</div>
        <div style={{ color: '#A1A1AA', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>X-Ray</div>
        <div style={{ color: '#A1A1AA', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>Technical</div>
      </div>

      {/* Top Right Metadata */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        backgroundColor: 'rgba(30,30,30,0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '8px 16px',
        color: '#A1A1AA',
        fontSize: '13px'
      }}>
        Rev C - Apr 8, 2026
      </div>

      {/* Right Vertical Toolbar */}
      <div style={{
        position: 'absolute',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          backgroundColor: 'rgba(30,30,30,0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #333',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          padding: '6px',
          gap: '4px'
        }}>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><Globe size={18} /></button>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><Maximize size={18} /></button>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><ZoomIn size={18} /></button>
        </div>

        <div style={{
          backgroundColor: 'rgba(30,30,30,0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #333',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          padding: '6px',
          gap: '4px'
        }}>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><Hexagon size={18} /></button>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><Grid size={18} /></button>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><MoveUpRight size={18} /></button>
        </div>

        <div style={{
          backgroundColor: 'rgba(30,30,30,0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #333',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          padding: '6px',
          gap: '4px'
        }}>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><ArrowUp size={18} /></button>
          <button className="studio-icon-btn" style={{ color: '#A1A1AA' }}><ArrowDown size={18} /></button>
        </div>
      </div>

    </div>
  )
}
