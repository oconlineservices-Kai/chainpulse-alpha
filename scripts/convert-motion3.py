#!/usr/bin/env python3
"""Remove all framer-motion references from TSX/TS files."""
import re, sys

def convert(content):
    # Remove framer-motion imports (must handle .strip() or .trim() imports)
    content = re.sub(r'^import\s+\{[^}]*\b(motion|AnimatePresence)\b[^}]*\}\s+from\s+[\'\"]framer-motion[\'\"]\s*;?\s*\n', '', content, flags=re.MULTILINE)
    
    # Replace opening tags: <motion.div ...>  -> <div ...>
    content = re.sub(r'<motion\.(\w+)', r'<\1', content)
    content = re.sub(r'</motion\.(\w+)>', r'</\1>', content)
    
    # Remove specific framer-motion props (with {} value)
    # Handle animate={{ ... }} - double curly (JSX object)
    content = re.sub(r'\s+animate=\{\{[^}]*\}\}', '', content) 
    # Handle single curly like animate={{ some.object }}
    content = re.sub(r'\s+animate=\{([^}]|\n)*?\}', '', content)
    
    # Handle initial={{ ... }} 
    content = re.sub(r'\s+initial=\{\{[^}]*\}\}', '', content)
    content = re.sub(r'\s+initial=\{([^}]|\n)*?\}', '', content)
    
    # Handle transition={{ ... }}
    content = re.sub(r'\s+transition=\{\{[^}]*\}\}', '', content)
    content = re.sub(r'\s+transition=\{([^}]|\n)*?\}', '', content)
    
    # Simple single-{}-value framer props
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
    
    # Remove AnimatePresence tags
    content = re.sub(r'</AnimatePresence>', '', content)
    content = re.sub(r'<AnimatePresence>', '', content)
    # Also self-closing
    content = re.sub(r'<AnimatePresence\s*/>', '', content)
    
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
