import re

with open('/Users/meemfayalif/Downloads/gt/gstack/frontend/src/components/orders/OrderWorkspace.tsx', 'r') as f:
    content = f.read()

# Fix violet buttons text and color
content = re.sub(r'bg-violet-500(.*?)text-zinc-900', r'bg-violet-600\1text-white', content)
content = re.sub(r'bg-violet-500(.*?)text-zinc-950', r'bg-violet-600\1text-white', content)

# Fix emerald
content = re.sub(r'bg-emerald-400(.*?)text-zinc-950', r'bg-emerald-500\1text-white', content)
content = re.sub(r'bg-emerald-400(.*?)text-zinc-900', r'bg-emerald-500\1text-white', content)

# Other instances of bg-violet-500
content = re.sub(r'bg-violet-500', r'bg-violet-600', content)

# Change text-zinc-950 to text-white in specific cases like hover:bg-violet-100 ? Wait, line 772 is:
# className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-white/70"
# This is a white button, so text-zinc-950 is fine. Wait, text-zinc-950 is actually text-zinc-900.
content = re.sub(r'text-zinc-950', r'text-zinc-900', content)

with open('/Users/meemfayalif/Downloads/gt/gstack/frontend/src/components/orders/OrderWorkspace.tsx', 'w') as f:
    f.write(content)

print("Done")
