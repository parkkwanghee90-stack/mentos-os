#!/usr/bin/env python3
# +1 시프트 단원의 avs_answers를 -1 시프트로 정정. corrected[N]=old[N+1], 마지막=도출답.
# 기본 dry-run. --apply 주면 실제 기록(src+public/data+dist/data).
import json, sys, re, math

ROOT = '/Users/mac/mathmentos'
APPLY = '--apply' in sys.argv
UNITS = ['미적분_01수열의극한_통합숙제', '미적분_03지수로그함수미분_통합숙제']

avs = json.load(open(f'{ROOT}/src/data/avs_answers.json'))
mega = json.load(open(f'{ROOT}/scripts/out_mega.json'))
results = mega.get('result', mega)
jobs = json.load(open(f'{ROOT}/scripts/jobs_cal_rest.json'))

def to_num(s):
    if s is None: return None
    s = str(s).strip().replace('①','1').replace('②','2').replace('③','3').replace('④','4').replace('⑤','5')
    s = re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'(\1)/(\2)', s)
    for a,b in [('\\left',''),('\\right',''),('\\,',''),('\\cdot','*'),('\\times','*'),
                ('\\sqrt','sqrt'),('√','sqrt'),('\\ln','log'),('\\log','log'),('ln','log'),
                ('\\pi','pi'),('π','pi'),('{','('),('}',')'),('^','**'),('$',''),('\\',''),(' ','')]:
        s = s.replace(a,b)
    s = re.sub(r'(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_])', 'E', s)
    s = re.sub(r'(\d)(sqrt|log|E|pi|\()', r'\1*\2', s)
    s = re.sub(r'(\))(\d|sqrt|log|E|pi|\()', r'\1*\2', s)
    try: return float(eval(s, {'sqrt':math.sqrt,'log':math.log,'pi':math.pi,'E':math.e,'__builtins__':{}}))
    except Exception: return None

def num_eq(a,b,tol=1e-4):
    return a is not None and b is not None and abs(a-b)<=tol*max(1,abs(a),abs(b))

def latex_to_plain(s):
    if s is None: return s
    s = str(s)
    m = re.search(r'=\s*(.+)$', s)  # "a+b=9" -> "9"
    if m and re.match(r'^[\-0-9./e^{}\\sqrtlnpi() ]+$', m.group(1).strip()):
        s = m.group(1).strip()
    s = re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'\1/\2', s)
    for a,b in [('\\left',''),('\\right',''),('\\,',''),('\\cdot','*'),('$',''),(' ','')]:
        s = s.replace(a,b)
    s = s.replace('\\ln','ln').replace('\\pi','pi').replace('\\sqrt','sqrt')
    s = re.sub(r'\^\{([^{}]*)\}', r'^\1', s)  # e^{2} -> e^2
    s = s.replace('{','').replace('}','')
    return s

for unit in UNITS:
    old = avs[unit]
    rowmap = {}
    for i,j in enumerate(jobs):
        if j['hk']==unit and i<len(results) and results[i]:
            rowmap[j['pid']] = results[i]
    pids = sorted(old.keys(), key=lambda x:int(x))
    maxN = int(pids[-1])
    corrected = {}
    verified=0; ambiguous=[]
    for pid in pids:
        n = int(pid)
        if n < maxN:
            corrected[pid] = old[str(n+1).zfill(3)]
        else:
            r = rowmap.get(pid)
            der = (r.get('answerLatex') or r.get('correctAnswer')) if r else None
            corrected[pid] = latex_to_plain(der) if der else old[pid]
        # verify: agent derived for problem N == corrected[N]?
        r = rowmap.get(pid)
        if r:
            ders = [to_num(r.get('answerLatex')), to_num(r.get('correctAnswer'))]
            if any(num_eq(d, to_num(corrected[pid])) for d in ders): verified += 1
            else: ambiguous.append(pid)
        else:
            ambiguous.append(pid)
    print(f'== {unit.split("_")[1]} (N={maxN}) ==')
    print(f'  corrected via -1 shift; 도출답 검증 일치 {verified}/{maxN}, 미검증(플래그) {len(ambiguous)}')
    print(f'  마지막 {maxN}번 corrected = {corrected[str(maxN).zfill(3)]!r} (도출답)')
    print(f'  flag pids: {",".join(ambiguous)}')
    # Red-Green 샘플
    print('  --- 샘플 (pid: old -> corrected | 도출답) ---')
    for pid in pids[:6]:
        r = rowmap.get(pid); der = (r.get('answerLatex') if r else '')
        print(f'   {pid}: {old[pid]!r} -> {corrected[pid]!r} | {der}')
    if APPLY:
        avs[unit] = corrected
    json.dump({'unit':unit,'corrected':corrected,'flag':ambiguous},
              open(f'{ROOT}/scripts/keyfix_{unit.split("_")[1]}.json','w'), ensure_ascii=False, indent=1)
    print()

if APPLY:
    for p in [f'{ROOT}/src/data/avs_answers.json', f'{ROOT}/public/data/avs_answers.json', f'{ROOT}/dist/data/avs_answers.json']:
        try:
            json.dump(avs, open(p,'w'), ensure_ascii=False, indent=2)
            print('WROTE', p)
        except Exception as e:
            print('skip', p, e)
else:
    print('(dry-run — --apply 로 실제 기록)')
