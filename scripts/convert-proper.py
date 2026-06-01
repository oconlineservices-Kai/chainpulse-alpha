#!/usr/bin/env python3
"""Convert framer-motion TSX files. Only touches import lines and motion.* tags + props."""
import re, sys

# Load file
def convert(path):
    with open(path) as f:
        content = f.read()
    original = content
    
    # 1. Remove framer-motion import line(s)
    content = re.sub(
        r"import\s+\{[^}]*\b(motion|AnimatePresence)\b[^}]*\}\s+from\s+['\"]framer-motion['\"]\s*;?\s*\n?",
        '',
        content
    )
    content = re.sub(
        r"import\s+motion\s+from\s+['\"]framer-motion['\"]\s*;?\s*\n?",
        '',
        content
    )
    
    # 2. Replace <motion.X ...> with <X ...> and </motion.X> with </X>
    content = re.sub(r'<motion\.(\w+)', r'<\1', content)
    content = re.sub(r'</motion\.(\w+)>', r'</\1>', content)
    
    # 3. Remove known framer-motion props (simple values in {} or "")
    for prop in ['animate', 'initial', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'variants', 'exit', 'key', 'layoutId']:
        # Remove prop="value"
        content = re.sub(r'\s+' + prop + r'="[^"]*"', '', content)
        content = re.sub(r"\s+" + prop + r"='[^']*'", '', content)
        # Remove prop={value} (single level of braces)
        content = re.sub(r'\s+' + prop + r'=\{[^}]*\}', '', content)
        # Remove prop={{...}} (nested double braces)
        content = re.sub(r'\s+' + prop + r'=\{\{[^}]*\}\}', '', content)
    
    # 4. Remove <AnimatePresence> / </AnimatePresence>
    content = re.sub(r'<AnimatePresence[^>]*>', '', content)
    content = re.sub(r'</AnimatePresence>', '', content)
    
    # 5. Remove dangling prop artifacts: <div}> -> <div>
    # Only the pattern <tag}> (closing brace immediately after tag name)
    content = re.sub(r'<(\w+)\}>', r'<\1>', content)
    
    with open(path, 'w') as f:
        f.write(content)
    
    # Verify
    level = 0
    for ch in content:
        if ch == '{': level += 1
        elif ch == '}': level -= 1
    
    if level != 0:
        print(f"❌ {path}: brace imbalance = {level}")
        return False
    else:
        print(f"✅ {path}")
        return True

if __name__ == '__main__':
    ok = True
    for p in sys.argv[1:]:
        if not convert(p):
            ok = False
    sys.exit(0 if ok else 1)
