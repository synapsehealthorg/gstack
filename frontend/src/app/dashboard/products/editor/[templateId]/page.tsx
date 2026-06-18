"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas } from "fabric";
import { MockupCanvas } from "@/components/products/editor/canvas";
import { DEFAULT_TEMPLATES } from "@/components/products/TemplateGallery";
import { useBuilderStore } from "@/store/useBuilderStore";

export default function ProductEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const { activeViewMode, setActiveViewMode } = useBuilderStore();

  // Find the requested template
  const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);

  useEffect(() => {
    if (!template) {
      router.push("/dashboard");
    }
  }, [template, router]);

  if (!template) {
    return <div className="flex h-screen items-center justify-center">Loading template...</div>;
  }

  return (
    // Fixed, non-scrolling 100vh layout that covers any dashboard navigation
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden text-gray-900">
      
      {/* ZONE 1: Top Bar (h-16) */}
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
        {/* Left: File tools */}
        <div className="flex items-center gap-6 w-1/3">
          <button 
            onClick={() => router.back()} 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <button className="text-sm font-medium text-gray-700 hover:text-black">Save</button>
          <button className="text-sm font-medium text-gray-700 hover:text-black">Import</button>
        </div>
        
        {/* Center: View toggle (2D Edit / 3D Mockup) */}
        <div className="flex items-center justify-center w-1/3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeViewMode === '2D_EDIT' 
                  ? 'bg-white shadow text-black' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setActiveViewMode('2D_EDIT')}
            >
              2D Edit
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeViewMode === '3D_MOCKUP' 
                  ? 'bg-white shadow text-black' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setActiveViewMode('3D_MOCKUP')}
            >
              3D Mockup
            </button>
          </div>
        </div>

        {/* Right: Export Techpack */}
        <div className="flex items-center justify-end w-1/3">
          <button className="bg-black text-white px-5 py-2 text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors">
            Export Techpack
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ZONE 2: Left Sidebar (w-80) */}
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
          <div className="flex border-b border-gray-200 shrink-0">
            <button className="flex-1 py-3 text-sm font-medium border-b-2 border-black text-black">
              Products
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-900">
              AI Studio
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-900">
              Library
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Products / AI Studio / Library content goes here */}
            <p className="text-xs text-gray-400">Left sidebar content area...</p>
          </div>
        </aside>

        {/* ZONE 3: Center Workspace (flex-1) */}
        <main className="flex-1 bg-gray-50 relative flex items-center justify-center overflow-hidden">
          {activeViewMode === '2D_EDIT' ? (
            <div className="w-[600px] h-[600px] bg-white shadow-sm border border-gray-200 rounded-lg flex items-center justify-center relative">
              {/* @ts-ignore */}
              <MockupCanvas template={{ imageUrl: template.imageUrl }} onCanvasReady={setCanvas} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500 font-medium">3D Mockup View (Phase 4)</p>
            </div>
          )}

          {/* Floating Zoom/Pan Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2">
            <button className="px-2 py-1 text-xs font-medium hover:bg-gray-100 rounded text-gray-600 transition-colors">Zoom In</button>
            <button className="px-2 py-1 text-xs font-medium hover:bg-gray-100 rounded text-gray-600 transition-colors">Zoom Out</button>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <button className="px-2 py-1 text-xs font-medium hover:bg-gray-100 rounded text-gray-600 transition-colors">Pan</button>
          </div>
        </main>

        {/* ZONE 4: Right Sidebar (w-80) */}
        <aside className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0">
          {/* The Context-Aware Inspector. (Leave empty for Phase 3). */}
          <div className="flex-1 p-4 flex items-center justify-center">
            <p className="text-xs text-gray-400">Context-Aware Inspector (Phase 3)</p>
          </div>
        </aside>

      </div>
    </div>
  );
}
