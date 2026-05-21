import os
import glob
import re
import json

d = 'public/math_hints/삼각함수활용 4단계(68)'
files = glob.glob(os.path.join(d, '*.json'))

fixed_count = 0

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    
    modified = False
    
    # 1. Fix literal "\n" strings that were incorrectly escaped
    if '{\\n' in c or '{\\r\\n' in c:
        c = c.replace('\\n', '\n')
        c = c.replace('\\r', '\r')
        c = c.replace('\\"', '"')
        modified = True
        
    try:
        json.loads(c)
    except json.JSONDecodeError as e:
        # 2. Fix actual unescaped newlines inside strings
        fixed = ''
        in_string = False
        for i in range(len(c)):
            if c[i] == '"' and c[i-1] != '\\':
                in_string = not in_string
            
            if in_string and c[i] == '\n':
                fixed += '\\n'
            elif in_string and c[i] == '\r':
                pass # just remove carriage returns inside strings
            else:
                fixed += c[i]
        c = fixed
        modified = True

    try:
        json.loads(c)
    except json.JSONDecodeError as e:
        # 3. Manual fixes for specific known errors
        if 'ABCP???이?,' in c:
            c = c.replace('ABCP???이?,', 'ABCP???이",')
            modified = True
        if '\\cos \\theta = \\frac{30}{30\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\\\' in c:
            c = c.replace('\\cos \\theta = \\frac{30}{30\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\\\"', '\\cos \\theta = \\frac{30}{30\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\\\",')
            modified = True

    try:
        json.loads(c)
        if modified:
            with open(f, 'w', encoding='utf-8') as fp:
                fp.write(c)
            print('Fixed:', f)
            fixed_count += 1
    except json.JSONDecodeError as e:
        print('Still broken:', f, e)

print(f"Total fixed: {fixed_count}")
