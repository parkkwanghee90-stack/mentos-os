#!/usr/bin/env python3
# 시프트 단원(01,03,04) 채점키 정정 — 문제별 정렬 판정(blanket shift 금지).
# 각 문제 N: 도출답이 orig[N]과 같으면 정렬(유지), orig[N+1]과 같으면 시프트, 둘 다 아니면 override(도출), 미해결이면 시프트추정+flag.
# dry-run 기본, --apply 기록.
import json, sys, re
ROOT='/Users/mac/mathmentos'
APPLY='--apply' in sys.argv
SHIFTED=['미적분_01수열의극한_통합숙제','미적분_03지수로그함수미분_통합숙제','미적분_04삼각함수미분_통합숙제']

orig=json.load(open('/tmp/avs_orig.json'))
cur=json.load(open(f'{ROOT}/src/data/avs_answers.json'))
mega=json.load(open(f'{ROOT}/scripts/out_mega.json')); results=mega.get('result',mega)
jobs=json.load(open(f'{ROOT}/scripts/jobs_cal_rest.json'))
try: import sympy
except ImportError: sympy=None

def to_num(s):
    if s is None or sympy is None: return None
    s=str(s).strip().replace('①','1').replace('②','2').replace('③','3').replace('④','4').replace('⑤','5')
    if re.search(r'[ㄱ-ㅎ가-힣]', s): return None
    m=re.search(r'=\s*([^=]+)$', s)
    if m: s=m.group(1).strip()
    s=re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'((\1)/(\2))', s)
    for a,b in [('\\left',''),('\\right',''),('\\,',''),('\\cdot','*'),('\\times','*'),('\\pi','pi'),('π','pi'),
                ('\\ln','ln'),('\\log','log'),('\\sqrt','sqrt'),('√','sqrt'),('{','('),('}',')'),('$',''),('\\','')]:
        s=s.replace(a,b)
    s=re.sub(r'(ln|log|sqrt)\s*([0-9.]+)', r'\1(\2)', s)
    s=s.replace('^','**').replace(' ','')
    s=re.sub(r'(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_])','E',s)
    s=re.sub(r'(\d)(sqrt|log|ln|E|pi|\()', r'\1*\2', s)
    try: return float(sympy.N(sympy.sympify(s, locals={'E':sympy.E,'pi':sympy.pi,'ln':sympy.log,'log':sympy.log,'sqrt':sympy.sqrt})))
    except Exception: return None

def kchars(s):  # ㄱㄴㄷ 합답 정규화: 한글자음만 정렬
    return ''.join(sorted(set(re.findall(r'[ㄱ-ㅎ]', str(s or '')))))

def sstr(s):  # 캐노니컬 문자열 정규화(frac->a/b, sqrt{x}->sqrtx, pi/√ 통일)
    if s is None: return ''
    s=str(s)
    s=re.sub(r'\\text\s*\{([^{}]*)\}', r'\1', s)
    s=re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'\1/\2', s)
    s=re.sub(r'\\sqrt\s*\{([^{}]*)\}', r'sqrt\1', s)
    s=s.replace('\\left','').replace('\\right','').replace('\\,','').replace('\\!','').replace('\\;','')
    s=s.replace('\\cdot','').replace('\\times','').replace('\\sqrt','sqrt').replace('√','sqrt')
    s=s.replace('\\pi','pi').replace('π','pi').replace('\\ln','ln').replace('\\log','log')
    s=re.sub(r'[{}$()\s,]','',s).replace('번','').replace('\\','')
    return s.lower()

def same(a,b):
    if a is None or b is None: return False
    ka,kb=kchars(a),kchars(b)
    if ka and kb: return ka==kb
    na,nb=to_num(a),to_num(b)
    if na is not None and nb is not None: return abs(na-nb)<=1e-4*max(1,abs(na),abs(nb))
    return sstr(a)==sstr(b) and sstr(a)!=''

def latex_plain(s):
    if s is None: return s
    s=str(s);
    m=re.search(r'=\s*([^=]+)$', s)
    if m and len(m.group(1))<len(s): s=m.group(1).strip()
    s=s.replace('\\text{','').replace('}','') if '\\text{' in s else s
    s=re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'\1/\2', s)
    for a,b in [('\\left',''),('\\right',''),('\\,',''),('\\cdot','*'),('$',''),(' ','')]: s=s.replace(a,b)
    s=s.replace('\\ln','ln').replace('\\pi','pi').replace('\\sqrt','sqrt')
    s=re.sub(r'\^\{([^{}]*)\}', r'^\1', s)
    return s.replace('{','').replace('}','')

for unit in SHIFTED:
    o=orig[unit]
    rowmap={}
    for i,j in enumerate(jobs):
        if j['hk']==unit and i<len(results) and results[i]: rowmap[j['pid']]=results[i]
    pids=sorted(o.keys(), key=lambda x:int(x))
    maxN=int(pids[-1])
    corrected={}; aligned=[]; shifted=[]; override=[]; flag=[]; clean=[]
    for pid in pids:
        n=int(pid); r=rowmap.get(pid)
        der=(r.get('answerLatex') or r.get('correctAnswer')) if r else None
        onext=o.get(str(n+1).zfill(3)); ocur=o.get(pid)
        if r and r.get('status')!='unclear' and (der not in (None,'')):
            if same(der, ocur):   corrected[pid]=ocur;  aligned.append(pid); clean.append(pid)
            elif same(der,onext): corrected[pid]=onext; shifted.append(pid); clean.append(pid)
            elif onext is not None: corrected[pid]=onext; override.append(pid); clean.append(pid)  # 시프트 추정(orig 포맷 유지), 검토 flag
            else:                 corrected[pid]=latex_plain(der); override.append(pid); clean.append(pid)  # 마지막 문제만 합성
        else:
            corrected[pid]= onext if onext is not None else ocur; flag.append(pid)
    cur[unit]=corrected
    json.dump({'unit':unit,'corrected':corrected,'clean_pids':clean,'aligned':aligned,'shifted':shifted,'override':override,'flag':flag},
              open(f'{ROOT}/scripts/keyfix3_{unit.split("_")[1]}.json','w'), ensure_ascii=False, indent=1)
    print(f'== {unit.split("_")[1]} N={maxN}: aligned {len(aligned)} | shifted {len(shifted)} | override {len(override)} | flag {len(flag)} | clean(upload) {len(clean)}')
    if override: print(f'   override pids: {override}')
    if flag: print(f'   flag pids: {flag}')

if APPLY:
    for p in ['src/data/avs_answers.json','public/data/avs_answers.json','dist/data/avs_answers.json']:
        json.dump(cur, open(f'{ROOT}/{p}','w'), ensure_ascii=False, indent=2); print('WROTE',p)
else: print('(dry-run)')
