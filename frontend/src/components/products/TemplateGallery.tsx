"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PRODUCT_TEMPLATES } from "@/lib/product-templates";

export const DEFAULT_TEMPLATES = PRODUCT_TEMPLATES;

export function TemplateGallery() {
  const router = useRouter();

  const handleSelectTemplate = (templateId: string) => {
    // Navigate to the editor for this template
    router.push(`/dashboard/products/editor/${templateId}`);
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {DEFAULT_TEMPLATES.map((template) => (
        <div
          key={template.id}
          onClick={() => handleSelectTemplate(template.id)}
          className="group relative cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-black hover:shadow-md"
        >
          <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={template.imageUrl}
              alt={template.name}
              width={800}
              height={1000}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {template.category}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start building with this template
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
