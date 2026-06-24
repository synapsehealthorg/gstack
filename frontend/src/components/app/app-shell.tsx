"use client"

import React from "react"
import { AppSidebar } from "./app-sidebar"
import { PageHeader } from "./page-header"
import { SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-zinc-100 dark:bg-[#0D0D0C] overflow-hidden text-zinc-900 dark:text-[#F0EDE8]">
        <div className="p-4 flex h-full">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 bg-transparent py-4 pr-4">
          <PageHeader />
          <main className="flex-1 overflow-auto bg-white dark:bg-[#111110] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
