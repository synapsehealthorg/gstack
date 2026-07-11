import { ReactNode } from "react";

// The studio editor is full-screen — override the parent /studio layout
// so the 3D canvas gets 100vw × 100vh with no sidebar or shell chrome.
export default function StudioEditorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
