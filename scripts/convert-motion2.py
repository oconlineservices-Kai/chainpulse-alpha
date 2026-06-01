#!/usr/bin/env python3
"""Convert framer-motion files to CSS animations. Reads stdin and writes stdout."""
import re, sys

def convert(content):
    # Remove framer-motion imports (the full line)
    content = re.sub(r'^import\s+\{[^}]*\b(motion|AnimatePresence)\b[^}]*\}\s+from\s+[\'\"]framer-motion[\'\"]\s*\n', '', content, flags=re.MULTILINE)
    
    # Also handle imports like: import { motion } from 'framer-motion'
    content = re.sub(r"import\s+\{[^}]*\}\s+from\s+['\"]framer-motion['\"];?\s*\n", '', content, flags=re.MULTILINE)
    
    # Replace opening tags: <motion.div ...>  -> <div ...>
    # And self-closing: <motion.div ... /> -> <div ... />
    content = re.sub(r'<motion\.(\w+)', r'<\1', content)
    content = re.sub(r'</motion\.(\w+)>', r'</\1>', content)
    
    # Remove specific framer-motion props that have single {} or ""
    # These are safe: whileHover, whileTap, whileInView, viewport, layoutId, variants, exit, key
    content = re.sub(r'\s+whileHover=\{[^}]*\}', '', content)
    content = re.sub(r'\s+whileTap=\{[^}]*\}', '', content)
    content = re.sub(r'\s+whileInView=\{[^}]*\}', '', content)
    content = re.sub(r'\s+viewport=\{[^}]*\}', '', content)
    content = re.sub(r'\s+layoutId="[^"]*"', '', content)
    content = re.sub(r"\s+layoutId='[^']*'", '', content)
    content = re.sub(r'\s+variants=\{[^}]*\}', '', content)
    content = re.sub(r'\s+exit=\{[^}]*\}', '', content)
    content = re.sub(r'\s+key="[^"]*"', '', content)
    content = re.sub(r"\s+key='[^']*'", '', content)
    
    # AnimatePresence removal (closing tag)
    content = re.sub(r'</AnimatePresence>\n?', '', content)
    content = re.sub(r'<AnimatePresence>\n?', '', content)
    
    # Remove lone motion import leftovers
    content = re.sub(r'^\s*import\s+motion\s+from\s+[\'\"]framer-motion[\'\"];?\n', '', content, flags=re.MULTILINE)
    
    return content

def main():
    for path in sys.argv[1:]:
        if not path.endswith(('.tsx', '.ts')):
            continue
        with open(path, 'r') as f:
            original = f.read()
        result = convert(original)
        if original != result:
            with open(path, 'w') as f:
                f.write(result)
            print(f"Converted: {path}")
        else:
            print(f"No changes: {path}")

if __name__ == '__main__':
    main()
