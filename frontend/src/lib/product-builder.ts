"use client";

import { createClient } from "@/utils/supabase/client";
import { getProductTemplate, ProductTemplateDefinition } from "@/lib/product-templates";

const LOCAL_PRODUCTS_KEY = "proov_product_builder_products_v1";

export type ProductStatus = "draft" | "ready";
export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export interface ProductBuilderDocument {
  version: 1;
  id: string;
  templateId: string;
  name: string;
  category: string;
  status: ProductStatus;
  favorite: boolean;
  archivedAt: string | null;
  thumbnailUrl: string;
  mockupUrls: string[];
  canvasByPerspective: Record<string, Record<string, unknown>>;
  activePerspective: "front" | "mockup" | "back" | "detail";
  colorways: Array<{ hex: string; name: string }>;
  activeColorway: { hex: string; name: string };
  printTechnique: string;
  specs: ProductTemplateDefinition["defaultSpecs"];
  brandingProfile: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRepositoryResult<T> {
  data: T;
  source: "supabase" | "local";
  warning?: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readLocalProducts(): ProductBuilderDocument[] {
  if (!isBrowser()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_PRODUCTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalProducts(products: ProductBuilderDocument[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function upsertLocalProduct(product: ProductBuilderDocument) {
  const products = readLocalProducts();
  const index = products.findIndex((item) => item.id === product.id);
  if (index >= 0) products[index] = product;
  else products.unshift(product);
  writeLocalProducts(products);
}

function removeLocalProduct(id: string) {
  writeLocalProducts(readLocalProducts().filter((product) => product.id !== id));
}

export function createProductDocument(templateId: string): ProductBuilderDocument {
  const template = getProductTemplate(templateId);
  const now = new Date().toISOString();
  return {
    version: 1,
    id: crypto.randomUUID(),
    templateId: template.id,
    name: template.blank ? "Untitled Product" : `${template.name} Concept`,
    category: template.category,
    status: "draft",
    favorite: false,
    archivedAt: null,
    thumbnailUrl: template.imageUrl,
    mockupUrls: [template.imageUrl],
    canvasByPerspective: {},
    activePerspective: "mockup",
    colorways: [
      { hex: "#4B8FD4", name: "PANTONE 286 C" },
      { hex: "#F0EDE8", name: "PANTONE 9183 C" },
      { hex: "#1A2233", name: "PANTONE 289 C" },
      { hex: "#E24B4A", name: "PANTONE 185 C" },
      { hex: "#F59E0B", name: "PANTONE 130 C" },
    ],
    activeColorway: { hex: "#4B8FD4", name: "PANTONE 286 C" },
    printTechnique: template.defaultSpecs.printTechnique,
    specs: structuredClone(template.defaultSpecs),
    brandingProfile: {},
    createdAt: now,
    updatedAt: now,
  };
}

function rowToDocument(row: Record<string, unknown>): ProductBuilderDocument {
  const branding = (row.branding_profile || {}) as Record<string, unknown>;
  const stored = (row.builder_state || branding.builderDocument) as Partial<ProductBuilderDocument> | undefined;
  const templateId = String(row.template_id || stored?.templateId || "blank-product");
  const base = createProductDocument(templateId);
  return {
    ...base,
    ...stored,
    id: String(row.id || stored?.id || base.id),
    name: String(row.name || stored?.name || base.name),
    category: String(row.category || stored?.category || base.category),
    thumbnailUrl: String(row.thumbnail_url || stored?.thumbnailUrl || base.thumbnailUrl),
    mockupUrls: (row.mockup_urls || stored?.mockupUrls || base.mockupUrls) as string[],
    favorite: Boolean(row.is_favorite ?? stored?.favorite ?? false),
    archivedAt: (row.archived_at || stored?.archivedAt || null) as string | null,
    status: (row.status || stored?.status || "draft") as ProductStatus,
    createdAt: String(row.created_at || stored?.createdAt || base.createdAt),
    updatedAt: String(row.updated_at || stored?.updatedAt || base.updatedAt),
  };
}

function documentToRow(document: ProductBuilderDocument, ownerId: string) {
  return {
    id: document.id,
    owner_id: ownerId,
    name: document.name,
    category: document.category,
    thumbnail_url: document.thumbnailUrl,
    mockup_urls: document.mockupUrls,
    layers: Object.values(document.canvasByPerspective),
    specs: document.specs,
    colorways: document.colorways,
    branding_profile: { ...document.brandingProfile, builderDocument: document },
    source: "template",
    is_blank_template: getProductTemplate(document.templateId).blank || false,
    template_id: document.templateId,
    builder_state: document,
    is_favorite: document.favorite,
    archived_at: document.archivedAt,
    status: document.status,
    last_opened_at: new Date().toISOString(),
    updated_at: document.updatedAt,
  };
}

async function authenticatedUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null };
  return { supabase, user: data.user };
}

export const productRepository = {
  async list(options: { includeArchived?: boolean } = {}): Promise<ProductRepositoryResult<ProductBuilderDocument[]>> {
    const local = readLocalProducts();
    try {
      const { supabase, user } = await authenticatedUser();
      if (!user) {
        return { data: local.filter((item) => options.includeArchived || !item.archivedAt), source: "local", warning: "Sign in to sync products across devices. Local saves remain available in this browser." };
      }
      const { data, error } = await supabase.from("product_snapshots").select("*").eq("owner_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      const remote = (data || []).map((row) => rowToDocument(row));
      const merged = [...remote, ...local.filter((item) => !remote.some((remoteItem) => remoteItem.id === item.id))];
      return { data: merged.filter((item) => options.includeArchived || !item.archivedAt), source: "supabase" };
    } catch (error) {
      return { data: local.filter((item) => options.includeArchived || !item.archivedAt), source: "local", warning: `Cloud products could not load: ${error instanceof Error ? error.message : "Unknown Supabase error"}` };
    }
  },

  async get(id: string): Promise<ProductRepositoryResult<ProductBuilderDocument | null>> {
    const local = readLocalProducts().find((item) => item.id === id) || null;
    try {
      const { supabase, user } = await authenticatedUser();
      if (!user) return { data: local, source: "local", warning: "This product is stored locally until you sign in." };
      const { data, error } = await supabase.from("product_snapshots").select("*").eq("id", id).eq("owner_id", user.id).maybeSingle();
      if (error) throw error;
      return { data: data ? rowToDocument(data) : local, source: data ? "supabase" : "local" };
    } catch (error) {
      return { data: local, source: "local", warning: `Cloud product could not open: ${error instanceof Error ? error.message : "Unknown Supabase error"}` };
    }
  },

  async save(document: ProductBuilderDocument): Promise<ProductRepositoryResult<ProductBuilderDocument>> {
    const savedDocument = { ...document, updatedAt: new Date().toISOString() };
    upsertLocalProduct(savedDocument);
    try {
      const { supabase, user } = await authenticatedUser();
      if (!user) return { data: savedDocument, source: "local", warning: "Saved locally. Sign in to enable cloud sync." };
      const fullRow = documentToRow(savedDocument, user.id);
      const { data, error } = await supabase.from("product_snapshots").upsert(fullRow).select().single();
      if (!error && data) {
        const remoteDocument = rowToDocument(data);
        upsertLocalProduct(remoteDocument);
        return { data: remoteDocument, source: "supabase" };
      }

      // Older databases can still store the complete document inside branding_profile.
      const { data: fallbackData, error: fallbackError } = await supabase.from("product_snapshots").upsert({
        id: savedDocument.id,
        owner_id: user.id,
        name: savedDocument.name,
        category: savedDocument.category,
        thumbnail_url: savedDocument.thumbnailUrl,
        mockup_urls: savedDocument.mockupUrls,
        layers: Object.values(savedDocument.canvasByPerspective),
        specs: savedDocument.specs,
        colorways: savedDocument.colorways,
        branding_profile: { ...savedDocument.brandingProfile, builderDocument: savedDocument },
        source: "template",
        is_blank_template: getProductTemplate(savedDocument.templateId).blank || false,
        updated_at: savedDocument.updatedAt,
      }).select().single();
      if (fallbackError || !fallbackData) throw fallbackError || error;
      return { data: rowToDocument(fallbackData), source: "supabase", warning: "Saved using the compatibility schema. Apply migration 00007_product_builder.sql for favorites and archive support." };
    } catch (error) {
      return { data: savedDocument, source: "local", warning: `Saved locally; cloud sync failed: ${error instanceof Error ? error.message : "Unknown Supabase error"}` };
    }
  },

  async remove(id: string): Promise<ProductRepositoryResult<boolean>> {
    removeLocalProduct(id);
    try {
      const { supabase, user } = await authenticatedUser();
      if (!user) return { data: true, source: "local", warning: "Deleted from this browser only." };
      const { error } = await supabase.from("product_snapshots").delete().eq("id", id).eq("owner_id", user.id);
      if (error) throw error;
      return { data: true, source: "supabase" };
    } catch (error) {
      return { data: true, source: "local", warning: `Cloud delete failed: ${error instanceof Error ? error.message : "Unknown Supabase error"}` };
    }
  },

  async duplicate(document: ProductBuilderDocument): Promise<ProductRepositoryResult<ProductBuilderDocument>> {
    const now = new Date().toISOString();
    return this.save({ ...structuredClone(document), id: crypto.randomUUID(), name: `${document.name} Copy`, status: "draft", favorite: false, archivedAt: null, createdAt: now, updatedAt: now });
  },
};
