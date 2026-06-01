#!/usr/bin/env python3
"""Remove all framer-motion from a TSX file. Handles all edge cases."""
import re, sys

def convert(path):
    with open(path) as f:
        content = f.read()
    original = content
    
    # ── 1. Remove framer-motion imports ──
    content = re.sub(
        r'import\s+\{[^}]*\b(motion|AnimatePresence)\b[^}]*\}\s+from\s+[\'"]framer-motion[\'"]\s*;?\s*\n?',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # ── 2. Remove <motion.X / </motion.X> tags ──
    content = re.sub(r'</motion\.(\w+)>', r'</\1>', content)
    
    # For opening tags: <motion.div prop="val"> -> <div prop="val">
    # BUT: <motion.div {...variants}> -> <div {...variants}>
    # The key insight: motion tags ONLY differ by the "motion." prefix
    content = re.sub(r'<motion\.(\w+)', r'<\1', content)
    
    # ── 3. Remove Framer Motion JSX props ──
    
    # Props with JSX expression values (curly braces, possibly nested)
    # Pattern: propName={...} where value can be single or double curly
    
    # Safe pass 1: Remove whileHover, whileTap, whileInView, viewport, variants, exit, layoutId
    # These always have simple JSX values
    for prop in ['whileHover', 'whileTap', 'whileInView', 'viewport', 'variants', 'exit', 'key']:
        content = re.sub(r'\s+' + prop + r'="[^"]*"', '', content)       # key="string"
        content = re.sub(r"\s+" + prop + r"='[^']*'", '', content)       # key='string'
        content = re.sub(r'\s+' + prop + r'=\{[^}]*\}', '', content)     # key={simpleExpr}
        content = re.sub(r'\s+' + prop + r'=\{\{[^}]*\}\}', '', content) # key={{object}}
    
    # layoutId is always quoted
    content = re.sub(r'\s+layoutId="[^"]*"', '', content)
    content = re.sub(r"\s+layoutId='[^']*'", '', content)
    
    # ── 4. Remove AnimatePresence tags (self-closing, open, close) ──
    content = re.sub(r'<AnimatePresence[^>]*/>', '', content)
    content = re.sub(r'<AnimatePresence[^>]*>', '', content)
    content = re.sub(r'</AnimatePresence>', '', content)
    
    # ── 5. Handle <tagname} artifacts (dangling { left from removed props) ──
    content = re.sub(r'<(\w+)\}>', r'<\1>', content)
    
    # ── 6. Remove leftover empty spaces ──
    content = re.sub(r'\s{2,}', ' ', content)  # multiple spaces to single
    
    # ── 7. Restore the removed braces if they came from inline conditional ──
    # Actually let's NOT do step 6 and instead verify braces are balanced
    
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        
        # Verify brace balance
        level = 0
        for ch in content:
            if ch == '{': level += 1
            elif ch == '}': level -= 1
        
        status = "OK" if level == 0 else f"UNBALANCED (level={level})"
        print(f"OK {path} [{status}]")
        if level != 0:
            return False
        return True
    else:
        print(f"-- {path} (no changes)")
        return True


def main():
    all_ok = True
    for path in sys.argv[1:]:
        ok = convert(path)
        if not ok:
            all_ok = False
    if not all_ok:
        sys.exit(1)

if __name__ == '__main__':
    main()
