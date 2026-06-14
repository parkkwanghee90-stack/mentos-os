#!/usr/bin/env python3
# 시프트 단원 답안키 정정 (agent-override). 도출답이 진실; old[N+1]은 일치 시 깔끔한 포맷 소스.
# dry-run 기본, --apply 로 기록. 단원별 {corrected, clean_pids, flag_pids} 저장.
import json, sys, re

ROOT = '/Users/mac/mathmentos'
APPLY = '--apply' in sys.argv
# 단원 인자 우선; 없으면 shift_report.json에서 best_off!=0(시프트) 단원 자동선택; 그래도 없으면 기본 01,03
_args = [a for a in sys.argv[1:] if not a.startswith('--')]
if _args:
    UNITS = _args
else:
    try:
        _rep = json.load(open(f'{ROOT}/scripts/shift_report.json'))
        UNITS = [u for u, v in _rep.items() if v.get('best') not in (0, None) and u.startswith('미적분')]
    except Exception:
        UNITS = []
    if not UNITS:
        UNITS = ['미적분_01수열의극한_통합숙제', '미적분_03지수로그함수미분_통합숙제']

orig = json.load(open('/tmp/avs_orig.json'))
cur = json.load(open(f'{ROOT}/src/data/avs_answers.json'))  # to write back into
mega = json.load(open(f'{ROOT}/scripts/out_mega.json')); results = mega.get('result', mega)
jobs = json.load(open(f'{ROOT}/scripts/jobs_cal_rest.json'))

try:
    import sympy
    def to_num(s):
        if s is None: return None
        s = str(s).strip().replace('①','1').replace('②','2').replace('③','3').replace('④','4').replace('⑤','5')
        m = re.search(r'=\s*([^=]+)$', s)
        if m: s = m.group(1).strip()  # "a+b=9" -> "9"
        s = re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'((\1)/(\2))', s)
        s = s.replace('\\left','').replace('\\right','').replace('\\,','').replace('\\!','')
        s = s.replace('\\cdot','*').replace('\\times','*').replace('\\pi','pi').replace('π','pi')
        s = s.replace('\\ln','ln').replace('\\log','log').replace('\\sqrt','sqrt').replace('√','sqrt')
        s = s.replace('{','(').replace('}',')').replace('$','').replace('\\','')
        s = re.sub(r'(ln|log|sqrt)\s*([0-9.]+)', r'\1(\2)', s)   # ln5 -> ln(5)
        s = re.sub(r'(ln|log|sqrt)\s*\(', r'\1(', s)
        s = s.replace('^','**').replace(' ','')
        s = re.sub(r'(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_])', 'E', s)
        try:
            return float(sympy.N(sympy.sympify(s, locals={'E': sympy.E, 'pi': sympy.pi, 'ln': sympy.log, 'log': sympy.log, 'sqrt': sympy.sqrt})))
        except Exception:
            return None
except ImportError:
    def to_num(s): return None

def latex_plain(s):
    if s is None: return s
    s = str(s)
    m = re.search(r'=\s*([^=]+)$', s)
    if m and len(m.group(1)) < len(s): s = m.group(1).strip()
    s = re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'\1/\2', s)
    for a,b in [('\\left',''),('\\right',''),('\\,',''),('\\cdot','*'),('$',''),(' ','')]:
        s = s.replace(a,b)
    s = s.replace('\\ln','ln').replace('\\pi','pi').replace('\\sqrt','sqrt')
    s = re.sub(r'\^\{([^{}]*)\}', r'^\1', s)
    return s.replace('{','').replace('}','')

def num_eq(a,b,tol=1e-4):
    return a is not None and b is not None and abs(a-b) <= tol*max(1,abs(a),abs(b))

for unit in UNITS:
    o = orig[unit]
    rowmap = {}
    for i,j in enumerate(jobs):
        if j['hk']==unit and i<len(results) and results[i]: rowmap[j['pid']] = results[i]
    pids = sorted(o.keys(), key=lambda x:int(x))
    maxN = int(pids[-1])
    corrected={}; clean=[]; flag=[]; override=[]
    for pid in pids:
        n=int(pid); r=rowmap.get(pid)
        der = (r.get('answerLatex') or r.get('correctAnswer')) if r else None
        dnum = to_num(der)
        onext = o.get(str(n+1).zfill(3))
        if r and r.get('status')!='unclear' and dnum is not None:
            if onext is not None and num_eq(dnum, to_num(onext)):
                corrected[pid]=onext; clean.append(pid)           # 일치: 시프트값(깔끔포맷)
            else:
                corrected[pid]=latex_plain(der); clean.append(pid); override.append(pid)  # 도출 우선
        else:
            corrected[pid]= onext if onext is not None else o[pid]  # 미해결: 시프트 추정
            flag.append(pid)
    cur[unit]=corrected
    json.dump({'unit':unit,'corrected':corrected,'clean_pids':clean,'flag_pids':flag,'override_pids':override},
              open(f'{ROOT}/scripts/keyfix2_{unit.split("_")[1]}.json','w'), ensure_ascii=False, indent=1)
    print(f'== {unit.split("_")[1]} (N={maxN}) ==')
    print(f'  clean(업로드대상) {len(clean)} | override(도출≠시프트, flag) {len(override)}:{override} | unclear-flag {len(flag)}:{flag}')
    print(f'  샘플: ', {p:f"{o[p]}->{corrected[p]}" for p in pids[:5]})

if APPLY:
    for p in ['src/data/avs_answers.json','public/data/avs_answers.json','dist/data/avs_answers.json']:
        json.dump(cur, open(f'{ROOT}/{p}','w'), ensure_ascii=False, indent=2); print('WROTE', p)
else:
    print('(dry-run)')
