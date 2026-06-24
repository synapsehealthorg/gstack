"use client"

import React from "react"
import { User, Settings, Rocket, Code, Moon, Sun, LogOut, Award } from "lucide-react"

interface UserPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function UserPopover({ isOpen, onClose, onLogout }: UserPopoverProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/5" onClick={onClose} />
      <div className="fixed bottom-6 left-6 w-[280px] bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f3f4f6] shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#E0E7FF" />
              <path d="M12 0C18.6274 0 24 5.37258 24 12H12V0Z" fill="#818CF8" />
              <path d="M0 12C0 18.6274 5.37258 24 12 24V12H0Z" fill="#A5B4FC" />
            </svg>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-[14px] text-gray-900 truncate">Rico Oktananda</span>
            <span className="text-[13px] text-gray-500 truncate">rico.oktanada1@gmail.com</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-2 pb-2 flex flex-col gap-0.5">
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 text-gray-900 text-[13px] font-medium transition-colors">
            <User size={16} className="text-gray-700" />
            Profile
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 text-[13px] font-medium transition-colors">
            <Settings size={16} />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 text-[13px] font-medium transition-colors">
            <Rocket size={16} />
            Subscriptions
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 text-[13px] font-medium transition-colors">
            <Code size={16} />
            Developers
          </button>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 text-[13px] font-medium transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full half-moon"></div>
              </div>
              Appearance
            </div>
            <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
              <div className="bg-white rounded-full p-1 shadow-sm">
                <Sun size={12} className="text-gray-900" />
              </div>
              <div className="p-1">
                <Moon size={12} className="text-gray-400" />
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-500 text-[13px] font-medium transition-colors mt-1">
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="h-px w-full bg-gray-100" />

        {/* Usage Section */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-gray-700" />
            <span className="text-[13px] font-medium text-gray-700">Basic Plan</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-gray-600">14/25 emails</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-sm ${i < 14 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-gray-600">24/30 images today</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-sm ${i < 24 ? 'bg-teal-400' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-gray-600">26/150 emails this month</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-sm ${i < 4 ? 'bg-amber-400' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <button className="w-full py-2.5 bg-[#1a1a1a] hover:bg-black text-white text-[14px] font-medium rounded-xl transition-colors mt-2">
            Upgrade
          </button>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .half-moon {
          clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
        }
      `}} />
    </>
  )
}
