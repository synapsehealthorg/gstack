"use client"

import React, { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Plus, Brush, Star, Folder, Image, Type, Heart, Clock, Trash2, Settings, 
  ChevronUp, ChevronDown, HelpCircle, ChevronsLeft,
  Layout, Box, Layers, MousePointer2, Play, Code, Database, Zap, Cpu, Asterisk, Globe, Send, History, UserCircle2, Package
} from "lucide-react"

type AppSection = 'standard' | 'studio' | 'builder'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
}

interface SidebarConfig {
  top: NavItem[]
  bottom: NavItem[]
}

const CONFIG: Record<AppSection, SidebarConfig> = {
  standard: {
    top: [
      { id: "dashboard", label: "Dashboard", icon: Layout, href: "/dashboard" },
      { id: "products", label: "Products", icon: Box, href: "/products" },
      { id: "studio", label: "Studio", icon: Brush, href: "/studio" },
      { id: "marketplace", label: "Marketplace", icon: Globe, href: "/marketplace" },
      { id: "orders", label: "Orders", icon: Package, href: "/orders" },
    ],
    bottom: [
      { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    ]
  },
  studio: {
    top: [], bottom: []
  },
  builder: {
    top: [], bottom: []
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
      className={`flex flex-col h-full bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline shadow-sm rounded-[24px] select-none shrink-0 z-10 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-[260px]" : "w-[68px]"
      }`}
    >
      {/* Top Header (Logo & Toggle) */}
      <div className={`flex items-center pt-6 pb-4 shrink-0 ${isExpanded ? "px-6 justify-between" : "flex-col justify-center space-y-4 px-2"}`}>
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <Asterisk strokeWidth={2} className="w-6 h-6 text-on-surface dark:text-inverse-on-surface shrink-0" />
            <span className="text-on-surface dark:text-inverse-on-surface font-bold text-[17px] tracking-tight truncate">proov.</span>
          </div>
        ) : (
          <button onClick={() => setIsExpanded(true)} className="flex items-center justify-center hover:opacity-70 transition-opacity">
            <Asterisk strokeWidth={2} className="w-6 h-6 text-on-surface dark:text-inverse-on-surface shrink-0" />
          </button>
        )}
        
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex shrink-0 items-center justify-center text-on-surface-variant hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors"
          >
            <ChevronsLeft strokeWidth={1.5} className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className={`shrink-0 ${isExpanded ? "px-4 pb-2" : "flex justify-center pb-4"}`}>
        <button className={`flex items-center transition-colors ${
          isExpanded 
            ? "justify-between w-full border border-outline-variant rounded-[14px] p-1.5 hover:bg-surface-container-high dark:hover:bg-surface-variant"
            : "justify-center w-8 h-8 rounded-full hover:opacity-80"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`rounded-full bg-violet-600 flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${isExpanded ? "w-[26px] h-[26px]" : "w-6 h-6"}`}>
               <span className="text-white text-[10px] font-bold">P</span>
            </div>
            {isExpanded && (
              <span className="text-[14px] font-medium text-on-surface dark:text-inverse-on-surface truncate">Pilot Workspace</span>
            )}
          </div>
          {isExpanded && <ChevronDown strokeWidth={1.5} className="w-4 h-4 text-on-surface-variant mr-1 shrink-0" />}
        </button>
      </div>

      {/* Main Navigation Wrapper */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        
        <nav 
          ref={navRef}
          onScroll={checkScrollPosition}
          className={`flex-1 overflow-y-auto custom-scroll flex flex-col pt-4 pb-16 ${isExpanded ? "px-4" : "px-2 items-center"}`}
        >
          {isExpanded && <span className="px-3 text-[13px] text-on-surface-variant mb-2 block tracking-wide">Create</span>}
          <div className="flex flex-col space-y-0.5 w-full">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center transition-colors cursor-pointer w-full
                    ${isExpanded ? "px-3 py-2.5 rounded-[12px]" : "justify-center w-10 h-10 rounded-[12px]"}
                    ${isActive 
                      ? "bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary active-glow"
                      : "hover:bg-surface-container-high dark:hover:bg-surface-variant text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-inverse-on-surface"
                    }
                  `}
                >
                  <Icon strokeWidth={1.5} className={`shrink-0 ${isExpanded ? "w-[18px] h-[18px] mr-3" : "w-[18px] h-[18px]"}`} />
                  {isExpanded && (
                    <span className={`text-[14px] font-medium truncate w-full text-left`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className={`w-full mt-6 flex flex-col space-y-0.5 ${!isExpanded && "items-center"}`}>
            {isExpanded && <span className="px-3 text-[13px] text-on-surface-variant mb-2 block tracking-wide">Operations</span>}
            {bottomItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center transition-colors cursor-pointer w-full
                    ${isExpanded ? "px-3 py-2.5 rounded-[12px]" : "justify-center w-10 h-10 rounded-[12px]"}
                    ${isActive 
                      ? "bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary active-glow"
                      : "hover:bg-surface-container-high dark:hover:bg-surface-variant text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-inverse-on-surface"
                    }
                  `}
                >
                  <Icon strokeWidth={1.5} className={`shrink-0 ${isExpanded ? "w-[18px] h-[18px] mr-3" : "w-[18px] h-[18px]"}`} />
                  {isExpanded && (
                    <span className={`text-[14px] font-medium truncate w-full text-left`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Scroll Gradients & Arrows */}
        <div className={`pointer-events-none absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-surface-container-lowest dark:from-inverse-surface to-transparent z-10 transition-opacity duration-300 ${showTopGradient ? "opacity-100" : "opacity-0"}`} />
        <button 
          onClick={scrollUp}
          className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all duration-200 z-20 shadow-sm ${showTopGradient ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronUp strokeWidth={1.5} className="w-4 h-4" />
        </button>

        <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-container-lowest dark:from-inverse-surface to-transparent z-10 transition-opacity duration-300 ${showBottomGradient ? "opacity-100" : "opacity-0"}`} />
        <button 
          onClick={scrollDown}
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all duration-200 z-20 shadow-sm ${showBottomGradient ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <ChevronDown strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>

    </aside>
  )
}
