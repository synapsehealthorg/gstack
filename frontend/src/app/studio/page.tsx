import Link from "next/link";
import { requireAppSession } from "@/lib/server/app-session";
import { Brush } from "lucide-react";

export default async function StudioIndexPage() {
  await requireAppSession();

  return (
    <div className="min-h-full p-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Design tools</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Studio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Open a product design in the full-screen 3D studio editor.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Default / new design */}
        <Link
          href="/studio/default"
          className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition">
            <Brush className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">New Design</p>
            <p className="mt-1 text-sm text-slate-500">Start a fresh product design in the 3D studio.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
