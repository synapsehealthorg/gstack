"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Canvas, FabricText, FabricImage } from "fabric";
import { MockupCanvas } from "@/components/products/editor/canvas";
import { useBuilderStore } from "@/store/useBuilderStore";
import type { BuilderPerspective } from "@/store/useBuilderStore";
import { createProductDocument, ProductBuilderDocument, productRepository } from "@/lib/product-builder";
import { buildOrderProductPrefill } from "@/lib/product-order-handoff";
import { getProductTemplate, PRODUCT_CATEGORIES, PRODUCT_TEMPLATES } from "@/lib/product-templates";
import { jsPDF } from "jspdf";
import "./builder.css";

export default function ProductEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = params.templateId as string;
  const requestedProductId = searchParams.get("productId");
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  // Zustand Store States
  const {
    activeTab,
    setActiveTab,
    activePerspective,
    setActivePerspective,
    activeTool,
    setActiveTool,
    selectedProps,
    setSelectedProps,
    activeColorway,
    setActiveColorway,
    activePrintTech,
    setActivePrintTech,
    layers,
    setLayers,
    aiPromptText,
    setAiPromptText,
    colorways,
    addColorway,
    techpackSpecs,
    updateTechpackSpecs,
    product,
    saveState,
    saveMessage,
    hydrateProduct,
    updateProduct,
    zoom,
    setZoom,
    showGrid,
    setShowGrid,
    exploded,
    setExploded,
    sectionView,
    setSectionView,
  } = useBuilderStore();

  // Local UI States
  const [inspectorTab, setInspectorTab] = useState<'inspector' | 'specs' | 'layers'>('inspector');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [orderTurnaround, setOrderTurnaround] = useState(30);
  const [templateSearch, setTemplateSearch] = useState("");
  const [activeTemplateCategory, setActiveTemplateCategory] = useState("All");

  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [showDesignDropdown, setShowDesignDropdown] = useState(false);
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [showPerspectiveDropdown, setShowPerspectiveDropdown] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [historyMeta, setHistoryMeta] = useState({ undo: 0, redo: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentProductIdRef = useRef<string | null>(null);
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const applyingHistoryRef = useRef(false);

  const template = getProductTemplate(templateId);

  useEffect(() => {
    let cancelled = false;
    const loadProduct = async () => {
      if (requestedProductId && currentProductIdRef.current === requestedProductId && useBuilderStore.getState().product) return;
      setIsLoadingProduct(true);
      setLoadWarning(null);
      let document: ProductBuilderDocument | null = null;
      if (requestedProductId) {
        const result = await productRepository.get(requestedProductId);
        document = result.data;
        if (result.warning) setLoadWarning(result.warning);
      }
      if (!document) {
        document = createProductDocument(template.id);
        if (requestedProductId) setLoadWarning("That saved product was not found. A new draft was created from its template.");
      }
      if (cancelled) return;
      currentProductIdRef.current = document.id;
      hydrateProduct(document);
      setIsLoadingProduct(false);
    };
    void loadProduct();
    return () => { cancelled = true; };
  }, [hydrateProduct, requestedProductId, template.id]);

  // Toast Helper
  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const saveCurrentProduct = useCallback(async (announce = false) => {
    const state = useBuilderStore.getState();
    if (!state.product) return null;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    const canvasData = canvas?.toJSON() as Record<string, unknown> | undefined;
    const nextDocument: ProductBuilderDocument = {
      ...state.product,
      activePerspective: state.activePerspective,
      activeColorway: state.activeColorway,
      colorways: state.colorways,
      printTechnique: state.activePrintTech,
      specs: { ...state.techpackSpecs, printTechnique: state.activePrintTech },
      canvasByPerspective: canvasData ? { ...state.product.canvasByPerspective, [state.activePerspective]: canvasData } : state.product.canvasByPerspective,
    };
    state.setSaveState("saving", "Saving...");
    const result = await productRepository.save(nextDocument);
    useBuilderStore.setState({ product: result.data, saveState: result.warning ? "error" : "saved", saveMessage: result.warning || `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` });
    currentProductIdRef.current = result.data.id;
    if (!requestedProductId) router.replace(`/dashboard/products/editor/${templateId}?productId=${result.data.id}`, { scroll: false });
    if (announce) triggerToast(result.warning || "Product saved");
    return result.data;
  }, [canvas, requestedProductId, router, templateId, triggerToast]);

  const saveNowRef = useRef(saveCurrentProduct);
  useEffect(() => { saveNowRef.current = saveCurrentProduct; }, [saveCurrentProduct]);

  const queueAutosave = useCallback(() => {
    useBuilderStore.getState().setSaveState("dirty", "Unsaved changes");
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => { void saveNowRef.current(false); }, 900);
  }, []);

  const handleCanvasReady = useCallback((instance: Canvas) => {
    setCanvas(instance);
    const snapshot = JSON.stringify(instance.toJSON());
    historyRef.current = [snapshot];
    redoRef.current = [];
    setHistoryMeta({ undo: 0, redo: 0 });
  }, []);

  const handleCanvasChange = useCallback((data: Record<string, unknown>) => {
    const state = useBuilderStore.getState();
    if (!state.product) return;
    const serialized = JSON.stringify(data);
    if (!applyingHistoryRef.current && historyRef.current.at(-1) !== serialized) {
      historyRef.current.push(serialized);
      if (historyRef.current.length > 50) historyRef.current.shift();
      redoRef.current = [];
      setHistoryMeta({ undo: Math.max(0, historyRef.current.length - 1), redo: 0 });
    }
    state.updateProduct({ canvasByPerspective: { ...state.product.canvasByPerspective, [state.activePerspective]: data } });
    queueAutosave();
  }, [queueAutosave]);

  const restoreCanvasSnapshot = useCallback(async (serialized: string) => {
    if (!canvas) return;
    applyingHistoryRef.current = true;
    await canvas.loadFromJSON(JSON.parse(serialized));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    applyingHistoryRef.current = false;
    handleCanvasChange(canvas.toJSON());
  }, [canvas, handleCanvasChange]);

  const handleUndo = useCallback(async () => {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop();
    if (current) redoRef.current.push(current);
    const previous = historyRef.current.at(-1);
    if (previous) await restoreCanvasSnapshot(previous);
    setHistoryMeta({ undo: Math.max(0, historyRef.current.length - 1), redo: redoRef.current.length });
    triggerToast("Undid last change");
  }, [restoreCanvasSnapshot, triggerToast]);

  const handleRedo = useCallback(async () => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    await restoreCanvasSnapshot(next);
    setHistoryMeta({ undo: Math.max(0, historyRef.current.length - 1), redo: redoRef.current.length });
    triggerToast("Redid change");
  }, [restoreCanvasSnapshot, triggerToast]);

  useEffect(() => {
    if (!useBuilderStore.getState().product || isLoadingProduct) return;
    useBuilderStore.getState().updateProduct({
      activeColorway,
      colorways,
      printTechnique: activePrintTech,
      specs: { ...techpackSpecs, printTechnique: activePrintTech },
    });
    queueAutosave();
  }, [activeColorway, activePrintTech, colorways, isLoadingProduct, queueAutosave, techpackSpecs]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (useBuilderStore.getState().saveState !== "dirty") return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, []);

  // Add Text Element to Canvas
  const handleAddText = () => {
    if (!canvas) return;
    const text = new FabricText("Double click to edit", {
      left: 30,
      top: 100,
      fontSize: 16,
      fill: "#ffffff",
      fontFamily: "Inter",
      id: "text_" + Date.now(),
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    handleCanvasChange(canvas.toJSON());
    triggerToast("Text layer added");
  };

  // Trigger Local Image Selection
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle Local Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    let url = URL.createObjectURL(file);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const upload = await response.json() as { url: string };
      url = upload.url;
    } catch (error) {
      setLoadWarning(`Graphic added for this session, but upload failed: ${error instanceof Error ? error.message : "Unknown upload error"}`);
    }

    FabricImage.fromURL(url, {}, { crossOrigin: "anonymous" }).then((img) => {
      img.scaleToWidth(100);
      img.left = 60;
      img.top = 80;
      img.id = "img_" + Date.now();
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      triggerToast("Image layer added");
    });
    e.target.value = "";
  };

  // Sync canvas object properties to Zustand and Canvas on user edit
  const handlePropertyChange = (key: string, value: string | number) => {
    if (!canvas || !selectedProps) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (key === "left") activeObject.set({ left: Number(value) });
    else if (key === "top") activeObject.set({ top: Number(value) });
    else if (key === "angle") activeObject.set({ angle: Number(value) });
    else if (key === "opacity") activeObject.set({ opacity: Number(value) / 100 });
    else if (key === "width") {
      const scaleX = Number(value) / (activeObject.width || 1);
      activeObject.set(lockAspectRatio ? { scaleX, scaleY: scaleX } : { scaleX });
    } else if (key === "height") {
      const scaleY = Number(value) / (activeObject.height || 1);
      activeObject.set(lockAspectRatio ? { scaleY, scaleX: scaleY } : { scaleY });
    } else if (key === "text") {
      if (activeObject instanceof FabricText) activeObject.set({ text: String(value) });
    } else if (key === "fontFamily") {
      if (activeObject instanceof FabricText) activeObject.set({ fontFamily: String(value) });
    } else if (key === "fontSize") {
      if (activeObject instanceof FabricText) activeObject.set({ fontSize: Number(value) });
    } else if (key === "fill") {
      activeObject.set({ fill: String(value) });
    } else if (key === "blendingMode") {
      activeObject.set({ globalCompositeOperation: String(value) as GlobalCompositeOperation });
    }

    canvas.renderAll();
    handleCanvasChange(canvas.toJSON());

    // Update selectedProps in Zustand
    setSelectedProps({
      ...selectedProps,
      [key]: value,
    });
  };

  // Align Objects
  const handleAlign = (alignment: string) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const canvasWidth = canvas.width || 220;
    const canvasHeight = canvas.height || 260;
    const objWidth = activeObject.width * (activeObject.scaleX || 1);
    const objHeight = activeObject.height * (activeObject.scaleY || 1);

    if (alignment === "left") activeObject.set({ left: 0 });
    else if (alignment === "center") activeObject.set({ left: (canvasWidth - objWidth) / 2 });
    else if (alignment === "right") activeObject.set({ left: canvasWidth - objWidth });
    else if (alignment === "top") activeObject.set({ top: 0 });
    else if (alignment === "middle") activeObject.set({ top: (canvasHeight - objHeight) / 2 });
    else if (alignment === "bottom") activeObject.set({ top: canvasHeight - objHeight });

    canvas.renderAll();
    handleCanvasChange(canvas.toJSON());
    
    // Sync to store
    setSelectedProps({
      ...selectedProps!,
      left: Math.round(activeObject.left || 0),
      top: Math.round(activeObject.top || 0),
    });
  };

  // Select Layer from Panel
  const handleSelectLayer = (id: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((object) => object.id === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  // Toggle Layer Visibility
  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    const obj = canvas.getObjects().find((object) => object.id === id);
    if (obj) {
      obj.set({ visible: !obj.visible });
      canvas.renderAll();
      setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
      handleCanvasChange(canvas.toJSON());
    }
  };

  // Toggle Layer Lock
  const handleToggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvas) return;
    const obj = canvas.getObjects().find((object) => object.id === id);
    if (obj) {
      const isLocked = !obj.lockMovementX;
      obj.set({
        lockMovementX: isLocked,
        lockMovementY: isLocked,
        lockScalingX: isLocked,
        lockScalingY: isLocked,
        lockRotation: isLocked,
      });
      canvas.renderAll();
      setLayers(layers.map(l => l.id === id ? { ...l, locked: isLocked } : l));
      handleCanvasChange(canvas.toJSON());
    }
  };

  // Delete Active Object
  const handleDeleteActive = useCallback(() => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.id !== "base-layout") {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      triggerToast("Layer deleted");
    }
  }, [canvas, triggerToast]);

  const handleDuplicateActive = useCallback(async () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.id === "base-layout") return;
    const clone = await active.clone();
    clone.set({ left: (active.left || 0) + 12, top: (active.top || 0) + 12, id: `${active.id || "layer"}_copy_${Date.now()}` });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
    triggerToast("Layer duplicated");
  }, [canvas, triggerToast]);

  // Layer ordering
  const handleBringForward = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      canvas.renderAll();
      handleCanvasChange(canvas.toJSON());
      triggerToast("Brought layer forward");
    }
  };

  const handleSendBackward = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectBackwards(active);
      // Ensure base layout stays at the very back
      const baseLayout = canvas.getObjects().find(o => o.id === "base-layout");
      if (baseLayout) {
        canvas.sendObjectToBack(baseLayout);
      }
      canvas.renderAll();
      handleCanvasChange(canvas.toJSON());
      triggerToast("Sent layer backward");
    }
  };

  // Colorway Select
  const handleColorwaySelect = (swatch: { hex: string; name: string }) => {
    setActiveColorway(swatch);
    triggerToast(`Colorway set to ${swatch.name}`);
  };

  // Add Custom Color
  const handleCustomColorAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const newColor = { hex, name: `Pantone Custom (#${hex.substring(1).toUpperCase()})` };
    addColorway(newColor);
    setActiveColorway(newColor);
    triggerToast("Custom color swatch added");
  };

  const handlePerspectiveChange = (perspective: BuilderPerspective) => {
    const state = useBuilderStore.getState();
    if (!state.product) return;
    const currentData = canvas?.toJSON() as Record<string, unknown> | undefined;
    state.updateProduct({
      activePerspective: perspective,
      canvasByPerspective: currentData ? { ...state.product.canvasByPerspective, [state.activePerspective]: currentData } : state.product.canvasByPerspective,
    });
    setActivePerspective(perspective);
    setCanvas(null);
    historyRef.current = [];
    redoRef.current = [];
    queueAutosave();
  };

  const handleLayerRename = (id: string) => {
    const layer = layers.find((item) => item.id === id);
    const object = canvas?.getObjects().find((item) => item.id === id);
    if (!layer || !object || id === "base-layout") return;
    const name = window.prompt("Layer name", layer.name)?.trim();
    if (!name) return;
    object.name = name;
    setLayers(layers.map((item) => item.id === id ? { ...item, name } : item));
    if (canvas) handleCanvasChange(canvas.toJSON());
  };

  // Save Draft
  const handleSaveDraft = () => { void saveCurrentProduct(true); };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "s") { event.preventDefault(); void saveCurrentProduct(true); }
      else if (command && event.key.toLowerCase() === "z" && event.shiftKey) { event.preventDefault(); void handleRedo(); }
      else if (command && event.key.toLowerCase() === "z") { event.preventDefault(); void handleUndo(); }
      else if (command && event.key.toLowerCase() === "y") { event.preventDefault(); void handleRedo(); }
      else if (command && event.key.toLowerCase() === "d") { event.preventDefault(); void handleDuplicateActive(); }
      else if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); handleDeleteActive(); }
      else if (event.key === "+" || event.key === "=") setZoom(zoom + 0.1);
      else if (event.key === "-") setZoom(zoom - 0.1);
      else if (event.key === "0") setZoom(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDeleteActive, handleDuplicateActive, handleRedo, handleUndo, saveCurrentProduct, setZoom, zoom]);

  // Export Canvas Image
  const handleExportImage = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
    const link = document.createElement("a");
    link.download = `${template.name}-export.png`;
    link.href = dataUrl;
    link.click();
    triggerToast("Image exported successfully");
  };

  // Generate PDF
  const handleGeneratePDF = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataUrl = canvas.toDataURL({ format: "jpeg", quality: 0.85, multiplier: 1 });

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark layout header block
    doc.setFillColor(22, 22, 20); // #161614
    doc.rect(0, 0, 210, 38, "F");

    // Title text
    doc.setTextColor(240, 237, 232); // #F0EDE8
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("PROOV MANUFACTURING TECHPACK", 15, 20);

    // Metadata
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.text(`PRODUCT TEMPLATE: ${template.name}`, 15, 28);
    doc.text(`EXPORT DATE: ${new Date().toLocaleDateString()}`, 145, 28);

    doc.setDrawColor(42, 42, 40); // #2A2A28
    doc.line(15, 42, 195, 42);

    // Frame mockup image
    doc.addImage(dataUrl, "JPEG", 15, 48, 85, 100);

    // Specs title
    doc.setTextColor(22, 22, 20);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("MANUFACTURING SPECIFICATIONS", 108, 55);

    // Border spec fields
    let y = 66;
    const addLine = (label: string, val: string) => {
      doc.setFont("Helvetica", "bold");
      doc.text(`${label}:`, 108, y);
      doc.setFont("Helvetica", "normal");
      doc.text(val, 148, y);
      y += 8;
    };

    addLine("Fabric Composition", techpackSpecs.fabricMaterial || "100% Polyester Mesh");
    addLine("Fabric Weight", `${techpackSpecs.gsm || "180"} GSM`);
    addLine("Print Technology", activePrintTech || "Sublimation");
    addLine("Base Colorway", activeColorway.name);
    addLine("Thread/Accent Color", techpackSpecs.threadColor || "#4B8FD4");
    addLine("Sizing Run", "XS to XXL (Athletic Standard Fit)");

    doc.rect(105, 48, 90, 100);
    doc.rect(13, 48, 89, 100);

    // Dynamic Layers Section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DESIGN LAYERS & ASSETS", 15, 160);

    let layerY = 170;
    layers.forEach((l, index) => {
      if (l.id === "base-layout") return;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Layer ${index}: [${l.type.toUpperCase()}] ${l.name}`, 18, layerY);
      layerY += 6;
    });

    // Escrow info & CTA Footer
    doc.setFontSize(8);
    doc.setTextColor(160, 156, 150);
    doc.text("This document constitutes a binding technical specification on the proov marketplace platform.", 15, 275);
    doc.text("proov escrow system guarantees milestone release upon validation against these guidelines.", 15, 280);

    doc.save(`${(product?.name || template.name).replace(/\s+/g, "-").toLowerCase()}-techpack.pdf`);
    triggerToast("Techpack PDF generated successfully!");
  };

  const handleMoveToOrder = async () => {
    useBuilderStore.getState().updateProduct({ status: "ready" });
    const saved = await saveCurrentProduct(false);
    if (!saved) return;
    window.sessionStorage.setItem("proov_order_product_prefill", JSON.stringify(
      buildOrderProductPrefill(saved, orderQuantity, getProductTemplate(saved.templateId).blank || false),
    ));
    setShowOrderModal(false);
    router.push(`/orders/new?productId=${saved.id}&tat=${orderTurnaround}`);
  };

  const handleAiRegen = () => {
    setIsAiGenerating(true);
    window.setTimeout(() => {
      setIsAiGenerating(false);
      setLoadWarning("AI mockup generation is not configured in this environment. No visual or production field was changed.");
      triggerToast("AI service not configured");
    }, 450);
  };

  // Templates list filter
  const filteredTemplates = PRODUCT_TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = activeTemplateCategory === "All" || t.category === activeTemplateCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoadingProduct || !product) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0C] text-[#F0EDE8]"><div className="flex flex-col items-center gap-3"><i className="ti ti-loader-2 animate-spin text-2xl text-[#E8E0CF]"></i><span className="font-mono text-xs text-[#A09C96]">Loading product workspace...</span></div></div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D0C] select-none text-[#F0EDE8]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1A] border border-[#2A2A28] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="ti ti-info-circle text-[#E8E0CF]"></i>
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}

      {loadWarning && (
        <div className="fixed bottom-4 left-1/2 z-[70] flex max-w-xl -translate-x-1/2 items-start gap-3 rounded-lg border border-amber-500/30 bg-[#211B10] px-4 py-3 font-mono text-[10px] text-amber-200 shadow-2xl">
          <i className="ti ti-alert-triangle mt-0.5"></i><span className="flex-1">{loadWarning}</span><button onClick={() => setLoadWarning(null)}><i className="ti ti-x"></i></button>
        </div>
      )}

      {/* Hidden File Upload Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <input
        ref={colorPickerRef}
        type="color"
        onChange={handleCustomColorAdd}
        className="hidden"
      />

      {/* Modal: Move to Order */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[420px] bg-[#161614] border border-[#2A2A28] rounded-xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold font-mono text-[#E8E0CF] uppercase tracking-wider">Move to Order</h3>
              <i className="ti ti-x text-[#A09C96] cursor-pointer hover:text-white" onClick={() => setShowOrderModal(false)}></i>
            </div>
            
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between border-b border-[#2A2A28] pb-2">
                <span className="text-[#A09C96]">Product</span>
                <span>{product.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#2A2A28] pb-2">
                <span className="text-[#A09C96]">Colorway</span>
                <span>{activeColorway.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#2A2A28] pb-2">
                <span className="text-[#A09C96]">Technology</span>
                <span>{activePrintTech}</span>
              </div>
              <div className="flex justify-between border-b border-[#2A2A28] pb-2">
                <span className="text-[#A09C96]">Material</span>
                <span>{techpackSpecs.fabricMaterial} ({techpackSpecs.gsm} GSM)</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Target Quantity</span>
                  <span className="text-[#E8E0CF] font-mono">{orderQuantity} units</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Target Delivery</span>
                  <span className="text-[#E8E0CF] font-mono">{orderTurnaround} days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="180"
                  value={orderTurnaround}
                  onChange={(e) => setOrderTurnaround(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button className="btn btn-ghost" onClick={() => setShowOrderModal(false)}>Cancel</button>
              <button
                className="btn btn-warm"
                onClick={() => void handleMoveToOrder()}
              >
                Save & Continue to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevisionPanel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={() => setShowRevisionPanel(false)}>
          <div className="w-full max-w-md rounded-xl border border-[#2A2A28] bg-[#161614] p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5C5A56]">Current session</p><h3 className="mt-1 text-sm font-semibold">Revision history</h3></div>
              <button onClick={() => setShowRevisionPanel(false)} className="icon-btn"><i className="ti ti-x"></i></button>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-[#2A2A28] bg-[#1C1C1A] p-3"><span className="font-mono text-[10px] text-[#A09C96]">Undo steps</span><strong className="text-xs">{historyMeta.undo}</strong></div>
              <div className="flex items-center justify-between rounded-lg border border-[#2A2A28] bg-[#1C1C1A] p-3"><span className="font-mono text-[10px] text-[#A09C96]">Last persisted</span><strong className="text-xs">{new Date(product.updatedAt).toLocaleString()}</strong></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2"><button className="btn btn-ghost justify-center" onClick={() => void handleUndo()} disabled={historyMeta.undo === 0}><i className="ti ti-arrow-back-up"></i>Undo</button><button className="btn btn-ghost justify-center" onClick={() => void handleRedo()} disabled={historyMeta.redo === 0}><i className="ti ti-arrow-forward-up"></i>Redo</button></div>
          </div>
        </div>
      )}

      {/* Main Grid App Wrapper */}
      <div className="app">
        {/* TOP NAV */}
        <nav className="top-nav">
          <div className="nav-logo" onClick={() => router.push("/dashboard")}>p</div>
          <div className="nav-breadcrumb">
            <span className="cursor-pointer hover:text-white" onClick={() => router.push("/dashboard")}>Products</span>
            <span className="sep">/</span>
            <input
              aria-label="Product name"
              value={product.name}
              onChange={(event) => { updateProduct({ name: event.target.value }); queueAutosave(); }}
              onBlur={() => { if (!product.name.trim()) updateProduct({ name: "Untitled Product" }); }}
              className="product-name-input"
            />
          </div>
          <div className="nav-divider"></div>
          <div className={`save-status ${saveState}`}>
            <span className="save-status-dot"></span>
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? (saveMessage || "Saved") : saveState === "error" ? "Saved locally" : saveState === "dirty" ? "Unsaved changes" : "Ready"}
          </div>
          <div className="nav-spacer"></div>
          
          <div className="view-tabs">
            {(["layers", "mockup", "measurements", "design"] as const).map((tab) => (
              <div
                key={tab}
                className={`view-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "layers") setInspectorTab("layers");
                  if (tab === "measurements") { setInspectorTab("specs"); setActiveTool("measure"); }
                  if (tab === "design") { setInspectorTab("inspector"); setActiveTool("select"); }
                  if (tab === "mockup") handlePerspectiveChange("mockup");
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          <div className="nav-spacer"></div>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={handleSaveDraft}>
              <i className="ti ti-bookmark text-xs"></i>
              Draft
            </button>
            <button className="btn btn-ghost" onClick={handleGeneratePDF}>
              <i className="ti ti-file-type-pdf text-xs"></i>
              View PDF
            </button>
            <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
              <i className="ti ti-arrow-right text-xs"></i>
              Move to Order
            </button>
            <button className="btn btn-warm" onClick={handleExportImage}>
              <i className="ti ti-upload text-xs"></i>
              Export
            </button>
            <div className="nav-divider"></div>
            <div className="icon-btn" title="Copy product link" onClick={() => { void navigator.clipboard.writeText(window.location.href); triggerToast("Product link copied"); }}>
              <i className="ti ti-share text-[14px]"></i>
            </div>
            <div className="icon-btn" title="Save status" onClick={() => triggerToast(saveMessage || (saveState === "saved" ? "Product is saved" : "Changes are pending"))}>
              <i className="ti ti-bell text-[14px]"></i>
              <div className="notif-dot"></div>
            </div>
            <div className="icon-btn" title="Open product specs" onClick={() => setInspectorTab("specs")}>
              <i className="ti ti-settings text-[14px]"></i>
            </div>
            <div className="nav-avatar"></div>
          </div>
        </nav>

        {/* TOOLBAR */}
        <div className="toolbar" style={{ position: "relative", overflow: "visible" }}>
          {/* File dropdown group */}
          <div className="relative">
            <div
              className={`tool-btn ${showFileDropdown ? "bg-white/10 text-white" : ""}`}
              onClick={() => {
                setShowFileDropdown(!showFileDropdown);
                setShowDesignDropdown(false);
                setShowInsertDropdown(false);
                setShowPerspectiveDropdown(false);
              }}
            >
              <i className="ti ti-file"></i> File <i className="ti ti-chevron-down text-[10px] opacity-70"></i>
            </div>
            {showFileDropdown && (
              <div className="absolute top-[32px] left-0 bg-[#161614]/95 backdrop-blur-md border border-[#2A2A28] rounded-md shadow-2xl p-1.5 flex flex-col gap-1 z-50 min-w-[140px]">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono"
                  onClick={() => {
                    setShowFileDropdown(false);
                    if (useBuilderStore.getState().saveState === "dirty" && !window.confirm("Leave before the pending autosave finishes?")) return;
                    router.push("/dashboard");
                  }}
                >
                  <i className="ti ti-layout-grid"></i> Dashboard
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono"
                  onClick={() => {
                    handleSaveDraft();
                    setShowFileDropdown(false);
                  }}
                >
                  <i className="ti ti-bookmark"></i> Save Draft
                </div>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono disabled:opacity-40"
                  onClick={() => { void handleDuplicateActive(); setShowFileDropdown(false); }}
                  disabled={!selectedProps}
                >
                  <i className="ti ti-copy"></i> Duplicate Layer
                </button>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono text-red-500 hover:text-red-400"
                  onClick={() => {
                    setShowFileDropdown(false);
                    if (useBuilderStore.getState().saveState === "dirty" && !window.confirm("Leave before the pending autosave finishes?")) return;
                    router.push("/dashboard");
                  }}
                >
                  <i className="ti ti-x"></i> Exit Editor
                </div>
              </div>
            )}
          </div>

          {/* Design dropdown group */}
          <div className="relative">
            <div
              className={`tool-btn ${showDesignDropdown ? "bg-white/10 text-white" : ""}`}
              onClick={() => {
                setShowDesignDropdown(!showDesignDropdown);
                setShowFileDropdown(false);
                setShowInsertDropdown(false);
                setShowPerspectiveDropdown(false);
              }}
            >
              <i className="ti ti-pencil"></i> Design <i className="ti ti-chevron-down text-[10px] opacity-70"></i>
            </div>
            {showDesignDropdown && (
              <div className="absolute top-[32px] left-0 bg-[#161614]/95 backdrop-blur-md border border-[#2A2A28] rounded-md shadow-2xl p-1.5 flex flex-col gap-1 z-50 min-w-[150px]">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono"
                  onClick={() => {
                    handleAddText();
                    setShowDesignDropdown(false);
                  }}
                >
                  <i className="ti ti-typography"></i> Insert Text
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono"
                  onClick={() => {
                    triggerImageUpload();
                    setShowDesignDropdown(false);
                  }}
                >
                  <i className="ti ti-photo"></i> Insert Graphic
                </div>
                <div className="h-px bg-[#2A2A28] my-1"></div>
                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono disabled:opacity-40"
                  onClick={() => {
                    handleBringForward();
                    setShowDesignDropdown(false);
                  }}
                  disabled={!selectedProps}
                >
                  <i className="ti ti-arrow-up"></i> Bring Forward
                </button>
                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono disabled:opacity-40"
                  onClick={() => {
                    handleSendBackward();
                    setShowDesignDropdown(false);
                  }}
                  disabled={!selectedProps}
                >
                  <i className="ti ti-arrow-down"></i> Send Backward
                </button>
                <div className="h-px bg-[#2A2A28] my-1"></div>
                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono text-red-500 hover:text-red-400 disabled:opacity-40"
                  onClick={() => {
                    handleDeleteActive();
                    setShowDesignDropdown(false);
                  }}
                  disabled={!selectedProps}
                >
                  <i className="ti ti-trash"></i> Delete Layer
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-[#2A2A28] mx-2"></div>

          {/* Insert dropdown group */}
          <div className="relative">
            <div
              className={`tool-btn ${showInsertDropdown ? "bg-white/10 text-white" : ""}`}
              onClick={() => {
                setShowInsertDropdown(!showInsertDropdown);
                setShowFileDropdown(false);
                setShowDesignDropdown(false);
                setShowPerspectiveDropdown(false);
              }}
            >
              <i className="ti ti-circle-plus"></i> Insert
            </div>
            {showInsertDropdown && (
              <div className="absolute top-[32px] left-0 bg-[#161614]/95 backdrop-blur-md border border-[#2A2A28] rounded-md shadow-2xl p-1.5 flex flex-col gap-1 z-50 min-w-[130px]">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono"
                  onClick={() => {
                    handleAddText();
                    setShowInsertDropdown(false);
                  }}
                >
                  <i className="ti ti-typography"></i> Add Text
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono"
                  onClick={() => {
                    triggerImageUpload();
                    setShowInsertDropdown(false);
                  }}
                >
                  <i className="ti ti-photo"></i> Add Graphic
                </div>
              </div>
            )}
          </div>

          {/* Select Tool */}
          <div
            className={`tool-btn ${activeTool === "select" ? "active" : ""}`}
            onClick={() => {
              setActiveTool("select");
              setShowFileDropdown(false);
              setShowDesignDropdown(false);
              setShowInsertDropdown(false);
              setShowPerspectiveDropdown(false);
            }}
          >
            <i className="ti ti-pointer"></i> Select
          </div>

          <div className={`tool-btn ${activeTool === "pan" ? "active" : ""}`} onClick={() => setActiveTool("pan")} title="Pan canvas (Alt-drag)">
            <i className="ti ti-hand-move"></i> Pan
          </div>

          {/* Measure Tool */}
          <div
            className={`tool-btn ${activeTool === "measure" ? "active" : ""}`}
            onClick={() => {
              setActiveTool("measure");
              setShowFileDropdown(false);
              setShowDesignDropdown(false);
              setShowInsertDropdown(false);
              setShowPerspectiveDropdown(false);
            }}
          >
            <i className="ti ti-ruler-measure"></i> Measure
          </div>

          {/* Explode */}
          <div className={`tool-btn ${exploded ? "active" : ""}`} onClick={() => { setExploded(!exploded); setActiveTool("explode"); }}>
            <i className="ti ti-bomb"></i> Explode
          </div>

          {/* Section */}
          <div className={`tool-btn ${sectionView ? "active" : ""}`} onClick={() => { setSectionView(!sectionView); setActiveTool("section"); }}>
            <i className="ti ti-scissors"></i> Section
          </div>

          {/* View */}
          <div className={`tool-btn ${showGrid ? "active" : ""}`} onClick={() => setShowGrid(!showGrid)}>
            <i className="ti ti-grid-dots"></i> Grid
          </div>

          {/* Perspective dropdown group */}
          <div className="relative">
            <div
              className={`tool-btn ${showPerspectiveDropdown ? "bg-white/10 text-white" : ""}`}
              onClick={() => {
                setShowPerspectiveDropdown(!showPerspectiveDropdown);
                setShowFileDropdown(false);
                setShowDesignDropdown(false);
                setShowInsertDropdown(false);
              }}
            >
              <i className="ti ti-cube"></i> Perspective <i className="ti ti-chevron-down text-[10px] opacity-70"></i>
            </div>
            {showPerspectiveDropdown && (
              <div className="absolute top-[32px] left-0 bg-[#161614]/95 backdrop-blur-md border border-[#2A2A28] rounded-md shadow-2xl p-1.5 flex flex-col gap-1 z-50 min-w-[130px]">
                {(["front", "mockup", "back", "detail"] as const).map((view) => (
                  <div
                    key={view}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/10 text-xs cursor-pointer font-mono ${
                      activePerspective === view ? "text-[#E8E0CF] font-bold bg-white/5" : ""
                    }`}
                    onClick={() => {
                      handlePerspectiveChange(view);
                      setShowPerspectiveDropdown(false);
                      triggerToast(`Perspective changed to ${view}`);
                    }}
                  >
                    <i className="ti ti-point"></i> {view.charAt(0).toUpperCase() + view.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-[#2A2A28] mx-2"></div>

          {/* VCS controls */}
          <div className="tool-btn" onClick={() => void handleUndo()} title="Undo (Cmd/Ctrl+Z)">
            <i className="ti ti-arrow-back-up"></i>
          </div>
          <div className="tool-btn" onClick={() => void handleRedo()} title="Redo (Cmd/Ctrl+Shift+Z)">
            <i className="ti ti-arrow-forward-up"></i>
          </div>
          <div className="tool-btn text-[10px]" onClick={() => void saveCurrentProduct(true)}>
            Check in
          </div>
          <div className="tool-btn text-[10px]" onClick={() => { setActiveTool("select"); triggerToast("Workspace ready for editing"); }}>
            Check Out
          </div>
          <div className="tool-btn text-[10px]" onClick={() => setShowRevisionPanel(true)}>
            <i className="ti ti-history"></i> Revision
          </div>

          <div className="toolbar-spacer"></div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 pr-2.5">
            <button className="toolbar-btn-blue" onClick={() => setShowOrderModal(true)}>
              Move to Order
            </button>
            <div className="tool-btn" onClick={handleGeneratePDF}>
              <i className="ti ti-cube"></i> View PDF
            </div>
            <div className="tool-btn" onClick={handleExportImage}>
              Export
            </div>
          </div>
        </div>

        {/* LEFT ICON SIDEBAR */}
        <div className="sidebar-icons">
          <div className="side-icon active">
            <i className="ti ti-layout-grid"></i>
            <span>Templates</span>
          </div>
          <div className="side-icon" onClick={handleAddText}>
            <i className="ti ti-typography"></i>
            <span>Text</span>
          </div>
          <div className="side-icon" onClick={triggerImageUpload}>
            <i className="ti ti-shapes"></i>
            <span>Logo</span>
          </div>
          <div className="side-spacer"></div>
          <div className="side-icon" onClick={async () => { await saveCurrentProduct(false); router.push("/dashboard"); }}>
            <i className="ti ti-arrow-back-up"></i>
            <span>Dashboard</span>
          </div>
        </div>

        {/* LEFT PANEL — TEMPLATES */}
        <div className="left-panel">
          <div className="panel-header">
            <span className="panel-title">Templates</span>
          </div>
          <div className="search-bar">
            <i className="ti ti-search"></i>
            <input
              type="text"
              placeholder="Search templates"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
            />
          </div>
          <div className="filter-chips">
            {PRODUCT_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className={`chip ${activeTemplateCategory === cat ? "active" : ""}`}
                onClick={() => setActiveTemplateCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>
          <div className="panel-scroll">
            <div className="template-section">
              <div className="section-header">
                <span className="section-label">Garment Models</span>
              </div>
              <div className="flex flex-col gap-2.5 px-1">
                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={async () => { await saveCurrentProduct(false); router.push(`/dashboard/products/editor/${t.id}`); }}
                    className={`flex gap-3 items-center p-2 rounded-lg border cursor-pointer transition-all ${
                      templateId === t.id
                        ? "border-[#E8E0CF] bg-[#1C1C1A]"
                        : "border-[#2A2A28] bg-transparent hover:border-[#333330]"
                    }`}
                  >
                    <div className="w-12 h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={t.imageUrl} alt={t.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{t.name}</span>
                      <span className="text-[10px] text-[#A09C96]">{t.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTRAL CANVAS */}
        <div className="canvas-area">
          <div className="canvas-ruler-h">
            <div className="ruler-mark" style={{'left': '60px'}}><span>100</span></div>
            <div className="ruler-mark" style={{'left': '140px'}}><span>200</span></div>
            <div className="ruler-mark" style={{'left': '220px'}}><span>300</span></div>
            <div className="ruler-mark" style={{'left': '300px'}}><span>400</span></div>
            <div className="ruler-mark" style={{'left': '380px'}}><span>500</span></div>
          </div>
          <div className="canvas-ruler-v"></div>

          <div className="canvas-product-wrap">
            <div className="canvas-view-switcher">
              {(["front", "mockup", "back", "detail"] as const).map((view) => (
                <div
                  key={view}
                  className={`cvs-tab ${activePerspective === view ? "active" : ""}`}
                  onClick={() => {
                    handlePerspectiveChange(view);
                    triggerToast(`Switched perspective to ${view.toUpperCase()}`);
                  }}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </div>
              ))}
            </div>

            <div className={`product-frame ${exploded ? "is-exploded" : ""} ${sectionView ? "is-section" : ""}`} style={{ position: "relative" }}>
              <div className="selection-border"></div>
              {/* Handles */}
              <div className="handle tl"></div>
              <div className="handle tr"></div>
              <div className="handle bl"></div>
              <div className="handle br"></div>

              {/* Garment Mockup Wrapper */}
              <div className="jersey-mockup">
                <MockupCanvas
                  key={`${product.id}-${activePerspective}`}
                  template={template}
                  onCanvasReady={handleCanvasReady}
                  colorwayColor={activeColorway.hex}
                  initialData={product.canvasByPerspective[activePerspective]}
                  activeTool={activeTool}
                  zoom={zoom}
                  showGrid={showGrid}
                  onCanvasChange={handleCanvasChange}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Measurement lines */}
              {activeTab === 'measurements' && (
                <>
                  <div style={{'position': 'absolute', 'top': '68px', 'left': '-62px', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'pointerEvents': 'none'}}>
                    <div className="mc-label">{String(techpackSpecs.measurements[0]?.point || "Chest")} {String(techpackSpecs.measurements[0]?.M || 52)}cm</div>
                    <div className="mc-line" style={{'width': '24px'}}></div>
                  </div>
                  <div style={{'position': 'absolute', 'right': '-58px', 'top': '130px', 'display': 'flex', 'alignItems': 'center', 'gap': '4px', 'pointerEvents': 'none'}}>
                    <div className="mc-line" style={{'width': '20px'}}></div>
                    <div className="mc-label">{String(techpackSpecs.measurements[1]?.point || "Length")} {String(techpackSpecs.measurements[1]?.M || 74)}cm</div>
                  </div>
                </>
              )}
            </div>
            <div className="canvas-zoom-controls">
              <button onClick={() => setZoom(zoom - 0.1)} aria-label="Zoom out"><i className="ti ti-minus"></i></button>
              <button onClick={() => setZoom(1)} className="zoom-value">{Math.round(zoom * 100)}%</button>
              <button onClick={() => setZoom(zoom + 0.1)} aria-label="Zoom in"><i className="ti ti-plus"></i></button>
            </div>
          </div>
        </div>

        {/* BOTTOM FILMSTRIP */}
        <div className="bottom-filmstrip">
          <div className="filmstrip-header">
            <span className="filmstrip-title">Canvas Layers</span>
          </div>
          <div className="filmstrip-row">
            {layers.map((l) => (
              <div
                key={l.id}
                onClick={() => handleSelectLayer(l.id)}
                onDoubleClick={() => handleLayerRename(l.id)}
                className={`layer-card ${selectedProps?.id === l.id ? "selected" : ""}`}
              >
                <div className="lc-thumb flex flex-col justify-center items-center p-2 text-center">
                  {l.type === "base" ? (
                    <div className="flex flex-col items-center gap-1">
                      <i className="ti ti-background text-lg text-[#E8E0CF]"></i>
                      <span className="text-[8px] text-[#A09C96]">Garment Base</span>
                    </div>
                  ) : l.type === "text" ? (
                    <div className="flex flex-col items-center gap-1">
                      <i className="ti ti-typography text-lg text-white"></i>
                      <span className="text-[8px] text-[#A09C96] truncate max-w-[90px]">Text Element</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <i className="ti ti-photo text-lg text-[#3B82F6]"></i>
                      <span className="text-[8px] text-[#A09C96]">Graphic Logo</span>
                    </div>
                  )}
                </div>
                <div className="lc-type">
                  <i className={l.type === "base" ? "ti ti-shirt" : l.type === "text" ? "ti ti-typography" : "ti ti-photo"}></i>
                </div>
                <div className="lc-label">{l.name}</div>
              </div>
            ))}
            <div className="filmstrip-next">
              <i className="ti ti-chevron-right"></i>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="rp-top-tabs">
            {(["inspector", "specs", "layers"] as const).map((tab) => (
              <div
                key={tab}
                className={`rp-tab ${inspectorTab === tab ? "active" : ""}`}
                onClick={() => setInspectorTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          <div className="rp-scroll">
            {inspectorTab === "inspector" && (
              <>
                {/* AI Prompt */}
                <div className="rp-section">
                  <div className="rp-section-title">AI Concept Generator</div>
                  <div className="ai-prompt-box">
                    <textarea
                      value={aiPromptText}
                      onChange={(e) => setAiPromptText(e.target.value)}
                      className="w-full bg-[#1C1C1A] text-xs text-[#A09C96] border border-[#2A2A28] rounded p-2 outline-none font-mono resize-none focus:border-[#E8E0CF] mb-2"
                      rows={3}
                    />
                    <div
                      onClick={handleAiRegen}
                      className="ai-regen-btn flex items-center justify-center gap-1.5 py-1 px-3 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded cursor-pointer font-mono hover:bg-[#3B82F6]/20 transition-all"
                    >
                      {isAiGenerating ? (
                        <>
                          <i className="ti ti-loader animate-spin"></i>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-sparkles"></i>
                          Regenerate Mockup
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rp-divider"></div>

                {/* Transform properties */}
                <div className="rp-section">
                  <div className="rp-section-title">Transform</div>
                  {selectedProps ? (
                    <div className="flex flex-col gap-3">
                      <div className="transform-row">
                        <div>
                          <div className="t-input-label">Width</div>
                          <input
                            type="number"
                            value={selectedProps.width || 0}
                            onChange={(e) => handlePropertyChange("width", e.target.value)}
                            className="t-input w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono"
                          />
                        </div>
                        <div className={`t-link pt-3 ${lockAspectRatio ? "text-[#3B82F6]" : "text-[#5C5A56]"}`} onClick={() => setLockAspectRatio(!lockAspectRatio)} title="Lock aspect ratio">
                          <i className={`ti ${lockAspectRatio ? "ti-link" : "ti-unlink"}`}></i>
                        </div>
                        <div>
                          <div className="t-input-label">Height</div>
                          <input
                            type="number"
                            value={selectedProps.height || 0}
                            onChange={(e) => handlePropertyChange("height", e.target.value)}
                            className="t-input w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="t-input-label">X Pos</div>
                          <input
                            type="number"
                            value={selectedProps.left || 0}
                            onChange={(e) => handlePropertyChange("left", e.target.value)}
                            className="t-input w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono"
                          />
                        </div>
                        <div>
                          <div className="t-input-label">Y Pos</div>
                          <input
                            type="number"
                            value={selectedProps.top || 0}
                            onChange={(e) => handlePropertyChange("top", e.target.value)}
                            className="t-input w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono"
                          />
                        </div>
                        <div>
                          <div className="t-input-label">Rotate</div>
                          <input
                            type="number"
                            value={selectedProps.angle || 0}
                            onChange={(e) => handlePropertyChange("angle", e.target.value)}
                            className="t-input w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono"
                          />
                        </div>
                      </div>

                      {/* Alignment controls */}
                      <div className="mt-2">
                        <div className="t-input-label mb-1">Canvas Align</div>
                        <div className="align-grid">
                          <div className="align-btn" onClick={() => handleAlign("left")} title="Align Left"><i className="ti ti-align-left"></i></div>
                          <div className="align-btn" onClick={() => handleAlign("center")} title="Align Horiz Center"><i className="ti ti-align-center"></i></div>
                          <div className="align-btn" onClick={() => handleAlign("right")} title="Align Right"><i className="ti ti-align-right"></i></div>
                          <div className="align-btn" onClick={() => handleAlign("top")} title="Align Top"><i className="ti ti-layout-align-top"></i></div>
                          <div className="align-btn" onClick={() => handleAlign("middle")} title="Align Vert Center"><i className="ti ti-layout-align-middle"></i></div>
                          <div className="align-btn" onClick={() => handleAlign("bottom")} title="Align Bottom"><i className="ti ti-layout-align-bottom"></i></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#5C5A56] font-mono text-center py-4">
                      Select a text or image layer to view properties.
                    </div>
                  )}
                </div>

                <div className="rp-divider"></div>

                {/* Layer Opacity & Blending */}
                <div className="rp-section">
                  <div className="rp-section-title">Layer Styling</div>
                  {selectedProps ? (
                    <div className="flex flex-col gap-3">
                      <div className="slider-row">
                        <span className="slider-label">Opacity</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round((selectedProps.opacity || 1) * 100)}
                          onChange={(e) => handlePropertyChange("opacity", e.target.value)}
                        />
                        <span className="slider-val">{Math.round((selectedProps.opacity || 1) * 100)}%</span>
                      </div>
                      <div>
                        <div className="t-input-label mb-1">Blending Mode</div>
                        <select
                          value={selectedProps.blendingMode || "source-over"}
                          onChange={(e) => handlePropertyChange("blendingMode", e.target.value)}
                          className="select-field w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded"
                        >
                          <option value="source-over">Normal</option>
                          <option value="multiply">Multiply</option>
                          <option value="screen">Screen</option>
                          <option value="overlay">Overlay</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#5C5A56] font-mono text-center py-2">
                      No layer selected.
                    </div>
                  )}
                </div>

                <div className="rp-divider"></div>

                {/* Colorway Swatches */}
                <div className="rp-section">
                  <div className="rp-section-title">Fabric Colorways</div>
                  <div className="color-row mb-3">
                    {colorways.map((swatch, idx) => (
                      <div
                        key={idx}
                        className={`color-swatch ${activeColorway.hex === swatch.hex ? "active" : ""}`}
                        style={{ backgroundColor: swatch.hex }}
                        onClick={() => handleColorwaySelect(swatch)}
                        title={swatch.name}
                      />
                    ))}
                    <div className="add-color" onClick={() => colorPickerRef.current?.click()}>
                      <i className="ti ti-plus"></i>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#A09C96] font-mono uppercase tracking-wide">
                    {activeColorway.name}
                  </div>
                </div>

                <div className="rp-divider"></div>

                {/* Typography configurations */}
                {selectedProps && selectedProps.type === "text" && (
                  <div className="rp-section">
                    <div className="rp-section-title">Typography Properties</div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="t-input-label">Text String</div>
                        <input
                          type="text"
                          value={selectedProps.text || ""}
                          onChange={(e) => handlePropertyChange("text", e.target.value)}
                          className="w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="t-input-label">Font Family</div>
                          <select
                            value={selectedProps.fontFamily || "Inter"}
                            onChange={(e) => handlePropertyChange("fontFamily", e.target.value)}
                            className="w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded text-xs"
                          >
                            <option value="Inter">Inter (Sans)</option>
                            <option value="DM Mono">DM Mono (Mono)</option>
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                          </select>
                        </div>
                        <div>
                          <div className="t-input-label">Font Size (px)</div>
                          <input
                            type="number"
                            value={selectedProps.fontSize || 12}
                            onChange={(e) => handlePropertyChange("fontSize", e.target.value)}
                            className="w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-1 rounded font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="t-input-label">Fill Color</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedProps.fill || "#ffffff"}
                            onChange={(e) => handlePropertyChange("fill", e.target.value)}
                            className="bg-transparent border-none w-8 h-8 cursor-pointer"
                          />
                          <span className="font-mono text-xs uppercase">{selectedProps.fill}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {inspectorTab === "specs" && (
              <div className="flex flex-col gap-4 font-mono text-xs">
                <div className="rp-section-title">Fabric Parameters</div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-[#A09C96]">Fabric Type</label>
                  <input
                    type="text"
                    value={techpackSpecs.fabricMaterial}
                    onChange={(e) => updateTechpackSpecs({ fabricMaterial: e.target.value })}
                    className="w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-2 rounded"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-[#A09C96]">Grams per Sq Meter (GSM)</label>
                  <input
                    type="text"
                    value={techpackSpecs.gsm}
                    onChange={(e) => updateTechpackSpecs({ gsm: e.target.value })}
                    className="w-full bg-[#1C1C1A] border border-[#2A2A28] text-white p-2 rounded"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-[#A09C96]">Accent / Thread Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={techpackSpecs.threadColor}
                      onChange={(e) => updateTechpackSpecs({ threadColor: e.target.value })}
                      className="bg-transparent border-none w-8 h-8 cursor-pointer"
                    />
                    <span className="uppercase text-[10px]">{techpackSpecs.threadColor}</span>
                  </div>
                </div>

                <div className="rp-divider"></div>

                <div className="rp-section-title">Print Technology</div>
                <div className="grid grid-cols-2 gap-2">
                  {["Sublimation", "Embroidery", "Screen Print", "Heat Transfer", "DTG", "Rubber Patch"].map((tech) => (
                    <div
                      key={tech}
                      className={`pt-option cursor-pointer p-2 border rounded text-center transition-all ${
                        activePrintTech === tech
                          ? "border-[#E8E0CF] bg-[#E8E0CF]/5 text-[#E8E0CF]"
                          : "border-[#2A2A28] bg-transparent text-[#A09C96] hover:border-[#333330]"
                      }`}
                      onClick={() => setActivePrintTech(tech)}
                    >
                      <span className="text-[10px] font-bold block truncate">{tech}</span>
                    </div>
                  ))}
                </div>

                <div className="rp-divider"></div>
                <div className="rp-section-title">Measurements (cm)</div>
                <div className="flex flex-col gap-2">
                  {techpackSpecs.measurements.map((row, index) => (
                    <div key={`${String(row.point)}-${index}`} className="grid grid-cols-[1fr_64px] items-center gap-2">
                      <input value={String(row.point || "Measurement")} onChange={(event) => updateTechpackSpecs({ measurements: techpackSpecs.measurements.map((item, itemIndex) => itemIndex === index ? { ...item, point: event.target.value } : item) })} className="w-full rounded border border-[#2A2A28] bg-[#1C1C1A] p-1.5 text-[10px] text-white" />
                      <input type="number" value={Number(row.M || 0)} onChange={(event) => updateTechpackSpecs({ measurements: techpackSpecs.measurements.map((item, itemIndex) => itemIndex === index ? { ...item, M: Number(event.target.value) } : item) })} className="w-full rounded border border-[#2A2A28] bg-[#1C1C1A] p-1.5 text-[10px] text-white" />
                    </div>
                  ))}
                </div>

                <div className="rp-divider"></div>
                <div className="rp-section-title">Size Run</div>
                <div className="grid grid-cols-4 gap-2">
                  {techpackSpecs.sizeChart.map((row, index) => (
                    <label key={`${String(row.size)}-${index}`} className="flex flex-col gap-1 text-center text-[9px] text-[#A09C96]">
                      {String(row.size)}
                      <input type="number" min="0" value={Number(row.quantity || 0)} onChange={(event) => updateTechpackSpecs({ sizeChart: techpackSpecs.sizeChart.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item) })} className="w-full rounded border border-[#2A2A28] bg-[#1C1C1A] p-1 text-center text-[10px] text-white" />
                    </label>
                  ))}
                </div>

                <div className="rp-divider"></div>
                <div className="rp-section-title">Bill of Materials</div>
                <div className="flex flex-col gap-2">
                  {techpackSpecs.bom.map((row, index) => (
                    <div key={`${String(row.item)}-${index}`} className="rounded border border-[#2A2A28] bg-[#1C1C1A] p-2">
                      <input value={String(row.item || "Component")} onChange={(event) => updateTechpackSpecs({ bom: techpackSpecs.bom.map((item, itemIndex) => itemIndex === index ? { ...item, item: event.target.value } : item) })} className="mb-1 w-full bg-transparent text-[10px] font-bold text-white outline-none" />
                      <input value={String(row.material || "")} onChange={(event) => updateTechpackSpecs({ bom: techpackSpecs.bom.map((item, itemIndex) => itemIndex === index ? { ...item, material: event.target.value } : item) })} className="w-full bg-transparent text-[9px] text-[#A09C96] outline-none" />
                    </div>
                  ))}
                </div>

                <div className="rp-divider"></div>
                <div className="rp-section-title">Packaging</div>
                {Object.entries(techpackSpecs.packaging).map(([key, value]) => (
                  <label key={key} className="flex flex-col gap-1 text-[9px] capitalize text-[#A09C96]">
                    {key.replace(/([A-Z])/g, " $1")}
                    <input value={value} onChange={(event) => updateTechpackSpecs({ packaging: { ...techpackSpecs.packaging, [key]: event.target.value } })} className="w-full rounded border border-[#2A2A28] bg-[#1C1C1A] p-1.5 text-[10px] text-white" />
                  </label>
                ))}
              </div>
            )}

            {inspectorTab === "layers" && (
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="rp-section-title">Design Layers Tree</div>
                {layers.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => handleSelectLayer(l.id)}
                    onDoubleClick={() => handleLayerRename(l.id)}
                    className={`lt-item flex items-center justify-between p-2 rounded ${
                      selectedProps?.id === l.id ? "bg-[#222]" : "hover:bg-[#1C1C1A]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className={`lt-icon ${l.type === "base" ? "ti ti-shirt" : l.type === "text" ? "ti ti-typography" : "ti ti-photo"}`}></i>
                      <span className="lt-name text-[11px] truncate max-w-[150px]">{l.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {l.id !== "base-layout" && (
                        <>
                          <i
                            className={`lt-eye ti ${l.visible ? "ti-eye" : "ti-eye-off text-[#5C5A56]"}`}
                            onClick={(e) => handleToggleVisibility(l.id, e)}
                          ></i>
                          <i
                            className={`lt-lock ti ${l.locked ? "ti-lock" : "ti-lock-open text-[#5C5A56]"}`}
                            onClick={(e) => handleToggleLock(l.id, e)}
                          ></i>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
