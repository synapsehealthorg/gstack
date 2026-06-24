"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import { Activity, Bell, ChevronDown, CircleDollarSign, Command, Gavel, LayoutDashboard, LogOut, Menu, Package, Search, Settings, ShieldCheck, Users, X, ScrollText } from "lucide-react";

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  urgent?: boolean;
};

const groups: Array<{ label: string; items: AdminNavItem[] }> = [
  { label: "Workspace", items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }] },
  { label: "Operations", items: [{ href: "/admin/manufacturers", label: "Verification", icon: ShieldCheck, badge: 3 }, { href: "/admin/market", label: "Market monitor", icon: Activity }, { href: "/admin/orders", label: "Orders", icon: Package }] },
  { label: "Money & risk", items: [{ href: "/admin/disputes", label: "Disputes", icon: Gavel, badge: 3, urgent: true }, { href: "/admin/payouts", label: "Payouts", icon: CircleDollarSign, badge: 2 }] },
  { label: "Platform", items: [{ href: "/admin/users", label: "Users", icon: Users }, { href: "/admin/logs", label: "Audit logs", icon: ScrollText }, { href: "/admin/settings", label: "Settings", icon: Settings }] },
];

const searchItems = groups.flatMap((group) => group.items);

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const filtered = useMemo(() => searchItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const current = searchItems.find((item) => item.href === pathname)?.label || searchItems.find((item) => pathname.startsWith(`${item.href}/`))?.label || "Admin";

  const navigate = (href: string) => {
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f8] text-sm text-zinc-900">
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-zinc-950/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-zinc-200 bg-white transition-transform lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
          <Link href="/admin" className="font-[var(--font-display)] text-xl font-bold tracking-tight text-zinc-950">proov<span className="text-violet-600">.</span><span className="ml-1 text-xs font-semibold text-zinc-400">admin</span></Link>
          <button className="rounded-md p-1 text-zinc-500 lg:hidden" onClick={() => setMobileOpen(false)}><X size={19} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                  return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex h-9 items-center justify-between rounded-lg px-3 text-[13px] font-medium transition ${active ? "bg-violet-50 text-violet-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}><span className="flex items-center gap-3"><Icon size={17} strokeWidth={active ? 2.2 : 1.8} />{item.label}</span>{item.badge ? <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${item.urgent ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-600"}`}>{item.badge}</span> : null}</Link>;
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-3">
          <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">NK</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-zinc-900">Nadia Khan</span><span className="block text-[11px] text-zinc-500">Super admin</span></span>
            <ChevronDown size={15} className="text-zinc-400" />
          </button>
          <Link href="/" className="mt-1 flex h-8 items-center gap-3 rounded-lg px-3 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"><LogOut size={15} />Exit admin</Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-zinc-200 p-2 text-zinc-600 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <div><p className="text-[11px] text-zinc-400">Control center</p><p className="text-sm font-semibold text-zinc-900">{current}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-left text-xs text-zinc-400 transition hover:border-zinc-300 sm:flex"><Search size={15} /><span className="flex-1">Search admin...</span><span className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-400"><Command size={10} />K</span></button>
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="rounded-lg border border-zinc-200 p-2 text-zinc-500 sm:hidden"><Search size={17} /></button>
            <div className="relative">
              <button aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button>
              {notificationsOpen && <div className="absolute right-0 top-11 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl"><div className="flex items-center justify-between px-2 py-2"><p className="font-semibold">Notifications</p><button onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>{["Payout PAY-5038 is ready for review", "Dispute DSP-0192 passed its 72h SLA", "Three manufacturers await verification"].map((item, index) => <button key={item} onClick={() => setNotificationsOpen(false)} className="flex w-full gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-zinc-50"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${index === 1 ? "bg-rose-500" : "bg-violet-500"}`} /><span><span className="block text-xs font-medium text-zinc-800">{item}</span><span className="mt-0.5 block text-[11px] text-zinc-400">{index + 1}h ago</span></span></button>)}</div>}
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</div></main>
      </div>

      {searchOpen && <div className="fixed inset-0 z-[70] flex items-start justify-center bg-zinc-950/40 px-4 pt-[12vh]" onMouseDown={() => setSearchOpen(false)}><div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center gap-3 border-b border-zinc-200 px-4"><Search size={18} className="text-zinc-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Go to an admin area..." className="h-14 flex-1 text-sm outline-none" /><button onClick={() => setSearchOpen(false)} className="rounded border border-zinc-200 px-2 py-1 text-[10px] text-zinc-500">ESC</button></div><div className="max-h-80 overflow-y-auto p-2">{filtered.map((item) => { const Icon = item.icon; return <button key={item.href} onClick={() => navigate(item.href)} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-zinc-700 hover:bg-violet-50 hover:text-violet-700"><Icon size={17} />{item.label}</button>; })}{filtered.length === 0 && <p className="p-6 text-center text-sm text-zinc-400">No admin area found.</p>}</div></div></div>}
    </div>
  );
}
