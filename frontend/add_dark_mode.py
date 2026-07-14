import os
import re

replacements = {
    r'\bbg-white\b': r'bg-white dark:bg-slate-900',
    r'\bbg-\[\#f8f9fc\]\b': r'bg-[#f8f9fc] dark:bg-slate-950',
    r'\bbg-gray-50\b': r'bg-gray-50 dark:bg-slate-800/50',
    r'\bbg-gray-100\b': r'bg-gray-100 dark:bg-slate-800',
    
    r'\btext-gray-900\b': r'text-gray-900 dark:text-white',
    r'\btext-gray-800\b': r'text-gray-800 dark:text-slate-200',
    r'\btext-gray-700\b': r'text-gray-700 dark:text-slate-300',
    r'\btext-gray-600\b': r'text-gray-600 dark:text-slate-400',
    r'\btext-gray-500\b': r'text-gray-500 dark:text-slate-400',
    
    r'\btext-slate-900\b': r'text-slate-900 dark:text-white',
    r'\btext-slate-850\b': r'text-slate-850 dark:text-white',
    r'\btext-slate-800\b': r'text-slate-800 dark:text-slate-200',
    r'\btext-slate-700\b': r'text-slate-700 dark:text-slate-300',
    r'\btext-slate-600\b': r'text-slate-600 dark:text-slate-400',
    r'\btext-slate-500\b': r'text-slate-500 dark:text-slate-400',
    
    r'\bborder-gray-50\b': r'border-gray-50 dark:border-slate-800/50',
    r'\bborder-gray-100\b': r'border-gray-100 dark:border-slate-800',
    r'\bborder-gray-200\b': r'border-gray-200 dark:border-slate-700',
    r'\bborder-gray-300\b': r'border-gray-300 dark:border-slate-600',
    
    r'\bborder-slate-50\b': r'border-slate-50 dark:border-slate-800/50',
    r'\bborder-slate-100\b': r'border-slate-100 dark:border-slate-800',
    r'\bborder-slate-200\b': r'border-slate-200 dark:border-slate-700',
    r'\bborder-slate-300\b': r'border-slate-300 dark:border-slate-600',

    r'\bhover:bg-gray-50\b': r'hover:bg-gray-50 dark:hover:bg-slate-800',
    r'\bhover:bg-gray-100\b': r'hover:bg-gray-100 dark:hover:bg-slate-700',
    r'\bhover:bg-white\b': r'hover:bg-white dark:hover:bg-slate-800',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        base_class = pattern.replace(r'\b', '').replace('\\', '')
        dark_class = replacement.split(' ')[1]
        
        # Clean up any existing instances of the dark_class that might be next to the base_class
        new_content = re.sub(rf'\b{base_class}\s+{dark_class}\b', base_class, new_content)
        
        # Now replace the base_class with the pair
        new_content = re.sub(pattern, replacement, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    target_files = [
        r"d:\RMS\frontend\src\layouts\OperatorLayout.jsx"
    ]
    
    pages_dir = r"d:\RMS\frontend\src\pages\operator"
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith(".jsx"):
                target_files.append(os.path.join(root, file))
                
    for filepath in target_files:
        replace_in_file(filepath)

if __name__ == "__main__":
    main()
