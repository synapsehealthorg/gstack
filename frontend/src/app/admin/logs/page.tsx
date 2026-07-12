"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileClock, SearchCheck, ShieldCheck } from "lucide-react";
import { EmptyState, FilterPills, PageHeader, SearchField, StatCard, Toast, secondaryButton, useAdminToast } from "@/components/admin/AdminUI";
import { createClient } from "@/utils/supabase/client";

interface AuditEvent {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  target: string;
  category: string;
  source: string;
}

const categoryFor = (action: string) => {
  if (action.includes("dispute")) return "dispute";
  if (action.includes("manufacturer")) return "verification";
  if (action.includes("suspend") || action.includes("restore")) return "user";
  if (action.includes("marketplace")) return "risk";
  if (action.includes("payout") || action.includes("refund")) return "finance";
  return "settings";
};

const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;

export default function LogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast, clearToast } = useAdminToast();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("admin_actions")
      .select("id, action_type, target_type, target_id, notes, metadata, created_at, admin:profiles!admin_actions_admin_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (loadError) setError(`Audit events could not load. ${loadError.message}`);
    else setEvents((data || []).map((row: any) => {
      const admin = Array.isArray(row.admin) ? row.admin[0] : row.admin;
      return {
        id: String(row.id),
        createdAt: String(row.created_at),
        actor: String(admin?.full_name || "Platform admin"),
        action: String(row.action_type || "admin_action").replaceAll("_", " "),
        target: `${row.target_type || "record"}:${row.target_id || "unknown"}`,
        category: categoryFor(String(row.action_type || "")),
        source: row.notes ? String(row.notes) : "Authenticated admin action",
      };
    }));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => events.filter((event) => (filter === "all" || event.category === filter) && `${event.actor} ${event.action} ${event.target} ${event.source}`.toLowerCase().includes(query.toLowerCase())), [events, query, filter]);
  const today = new Date().toDateString();
  const eventsToday = events.filter((event) => new Date(event.createdAt).toDateString() === today).length;
  const critical = events.filter((event) => ["risk", "dispute", "user"].includes(event.category)).length;
  const exportLogs = () => {
    const rows = ["Time,Actor,Action,Target,Category,Notes", ...filtered.map((event) => [event.createdAt, event.actor, event.action, event.target, event.category, event.source].map(csvCell).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "proov-admin-audit.csv"; link.click(); URL.revokeObjectURL(url); showToast("Audit log exported");
  };

  return <div className="space-y-7"><PageHeader eyebrow="Governance" title="Audit logs" description="A traceable record of authenticated administrator actions." actions={<button onClick={exportLogs} disabled={!filtered.length} className={secondaryButton}><Download size={15} />Export CSV</button>} />
    <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Events today" value={loading ? "..." : String(eventsToday)} detail="Recorded admin decisions" icon={<FileClock size={18} />} /><StatCard label="Critical actions" value={loading ? "..." : String(critical)} detail="Risk, dispute, and account actions" icon={<ShieldCheck size={18} />} tone="emerald" /><StatCard label="Loaded history" value={loading ? "..." : String(events.length)} detail="Most recent 500 events" icon={<SearchCheck size={18} />} /></div>
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between"><SearchField value={query} onChange={setQuery} placeholder="Search actor, action, target..." /><FilterPills options={["all", "verification", "risk", "finance", "dispute", "user", "settings"]} value={filter} onChange={setFilter} /></div>
      {loading ? <div className="space-y-3 p-5" aria-label="Loading audit events">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-10 animate-pulse rounded-lg bg-zinc-100" />)}</div> : error ? <div className="p-5"><EmptyState title="Audit events unavailable" description={error} /><button onClick={() => void load()} className={`${secondaryButton} mx-auto mt-4`}>Retry</button></div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400"><th className="px-5 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Category</th><th className="px-5 py-3">Notes</th></tr></thead><tbody className="divide-y divide-zinc-100">{filtered.map((event) => <tr key={event.id} className="hover:bg-zinc-50"><td className="px-5 py-3 text-xs text-zinc-500">{new Date(event.createdAt).toLocaleString()}</td><td className="px-4 py-3 text-xs font-semibold text-zinc-800">{event.actor}</td><td className="px-4 py-3 text-xs capitalize text-zinc-700">{event.action}</td><td className="px-4 py-3 font-mono text-[11px] text-violet-600">{event.target}</td><td className="px-4 py-3"><span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600">{event.category}</span></td><td className="max-w-xs truncate px-5 py-3 text-xs text-zinc-500" title={event.source}>{event.source}</td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title="No audit events found" description="No recorded events match this filter." /></div>}
    </section>{toast && <Toast message={toast} onClose={clearToast} />}</div>;
}
