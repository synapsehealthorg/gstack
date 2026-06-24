"use client"

import React, { useState } from "react"
import { 
  Asterisk, Plus, Grid, Target, Sparkles, 
  Wand2, User, Globe, Send, History, ChevronsUpDown,
  ChevronsLeft
} from "lucide-react"
import { UserPopover } from "./UserPopover"

interface DashboardSidebarProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
  currentUserRole: "buyer" | "manufacturer" | "admin";
  currentUserName: string;
  roleDropdownOpen: boolean;
  setRoleDropdownOpen: (open: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  clearCanvas: () => void;
  handleLogout: () => void;
}

export function DashboardSidebar({
  activePanel,
  setActivePanel,
  isExpanded,
  setIsExpanded,
  clearCanvas,
  handleLogout
}: DashboardSidebarProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navItemClass = (isActive: boolean, isPrimaryAction: boolean = false) => `
    flex items-center gap-3 px-3 py-2 rounded-[14px] transition-all duration-200 cursor-pointer
    ${isActive || isPrimaryAction
      ? 'bg-[#F4F4F5] text-black font-medium' 
      : 'text-gray-500 hover:bg-[#F4F4F5] hover:text-black font-normal'
    }
  `

  const NavItem = ({ id, label, icon: Icon, onClick, isPrimaryAction = false }: any) => {
    const isActive = activePanel === id || (!activePanel && id === "view-buyer-dashboard");
    return (
      <div 
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={navItemClass(isActive, isPrimaryAction)}
        title={!isExpanded ? label : undefined}
      >
        <div className={`flex items-center justify-center ${isExpanded ? 'w-5 h-5' : 'w-full h-8'}`}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        {isExpanded && <span className="text-[14px]">{label}</span>}
      </div>
    )
  }

  const GroupLabel = ({ label }: { label: string }) => {
    if (!isExpanded) return <div className="h-6 flex items-center justify-center"><div className="w-4 border-t border-gray-200"></div></div>;
    return (
      <div className="px-3 pt-5 pb-2 text-[13px] text-gray-400">
        {label}
      </div>
    )
  }

  return (
    <div className={`p-4 flex h-full transition-all duration-300 ${isExpanded ? 'w-[260px]' : 'w-[80px]'}`}>
      <aside className="h-full w-full bg-[#FAFAFA] rounded-3xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => !isExpanded && setIsExpanded(true)}>
            <div className="flex items-center justify-center w-6 h-6">
              <Asterisk size={24} strokeWidth={2} className="text-black" />
            </div>
            {isExpanded && <span className="font-medium text-[16px] text-black">Acme AI</span>}
          </div>
          
          {isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <ChevronsLeft size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Workspace Selector */}
        <div className="px-3 pb-2">
          <div className={`flex items-center ${isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2'} bg-white border border-gray-200 rounded-[14px] cursor-pointer hover:bg-gray-50 shadow-sm transition-colors`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#D4F826] flex items-center justify-center overflow-hidden relative shrink-0">
                 <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-black opacity-90"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-transparent"></div>
              </div>
              {isExpanded && <span className="font-medium text-[14px] text-black truncate w-24">Ace Studio 2.0</span>}
            </div>
            {isExpanded && (
              <ChevronsUpDown size={16} strokeWidth={1.5} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto custom-scroll px-3 pb-4 flex flex-col gap-0.5 mt-2">
          
          <GroupLabel label="Create" />
          <NavItem 
            id="studio-create" 
            label="New Email" 
            icon={Plus} 
            isPrimaryAction={activePanel === "studio-create"}
            onClick={() => { clearCanvas(); setActivePanel("studio-create"); }} 
          />
          <NavItem id="view-buyer-dashboard" label="Templates" icon={Grid} onClick={() => setActivePanel("view-buyer-dashboard")} />
          <NavItem id="view-products" label="My Brands" icon={Target} onClick={() => setActivePanel("view-products")} />
          <NavItem id="view-market" label="Brand Images" icon={Sparkles} onClick={() => setActivePanel("view-market")} />
          
          <GroupLabel label="Operations" />
          <NavItem id="view-orders" label="Campaigns" icon={Wand2} onClick={() => setActivePanel("view-orders")} />
          <NavItem id="audience" label="Audience" icon={User} onClick={() => {}} />
          <NavItem id="domains" label="Sending Domains" icon={Globe} onClick={() => {}} />
          <NavItem id="activity" label="Sending Activity" icon={Send} onClick={() => {}} />
          <NavItem id="history" label="History" icon={History} onClick={() => {}} />

        </div>

        {/* Footer Profile User Card */}
        <div className="p-3">
          <div 
            onClick={() => setPopoverOpen(true)}
            className={`flex items-center ${isExpanded ? 'px-3 py-2 gap-3' : 'justify-center p-2'} bg-[#F4F4F5] rounded-[16px] cursor-pointer hover:bg-gray-200 transition-colors relative`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F3F4F6] shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#E0E7FF" />
                <path d="M12 0C18.6274 0 24 5.37258 24 12H12V0Z" fill="#818CF8" />
                <path d="M0 12C0 18.6274 5.37258 24 12 24V12H0Z" fill="#A5B4FC" />
              </svg>
            </div>
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-[14px] text-gray-900 truncate">Rico Oktananda</span>
                <span className="text-[12px] text-gray-500 truncate">Basic Plan</span>
              </div>
            )}
          </div>
          
          <UserPopover 
            isOpen={popoverOpen} 
            onClose={() => setPopoverOpen(false)} 
            onLogout={handleLogout} 
          />
        </div>

      </aside>
    </div>
  )
}
