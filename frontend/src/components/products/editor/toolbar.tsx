"use client";

import { useCallback } from "react";
import type { Canvas } from "fabric";
import { FabricText, FabricImage } from "fabric";
import { Type, ImagePlus, Square, Trash2, Download, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
  canvas: Canvas | null;
  onExport: () => void;
}

export function EditorToolbar({ canvas, onExport }: EditorToolbarProps) {
  const addText = useCallback(() => {
    if (!canvas) return;
    const text = new FabricText("Your Text", {
      left: 100,
      top: 100,
      fontSize: 48,
      fill: "#000000",
      fontFamily: "Arial",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [canvas]);

  const addImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const img = await FabricImage.fromURL(url, {}, { crossOrigin: "anonymous" });
    img.scaleToWidth(200);
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
  }, [canvas]);

  const deleteSelected = useCallback(() => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [canvas]);

  const bringForward = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) canvas.bringObjectForward(obj);
  }, [canvas]);

  const sendBackward = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) canvas.sendObjectBackwards(obj);
  }, [canvas]);

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
      <Button variant="ghost" size="icon" onClick={addText} title="Add text">
        <Type className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" asChild title="Add image">
        <label className="cursor-pointer">
          <ImagePlus className="h-4 w-4" />
          <input type="file" accept="image/*" className="hidden" onChange={addImage} />
        </label>
      </Button>

      <div className="h-5 w-px bg-border" />

      <Button variant="ghost" size="icon" onClick={bringForward} title="Bring forward">
        <MoveUp className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onClick={sendBackward} title="Send backward">
        <MoveDown className="h-4 w-4" />
      </Button>

      <div className="h-5 w-px bg-border" />

      <Button variant="ghost" size="icon" onClick={deleteSelected} title="Delete selected">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <div className="ml-auto">
        <Button size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
