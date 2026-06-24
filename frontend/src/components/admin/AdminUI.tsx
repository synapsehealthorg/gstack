"use client";

import { ReactNode, useState } from "react";
import { Check, Search, X } from "lucide-react";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  funded: "bg-violet-50 text-violet-700 border-violet-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  "closing soon": "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-rose-50 text-rose-700 border-rose-200",
  "under review": "bg-orange-50 text-orange-700 border-orange-200",
  suspended: "bg-rose-50 text-rose-700 border-rose-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  resolved: "bg-slate-100 text-slate-600 border-slate-200",
  "in production": "bg-violet-50 text-violet-700 border-violet-200",
  "quality check": "bg-cyan-50 text-cyan-700 border-cyan-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
};

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">{eyebrow}</p>}
        <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[28px]">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyles[status.toLowerCase()] || "border-zinc-200 bg-zinc-50 text-zinc-600"}`}>{status}</span>;
}

export function StatCard({ label, value, detail, icon, tone = "violet" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "violet" | "emerald" | "amber" | "rose" }) {
  const tones = {
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
    </label>
  );
}

export function FilterPills({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1">
      {options.map((option) => (
        <button key={option} onClick={() => onChange(option)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${value === option ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>{option}</button>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center"><Search size={26} className="mb-3 text-zinc-300" /><p className="font-semibold text-zinc-800">{title}</p><p className="mt-1 text-sm text-zinc-500">{description}</p></div>;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-950 px-4 py-3 text-sm text-white shadow-xl"><Check size={16} className="text-emerald-400" /><span>{message}</span><button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white"><X size={15} /></button></div>;
}

export function useAdminToast() {
  const [toast, setToast] = useState("");
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };
  return { toast, showToast, clearToast: () => setToast("") };
}

export const primaryButton = "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300";
export const secondaryButton = "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-100";

