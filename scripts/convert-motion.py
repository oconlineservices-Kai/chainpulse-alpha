#!/usr/bin/env python3
import re, sys

def convert_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove framer-motion imports
    content = re.sub(r"import\s+\{[^}]*motion[^}]*\}\s+from\s+['\"]framer-motion['\"]\s*\n", '', content)
    content = re.sub(r"import\s+\{[^}]*AnimatePresence[^}]*\}\s+from\s+['\"]framer-motion['\"]\s*\n", '', content)
    
    # Replace motion.X opening tags with regular tags
    content = re.sub(r'<motion\.(\w+)(\s|>)', r'<\1\2', content)
    # Replace motion.X closing tags
    content = re.sub(r'</motion\.(\w+)>', r'</\1>', content)
    
    # Remove framer-motion specific props (single-line)
    props_to_remove = [
        r'\s+whileHover=\{[^}]*\}',
        r'\s+whileTap=\{[^}]*\}',
        r'\s+whileInView=\{[^}]*\}',
        r'\s+viewport=\{[^}]*\}',
        r'\s+layoutId="[^"]*"',
        r'\s+variants=\{[^}]*\}',
        r'\s+exit=\{[^}]*\}',
        r'\s+key="[^"]*"',
    ]
    for prop in props_to_remove:
        content = re.sub(prop, '', content)
    
    # Remove animate/props with nested braces (multi-line)
    # These are harder - try simpler approach: remove props with single {}
    content = re.sub(r'\s+(animate|initial|transition)=\{[^{}]*\}', '', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Converted: {filepath}")

if __name__ == '__main__':
    for f in sys.argv[1:]:
        convert_file(f)
