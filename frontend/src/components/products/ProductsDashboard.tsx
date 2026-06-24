"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Box,
  Copy,
  FileUp,
  Heart,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { createProductDocument, ProductBuilderDocument, productRepository } from "@/lib/product-builder";
import { PRODUCT_CATEGORIES, PRODUCT_TEMPLATES } from "@/lib/product-templates";

type LibraryView = "products" | "templates" | "favorites" | "archived";

export default function ProductsDashboard() {
  const router = useRouter();
  const importRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<ProductBuilderDocument[]>([]);
  const [view, setView] = useState<LibraryView>("products");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    productRepository.list({ includeArchived: true }).then((result) => {
      if (cancelled) return;
      setProducts(result.data);
      setWarning(result.warning || null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || product.category === category;
    const matchesView = view === "archived" ? Boolean(product.archivedAt) : !product.archivedAt;
    const matchesFavorite = view !== "favorites" || product.favorite;
    return matchesQuery && matchesCategory && matchesView && matchesFavorite;
  }), [category, products, query, view]);

  const visibleTemplates = useMemo(() => PRODUCT_TEMPLATES.filter((template) => {
    const matchesQuery = `${template.name} ${template.description} ${template.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "All" || template.category === category);
  }), [category, query]);

  const openNewProduct = (templateId: string) => {
    router.push(`/dashboard/products/editor/${templateId}`);
  };

  const openProduct = (product: ProductBuilderDocument) => {
    router.push(`/dashboard/products/editor/${product.templateId}?productId=${product.id}`);
  };

  const updateProduct = async (product: ProductBuilderDocument, patch: Partial<ProductBuilderDocument>) => {
    setWorkingId(product.id);
    const result = await productRepository.save({ ...product, ...patch });
    setProducts((items) => items.map((item) => item.id === product.id ? result.data : item));
    setWarning(result.warning || null);
    setWorkingId(null);
    setMenuId(null);
  };

  const duplicateProduct = async (product: ProductBuilderDocument) => {
    setWorkingId(product.id);
    const result = await productRepository.duplicate(product);
    setProducts((items) => [result.data, ...items]);
    setWarning(result.warning || null);
    setWorkingId(null);
    setMenuId(null);
  };

  const deleteProduct = async (product: ProductBuilderDocument) => {
    if (!window.confirm(`Permanently delete “${product.name}”? This cannot be undone.`)) return;
    setWorkingId(product.id);
    const result = await productRepository.remove(product.id);
    setProducts((items) => items.filter((item) => item.id !== product.id));
    setWarning(result.warning || null);
    setWorkingId(null);
    setMenuId(null);
  };

  const renameProduct = async (product: ProductBuilderDocument) => {
    const name = window.prompt("Product name", product.name)?.trim();
    if (!name || name === product.name) return;
    await updateProduct(product, { name });
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const document = createProductDocument("blank-product");
    document.name = file.name.replace(/\.[^.]+$/, "") || "Imported Techpack";
    document.brandingProfile = { importFileName: file.name, importFileType: file.type };
    setLoading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const upload = await response.json() as { url: string };
      document.brandingProfile.importUrl = upload.url;
    } catch (error) {
      setWarning(`The techpack was created, but the source file could not upload: ${error instanceof Error ? error.message : "Unknown upload error"}`);
    }
    const result = await productRepository.save(document);
    setProducts((items) => [result.data, ...items]);
    setWarning(result.warning || warning);
    setLoading(false);
    event.target.value = "";
    openProduct(result.data);
  };

  const productCount = products.filter((product) => !product.archivedAt).length;
  const favoriteCount = products.filter((product) => product.favorite && !product.archivedAt).length;
  const archivedCount = products.filter((product) => product.archivedAt).length;

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA] text-zinc-950">
      <input ref={importRef} type="file" accept=".pdf,.json,.csv,.xlsx,image/*" className="hidden" onChange={handleImport} />
      <header className="border-b border-zinc-200 bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-600">Product library</p>
              <h1 className="mt-1 font-[var(--font-display)] text-3xl font-semibold tracking-tight">Products</h1>
              <p className="mt-1 text-sm text-zinc-500">Create, configure, and reuse production-ready product specifications.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => importRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"><FileUp size={15} />Import techpack</button>
              <button onClick={() => openNewProduct("blank-product")} className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-3.5 text-sm font-semibold text-white hover:bg-zinc-800"><Plus size={15} />Blank product</button>
            </div>
          </div>

          {warning && <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800"><span>{warning}</span><button onClick={() => setWarning(null)} aria-label="Dismiss warning"><X size={14} /></button></div>}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1">
              {[
                ["products", `My products ${productCount}`],
                ["templates", `Templates ${PRODUCT_TEMPLATES.length}`],
                ["favorites", `Favorites ${favoriteCount}`],
                ["archived", `Archived ${archivedCount}`],
              ].map(([id, label]) => <button key={id} onClick={() => setView(id as LibraryView)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === id ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>{label}</button>)}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${view}...`} className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label>
              <label className="relative"><SlidersHorizontal size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 min-w-40 appearance-none rounded-lg border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-700 outline-none focus:border-violet-400">{PRODUCT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? <LoadingGrid /> : view === "templates" ? (
            visibleTemplates.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleTemplates.map((template) => <TemplateCard key={template.id} template={template} onUse={() => openNewProduct(template.id)} />)}</div> : <EmptyState title="No templates found" text="Try another category or a broader search." action="Clear filters" onAction={() => { setQuery(""); setCategory("All"); }} />
          ) : visibleProducts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} working={workingId === product.id} menuOpen={menuId === product.id} onOpen={() => openProduct(product)} onMenu={() => setMenuId(menuId === product.id ? null : product.id)} onFavorite={() => void updateProduct(product, { favorite: !product.favorite })} onRename={() => void renameProduct(product)} onDuplicate={() => void duplicateProduct(product)} onArchive={() => void updateProduct(product, { archivedAt: product.archivedAt ? null : new Date().toISOString() })} onDelete={() => void deleteProduct(product)} />)}</div>
          ) : <EmptyState title={view === "archived" ? "No archived products" : view === "favorites" ? "No favorite products yet" : "Create your first product"} text={view === "products" ? "Start with a production template or a blank garment base." : "Products matching this view will appear here."} action={view === "products" ? "Browse templates" : "Show all products"} onAction={() => setView(view === "products" ? "templates" : "products")} />}
        </div>
      </main>
    </div>
  );
}

function ProductCard({ product, working, menuOpen, onOpen, onMenu, onFavorite, onRename, onDuplicate, onArchive, onDelete }: { product: ProductBuilderDocument; working: boolean; menuOpen: boolean; onOpen: () => void; onMenu: () => void; onFavorite: () => void; onRename: () => void; onDuplicate: () => void; onArchive: () => void; onDelete: () => void }) {
  return <article className="group relative overflow-visible rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg"><button onClick={onOpen} className="block w-full text-left"><div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-zinc-100"><img src={product.thumbnailUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /><span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-zinc-950/75 px-2 py-1 text-[10px] font-semibold capitalize text-white backdrop-blur">{product.status}</span></div><div className="p-4 pr-12"><p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p><p className="mt-1 text-xs text-zinc-500">{product.category} · Updated {relativeTime(product.updatedAt)}</p></div></button><button onClick={onFavorite} aria-label={product.favorite ? "Remove favorite" : "Add favorite"} className="absolute right-12 top-3 rounded-lg bg-white/90 p-2 text-zinc-600 shadow-sm backdrop-blur hover:text-rose-600"><Heart size={15} fill={product.favorite ? "currentColor" : "none"} className={product.favorite ? "text-rose-500" : ""} /></button><button onClick={onMenu} aria-label="Product actions" className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-zinc-600 shadow-sm backdrop-blur hover:text-zinc-950"><MoreHorizontal size={15} /></button>{menuOpen && <div className="absolute right-3 top-12 z-20 w-44 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl"><MenuButton icon={<Pencil size={14} />} label="Rename" onClick={onRename} /><MenuButton icon={<Copy size={14} />} label="Duplicate" onClick={onDuplicate} /><MenuButton icon={<Archive size={14} />} label={product.archivedAt ? "Restore" : "Archive"} onClick={onArchive} /><MenuButton icon={<Trash2 size={14} />} label="Delete permanently" onClick={onDelete} danger /></div>}{working && <div className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-white/70 text-xs font-semibold text-zinc-600 backdrop-blur-sm">Saving...</div>}</article>;
}

function TemplateCard({ template, onUse }: { template: (typeof PRODUCT_TEMPLATES)[number]; onUse: () => void }) {
  return <article className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"><div className="relative aspect-[4/3] overflow-hidden bg-zinc-100"><img src={template.imageUrl} alt={template.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />{template.featured && <span className="absolute left-3 top-3 rounded-full bg-violet-600 px-2 py-1 text-[10px] font-semibold text-white">Popular</span>}<span className="absolute bottom-3 right-3 rounded-full bg-zinc-950/75 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">{template.editableZones.length} zones</span></div><div className="p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-600">{template.category}</p><h3 className="mt-1 text-sm font-semibold text-zinc-950">{template.name}</h3><p className="mt-1.5 line-clamp-2 min-h-9 text-xs leading-relaxed text-zinc-500">{template.description}</p><button onClick={onUse} className="mt-4 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 text-xs font-semibold text-white hover:bg-violet-600"><Plus size={14} />Use template</button></div></article>;
}

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) { return <button onClick={onClick} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium hover:bg-zinc-100 ${danger ? "text-rose-600" : "text-zinc-700"}`}>{icon}{label}</button>; }
function LoadingGrid() { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><div className="aspect-[4/3] animate-pulse bg-zinc-100" /><div className="space-y-2 p-4"><div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100" /><div className="h-2 w-1/2 animate-pulse rounded bg-zinc-100" /></div></div>)}</div>; }
function EmptyState({ title, text, action, onAction }: { title: string; text: string; action: string; onAction: () => void }) { return <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400"><Box size={24} /></span><h2 className="mt-4 text-base font-semibold text-zinc-900">{title}</h2><p className="mt-1 max-w-sm text-sm text-zinc-500">{text}</p><button onClick={onAction} className="mt-5 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600">{action}</button></div>; }
function relativeTime(value: string) { const diff = Date.now() - new Date(value).getTime(); const minutes = Math.max(1, Math.round(diff / 60000)); if (minutes < 60) return `${minutes}m ago`; const hours = Math.round(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.round(hours / 24)}d ago`; }
