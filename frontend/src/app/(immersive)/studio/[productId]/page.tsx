"use client"
import React from 'react'
import StudioCanvasHeader from '@/components/studio/StudioCanvasHeader'
import StudioIconSidebar from '@/components/studio/StudioIconSidebar'
import StudioLeftSidebar from '@/components/studio/StudioLeftSidebar'
import StudioCanvas from '@/components/studio/StudioCanvas'
import StudioRightPanel from '@/components/studio/StudioRightPanel'
import StudioPreviewOverlay from '@/components/studio/StudioPreviewOverlay'
import { useStudioStore } from '@/lib/store/studioStore'

export default function StudioPage() {
  const { selectedItemId, isLeftSidebarOpen, showCreateOverlay } = useStudioStore()
  return (
    <div className="studio-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#1a1b1e' }}>
      <StudioCanvasHeader />
      <div className="studio-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <StudioIconSidebar />
        {isLeftSidebarOpen && <StudioLeftSidebar />}
        
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <StudioCanvas />
        </div>
        
        {selectedItemId && <StudioRightPanel />}
      </div>
      <StudioPreviewOverlay />
    </div>
  )
}
