"use client";

import { useEffect, useRef } from "react";
import { Canvas, FabricImage } from "fabric";
import type { Template } from "@/types";

interface MockupCanvasProps {
  template: Template;
  onCanvasReady: (canvas: Canvas) => void;
}

export function MockupCanvas({ template, onCanvasReady }: MockupCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 800,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Load garment base image
    FabricImage.fromURL(template.imageUrl, {}, { crossOrigin: "anonymous" }).then((img) => {
      img.scaleToWidth(800);
      img.selectable = false;
      img.evented = false;
      canvas.add(img);
      canvas.sendObjectToBack(img);
      canvas.renderAll();
    });

    onCanvasReady(canvas);

    return () => {
      canvas.dispose();
    };
  }, [template.imageUrl, onCanvasReady]);

  return (
    <div className="relative overflow-hidden rounded-lg border bg-muted/30 shadow-sm">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
