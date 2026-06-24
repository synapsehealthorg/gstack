import re

with open('/Users/meemfayalif/Downloads/gt/gstack/frontend/src/components/orders/OrderWorkspace.tsx', 'r') as f:
    content = f.read()

replacements = [
    # Backgrounds
    (r'bg-\[\#0d0d12\]', 'bg-zinc-50'),
    (r'bg-\[\#111018\]\/95', 'bg-white/95'),
    (r'bg-\[\#0f0e15\]', 'bg-zinc-50'),
    (r'bg-\[\#121119\]', 'bg-white'),
    (r'bg-white\/\[0\.055\]', 'bg-white'),
    (r'bg-white\/\[0\.045\]', 'bg-white'),
    (r'bg-white\/\[0\.04\]', 'bg-white'),
    (r'bg-white\/\[0\.035\]', 'bg-white'),
    (r'bg-white\/\[0\.03\]', 'bg-white'),
    (r'bg-white\/\[0\.025\]', 'bg-white'),
    (r'bg-white\/\[0\.07\]', 'bg-zinc-50 hover:bg-zinc-100'),
    (r'bg-white\/\[0\.08\]', 'bg-zinc-100'),
    (r'bg-white\/\[0\.06\]', 'bg-zinc-100'),
    (r'bg-white\/10', 'bg-zinc-100'),
    (r'bg-black\/20', 'bg-zinc-50'),
    (r'bg-zinc-950', 'bg-white'),
    
    # Text
    (r'text-white', 'text-zinc-900'),
    (r'text-zinc-100', 'text-zinc-900'),
    (r'text-zinc-200', 'text-zinc-700'),
    (r'text-zinc-300', 'text-zinc-600'),
    (r'text-zinc-400', 'text-zinc-500'),
    (r'text-zinc-500', 'text-zinc-500'),
    
    # Borders
    (r'border-white\/10', 'border-zinc-200'),
    
    # Accents - Violet
    (r'bg-violet-500\/10', 'bg-violet-50'),
    (r'bg-violet-500\/12', 'bg-violet-50'),
    (r'bg-violet-500\/15', 'bg-violet-50'),
    (r'bg-violet-500\/25', 'bg-violet-100'),
    (r'border-violet-400\/25', 'border-violet-200'),
    (r'border-violet-400\/30', 'border-violet-200'),
    (r'border-violet-400\/35', 'border-violet-200'),
    (r'border-violet-400\/40', 'border-violet-300'),
    (r'text-violet-100', 'text-violet-700'),
    (r'text-violet-200', 'text-violet-700'),
    (r'text-violet-300', 'text-violet-600'),
    
    # Accents - Emerald/Green
    (r'bg-emerald-400\/8', 'bg-emerald-50'),
    (r'bg-emerald-400\/10', 'bg-emerald-50'),
    (r'border-emerald-300\/25', 'border-emerald-200'),
    (r'border-emerald-400\/20', 'border-emerald-200'),
    (r'text-emerald-100', 'text-emerald-700'),
    (r'text-emerald-200', 'text-emerald-700'),
    (r'text-emerald-300', 'text-emerald-600'),
    
    # Accents - Amber
    (r'bg-amber-300\/10', 'bg-amber-50'),
    (r'border-amber-300\/20', 'border-amber-200'),
    (r'border-amber-300\/30', 'border-amber-200'),
    (r'text-amber-100', 'text-amber-700'),
    (r'text-amber-200', 'text-amber-700'),
    (r'text-amber-300', 'text-amber-600'),
    
    # Accents - Red
    (r'bg-red-500\/10', 'bg-red-50'),
    (r'border-red-400\/30', 'border-red-200'),
    (r'border-red-400\/40', 'border-red-300'),
    (r'text-red-100', 'text-red-700'),
    
    # Shadows
    (r'shadow-\[0_20px_80px_rgba\(0\,0\,0\,0\.22\)\]', 'shadow-sm'),
    (r'shadow-\[0_0_28px_rgba\(124\,58\,237\,0\.35\)\]', 'shadow-sm'),
    (r'shadow-\[0_0_40px_rgba\(124\,58\,237\,0\.35\)\]', 'shadow-sm'),
    (r'bg-\[radial-gradient\(circle_at_top_left\,rgba\(124\,58\,237\,0\.28\)\,transparent_34\%\)\,rgba\(255\,255\,255\,0\.035\)\]', 'bg-white'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open('/Users/meemfayalif/Downloads/gt/gstack/frontend/src/components/orders/OrderWorkspace.tsx', 'w') as f:
    f.write(content)

print("Done")
