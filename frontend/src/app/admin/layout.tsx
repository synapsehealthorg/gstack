import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Package,
  Gavel,
  CreditCard,
  Users,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1117] text-[#9ca3af] flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
            <span className="text-white font-bold text-lg tracking-wider">
              proov<span className="text-[#6366f1]">admin</span>
            </span>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto">
            <NavItem href="/admin" icon={<LayoutDashboard size={18} />} label="Overview" />
            
            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Operations
            </div>
            <NavItem href="/admin/manufacturers" icon={<ShieldCheck size={18} />} label="Verification Queue" badge={3} />
            <NavItem href="/admin/market" icon={<Activity size={18} />} label="Market Monitor" />
            <NavItem href="/admin/orders" icon={<Package size={18} />} label="Orders" />
            
            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">
              High Priority
            </div>
            <NavItem href="/admin/disputes" icon={<Gavel size={18} />} label="Disputes" badge={1} badgeColor="bg-[#ef4444]" />
            <NavItem href="/admin/payouts" icon={<CreditCard size={18} />} label="Payouts" badge={5} />
            
            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-[#475569] uppercase tracking-wider">
              System
            </div>
            <NavItem href="/admin/users" icon={<Users size={18} />} label="Users" />
            <NavItem href="/admin/logs" icon={<ScrollText size={18} />} label="Audit Logs" />
            <NavItem href="/admin/settings" icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        <div className="p-4 border-t border-[#1e293b]">
          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-[#1e293b] hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge,
  badgeColor = "bg-[#6366f1]",
}: {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#1e293b] hover:text-white transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <span className="text-[#9ca3af] group-hover:text-white transition-colors">{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold ${badgeColor}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
