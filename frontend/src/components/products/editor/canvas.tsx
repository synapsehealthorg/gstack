"use client";

import { useEffect, useRef } from "react";
import { Canvas, FabricImage, FabricObject, Point } from "fabric";
import type { Template } from "@/types";
import { useBuilderStore } from "@/store/useBuilderStore";
import type { BuilderTool } from "@/store/useBuilderStore";

interface MockupCanvasProps {
  template: Template;
  onCanvasReady: (canvas: Canvas) => void;
  width?: number;
  height?: number;
  colorwayColor?: string;
  initialData?: Record<string, unknown>;
  activeTool?: BuilderTool;
  zoom?: number;
  showGrid?: boolean;
  onCanvasChange?: (data: Record<string, unknown>) => void;
  onZoomChange?: (zoom: number) => void;
}

export function MockupCanvas({
  template,
  onCanvasReady,
  width = 220,
  height = 260,
  colorwayColor,
  initialData,
  activeTool = "select",
  zoom = 1,
  showGrid = true,
  onCanvasChange,
  onZoomChange,
}: MockupCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const initialDataRef = useRef(initialData);
  const initialColorRef = useRef(colorwayColor);
  const initialZoomRef = useRef(zoom);
  const initialToolRef = useRef(activeTool);
  const readyRef = useRef(onCanvasReady);
  const changeRef = useRef(onCanvasChange);
  const zoomChangeRef = useRef(onZoomChange);
  const isHydratingRef = useRef(true);
  const panRef = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => { readyRef.current = onCanvasReady; }, [onCanvasReady]);
  useEffect(() => { changeRef.current = onCanvasChange; }, [onCanvasChange]);
  useEffect(() => { zoomChangeRef.current = onZoomChange; }, [onZoomChange]);

  useEffect(() => {
    if (!canvasRef.current) return;
    FabricObject.customProperties = ["id", "name"];

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: initialColorRef.current || "#0D0D0C",
      preserveObjectStacking: true,
      selection: initialToolRef.current === "select",
    });
    fabricRef.current = canvas;

    const syncSelectedProps = (object: FabricObject | undefined) => {
      if (!object || object.id === "base-layout") return;
      const text = "text" in object ? String(object.text || "") : "";
      if (!object.id) object.id = `${text ? "text" : "image"}_${Date.now()}`;
      useBuilderStore.getState().setSelectedProps({
        id: object.id,
        type: text ? "text" : "image",
        text,
        fontFamily: "fontFamily" in object ? String(object.fontFamily || "Inter") : "Inter",
        fontSize: "fontSize" in object ? Number(object.fontSize || 12) : 12,
        fill: typeof object.fill === "string" ? object.fill : "#ffffff",
        opacity: object.opacity ?? 1,
        angle: Math.round(object.angle || 0),
        scaleX: object.scaleX || 1,
        scaleY: object.scaleY || 1,
        width: Math.round((object.width || 0) * (object.scaleX || 1)),
        height: Math.round((object.height || 0) * (object.scaleY || 1)),
        left: Math.round(object.left || 0),
        top: Math.round(object.top || 0),
        blendingMode: object.globalCompositeOperation || "source-over",
      });
    };

    const syncLayers = () => {
      const layers = canvas.getObjects().map((object, index) => {
        const text = "text" in object ? String(object.text || "") : "";
        if (!object.id) object.id = `layer_${Date.now()}_${index}`;
        return {
          id: object.id,
          name: object.id === "base-layout" ? "Base layout" : text ? `Text: “${text.slice(0, 18)}${text.length > 18 ? "…" : ""}”` : String(object.name || `Graphic ${index}`),
          type: object.id === "base-layout" ? "base" as const : text ? "text" as const : "image" as const,
          visible: object.visible !== false,
          locked: object.lockMovementX === true,
        };
      });
      if (!layers.some((layer) => layer.id === "base-layout")) layers.unshift({ id: "base-layout", name: "Base layout", type: "base", visible: true, locked: true });
      useBuilderStore.getState().setLayers(layers);
    };

    const emitChange = () => {
      if (isHydratingRef.current) return;
      syncLayers();
      changeRef.current?.(canvas.toJSON());
    };

    const addBaseImage = async () => {
      const image = await FabricImage.fromURL(template.imageUrl, {}, { crossOrigin: "anonymous" });
      const scale = Math.min(width / Math.max(1, image.width), height / Math.max(1, image.height));
      image.scale(scale);
      image.set({
        left: (width - image.width * scale) / 2,
        top: (height - image.height * scale) / 2,
        selectable: false,
        evented: false,
        id: "base-layout",
        name: "Base layout",
      });
      canvas.add(image);
      canvas.sendObjectToBack(image);
    };

    canvas.on("selection:created", (event) => syncSelectedProps(event.selected?.[0]));
    canvas.on("selection:updated", (event) => syncSelectedProps(event.selected?.[0]));
    canvas.on("selection:cleared", () => useBuilderStore.getState().setSelectedProps(null));
    canvas.on("object:moving", (event) => syncSelectedProps(event.target));
    canvas.on("object:scaling", (event) => syncSelectedProps(event.target));
    canvas.on("object:rotating", (event) => syncSelectedProps(event.target));
    canvas.on("object:modified", (event) => { syncSelectedProps(event.target); emitChange(); });
    canvas.on("object:added", emitChange);
    canvas.on("object:removed", () => { useBuilderStore.getState().setSelectedProps(null); emitChange(); });
    canvas.on("mouse:wheel", (event) => {
      const wheel = event.e as WheelEvent;
      const nextZoom = Math.min(3, Math.max(0.35, canvas.getZoom() * Math.pow(0.999, wheel.deltaY)));
      canvas.zoomToPoint(new Point(wheel.offsetX, wheel.offsetY), nextZoom);
      wheel.preventDefault();
      wheel.stopPropagation();
      zoomChangeRef.current?.(nextZoom);
    });
    canvas.on("mouse:down", (event) => {
      const mouse = event.e as MouseEvent;
      if (useBuilderStore.getState().activeTool !== "pan" && !mouse.altKey) return;
      panRef.current = { active: true, x: mouse.clientX, y: mouse.clientY };
      canvas.selection = false;
      canvas.defaultCursor = "grabbing";
    });
    canvas.on("mouse:move", (event) => {
      const mouse = event.e as MouseEvent;
      if (!panRef.current.active || !canvas.viewportTransform) return;
      canvas.viewportTransform[4] += mouse.clientX - panRef.current.x;
      canvas.viewportTransform[5] += mouse.clientY - panRef.current.y;
      panRef.current = { active: true, x: mouse.clientX, y: mouse.clientY };
      canvas.requestRenderAll();
    });
    canvas.on("mouse:up", () => {
      panRef.current.active = false;
      const tool = useBuilderStore.getState().activeTool;
      canvas.defaultCursor = tool === "pan" ? "grab" : "default";
      canvas.selection = tool === "select";
    });

    const hydrate = async () => {
      isHydratingRef.current = true;
      try {
        const data = initialDataRef.current;
        if (data && Array.isArray(data.objects) && data.objects.length > 0) {
          await canvas.loadFromJSON(data);
          const base = canvas.getObjects().find((object) => object.id === "base-layout");
          if (base) {
            base.set({ selectable: false, evented: false });
            canvas.sendObjectToBack(base);
          }
        } else {
          await addBaseImage();
        }
        canvas.setZoom(initialZoomRef.current);
        syncLayers();
        canvas.renderAll();
      } finally {
        isHydratingRef.current = false;
        readyRef.current(canvas);
      }
    };
    void hydrate();

    return () => {
      fabricRef.current = null;
      canvas.dispose();
    };
  }, [height, template.imageUrl, width]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = colorwayColor || "#0D0D0C";
    canvas.requestRenderAll();
  }, [colorwayColor]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
  }, [zoom]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const selectable = activeTool === "select";
    canvas.selection = selectable;
    canvas.defaultCursor = activeTool === "pan" ? "grab" : "default";
    canvas.getObjects().forEach((object) => {
      if (object.id !== "base-layout" && !object.lockMovementX) object.selectable = selectable;
    });
    if (!selectable) canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [activeTool]);

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg ${showGrid ? "builder-canvas-grid" : "bg-transparent"}`}>
      <canvas ref={canvasRef} className="block border border-[#2A2A28]" />
    </div>
  );
}
