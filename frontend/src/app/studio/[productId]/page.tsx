"use client"
import dynamic from "next/dynamic";
import { useStudioStore } from "@/lib/store/studioStore";

const StudioCanvasHeader = dynamic(
  () => import("@/components/studio/StudioCanvasHeader"),
  { ssr: false }
);
const StudioIconSidebar = dynamic(
  () => import("@/components/studio/StudioIconSidebar"),
  { ssr: false }
);
const StudioLeftSidebar = dynamic(
  () => import("@/components/studio/StudioLeftSidebar"),
  { ssr: false }
);
const StudioCanvas = dynamic(
  () => import("@/components/studio/StudioCanvas"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1b1e",
          color: "#888",
          fontSize: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #7c3aed",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <span>Loading studio…</span>
        </div>
      </div>
    ),
  }
);
const StudioRightPanel = dynamic(
  () => import("@/components/studio/StudioRightPanel"),
  { ssr: false }
);
const StudioPreviewOverlay = dynamic(
  () => import("@/components/studio/StudioPreviewOverlay"),
  { ssr: false }
);

export default function StudioEditorPage() {
  const { selectedItemId, isLeftSidebarOpen } = useStudioStore();

  return (
    <div
      className="studio-layout"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#1a1b1e",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <StudioCanvasHeader />
      <div
        className="studio-body"
        style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}
      >
        <StudioIconSidebar />
        {isLeftSidebarOpen && <StudioLeftSidebar />}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <StudioCanvas />
        </div>
        {selectedItemId && <StudioRightPanel />}
      </div>
      <StudioPreviewOverlay />
    </div>
  );
}
