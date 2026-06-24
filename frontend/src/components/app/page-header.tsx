"use client"

import React, { useState } from "react"
import { Bell } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import NotificationFlybox from "@/components/dashboard/NotificationFlybox"

export function PageHeader() {
  const [isFlyboxOpen, setIsFlyboxOpen] = useState(false)

  return (
    <header className="flex h-16 items-center gap-4 border-b border-subtle bg-[#0D0D0C] px-6">
      <SidebarTrigger className="text-subtle hover:text-default" />
      <Separator orientation="vertical" className="h-6 bg-border-subtle" />
      <div className="font-medium text-sm text-default">Dashboard</div>
      <div className="ml-auto flex items-center gap-4">
        <button 
          onClick={() => setIsFlyboxOpen(true)}
          className="p-2 rounded-full text-subtle hover:text-default hover:bg-bg-selected transition-colors relative"
        >
          <Bell strokeWidth={1} className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>

      <NotificationFlybox 
        isOpen={isFlyboxOpen} 
        onClose={() => setIsFlyboxOpen(false)} 
      />
    </header>
  )
}
