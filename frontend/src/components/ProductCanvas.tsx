"use client"

import React, { useState, useEffect, useRef } from "react"
import { create } from "zustand"
import { ReactFlow, Background, Controls, Handle, Position, Node, Edge, Connection, BackgroundVariant } from "@xyflow/react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { proovDb } from "@/lib/db"

import "@xyflow/react/dist/style.css"

// ==========================================
// 1. PANTONE TCX TO sRGB DICTIONARY
// ==========================================
const PANTONE_TCX: Record<string, { name: string; hex: string }> = {
  "18-1664": { name: "Fiery Red", hex: "#DD3B3F" },
  "19-4052": { name: "Classic Blue", hex: "#0F4C81" },
  "15-5534": { name: "Bright Green", hex: "#00A86B" },
  "12-0752": { name: "Buttercup Yellow", hex: "#F4D03F" },
  "19-0303": { name: "Jet Black", hex: "#1A1A1A" },
  "11-0601": { name: "Bright White", hex: "#F9F9FB" },
  "16-1364": { name: "Vibrant Orange", hex: "#FF6F61" },
  "18-3840": { name: "Ultra Violet", hex: "#5F4B8B" },
  "17-5104": { name: "Ultimate Gray", hex: "#939597" },
  "13-0647": { name: "Illuminating Yellow", hex: "#F5DF4D" },
  "18-2043": { name: "Raspberry Sorbet", hex: "#D2386C" },
  "14-4122": { name: "Sky Blue", hex: "#8FAEC6" }
}

function resolvePantone(code: string) {
  const clean = code.trim().toLowerCase().replace("tcx", "").trim()
  if (PANTONE_TCX[clean]) return { ...PANTONE_TCX[clean], code: clean }
  for (const k in PANTONE_TCX) {
    if (k.includes(clean) || PANTONE_TCX[k].name.toLowerCase().includes(clean)) {
      return { ...PANTONE_TCX[k], code: k }
    }
  }
  return null
}

function PantoneName(code: string) {
  return PANTONE_TCX[code] ? PANTONE_TCX[code].name : "Custom"
}

// ==========================================
// 2. PROCEDURAL PRODUCT TEMPLATES
// ==========================================
export interface ZoneConfig {
  name: string
  acceptsLogo: boolean
  acceptsText: boolean
  defaultColor: string
  defaultPantone: string
  shapePoints: { x: number; y: number }[]
}

export interface ProductTemplate {
  id: string
  name: string
  category: string
  requiredSpecCards: string[]
  zones: Record<string, ZoneConfig>
  build3DMesh: (materials: Record<string, THREE.Material>) => THREE.Object3D
}

export const TEMPLATES: Record<string, ProductTemplate> = {
  jersey: {
    id: "jersey",
    name: "Elite Football Jersey",
    category: "sportswear",
    requiredSpecCards: ["Colorway", "Logo Placement", "Material", "Construction", "Sizing"],
    zones: {
      "front-body": { name: "Front Body", acceptsLogo: true, acceptsText: true, defaultColor: "#F9F9FB", defaultPantone: "11-0601", shapePoints: [{x: 0.2, y: 0.1}, {x: 0.8, y: 0.1}, {x: 0.8, y: 0.8}, {x: 0.2, y: 0.8}] },
      "back-body": { name: "Back Body", acceptsLogo: true, acceptsText: true, defaultColor: "#1A1A1A", defaultPantone: "19-0303", shapePoints: [{x: 0.2, y: 0.1}, {x: 0.8, y: 0.1}, {x: 0.8, y: 0.8}, {x: 0.2, y: 0.8}] },
      "left-sleeve": { name: "Left Sleeve", acceptsLogo: true, acceptsText: false, defaultColor: "#8B5CF6", defaultPantone: "18-3840", shapePoints: [{x: 0.0, y: 0.15}, {x: 0.2, y: 0.1}, {x: 0.2, y: 0.4}, {x: 0.05, y: 0.55}] },
      "right-sleeve": { name: "Right Sleeve", acceptsLogo: true, acceptsText: false, defaultColor: "#8B5CF6", defaultPantone: "18-3840", shapePoints: [{x: 0.8, y: 0.1}, {x: 1.0, y: 0.15}, {x: 0.95, y: 0.55}, {x: 0.8, y: 0.4}] },
      "collar": { name: "Collar Ring", acceptsLogo: false, acceptsText: false, defaultColor: "#DD3B3F", defaultPantone: "18-1664", shapePoints: [{x: 0.4, y: 0.05}, {x: 0.6, y: 0.05}, {x: 0.65, y: 0.12}, {x: 0.35, y: 0.12}] }
    },
    build3DMesh: (materials) => {
      const group = new THREE.Group()
      
      const bodyGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 32, 1, true)
      const bodyMesh = new THREE.Mesh(bodyGeom, materials["front-body"] || materials.default)
      bodyMesh.position.y = 0.9
      group.add(bodyMesh)

      const sleeveGeom = new THREE.CylinderGeometry(0.25, 0.2, 0.6, 16)
      sleeveGeom.rotateZ(-Math.PI / 4)
      const leftSleeve = new THREE.Mesh(sleeveGeom, materials["left-sleeve"] || materials.default)
      leftSleeve.position.set(-0.75, 1.4, 0)
      group.add(leftSleeve)

      const sleeveGeomR = new THREE.CylinderGeometry(0.25, 0.2, 0.6, 16)
      sleeveGeomR.rotateZ(Math.PI / 4)
      const rightSleeve = new THREE.Mesh(sleeveGeomR, materials["right-sleeve"] || materials.default)
      rightSleeve.position.set(0.75, 1.4, 0)
      group.add(rightSleeve)

      const collarGeom = new THREE.TorusGeometry(0.42, 0.06, 8, 32)
      collarGeom.rotateX(Math.PI / 2)
      const collar = new THREE.Mesh(collarGeom, materials["collar"] || materials.default)
      collar.position.set(0, 1.8, 0)
      group.add(collar)

      return group
    }
  },
  shorts: {
    id: "shorts",
    name: "Pro Match Shorts",
    category: "sportswear",
    requiredSpecCards: ["Colorway", "Sizing", "Material"],
    zones: {
      "left-leg": { name: "Left Leg", acceptsLogo: true, acceptsText: true, defaultColor: "#0F4C81", defaultPantone: "19-4052", shapePoints: [{x: 0.1, y: 0.2}, {x: 0.49, y: 0.2}, {x: 0.49, y: 0.9}, {x: 0.1, y: 0.9}] },
      "right-leg": { name: "Right Leg", acceptsLogo: true, acceptsText: true, defaultColor: "#0F4C81", defaultPantone: "19-4052", shapePoints: [{x: 0.51, y: 0.2}, {x: 0.9, y: 0.2}, {x: 0.9, y: 0.9}, {x: 0.51, y: 0.9}] },
      "waistband": { name: "Waistband", acceptsLogo: false, acceptsText: false, defaultColor: "#1A1A1A", defaultPantone: "19-0303", shapePoints: [{x: 0.1, y: 0.05}, {x: 0.9, y: 0.05}, {x: 0.9, y: 0.2}, {x: 0.1, y: 0.2}] }
    },
    build3DMesh: (materials) => {
      const group = new THREE.Group()
      
      const waistGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 24)
      const waist = new THREE.Mesh(waistGeom, materials["waistband"] || materials.default)
      waist.position.y = 0.95
      group.add(waist)

      const lLegGeom = new THREE.CylinderGeometry(0.35, 0.38, 0.6, 16)
      const lLeg = new THREE.Mesh(lLegGeom, materials["left-leg"] || materials.default)
      lLeg.position.set(-0.25, 0.5, 0)
      group.add(lLeg)

      const rLegGeom = new THREE.CylinderGeometry(0.35, 0.38, 0.6, 16)
      const rLeg = new THREE.Mesh(rLegGeom, materials["right-leg"] || materials.default)
      rLeg.position.set(0.25, 0.5, 0)
      group.add(rLeg)

      return group
    }
  }
}

// ==========================================
// 3. ZUSTAND CANVAS GRAPH & SPEC STORE
// ==========================================
interface ZoneState {
  color: string
  pantone: string
  colorName: string
  logo: string | null
  logoUrl: string | null
  logoScale: number
  logoPos: { x: number; y: number }
  logoRot: number
  text: string
  textFont: string
  textColor: string
  textPantone: string
  textSize: number
}

interface InspirationItem {
  id: string
  type: "image" | "text" | "sticky"
  content: string
  label?: string
  color?: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  createdAt: string
}

interface CanvasStore {
  isPremium: boolean
  activeTemplate: string
  selectedZone: string
  cameraMode: "2d" | "3d" | "board"
  show3DPrototype: boolean
  templatesData: Record<string, { zones: Record<string, ZoneState>; title: string }>
  nodes: Node[]
  edges: Edge[]
  undoStack: string[]
  redoStack: string[]
  techpackTitle: string
  showWhopCheckout: boolean
  openSpecCardId: string | null
  techpackDrawerOpen: boolean
  inspirationItems: InspirationItem[]
  selectedItemId: string | null
  boardZoom: number
  boardPan: { x: number; y: number }
  
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: Connection) => void
  setPremium: (isPremium: boolean) => void
  setCameraMode: (mode: "2d" | "3d" | "board") => void
  addInspirationItem: (item: Partial<InspirationItem>) => string
  updateInspirationItem: (id: string, updates: Partial<InspirationItem>) => void
  removeInspirationItem: (id: string) => void
  setSelectedItemId: (id: string | null) => void
  setBoardZoom: (zoom: number) => void
  setBoardPan: (pan: { x: number; y: number }) => void
  bringItemToFront: (id: string) => void
  setActiveTemplate: (tid: string) => void
  setSelectedZone: (zid: string) => void
  updateZoneColor: (zid: string, hex: string, pantone: string) => void
  updateZoneLogo: (zid: string, url: string | null) => void
  updateZoneLogoTransform: (zid: string, scale?: number, rot?: number, pos?: { x: number; y: number }) => void
  updateZoneText: (zid: string, text?: string, font?: string, color?: string, pantone?: string, size?: number) => void
  updateSpecFields: (nodeId: string, fields: any) => void
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

const getInitialSpecFields = (cardName: string) => {
  switch(cardName) {
    case "Colorway":
      return { "Primary Color": "", "Secondary Color": "", "Accent Color": "", "Pantone Match": "" }
    case "Logo Placement":
      return { "Logo File": "", "Position Detail": "", "Print Method": "Sublimation" }
    case "Material":
      return { "Fabric Type": "Polyester Mesh", "GSM": "180", "Composition": "100% Polyester" }
    case "Construction":
      return { "Seam Finish": "Flatlock flat seam", "Thread Type": "Heavy-duty core spun" }
    case "Sizing":
      return { "Target Run": "S to XXL", "Fits": "Standard Athletic Fits" }
    default:
      return {}
  }
}

const buildInitialGraph = (templateId: string): { nodes: Node[]; edges: Edge[] } => {
  const t = TEMPLATES[templateId] || TEMPLATES.jersey
  const nodes: Node[] = []
  let yOffset = 50
  
  for (const zid in t.zones) {
    nodes.push({
      id: `zone_${zid}`,
      type: "zone",
      position: { x: 50, y: yOffset },
      data: { name: t.zones[zid].name, zoneId: zid },
    })
    yOffset += 70
  }
  
  yOffset = 50
  const cards = t.requiredSpecCards
  for (const c of cards) {
    nodes.push({
      id: `spec_${c.toLowerCase().replace(" ", "_")}`,
      type: "spec",
      position: { x: 280, y: yOffset },
      data: { name: c, completed: false, fields: getInitialSpecFields(c) },
    })
    yOffset += 70
  }

  const edges: Edge[] = []
  if (t.zones["front-body"] && cards.includes("Colorway")) {
    edges.push({
      id: `edge_front_colorway`,
      source: "zone_front-body",
      target: "spec_colorway",
      animated: true,
      style: { stroke: '#8B5CF6', strokeWidth: 2 }
    })
  }

  return { nodes, edges }
}

const initialTemplatesData: Record<string, { zones: Record<string, ZoneState>; title: string }> = {}
for (const tid in TEMPLATES) {
  const t = TEMPLATES[tid]
  const zoneStates: Record<string, ZoneState> = {}
  for (const zid in t.zones) {
    const z = t.zones[zid]
    zoneStates[zid] = {
      color: z.defaultColor,
      pantone: z.defaultPantone,
      colorName: PantoneName(z.defaultPantone),
      logo: null,
      logoUrl: null,
      logoScale: 1.0,
      logoPos: { x: 0.5, y: 0.5 },
      logoRot: 0,
      text: "",
      textFont: "Inter",
      textColor: "#FFFFFF",
      textPantone: "11-0601",
      textSize: 25
    }
  }
  initialTemplatesData[tid] = {
    zones: zoneStates,
    title: t.name
  }
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  isPremium: false,
  activeTemplate: "jersey",
  selectedZone: "front-body",
  cameraMode: "2d",
  show3DPrototype: false,
  templatesData: initialTemplatesData,
  nodes: buildInitialGraph("jersey").nodes,
  edges: buildInitialGraph("jersey").edges,
  undoStack: [],
  redoStack: [],
  techpackTitle: "Elite Football Jersey Canvas",
  showWhopCheckout: false,
  openSpecCardId: null,
  techpackDrawerOpen: false,
  inspirationItems: [],
  selectedItemId: null,
  boardZoom: 1,
  boardPan: { x: 0, y: 0 },

  onNodesChange: (changes) => {
    // Handling React Flow node change
  },
  onEdgesChange: (changes) => {
    // Handling React Flow edge change
  },
  onConnect: (connection) => {
    const { nodes, edges } = get()
    const updatedNodes = nodes.map(n => {
      if (n.id === connection.target && n.type === "spec") {
        return { ...n, data: { ...n.data, completed: true } }
      }
      return n
    })
    const newEdges = [
      ...edges,
      {
        id: `edge_${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        animated: true,
        style: { stroke: '#8B5CF6', strokeWidth: 2 }
      }
    ]
    set({ edges: newEdges, nodes: updatedNodes })
    
    // Sync data
    const zoneId = connection.source!.replace("zone_", "")
    syncZoneToSpecCards(zoneId)
  },

  setPremium: (isPremium) => set({ isPremium }),
  setCameraMode: (cameraMode) => {
    const { isPremium } = get()
    if (cameraMode === "3d" && !isPremium) {
      set({ showWhopCheckout: true })
      return
    }
    set({ cameraMode, show3DPrototype: cameraMode === "3d" })
    
    // Trigger resize trigger
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 100)
  },

  addInspirationItem: (item) => {
    const { inspirationItems } = get()
    const id = 'board_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    const newItem: InspirationItem = {
      id,
      type: item.type || "sticky",
      content: item.content || "",
      x: item.x || 100,
      y: item.y || 100,
      width: item.width || 150,
      height: item.height || 150,
      zIndex: inspirationItems.length,
      createdAt: new Date().toISOString(),
      label: item.label,
      color: item.color
    }
    set({ inspirationItems: [...inspirationItems, newItem], selectedItemId: id })
    return id
  },

  updateInspirationItem: (id, updates) => {
    const { inspirationItems } = get()
    set({
      inspirationItems: inspirationItems.map(item => item.id === id ? { ...item, ...updates } : item)
    })
  },

  removeInspirationItem: (id) => {
    const { inspirationItems, selectedItemId } = get()
    set({
      inspirationItems: inspirationItems.filter(i => i.id !== id),
      selectedItemId: selectedItemId === id ? null : selectedItemId
    })
  },

  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setBoardZoom: (zoom) => set({ boardZoom: Math.max(0.25, Math.min(3, zoom)) }),
  setBoardPan: (pan) => set({ boardPan: pan }),
  bringItemToFront: (id) => {
    const { inspirationItems } = get()
    const maxZ = Math.max(...inspirationItems.map(i => i.zIndex || 0), 0)
    set({
      inspirationItems: inspirationItems.map(i => i.id === id ? { ...i, zIndex: maxZ + 1 } : i)
    })
  },

  setActiveTemplate: (tid) => {
    const { nodes, edges } = buildInitialGraph(tid)
    const title = (TEMPLATES[tid]?.name || "Product") + " Design Draft"
    set({ activeTemplate: tid, selectedZone: Object.keys(TEMPLATES[tid]?.zones || {})[0], nodes, edges, techpackTitle: title })
    
    // Trigger Three.js redraw
    window.dispatchEvent(new CustomEvent("proov_canvas_reload"))
  },

  setSelectedZone: (zid) => set({ selectedZone: zid }),

  updateZoneColor: (zid, hex, pantoneCode) => {
    const { activeTemplate, templatesData } = get()
    get().pushHistory()
    const updated = { ...templatesData }
    const template = updated[activeTemplate]
    if (template && template.zones[zid]) {
      template.zones[zid].color = hex
      template.zones[zid].pantone = pantoneCode
      template.zones[zid].colorName = PantoneName(pantoneCode)
    }
    set({ templatesData: updated })
    syncZoneToSpecCards(zid)
    window.dispatchEvent(new CustomEvent("proov_canvas_bake"))
  },

  updateZoneLogo: (zid, logoUrl) => {
    const { activeTemplate, templatesData } = get()
    get().pushHistory()
    const updated = { ...templatesData }
    const template = updated[activeTemplate]
    if (template && template.zones[zid]) {
      template.zones[zid].logo = logoUrl
      template.zones[zid].logoUrl = logoUrl
    }
    set({ templatesData: updated })
    syncZoneToSpecCards(zid)
    window.dispatchEvent(new CustomEvent("proov_canvas_bake"))
  },

  updateZoneLogoTransform: (zid, scale, rot, pos) => {
    const { activeTemplate, templatesData } = get()
    const updated = { ...templatesData }
    const template = updated[activeTemplate]
    if (template && template.zones[zid]) {
      if (scale !== undefined) template.zones[zid].logoScale = scale
      if (rot !== undefined) template.zones[zid].logoRot = rot
      if (pos !== undefined) template.zones[zid].logoPos = pos
    }
    set({ templatesData: updated })
    window.dispatchEvent(new CustomEvent("proov_canvas_bake"))
  },

  updateZoneText: (zid, text, font, color, pantone, size) => {
    const { activeTemplate, templatesData } = get()
    get().pushHistory()
    const updated = { ...templatesData }
    const template = updated[activeTemplate]
    if (template && template.zones[zid]) {
      const zone = template.zones[zid]
      if (text !== undefined) zone.text = text
      if (font !== undefined) zone.textFont = font
      if (color !== undefined) zone.textColor = color
      if (pantone !== undefined) zone.textPantone = pantone
      if (size !== undefined) zone.textSize = size
    }
    set({ templatesData: updated })
    window.dispatchEvent(new CustomEvent("proov_canvas_bake"))
  },

  updateSpecFields: (nodeId, fields) => {
    const { nodes } = get()
    get().pushHistory()
    
    let completed = true
    for (const k in fields) {
      if (!fields[k] || fields[k].trim() === "") {
        completed = false
      }
    }

    set({
      nodes: nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, fields, completed } } : n)
    })
    
    flowSpecCardBackToZones(nodeId, fields)
  },

  pushHistory: () => {
    const { templatesData, nodes, edges, undoStack } = get()
    const snapshot = JSON.stringify({ templatesData, nodes, edges })
    set({
      undoStack: [...undoStack, snapshot],
      redoStack: []
    })
  },

  undo: () => {
    const { undoStack, redoStack, templatesData, nodes, edges } = get()
    if (undoStack.length === 0) return
    
    const prev = undoStack[undoStack.length - 1]
    const newUndo = undoStack.slice(0, -1)
    const current = JSON.stringify({ templatesData, nodes, edges })

    const parsed = JSON.parse(prev)
    set({
      templatesData: parsed.templatesData,
      nodes: parsed.nodes,
      edges: parsed.edges,
      undoStack: newUndo,
      redoStack: [...redoStack, current]
    })
    window.dispatchEvent(new CustomEvent("proov_canvas_reload"))
  },

  redo: () => {
    const { undoStack, redoStack, templatesData, nodes, edges } = get()
    if (redoStack.length === 0) return
    
    const next = redoStack[redoStack.length - 1]
    const newRedo = redoStack.slice(0, -1)
    const current = JSON.stringify({ templatesData, nodes, edges })

    const parsed = JSON.parse(next)
    set({
      templatesData: parsed.templatesData,
      nodes: parsed.nodes,
      edges: parsed.edges,
      undoStack: [...undoStack, current],
      redoStack: newRedo
    })
    window.dispatchEvent(new CustomEvent("proov_canvas_reload"))
  }
}))

function syncZoneToSpecCards(zoneId: string) {
  const state = useCanvasStore.getState()
  const tData = state.templatesData[state.activeTemplate]
  const zone = tData?.zones[zoneId]
  if (!zone) return

  const connections = state.edges.filter(e => e.source === `zone_${zoneId}`)
  connections.forEach(edge => {
    const targetNode = state.nodes.find(n => n.id === edge.target)
    if (!targetNode) return

    const fields = { ...(targetNode.data.fields as any) }
    if (targetNode.data.name === "Colorway") {
      fields["Primary Color"] = zone.color
      fields["Pantone Match"] = zone.pantone + " (" + zone.colorName + ")"
    } else if (targetNode.data.name === "Logo Placement") {
      fields["Logo File"] = zone.logoUrl ? "Uploaded Asset" : "None"
      fields["Position Detail"] = `Zone: ${zoneId} | Scale: ${Math.round(zone.logoScale * 100)}%`
    } else if (targetNode.data.name === "Branding" && zone.text) {
      fields["Inner Label"] = `Printed Text: "${zone.text}" | Font: ${zone.textFont}`
    }
    
    let completed = true
    for (const k in fields) {
      if (!fields[k] || fields[k].toString().trim() === "") {
        completed = false
      }
    }

    state.nodes = state.nodes.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, fields, completed } } : n)
  })

  useCanvasStore.setState({ nodes: [...state.nodes] })
}

function flowSpecCardBackToZones(cardNodeId: string, fields: any) {
  const state = useCanvasStore.getState()
  const tData = state.templatesData[state.activeTemplate]
  
  const connections = state.edges.filter(e => e.target === cardNodeId)
  connections.forEach(edge => {
    const sourceNode = state.nodes.find(n => n.id === edge.source)
    if (!sourceNode) return

    const zoneId = sourceNode.data.zoneId as string
    const zone = tData?.zones[zoneId]
    if (!zone) return

    const cardNode = state.nodes.find(n => n.id === cardNodeId)
    if (cardNode?.data.name === "Colorway") {
      const primaryColorInput = fields["Primary Color"]
      const pantoneMatchInput = fields["Pantone Match"]

      if (primaryColorInput && primaryColorInput !== zone.color) {
        zone.color = primaryColorInput
        const resolved = resolvePantone(pantoneMatchInput || "")
        if (resolved) {
          zone.pantone = resolved.code || resolved.hex
          zone.colorName = resolved.name
        }
      }
    }
  })

  useCanvasStore.setState({ templatesData: { ...state.templatesData } })
  window.dispatchEvent(new CustomEvent("proov_canvas_bake"))
}

// ==========================================
// 4. THREE.js WEBGL CANVAS ENGINE MANAGER
// ==========================================
class CanvasEngine {
  canvas: HTMLCanvasElement
  store: typeof useCanvasStore
  width: number
  height: number
  renderer: THREE.WebGLRenderer
  scene2D: THREE.Scene
  scene3D: THREE.Scene
  camera2D: THREE.OrthographicCamera
  camera3D: THREE.PerspectiveCamera
  controls: OrbitControls
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2
  
  textures: Record<string, THREE.CanvasTexture> = {}
  materials: Record<string, THREE.MeshStandardMaterial | THREE.MeshBasicMaterial> = {}
  mesh2DGroup: THREE.Group | null = null
  mesh3DObject: THREE.Object3D | null = null
  logoPlanes: Record<string, THREE.Mesh> = {}
  
  draggedLogoZone: string | null = null
  dragStartMouse: THREE.Vector2 | null = null
  dragStartLogoPos: { x: number; y: number } | null = null

  constructor(canvasElement: HTMLCanvasElement, store: typeof useCanvasStore) {
    this.canvas = canvasElement
    this.store = store
    
    const rect = this.canvas.getBoundingClientRect()
    this.width = rect.width || 400
    this.height = rect.height || 400

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.scene2D = new THREE.Scene()
    this.scene3D = new THREE.Scene()

    this.camera2D = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 100)
    this.camera2D.position.set(0, 0, 10)
    this.camera2D.lookAt(0, 0, 0)

    this.camera3D = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100)
    this.camera3D.position.set(0, 0.9, 4.5)

    this.controls = new OrbitControls(this.camera3D, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2 + 0.2
    this.controls.minDistance = 2.0
    this.controls.maxDistance = 10.0
    this.controls.target.set(0, 0.9, 0)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7)
    hemiLight.position.set(0, 20, 0)
    this.scene3D.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 10, 7)
    this.scene3D.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0x8B5CF6, 0.3)
    fillLight.position.set(-5, 5, -5)
    this.scene3D.add(fillLight)

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.loadProductGeometry()
    this.animate()
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.renderer.setSize(width, height)
    
    this.camera3D.aspect = width / height
    this.camera3D.updateProjectionMatrix()

    const aspect = width / height
    this.camera2D.left = -2 * aspect
    this.camera2D.right = 2 * aspect
    this.camera2D.top = 2
    this.camera2D.bottom = -2
    this.camera2D.updateProjectionMatrix()
  }

  loadProductGeometry() {
    const state = this.store.getState()
    const tid = state.activeTemplate
    const template = TEMPLATES[tid] || TEMPLATES.jersey
    const tData = state.templatesData[tid]

    if (this.mesh2DGroup) this.scene2D.remove(this.mesh2DGroup)
    if (this.mesh3DObject) this.scene3D.remove(this.mesh3DObject)
    this.logoPlanes = {}

    this.mesh2DGroup = new THREE.Group()
    this.scene2D.add(this.mesh2DGroup)

    const meshMaterials: Record<string, THREE.Material> = {
      default: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 })
    }

    for (const zid in template.zones) {
      const z = template.zones[zid]
      const zState = tData.zones[zid]

      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512
      
      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      this.textures[zid] = texture

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide
      })
      this.materials[zid] = mat
      meshMaterials[zid] = mat

      // 2D Mesh Shape
      const shape = new THREE.Shape()
      const points = z.shapePoints
      const toWorld = (p: { x: number; y: number }) => new THREE.Vector2((p.x - 0.5) * 3, (p.y - 0.5) * 3)
      
      const start = toWorld(points[0])
      shape.moveTo(start.x, start.y)
      for (let i = 1; i < points.length; i++) {
        const pt = toWorld(points[i])
        shape.lineTo(pt.x, pt.y)
      }
      shape.closePath()

      const geom = new THREE.ShapeGeometry(shape)
      const mat2D = new THREE.MeshBasicMaterial({
        color: new THREE.Color(zState.color),
        side: THREE.DoubleSide
      })
      
      const mesh2D = new THREE.Mesh(geom, mat2D)
      mesh2D.userData = { zoneId: zid }
      this.mesh2DGroup.add(mesh2D)

      if (zState.logoUrl) {
        const logoTexture = new THREE.TextureLoader().load(zState.logoUrl)
        const logoMat = new THREE.MeshBasicMaterial({
          map: logoTexture,
          transparent: true,
          depthWrite: false
        })
        
        const logoGeom = new THREE.PlaneGeometry(0.5, 0.5)
        const logoMesh = new THREE.Mesh(logoGeom, logoMat)
        
        const pos = this.getZoneCenter(zid)
        logoMesh.position.set(pos.x, pos.y, 0.005)
        logoMesh.scale.set(zState.logoScale, zState.logoScale, 1)
        logoMesh.rotation.z = zState.logoRot
        
        logoMesh.userData = { isLogo: true, zoneId: zid }
        this.mesh2DGroup.add(logoMesh)
        this.logoPlanes[zid] = logoMesh
      }
    }

    if (template.build3DMesh) {
      this.mesh3DObject = template.build3DMesh(meshMaterials)
      this.scene3D.add(this.mesh3DObject)
    }

    this.bakeTextures()
  }

  getZoneCenter(zoneId: string) {
    const template = TEMPLATES[this.store.getState().activeTemplate] || TEMPLATES.jersey
    const points = template.zones[zoneId]?.shapePoints || []
    let minX = 999, maxX = -999, minY = 999, maxY = -999
    points.forEach(p => {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    })
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    return new THREE.Vector2((cx - 0.5) * 3, (cy - 0.5) * 3)
  }

  bakeTextures() {
    const state = this.store.getState()
    const tid = state.activeTemplate
    const template = TEMPLATES[tid] || TEMPLATES.jersey
    const tData = state.templatesData[tid]

    for (const zid in template.zones) {
      const zState = tData.zones[zid]
      const texture = this.textures[zid]
      const mat = this.materials[zid]

      if (!texture || !mat) continue

      const canvas = texture.image as HTMLCanvasElement
      const ctx = canvas.getContext("2d")
      if (!ctx) continue

      ctx.fillStyle = zState.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgba(0,0,0,0.03)"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 8) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      if (zState.text && zState.text.trim() !== "") {
        ctx.fillStyle = zState.textColor
        ctx.font = `bold ${zState.textSize * 1.5}px ${zState.textFont}`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.fillText(zState.text, 0, 0)
        ctx.restore()
      }

      if (zState.logoUrl) {
        const logoImg = new Image()
        logoImg.onload = () => {
          ctx.save()
          const x = zState.logoPos.x * canvas.width
          const y = (1 - zState.logoPos.y) * canvas.height
          ctx.translate(x, y)
          ctx.rotate(-zState.logoRot)

          const w = 150 * zState.logoScale
          const h = 150 * zState.logoScale
          ctx.drawImage(logoImg, -w/2, -h/2, w, h)
          ctx.restore()
          
          texture.needsUpdate = true
        }
        logoImg.src = zState.logoUrl
      } else {
        texture.needsUpdate = true
      }

      if (this.mesh2DGroup) {
        this.mesh2DGroup.children.forEach(c => {
          if (c.userData.zoneId === zid && !c.userData.isLogo) {
            const meshBasicMat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
            meshBasicMat.color.set(zState.color)
            meshBasicMat.needsUpdate = true
          }
        })
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    const state = this.store.getState()
    const is3D = state.cameraMode === "3d" && state.isPremium

    if (is3D) {
      this.renderer.render(this.scene3D, this.camera3D)
      this.controls.update()
    } else {
      this.renderer.render(this.scene2D, this.camera2D)
    }
  }

  takeScreenshot() {
    const state = this.store.getState()
    if (state.cameraMode === "3d") {
      this.renderer.render(this.scene3D, this.camera3D)
    } else {
      this.renderer.render(this.scene2D, this.camera2D)
    }
    return this.canvas.toDataURL("image/png")
  }
}

// ==========================================
// 5. CUSTOM REACT FLOW NODE GRAPH STYLING
// ==========================================
const ZoneNodeComponent = ({ data, selected }: any) => {
  const { templatesData, activeTemplate } = useCanvasStore()
  const zoneState = templatesData[activeTemplate]?.zones[data.zoneId]
  
  return (
    <div style={{
      background: "#1E1E24",
      border: `2px solid ${selected ? "#8B5CF6" : "rgba(255, 255, 255, 0.08)"}`,
      borderRadius: "8px",
      padding: "10px",
      width: "130px",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontSize: "11px",
      fontWeight: "bold",
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {zoneState && (
          <div style={{
            width: "20px", height: "20px", borderRadius: "4px", backgroundColor: zoneState.color,
            border: "1px solid rgba(255,255,255,0.2)"
          }}></div>
        )}
        <span>{data.name}</span>
      </div>
      <Handle type="source" position={Position.Right} id="output" style={{ background: "#8B5CF6", width: "10px", height: "10px", border: "none", right: "-6px" }} />
    </div>
  )
}

const SpecNodeComponent = ({ data, id }: any) => {
  return (
    <div 
      style={{
        background: "#18181C",
        border: `1px solid ${data.completed ? "#0D9488" : "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: "8px",
        padding: "10px",
        width: "140px",
        color: "#fff",
        fontFamily: "var(--font-sans)",
        fontSize: "11px",
        fontWeight: "bold",
        position: "relative",
        cursor: "pointer",
        transition: "border 0.2s ease"
      }}
      onClick={() => useCanvasStore.setState({ openSpecCardId: id })}
    >
      <Handle type="target" position={Position.Left} id="input" style={{ background: "#0D9488", width: "10px", height: "10px", border: "none", left: "-6px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%", backgroundColor: data.completed ? "#0D9488" : "#EF4444"
        }}></div>
        <span>{data.name}</span>
      </div>
    </div>
  )
}

const nodeTypes = {
  zone: ZoneNodeComponent,
  spec: SpecNodeComponent
}

let activeEngineInstance: CanvasEngine | null = null

export default function ProductCanvas() {
  const {
    isPremium,
    activeTemplate,
    selectedZone,
    cameraMode,
    templatesData,
    nodes,
    edges,
    techpackTitle,
    showWhopCheckout,
    openSpecCardId,
    techpackDrawerOpen,
    setCameraMode,
    setActiveTemplate,
    setSelectedZone,
    updateZoneColor,
    updateZoneLogo,
    updateZoneLogoTransform,
    updateZoneText,
    updateSpecFields,
    undo,
    redo,
    setPremium,
    onConnect
  } = useCanvasStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (canvasRef.current && !activeEngineInstance) {
      activeEngineInstance = new CanvasEngine(canvasRef.current, useCanvasStore)
    }

    const handleResize = () => {
      if (activeEngineInstance) {
        const viewer = document.querySelector(".canvas-viewer")
        if (viewer) {
          const rect = viewer.getBoundingClientRect()
          activeEngineInstance.resize(rect.width, rect.height)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("proov_canvas_reload", () => activeEngineInstance?.loadProductGeometry())
    window.addEventListener("proov_canvas_bake", () => activeEngineInstance?.bakeTextures())
    
    setTimeout(handleResize, 100)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const template = TEMPLATES[activeTemplate] || TEMPLATES.jersey
  const tData = templatesData[activeTemplate]
  const zoneState = tData?.zones[selectedZone]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        updateZoneLogo(selectedZone, event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePostInquiry = async () => {
    const incomplete = nodes.filter(n => n.type === "spec" && !n.data.completed)
    if (incomplete.length > 0) {
      alert(`Please complete the following technical cards before posting:\n\n${incomplete.map(n => "- " + n.data.name).join("\n")}`)
      return
    }

    let screenshotUrl = ""
    if (activeEngineInstance) {
      screenshotUrl = activeEngineInstance.takeScreenshot()
    }

    const specFields: Record<string, any> = {}
    nodes.filter(n => n.type === "spec").forEach(n => {
      specFields[n.data.name as string] = n.data.fields
    })

    const techpackDoc = {
      id: "inquiry_" + Date.now(),
      title: techpackTitle,
      productTemplate: activeTemplate,
      created_at: new Date().toISOString(),
      screenshot: screenshotUrl,
      specifications: specFields,
      pantoneMappings: Object.keys(tData.zones).map(zid => ({
        zone: zid,
        color: tData.zones[zid].color,
        pantone: tData.zones[zid].pantone,
        colorName: tData.zones[zid].colorName
      }))
    }

    // Save
    const newDemand = {
      id: "demand_" + Date.now(),
      buyer_id: "phantom_sports",
      buyer_name: "Phantom Sports (Miami)",
      title: techpackTitle,
      description: `Visual Spec Sheet Inquiry created using 3D Product Canvas.\n\nIncluded Zones:\n${Object.keys(tData.zones).map(z => `- ${z}: Pantone ${tData.zones[z].pantone}`).join("\n")}`,
      category: template.category,
      quantity: 100,
      fabric: specFields["Material"] ? specFields["Material"]["Fabric Type"] : "100% Polyester Mesh",
      budget_range: "$15.00 / piece",
      budget_min: 15.00,
      turnaround_time: "21 days",
      status: "open",
      techpack_url: "proov_canvas_techpack_" + Date.now() + ".pdf",
      created_at: new Date().toISOString(),
      canvas_locked: true,
      canvas_doc: techpackDoc
    }
    
    await proovDb.saveDemand(newDemand)
    await proovDb.logDebug("TECHPACK", `Immutable techpack generated for Canvas Inquiry: ${techpackTitle}`)
    alert("Inquiry successfully posted! Sialkot custom factories can now bid against your exact specifications.")
    window.location.reload()
  }

  const activeSpecCardNode = nodes.find(n => n.id === openSpecCardId)

  return (
    <div className="canvas-container" style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#18181A", color: "#FFFFFF" }}>
      {/* 1. TOP TOOLBAR */}
      <div className="canvas-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#1E1E21" }}>
        <div className="canvas-toolbar-group" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="#" className="canvas-logo" onClick={(e) => { e.preventDefault(); window.location.reload() }} style={{ fontWeight: 800, fontSize: "18px", color: "#FFFFFF", textDecoration: "none" }}>
            proov<span style={{ color: "#8B5CF6" }}>.to</span>
          </a>
          <div className="canvas-divider" style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.15)" }}></div>
          <input
            type="text"
            className="canvas-title-input"
            style={{ background: "transparent", border: "none", color: "#FFFFFF", fontSize: "14px", fontWeight: "600", outline: "none" }}
            value={techpackTitle}
            onChange={(e) => useCanvasStore.setState({ techpackTitle: e.target.value })}
          />
        </div>

        {/* Center segments: Board vs 2D Edit vs 3D Mode */}
        <div className="canvas-toolbar-group">
          <div className="canvas-mode-toggle" style={{ display: "flex", backgroundColor: "#27272A", borderRadius: "8px", padding: "4px" }}>
            <button
              className={`canvas-mode-btn board ${cameraMode === "board" ? "active" : ""}`}
              onClick={() => setCameraMode("board")}
              style={{ padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: cameraMode === "board" ? "#FFFFFF" : "#A1A1AA", backgroundColor: cameraMode === "board" ? "#8B5CF6" : "transparent", cursor: "pointer" }}
            >
              ✦ Mood Board
            </button>
            <button
              className={`canvas-mode-btn ${cameraMode === "2d" ? "active" : ""}`}
              onClick={() => setCameraMode("2d")}
              style={{ padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: cameraMode === "2d" ? "#FFFFFF" : "#A1A1AA", backgroundColor: cameraMode === "2d" ? "#8B5CF6" : "transparent", cursor: "pointer" }}
            >
              2D Editor
            </button>
            <button
              className={`canvas-mode-btn mode-3d ${cameraMode === "3d" ? "active" : ""}`}
              onClick={() => setCameraMode("3d")}
              style={{ padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: cameraMode === "3d" ? "#FFFFFF" : "#A1A1AA", backgroundColor: cameraMode === "3d" ? "#8B5CF6" : "transparent", cursor: "pointer" }}
            >
              3D Prototype
            </button>
          </div>
        </div>

        {/* Right buttons */}
        <div className="canvas-toolbar-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="canvas-btn-icon" onClick={undo} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: "16px" }}>⟲</button>
          <button className="canvas-btn-icon" onClick={redo} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer", fontSize: "16px" }}>⟳</button>
          <div className="canvas-divider" style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.15)" }}></div>
          <button className="btn-secondary" style={{ fontSize: "11px", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "#27272A", color: "#FFF" }} onClick={() => useCanvasStore.setState({ techpackDrawerOpen: true })}>
            Preview Techpack
          </button>
          <button className="btn-primary" style={{ fontSize: "11px", padding: "6px 12px", backgroundColor: "#8B5CF6", color: "#FFF", border: "none" }} onClick={handlePostInquiry}>
            Post Inquiry
          </button>
        </div>
      </div>

      {/* 2. BODY LAYOUT */}
      <div className="canvas-body" style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Left Side: Node Graph */}
        {cameraMode !== "board" && (
          <div className="canvas-sidebar-left" style={{ width: "320px", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#1E1E21" }}>
            <div className="node-graph-header" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="node-graph-title" style={{ fontSize: "12px", fontWeight: "700", color: "#A1A1AA", textTransform: "uppercase" }}>Spec Node Graph</span>
              <select
                className="canvas-form-select"
                style={{ width: "130px", fontSize: "11px", padding: "4px", backgroundColor: "#27272A", border: "1px solid rgba(255,255,255,0.08)", color: "#FFFFFF", borderRadius: "4px" }}
                value={activeTemplate}
                onChange={(e) => setActiveTemplate(e.target.value)}
              >
                {Object.keys(TEMPLATES).map(tid => (
                  <option key={tid} value={tid}>{TEMPLATES[tid].name}</option>
                ))}
              </select>
            </div>

            <div className="node-graph-canvas-container" style={{ position: "relative", width: "100%", flex: 1 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => {
                  if (node.type === "zone") {
                    setSelectedZone(node.data.zoneId as string)
                  } else if (node.type === "spec") {
                    useCanvasStore.setState({ openSpecCardId: node.id })
                  }
                }}
                fitView
                defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#8B5CF6', strokeWidth: 2 } }}
              >
                <Background color="#55555C" gap={16} variant={BackgroundVariant.Dots} />
                <Controls />
              </ReactFlow>

              {/* Spec Card Fields Drawer Overlay */}
              {openSpecCardId && activeSpecCardNode && (
                <div className="spec-card-drawer open" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "240px", backgroundColor: "#1E1E21", borderTop: "2px solid #8B5CF6", zIndex: 100, display: "flex", flexDirection: "column", padding: "16px" }}>
                  <div className="spec-card-drawer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                    <span className="spec-card-drawer-title" style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: activeSpecCardNode.data.completed ? "#0D9488" : "#EF4444" }}></span>
                      {activeSpecCardNode.data.name as string} Specs
                    </span>
                    <button className="spec-card-drawer-close" style={{ background: "none", border: "none", color: "#A1A1AA", fontSize: "20px", cursor: "pointer" }} onClick={() => useCanvasStore.setState({ openSpecCardId: null })}>&times;</button>
                  </div>
                  <div className="spec-card-drawer-body" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    {Object.keys(activeSpecCardNode.data.fields as any).map(key => (
                      <div className="canvas-form-group" key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="canvas-form-label" style={{ fontSize: "11px", color: "#A1A1AA" }}>{key}</label>
                        <input
                          type="text"
                          className="canvas-form-input"
                          style={{ backgroundColor: "#27272A", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", color: "#FFF", outline: "none" }}
                          value={(activeSpecCardNode.data.fields as any)[key]}
                          onChange={(e) => {
                            const newFields = { ...(activeSpecCardNode.data.fields as any) }
                            newFields[key] = e.target.value
                            updateSpecFields(openSpecCardId, newFields)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Viewer: WebGL Canvas */}
        {cameraMode !== "board" && (
          <div className="canvas-viewer" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", outline: "none" }} />

            {cameraMode === "3d" && isPremium && (
              <div style={{ position: "absolute", bottom: "16px", left: "16px", display: "flex", gap: "8px", zIndex: 10 }}>
                <button className="btn-secondary" style={{ fontSize: "11px", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "#27272A", color: "#FFF" }} onClick={() => activeEngineInstance?.controls.reset()}>
                  Reset View
                </button>
                <button className="btn-primary teal" style={{ fontSize: "11px", padding: "6px 12px", backgroundColor: "#0D9488", color: "#FFF", border: "none" }} onClick={() => setCameraMode("2d")}>
                  Back to Editor
                </button>
              </div>
            )}

            {/* Premium Gating Overlay for 3D View */}
            {cameraMode === "3d" && !isPremium && (
              <div className="gating-overlay" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(24,24,26,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                <div className="gating-card" style={{ maxWidth: "340px", backgroundColor: "#1E1E21", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="gating-icon" style={{ fontSize: "36px" }}>💎</div>
                  <h3 className="gating-title" style={{ fontSize: "16px", fontWeight: "700" }}>Design in 3D Canvas</h3>
                  <p className="gating-text" style={{ fontSize: "12px", color: "#A1A1AA" }}>
                    Unlock full perspective 3D mockup rendering, interactive model orbiting, and Pantone-sRGB texture bakes.
                  </p>
                  <button className="btn-primary" onClick={() => useCanvasStore.setState({ showWhopCheckout: true })} style={{ backgroundColor: "#8B5CF6", border: "none", padding: "10px", borderRadius: "8px", color: "#FFF", fontWeight: "600", cursor: "pointer" }}>
                    Upgrade to proov Premium
                  </button>
                  <button className="btn-secondary" onClick={() => setCameraMode("2d")} style={{ border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "#27272A", padding: "8px", borderRadius: "8px", color: "#FFF", cursor: "pointer", fontSize: "11px" }}>
                    Return to 2D Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mood Board Component */}
        {cameraMode === "board" && (
          <MoodBoardView />
        )}

        {/* Right Side: Floating Zone Panel */}
        {selectedZone && cameraMode === "2d" && (
          <div className="floating-zone-panel" style={{ width: "280px", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", padding: "16px", backgroundColor: "#1E1E21", height: "100%" }}>
            <div className="floating-zone-panel-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px", marginBottom: "16px" }}>
              <span className="floating-zone-panel-title" style={{ fontSize: "11px", color: "#A1A1AA", textTransform: "uppercase", display: "block" }}>Zone Settings</span>
              <span className="floating-zone-tag" style={{ fontSize: "15px", fontWeight: "700", color: "#FFFFFF" }}>{template.zones[selectedZone]?.name}</span>
            </div>

            {/* A. Color Fill Settings */}
            <div className="canvas-form-group" style={{ marginBottom: "16px" }}>
              <label className="canvas-form-label" style={{ fontSize: "11px", color: "#A1A1AA", display: "block", marginBottom: "6px" }}>Pantone Color Code</label>
              <div className="pantone-input-container" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div className="pantone-color-preview" style={{ width: "36px", height: "36px", borderRadius: "6px", backgroundColor: zoneState?.color, position: "relative", cursor: "pointer", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <input
                    type="color"
                    className="pantone-color-picker-native"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    value={zoneState?.color}
                    onChange={(e) => {
                      updateZoneColor(selectedZone, e.target.value, "Custom")
                    }}
                  />
                </div>
                <input
                  type="text"
                  className="canvas-form-input"
                  style={{ flex: 1, backgroundColor: "#27272A", border: "1px solid rgba(255,255,255,0.08)", padding: "8px", borderRadius: "6px", color: "#FFF", fontSize: "13px", outline: "none" }}
                  placeholder="e.g. 18-1664"
                  value={zoneState?.pantone}
                  onChange={(e) => {
                    const code = e.target.value
                    const resolved = resolvePantone(code)
                    if (resolved) {
                      updateZoneColor(selectedZone, resolved.hex, code)
                    } else {
                      updateZoneColor(selectedZone, zoneState?.color || "#FFFFFF", code)
                    }
                  }}
                />
              </div>
              <span className="pantone-lookup-result" style={{ fontSize: "10px", color: "#71717A", display: "block", marginTop: "6px" }}>
                sRGB: {zoneState?.color} | Pantone: <strong>{zoneState?.colorName}</strong>
              </span>
            </div>

            {/* B. Logo Upload Settings */}
            {template.zones[selectedZone]?.acceptsLogo && (
              <div className="canvas-form-group" style={{ marginBottom: "16px" }}>
                <label className="canvas-form-label" style={{ fontSize: "11px", color: "#A1A1AA", display: "block", marginBottom: "6px" }}>Branding Logo</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                
                {zoneState?.logoUrl ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <img src={zoneState.logoUrl} style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", backgroundColor: "#3f3f46" }} alt="Logo" />
                      <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "10px", border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "#27272A", color: "#FFF" }} onClick={() => fileInputRef.current?.click()}>
                        Change
                      </button>
                      <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "10px", color: "#EF4444", borderColor: "#EF4444", background: "none" }} onClick={() => updateZoneLogo(selectedZone, null)}>
                        Remove
                      </button>
                    </div>

                    <div className="canvas-form-group">
                      <label className="canvas-form-label" style={{ fontSize: "10px", color: "#71717A" }}>Scale ({Math.round(zoneState.logoScale * 100)}%)</label>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        style={{ width: "100%" }}
                        value={zoneState.logoScale}
                        onChange={(e) => updateZoneLogoTransform(selectedZone, parseFloat(e.target.value), undefined, undefined)}
                      />
                    </div>
                    
                    <span className="logo-transform-tip" style={{ fontSize: "9px", color: "#71717A" }}>
                      Tip: Reposition is auto-aligned to center bounds.
                    </span>
                  </div>
                ) : (
                  <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)", backgroundColor: "#27272A", color: "#FFF", padding: "8px", borderRadius: "6px", fontSize: "12px" }} onClick={() => fileInputRef.current?.click()}>
                    Upload Logo
                  </button>
                )}
              </div>
            )}

            {/* C. Text Placement Settings */}
            {template.zones[selectedZone]?.acceptsText && (
              <div className="canvas-form-group">
                <label className="canvas-form-label" style={{ fontSize: "11px", color: "#A1A1AA", display: "block", marginBottom: "6px" }}>Text Overlay</label>
                <input
                  type="text"
                  className="canvas-form-input"
                  style={{ width: "100%", backgroundColor: "#27272A", border: "1px solid rgba(255,255,255,0.08)", padding: "8px", borderRadius: "6px", color: "#FFF", fontSize: "13px", outline: "none" }}
                  placeholder="e.g. SQUAD #10"
                  value={zoneState?.text}
                  onChange={(e) => updateZoneText(selectedZone, e.target.value, undefined, undefined, undefined, undefined)}
                />

                {zoneState?.text && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                    <div className="canvas-form-group">
                      <label className="canvas-form-label" style={{ fontSize: "10px", color: "#71717A" }}>Font Family</label>
                      <select
                        className="canvas-form-select"
                        style={{ width: "100%", backgroundColor: "#27272A", border: "1px solid rgba(255,255,255,0.08)", padding: "6px", color: "#FFFFFF", borderRadius: "4px", fontSize: "11px" }}
                        value={zoneState.textFont}
                        onChange={(e) => updateZoneText(selectedZone, undefined, e.target.value, undefined, undefined, undefined)}
                      >
                        <option value="Inter">Inter (Sans)</option>
                        <option value="Outfit">Outfit (Display)</option>
                        <option value="Arial">Arial (Standard)</option>
                        <option value="Courier New">Courier New (Mono)</option>
                      </select>
                    </div>

                    <div className="canvas-form-group">
                      <label className="canvas-form-label" style={{ fontSize: "10px", color: "#71717A" }}>Text Size ({zoneState.textSize} mm)</label>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        style={{ width: "100%" }}
                        value={zoneState.textSize}
                        onChange={(e) => updateZoneText(selectedZone, undefined, undefined, undefined, undefined, parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. TECHPACK PREVIEW DRAWER */}
      {techpackDrawerOpen && (
        <>
          <div className="side-drawer-overlay open" onClick={() => useCanvasStore.setState({ techpackDrawerOpen: false })}></div>
          <div className="side-drawer open" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "380px", backgroundColor: "#1E1E21", borderLeft: "2px solid #8B5CF6", zIndex: 1100, display: "flex", flexDirection: "column", padding: "20px" }}>
            <div className="techpack-preview-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <span className="spec-card-drawer-title" style={{ fontSize: "14px", fontWeight: "700" }}>Techpack Specifications</span>
              <button className="spec-card-drawer-close" style={{ background: "none", border: "none", color: "#A1A1AA", fontSize: "24px", cursor: "pointer" }} onClick={() => useCanvasStore.setState({ techpackDrawerOpen: false })}>&times;</button>
            </div>
            <div className="techpack-preview-body" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", padding: "16px 0" }}>
              <h1 style={{ fontSize: "18px", fontWeight: "800" }}>{techpackTitle}</h1>
              
              <h2 style={{ fontSize: "13px", color: "#A1A1AA", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px" }}>1. Colorways & Mappings</h2>
              <ul style={{ paddingLeft: "16px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.keys(tData.zones).map(zid => (
                  <li key={zid}>
                    Zone: <strong>{template.zones[zid]?.name}</strong> | Pantone: <strong>{tData.zones[zid].pantone} ({tData.zones[zid].colorName})</strong>
                  </li>
                ))}
              </ul>

              <h2 style={{ fontSize: "13px", color: "#A1A1AA", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "4px" }}>2. Node Graph Connections</h2>
              {nodes.filter(n => n.type === "spec").map(n => (
                <div key={n.id} style={{ marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px dashed rgba(255,255,255,0.06)", fontSize: "12px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: "700", color: n.data.completed ? "#0D9488" : "#EF4444" }}>
                    {n.data.name as string} Specs {n.data.completed ? "✓" : "(Incomplete)"}
                  </h3>
                  {Object.keys(n.data.fields as any).map(k => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "#71717A" }}>{k}:</span>
                      <span>{(n.data.fields as any)[k] || "Not Specified"}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 4. WHOP CHECKOUT SIMULATION DIALOG */}
      {showWhopCheckout && (
        <div className="whop-checkout-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div className="whop-checkout-card" style={{ width: "380px", backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", color: "#000000", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="whop-logo-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E4E4E7", paddingBottom: "10px" }}>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "#8B5CF6" }}>whop Checkout</span>
              <span style={{ fontSize: "11px", color: "#71717A" }}>Secure Escrow</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "14px" }}>proov Premium Subscription Pass</p>
              <p style={{ fontSize: "12px", color: "#71717A", marginTop: "4px" }}>Unlock the full perspective 3D mockup controls, interactive model orbiting, and export-ready techpack PDFs.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E4E4E7", paddingBottom: "10px" }}>
              <span style={{ fontSize: "12px" }}>USDC Escrow Premium Upgrade:</span>
              <strong style={{ fontSize: "14px" }}>$49.00 / month</strong>
            </div>
            <button className="whop-btn-pay" onClick={() => {
              setPremium(true)
              useCanvasStore.setState({ showWhopCheckout: false, cameraMode: "3d", show3DPrototype: true })
            }} style={{ width: "100%", backgroundColor: "#8B5CF6", color: "#FFF", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Pay $49.00 via Card
            </button>
            <button className="whop-btn-cancel" onClick={() => useCanvasStore.setState({ showWhopCheckout: false })} style={{ width: "100%", backgroundColor: "none", border: "1px solid #E4E4E7", color: "#71717A", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 6. MOOD BOARD VIEW SUBCOMPONENT
// ==========================================
const STICKY_COLORS = ['yellow', 'pink', 'green', 'blue', 'purple']

function MoodBoardView() {
  const {
    inspirationItems,
    selectedItemId,
    boardZoom,
    boardPan,
    addInspirationItem,
    updateInspirationItem,
    removeInspirationItem,
    setSelectedItemId,
    setBoardZoom,
    setBoardPan,
    bringItemToFront,
    techpackTitle
  } = useCanvasStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setIsDraggingFile] = useState(false)
  const panStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragRef = useRef<{ itemId: string; startX: number; startY: number; startItemX: number; startItemY: number } | null>(null)
  const resizeRef = useRef<{ itemId: string; startX: number; startY: number; startW: number; startH: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleDragLeave = () => {
    setIsDraggingFile(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)

    const files = Array.from(e.dataTransfer.files)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    files.forEach((file, idx) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            const dropX = (e.clientX - rect.left - boardPan.x) / boardZoom
            const dropY = (e.clientY - rect.top - boardPan.y) / boardZoom
            addInspirationItem({
              type: 'image',
              content: ev.target.result as string,
              label: file.name,
              x: dropX + idx * 30,
              y: dropY + idx * 20,
              width: 240,
              height: 180
            })
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('mood-board-transform-layer')) {
      setSelectedItemId(null)
      setIsPanning(true)
      panStartRef.current = { x: e.clientX - boardPan.x, y: e.clientY - boardPan.y }
    }
  }

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStartRef.current) {
      setBoardPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      })
    }
    
    if (dragRef.current) {
      const { itemId, startX, startY, startItemX, startItemY } = dragRef.current
      const dx = (e.clientX - startX) / boardZoom
      const dy = (e.clientY - startY) / boardZoom
      const snappedX = Math.round((startItemX + dx) / 12) * 12
      const snappedY = Math.round((startItemY + dy) / 12) * 12
      updateInspirationItem(itemId, { x: snappedX, y: snappedY })
    }
    
    if (resizeRef.current) {
      const { itemId, startX, startY, startW, startH } = resizeRef.current
      const dx = (e.clientX - startX) / boardZoom
      const dy = (e.clientY - startY) / boardZoom
      updateInspirationItem(itemId, {
        width: Math.max(80, startW + dx),
        height: Math.max(60, startH + dy)
      })
    }
  }

  const handleContainerMouseUp = () => {
    setIsPanning(false)
    panStartRef.current = null
    dragRef.current = null
    resizeRef.current = null
  }

  const startItemDrag = (e: React.MouseEvent, item: InspirationItem) => {
    e.stopPropagation()
    setSelectedItemId(item.id)
    bringItemToFront(item.id)
    dragRef.current = {
      itemId: item.id,
      startX: e.clientX,
      startY: e.clientY,
      startItemX: item.x,
      startItemY: item.y
    }
  }

  const startItemResize = (e: React.MouseEvent, item: InspirationItem) => {
    e.stopPropagation()
    resizeRef.current = {
      itemId: item.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: item.width || 200,
      startH: item.height || 150
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        addInspirationItem({
          type: 'image',
          content: ev.target.result as string,
          label: file.name,
          x: (-boardPan.x + 200) / boardZoom,
          y: (-boardPan.y + 200) / boardZoom,
          width: 260,
          height: 200
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddText = () => {
    addInspirationItem({
      type: 'text',
      content: 'Click to edit text...',
      x: (-boardPan.x + 250) / boardZoom,
      y: (-boardPan.y + 200) / boardZoom,
      width: 240,
      height: 80
    })
  }

  const handleAddSticky = () => {
    const color = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)]
    addInspirationItem({
      type: 'sticky',
      content: 'Sticky Note...',
      color: color,
      x: (-boardPan.x + 280) / boardZoom,
      y: (-boardPan.y + 180) / boardZoom,
      width: 180,
      height: 140
    })
  }

  const handleConvertToBrief = async () => {
    if (inspirationItems.length === 0) return
    
    if (!confirm("Convert this mood board into an immutable sourcing brief?")) return

    const descParts = ['## Mood Board Inspiration\n']
    inspirationItems.forEach(item => {
      if (item.type === 'text') {
        descParts.push(`- **Note:** ${item.content}`)
      } else if (item.type === 'sticky') {
        descParts.push(`- **Sticky:** ${item.content}`)
      } else if (item.type === 'image') {
        descParts.push(`- **Image:** ${item.label || 'Reference Image'}`)
      }
    })

    const newDemand = {
      id: 'demand_' + Date.now(),
      buyer_id: 'phantom_sports',
      buyer_name: 'Phantom Sports (Miami)',
      title: techpackTitle + ' — Mood Board Brief',
      description: descParts.join('\n'),
      category: 'sportswear',
      quantity: 100,
      fabric: '100% Polyester Mesh (180 GSM)',
      budget_range: '$15.00 / piece',
      budget_min: 15.00,
      turnaround_time: '21 days',
      status: 'open',
      techpack_url: 'mood_board_ref_' + Date.now() + '.pdf',
      created_at: new Date().toISOString(),
      canvas_locked: false,
      mood_board_item_count: inspirationItems.length
    }

    await proovDb.saveDemand(newDemand)
    await proovDb.logDebug('BOARD', `Mood board converted to brief: "${newDemand.title}" with ${inspirationItems.length} items.`)
    alert('Brief created from your mood board!')
    window.location.reload()
  }

  return (
    <div
      className={`mood-board-container ${isPanning ? 'grabbing' : ''}`}
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
      style={{ flex: 1, position: 'relative', overflow: 'hidden', height: "100%", cursor: isPanning ? "grabbing" : "default" }}
    >
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect} />

      <div
        className="mood-board-transform-layer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `translate(${boardPan.x}px, ${boardPan.y}px) scale(${boardZoom})`,
          transformOrigin: "0 0"
        }}
      >
        {inspirationItems.map(item => {
          const isSelected = selectedItemId === item.id

          if (item.type === 'image') {
            return (
              <div
                key={item.id}
                className={`board-item board-item-image ${isSelected ? 'selected' : ''}`}
                style={{
                  position: "absolute",
                  left: item.x + 'px',
                  top: item.y + 'px',
                  width: item.width + 'px',
                  height: item.height + 'px',
                  zIndex: item.zIndex || 0,
                  border: isSelected ? "2px solid #8B5CF6" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                }}
                onMouseDown={(e) => startItemDrag(e, item)}
              >
                <img src={item.content} alt={item.label || 'Inspiration'} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {isSelected && (
                  <button
                    style={{ position: "absolute", top: "-10px", right: "-10px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#EF4444", color: "#FFF", border: "none", cursor: "pointer", fontSize: "12px", lineHeight: "1" }}
                    onMouseDown={(e) => { e.stopPropagation(); removeInspirationItem(item.id) }}
                  >
                    &times;
                  </button>
                )}
                {isSelected && (
                  <div
                    style={{ position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px", cursor: "se-resize", backgroundColor: "#8B5CF6" }}
                    onMouseDown={(e) => startItemResize(e, item)}
                  />
                )}
              </div>
            )
          }

          if (item.type === 'text') {
            return (
              <div
                key={item.id}
                className={`board-item board-item-text ${isSelected ? 'selected' : ''}`}
                style={{
                  position: "absolute",
                  left: item.x + 'px',
                  top: item.y + 'px',
                  width: item.width + 'px',
                  minHeight: item.height + 'px',
                  zIndex: item.zIndex || 0,
                  backgroundColor: "#27272A",
                  padding: "10px",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #8B5CF6" : "1px solid rgba(255,255,255,0.1)",
                  color: "#FFF"
                }}
                onMouseDown={(e) => {
                  if ((e.target as HTMLElement).contentEditable === 'true') {
                    setSelectedItemId(item.id)
                    bringItemToFront(item.id)
                    return
                  }
                  startItemDrag(e, item)
                }}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateInspirationItem(item.id, { content: e.target.innerText })}
                  style={{ outline: "none", fontSize: "12px" }}
                >
                  {item.content}
                </div>
                {isSelected && (
                  <button
                    style={{ position: "absolute", top: "-10px", right: "-10px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#EF4444", color: "#FFF", border: "none", cursor: "pointer", fontSize: "12px" }}
                    onMouseDown={(e) => { e.stopPropagation(); removeInspirationItem(item.id) }}
                  >
                    &times;
                  </button>
                )}
              </div>
            )
          }

          if (item.type === 'sticky') {
            const colors: Record<string, string> = {
              yellow: "#FEF08A",
              pink: "#FBCFE8",
              green: "#A7F3D0",
              blue: "#BFDBFE",
              purple: "#E9D5FF"
            }
            const bg = colors[item.color || "yellow"]
            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  left: item.x + 'px',
                  top: item.y + 'px',
                  width: item.width + 'px',
                  minHeight: item.height + 'px',
                  zIndex: item.zIndex || 0,
                  backgroundColor: bg,
                  padding: "12px",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #8B5CF6" : "none",
                  color: "#000",
                  fontFamily: "var(--font-sans)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
                }}
                onMouseDown={(e) => {
                  if ((e.target as HTMLElement).contentEditable === 'true') {
                    setSelectedItemId(item.id)
                    bringItemToFront(item.id)
                    return
                  }
                  startItemDrag(e, item)
                }}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateInspirationItem(item.id, { content: e.target.innerText })}
                  style={{ outline: "none", fontSize: "13px", fontWeight: "500", minHeight: "80px" }}
                >
                  {item.content}
                </div>
                {isSelected && (
                  <button
                    style={{ position: "absolute", top: "-10px", right: "-10px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#EF4444", color: "#FFF", border: "none", cursor: "pointer", fontSize: "12px" }}
                    onMouseDown={(e) => { e.stopPropagation(); removeInspirationItem(item.id) }}
                  >
                    &times;
                  </button>
                )}
              </div>
            )
          }

          return null
        })}
      </div>

      {inspirationItems.length === 0 && (
        <div className="mood-board-empty" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "#A1A1AA", maxWidth: "400px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎨</div>
          <h3 style={{ fontSize: "18px", color: "#FFF", fontWeight: "700" }}>Start Your Inspiration Board</h3>
          <p style={{ fontSize: "12px", marginTop: "8px" }}>
            Drop reference images, add notes, and collect design inspiration. Your board feeds directly into manufacturing briefs.
          </p>
        </div>
      )}

      {/* Floating Mood Board Actions */}
      <div className="mood-board-toolbar" style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", backgroundColor: "#1E1E21", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100 }}>
        <button className="mood-board-toolbar-btn" onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", color: "#FFF", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          🖼 Image
        </button>
        <button className="mood-board-toolbar-btn" onClick={handleAddText} style={{ background: "none", border: "none", color: "#FFF", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          T Text
        </button>
        <button className="mood-board-toolbar-btn" onClick={handleAddSticky} style={{ background: "none", border: "none", color: "#FFF", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          📌 Sticky Note
        </button>
      </div>

      {/* Convert to Brief */}
      {inspirationItems.length > 0 && (
        <div style={{ position: "absolute", bottom: "20px", right: "20px", zIndex: 100 }}>
          <button className="btn-primary" onClick={handleConvertToBrief} style={{ backgroundColor: "#8B5CF6", border: "none", padding: "10px 16px", borderRadius: "8px", color: "#FFF", fontWeight: "700", cursor: "pointer" }}>
            Convert to Brief →
          </button>
        </div>
      )}
    </div>
  )
}
