import os

replacements = {
    'text-white': 'text-gray-900',
    'bg-neutral-900': 'bg-gray-50',
    'bg-neutral-800': 'bg-white',
    'bg-neutral-950': 'bg-white',
    'border-neutral-700': 'border-gray-200',
    'border-neutral-800': 'border-gray-200',
    'border-neutral-800/50': 'border-gray-100',
    'text-neutral-300': 'text-gray-700',
    'text-neutral-400': 'text-gray-500',
    'text-neutral-500': 'text-gray-400',
    'bg-indigo-500/10': 'bg-cyan-50',
    'text-indigo-400': 'text-cyan-600',
    'text-indigo-500': 'text-cyan-600',
    'border-indigo-500/20': 'border-cyan-100',
    'border-indigo-500': 'border-cyan-500',
    'bg-indigo-600': 'bg-cyan-600',
    'hover:bg-neutral-800': 'hover:bg-gray-50',
    'hover:bg-neutral-700': 'hover:bg-gray-100',
    'divide-neutral-800': 'divide-gray-100',
    # Chart colors
    'backgroundColor: \'#171717\'': 'backgroundColor: \'#fff\'',
    'borderColor: \'#333\'': 'borderColor: \'#f3f4f6\'',
    'color: \'#fff\'': 'color: \'#111827\'',
    'stroke="#333"': 'stroke="#f3f4f6"',
    'stroke="#888"': 'stroke="#9ca3af"',
    'fill: \'#888\'': 'fill: \'#6b7280\'',
    'cursor={{fill: \'#262626\'}}': 'cursor={{fill: \'#f3f4f6\'}}',
    'text-green-400': 'text-emerald-600',
    'text-green-500': 'text-emerald-600',
    'bg-green-500/10': 'bg-emerald-50',
    'border-l-green-500': 'border-l-emerald-500',
    'text-yellow-500': 'text-orange-500',
    'bg-yellow-500/10': 'bg-orange-50',
    'border-l-yellow-500': 'border-l-orange-500',
    'border-l-indigo-500': 'border-l-cyan-500',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    pages_dir = r"d:\RMS\frontend\src\pages"
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith(".jsx"):
                filepath = os.path.join(root, file)
                # Skip Login.jsx because it was already carefully crafted
                if file == "Login.jsx":
                    continue
                replace_in_file(filepath)

if __name__ == "__main__":
    main()
