"use client"
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type BriefBoardType from "@/components/orders/BriefBoard";
import type KanbanBoardViewType from "@/components/orders/KanbanBoardView";

function Skeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-64 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="h-5 w-24 rounded bg-slate-200 mb-4" />
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="h-4 w-full rounded bg-slate-200 mb-2" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const BriefBoardDynamic = dynamic(
  () => import("@/components/orders/BriefBoard"),
  { ssr: false, loading: () => <Skeleton /> }
);

const KanbanBoardDynamic = dynamic(
  () => import("@/components/orders/KanbanBoardView"),
  { ssr: false, loading: () => <Skeleton /> }
);

export function BriefBoardClient(props: ComponentProps<typeof BriefBoardType>) {
  return <BriefBoardDynamic {...props} />;
}

export function KanbanBoardClient(props: ComponentProps<typeof KanbanBoardViewType>) {
  return <KanbanBoardDynamic {...props} />;
}
