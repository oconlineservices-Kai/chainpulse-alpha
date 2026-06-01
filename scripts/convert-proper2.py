#!/usr/bin/env python3
"""Remove framer-motion from TSX files. Properly handles nested braces."""
import sys

def index_of_matching_brace(text, start):
    """Find the matching closing brace starting from the { at position start."""
    level = 1
    i = start + 1
    while i < len(text) and level > 0:
        if text[i] == '{':
            level += 1
        elif text[i] == '}':
            level -= 1
        i += 1
    return i if level == 0 else -1

def remove_prop(content, prop_name):
    """Remove all occurrences of prop_name={...} from content."""
    result = ""
    i = 0
    while i < len(content):
        # Check for whitespace + prop_name + =
        if i > 0 and content[i-1:i+len(prop_name)+1] in (f' {prop_name}=', f'\n{prop_name}='):
            # Check if it's the right context (after whitespace/newline)
            pass
        
        # Look for pattern: whitespace + propName + = + {
        rest = content[i:]
        import re
        m = re.match(r'\s+' + prop_name + r'=', rest)
        if m:
            matched = m.group()
            after_eq = i + len(matched)
            if after_eq < len(content) and content[after_eq] == '{':
                # We found prop_name={
                # Find the matching }
                brace_end = index_of_matching_brace(content, after_eq)
                if brace_end > 0:
                    # Skip this entire prop + whitespace before it
                    i = brace_end
                    continue
        
        result += content[i]
        i += 1
    return result

def convert(path):
    with open(path) as f:
        content = f.read()
    original = content
    
    import re
    
    # 1. Remove framer-motion imports
    for pattern in [
        r"import\s+\{[^}]*\b(motion|AnimatePresence)\b[^}]*\}\s+from\s+['\"]framer-motion['\"]\s*;?\s*\n?",
        r"import\s+motion\s+from\s+['\"]framer-motion['\"]\s*;?\s*\n?",
    ]:
        content = re.sub(pattern, '', content)
    
    # 2. Replace <motion.X> with <X>, </motion.X> with </X>
    content = re.sub(r'<motion\.(\w+)', r'<\1', content)
    content = re.sub(r'</motion\.(\w+)>', r'</\1>', content)
    
    # 3. Remove framer-motion props (properly handle nested braces)
    for prop in ['animate', 'initial', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'variants', 'exit', 'key', 'layoutId']:
        content = remove_prop(content, prop)
    
    # 4. Remove <AnimatePresence> and </AnimatePresence>
    content = re.sub(r'<AnimatePresence[^>]*>', '', content)
    content = re.sub(r'</AnimatePresence>', '', content)
    
    # 5. Fix <tag}> -> <tag>
    content = re.sub(r'<(\w+)\}>', r'<\1>', content)
    
    with open(path, 'w') as f:
        f.write(content)
    
    # Verify
    level = 0
    for ch in content:
        if ch == '{': level += 1
        elif ch == '}': level -= 1
    
    status = "OK" if level == 0 else f"UNBALANCED (level={level})"
    print(f"{'✅' if level == 0 else '❌'} {path} [{status}]")
    return level == 0

if __name__ == '__main__':
    ok = True
    for p in sys.argv[1:]:
        if not convert(p):
            ok = False
    sys.exit(0 if ok else 1)
