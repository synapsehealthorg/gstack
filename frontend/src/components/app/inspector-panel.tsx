"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function InspectorPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="w-[300px] border-l border-subtle bg-[#0D0D0C] text-default h-full flex flex-col">
      <div className="border-b border-subtle p-4 font-medium text-sm">
        Inspector
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {children || (
            <div className="text-subtle text-sm text-center py-8">
              Select an item to inspect its properties.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
