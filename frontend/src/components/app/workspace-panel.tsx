"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function WorkspacePanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex-1 h-full w-full bg-[#0D0D0C] relative">
      <ScrollArea className="h-full w-full">
        <div className="p-6">
          {children || (
            <div className="text-subtle text-center py-10">
              Workspace content goes here
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
