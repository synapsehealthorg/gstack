"use client"

import React, { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { 
  Plus, Brush, Star, Folder, Image, Type, Heart, Clock, Trash2, Settings, 
  ChevronUp, ChevronDown, HelpCircle, ChevronsLeft,
  Layout, Box, Layers, MousePointer2, Play, Code, Database, Zap, Cpu, Asterisk, Globe, Send, History, UserCircle2
} from "lucide-react"

type AppSection = 'standard' | 'studio' | 'builder'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
}

interface SidebarConfig {
  top: NavItem[]
  bottom: NavItem[]
}

const CONFIG: Record<AppSection, SidebarConfig> = {
  standard: {
    top: [
      { id: "new-email", label: "New Email", icon: Plus },
      { id: "templates", label: "Templates", icon: Layout },
      { id: "my-brands", label: "My Brands", icon: Star },
      { id: "brand-images", label: "Brand Images", icon: Image },
    ],
    bottom: [
      { id: "campaigns", label: "Campaigns", icon: Zap },
      { id: "audience", label: "Audience", icon: UserCircle2 },
      { id: "sending-domains", label: "Sending Domains", icon: Globe },
      { id: "sending-activity", label: "Sending Activity", icon: Send },
      { id: "history", label: "History", icon: History },
    ]
  },
  studio: {
    top: [
      { id: "studio-layout", label: "Layouts", icon: Layout },
      { id: "studio-components", label: "Components", icon: Box },
      { id: "studio-layers", label: "Layers", icon: Layers },
      { id: "studio-interactions", label: "Interactions", icon: MousePointer2 },
      { id: "studio-preview", label: "Preview", icon: Play },
    ],
    bottom: [
      { id: "studio-assets", label: "Assets", icon: Folder },
      { id: "studio-settings", label: "Settings", icon: Settings },
    ]
  },
  builder: {
    top: [
      { id: "build-logic", label: "Logic", icon: Cpu },
      { id: "build-data", label: "Database", icon: Database },
      { id: "build-api", label: "API Routes", icon: Zap },
      { id: "build-code", label: "Source Code", icon: Code },
    ],
    bottom: [
      { id: "build-deploy", label: "Deployments", icon: Clock },
      { id: "build-settings", label: "Config", icon: Settings },
    ]
  }
}

export function AppSidebar() {
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState("new-email")
  const [isExpanded, setIsExpanded] = useState(true)
  const navRef = useRef<HTMLElement>(null)
  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(true)

  // Determine section based on pathname
  let section: AppSection = 'standard'
  if (pathname?.startsWith('/studio')) section = 'studio'
  if (pathname?.startsWith('/builder')) section = 'builder'

  const { top: navItems, bottom: bottomItems } = CONFIG[section]

  const checkScrollPosition = () => {
    if (!navRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = navRef.current
    const isAtTop = scrollTop <= 10
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 10
    
    if (isAtBottom) {
      setShowBottomGradient(false)
      setShowTopGradient(true)
    } else if (isAtTop) {
      setShowTopGradient(false)
      setShowBottomGradient(true)
    } else {
      setShowTopGradient(false)
      setShowBottomGradient(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(checkScrollPosition, 100)
    window.addEventListener("resize", checkScrollPosition)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener("resize", checkScrollPosition)
    }
  }, [isExpanded, section])

  const scrollUp = () => navRef.current?.scrollBy({ top: -150, behavior: 'smooth' })
  const scrollDown = () => navRef.current?.scrollBy({ top: 150, behavior: 'smooth' })

  useEffect(() => {
    const timeout = setTimeout(checkScrollPosition, 300)
    return () => clearTimeout(timeout)
  }, [isExpanded])

  return (
    <aside 
      className={`flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-[24px] select-none shrink-0 z-10 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-[260px]" : "w-[68px]"
      }`}
    >
      {/* Top Header (Logo & Toggle) */}
      <div className={`flex items-center pt-6 pb-4 shrink-0 ${isExpanded ? "px-6 justify-between" : "flex-col justify-center space-y-4 px-2"}`}>
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <Asterisk strokeWidth={2} className="w-6 h-6 text-zinc-900 dark:text-white shrink-0" />
            <span className="text-zinc-900 dark:text-white font-medium text-[17px] tracking-tight truncate">Acme AI</span>
          </div>
        ) : (
          <button onClick={() => setIsExpanded(true)} className="flex items-center justify-center hover:opacity-70 transition-opacity">
            <Asterisk strokeWidth={2} className="w-6 h-6 text-zinc-900 dark:text-white shrink-0" />
          </button>
        )}
        
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex shrink-0 items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ChevronsLeft strokeWidth={1.5} className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className={`shrink-0 ${isExpanded ? "px-4 pb-2" : "flex justify-center pb-4"}`}>
        <button className={`flex items-center transition-colors ${
          isExpanded 
            ? "justify-between w-full border border-zinc-200 dark:border-zinc-800 rounded-[14px] p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50" 
            : "justify-center w-8 h-8 rounded-full hover:opacity-80"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`rounded-full bg-[#c7ec00] flex items-center justify-start shrink-0 overflow-hidden shadow-sm ${isExpanded ? "w-[26px] h-[26px]" : "w-6 h-6"}`}>
               <div className="w-1/2 h-full bg-zinc-900/90 dark:bg-black/90" />
            </div>
            {isExpanded && (
              <span className="text-[14px] font-medium text-zinc-900 dark:text-white truncate">Ace Studio 2.0</span>
            )}
          </div>
          {isExpanded && <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-zinc-400 mr-1 shrink-0" />}
        </button>
      </div>

      {/* Main Navigation Wrapper */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        
        <nav 
          ref={navRef}
          onScroll={checkScrollPosition}
          className={`flex-1 overflow-y-auto custom-scroll flex flex-col pt-4 pb-16 ${isExpanded ? "px-4" : "px-2 items-center"}`}
        >
          {isExpanded && <span className="px-3 text-[13px] text-zinc-400 dark:text-zinc-500 mb-2 block tracking-wide">Create</span>}
          <div className="flex flex-col space-y-0.5 w-full">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`flex items-center transition-colors cursor-pointer w-full
                    ${isExpanded ? "px-3 py-2.5 rounded-[12px]" : "justify-center w-10 h-10 rounded-[12px]"}
                    ${isActive 
                      ? "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }
                  `}
                >
                  <Icon strokeWidth={1.5} className={`shrink-0 ${isExpanded ? "w-[18px] h-[18px] mr-3" : "w-[18px] h-[18px]"}`} />
                  {isExpanded && (
                    <span className={`text-[14px] font-medium truncate w-full text-left`}>
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className={`w-full mt-6 flex flex-col space-y-0.5 ${!isExpanded && "items-center"}`}>
            {isExpanded && <span className="px-3 text-[13px] text-zinc-400 dark:text-zinc-500 mb-2 block tracking-wide">Operations</span>}
            {bottomItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`flex items-center transition-colors cursor-pointer w-full
                    ${isExpanded ? "px-3 py-2.5 rounded-[12px]" : "justify-center w-10 h-10 rounded-[12px]"}
                    ${isActive 
                      ? "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }
                  `}
                >
                  <Icon strokeWidth={1.5} className={`shrink-0 ${isExpanded ? "w-[18px] h-[18px] mr-3" : "w-[18px] h-[18px]"}`} />
                  {isExpanded && (
                    <span className={`text-[14px] font-medium truncate w-full text-left`}>
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Scroll Gradients & Arrows */}
        <div className={`pointer-events-none absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white dark:from-zinc-900 to-transparent z-10 transition-opacity duration-300 ${showTopGradient ? "opacity-100" : "opacity-0"}`} />
        <button 
          onClick={scrollUp}
          className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 z-20 shadow-sm ${showTopGradient ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronUp strokeWidth={1.5} className="w-4 h-4" />
        </button>

        <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent z-10 transition-opacity duration-300 ${showBottomGradient ? "opacity-100" : "opacity-0"}`} />
        <button 
          onClick={scrollDown}
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 z-20 shadow-sm ${showBottomGradient ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronDown strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>

    </aside>
  )
}

