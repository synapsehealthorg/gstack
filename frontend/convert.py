import re

with open('/Users/meemfayalif/Downloads/gt/gstack/proov_product_builder.html', 'r') as f:
    content = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    css = style_match.group(1)
    with open('/Users/meemfayalif/Downloads/gt/gstack/frontend/src/app/dashboard/products/editor/[templateId]/builder.css', 'w') as f:
        f.write(css)

# Extract Body Content
body_match = re.search(r'<body>(.*?)</body>', content, re.DOTALL)
if body_match:
    html = body_match.group(1)
    
    # Simple HTML to JSX conversions
    html = html.replace('class="', 'className="')
    html = html.replace('<!--', '{/*')
    html = html.replace('-->', '*/}')
    html = re.sub(r'<input([^>]*?[^/])>', r'<input\1 />', html)
    
    # Fix inline styles (basic regex for the known styles in this file)
    # This might require some careful regex or just manual fixes, but let's try a programmatic approach for the specific inline styles in this file.
    def style_replacer(match):
        style_str = match.group(1)
        styles = style_str.split(';')
        jsx_styles = []
        for s in styles:
            if not s.strip(): continue
            parts = s.split(':', 1)
            if len(parts) == 2:
                key = parts[0].strip()
                val = parts[1].strip()
                # camelCase the key
                key = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), key)
                jsx_styles.append(f"'{key}': '{val}'")
        return 'style={{' + ', '.join(jsx_styles) + '}}'

    html = re.sub(r'style="([^"]*)"', style_replacer, html)

    tsx = f""""use client";

import React, {{ useState, useEffect }} from "react";
import {{ useParams, useRouter }} from "next/navigation";
import {{ Canvas }} from "fabric";
import {{ MockupCanvas }} from "@/components/products/editor/canvas";
import {{ DEFAULT_TEMPLATES }} from "@/components/products/TemplateGallery";
import {{ useBuilderStore }} from "@/store/useBuilderStore";
import "./builder.css";

export default function ProductEditorPage() {{
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const {{ activeViewMode, setActiveViewMode }} = useBuilderStore();

  const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);

  useEffect(() => {{
    if (!template) {{
      router.push("/dashboard");
    }}
  }}, [template, router]);

  if (!template) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {{/* Tabler Icons CDN */}}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      
{html}
    </div>
  );
}}
"""
    with open('/Users/meemfayalif/Downloads/gt/gstack/frontend/src/app/dashboard/products/editor/[templateId]/page.tsx', 'w') as f:
        f.write(tsx)
