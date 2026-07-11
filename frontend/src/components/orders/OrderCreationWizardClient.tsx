"use client"
import dynamic from "next/dynamic";
import { OrderCreationProvider } from "@/components/orders/OrderCreationContext";

const OrderCreationWizard = dynamic(
  () => import("@/components/orders/OrderCreationWizard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <span className="text-sm text-slate-500">Loading order form…</span>
        </div>
      </div>
    ),
  }
);

export default function OrderCreationWizardClient() {
  return (
    <OrderCreationProvider>
      <OrderCreationWizard />
    </OrderCreationProvider>
  );
}
