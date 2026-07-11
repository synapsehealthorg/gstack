"use client"
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type OrderWorkspaceType from "@/components/orders/OrderWorkspace";

const OrderWorkspace = dynamic(
  () => import("@/components/orders/OrderWorkspace"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <span className="text-sm text-slate-500">Loading workspace…</span>
        </div>
      </div>
    ),
  }
);

export default function OrderWorkspaceClient(
  props: ComponentProps<typeof OrderWorkspaceType>
) {
  return <OrderWorkspace {...props} />;
}
