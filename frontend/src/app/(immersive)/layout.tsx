// Layout for immersive (full-screen) routes — strips out the root dashboard shell
import React from 'react'

export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
