#!/usr/bin/env python3
# 시프트 단원의 도출답을 수치 평가해 stored[N] / stored[N+1] 중 어디에 맞는지 분류.
# 사용: python3 scripts/verify_shift.py <unit_hk>
import json, sys, re, math

ROOT = '/Users/mac/mathmentos'
avs = json.load(open(f'{ROOT}/src/data/avs_answers.json'))
mega = json.load(open(f'{ROOT}/scripts/out_mega.json'))
results = mega.get('result', mega)
jobs = json.load(open(f'{ROOT}/scripts/jobs_cal_rest.json'))

unit = sys.argv[1]  # 예: 미적분_01수열의극한_통합숙제
key = avs[unit]

# index→result for this unit
rowmap = {}
for i, j in enumerate(jobs):
    if j['hk'] == unit and i < len(results) and results[i]:
        rowmap[j['pid']] = results[i]

def to_num(s):
    """수식 문자열을 float로 평가(가능하면). 실패 시 None."""
    if s is None: return None
    s = str(s).strip()
    s = s.replace('①','1').replace('②','2').replace('③','3').replace('④','4').replace('⑤','5')
    # LaTeX 정리
    s = re.sub(r'\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}', r'(\1)/(\2)', s)
    s = s.replace('\\left','').replace('\\right','').replace('\\,','').replace('\\!','')
    s = s.replace('\\cdot','*').replace('\\times','*')
    s = s.replace('\\sqrt','sqrt').replace('√','sqrt')
    s = s.replace('\\ln','log').replace('\\log','log').replace('ln','log')
    s = s.replace('\\pi','pi').replace('π','pi')
    s = s.replace('{','(').replace('}',')')
    s = s.replace('^','**')
    s = s.replace('$','').replace('\\','').replace(' ','')
    s = s.replace('e**','E**')  # protect e as Euler
    # standalone e -> E
    s = re.sub(r'(?<![a-zA-Z0-9_])e(?![a-zA-Z0-9_])', 'E', s)
    # implicit multiplication: number before sqrt/log/E/pi/(  e.g. 2sqrt -> 2*sqrt, 2( -> 2*(
    s = re.sub(r'(\d)(sqrt|log|E|pi|\()', r'\1*\2', s)
    s = re.sub(r'(\))(\d|sqrt|log|E|pi|\()', r'\1*\2', s)
    env = {'sqrt': math.sqrt, 'log': math.log, 'pi': math.pi, 'E': math.e, '__builtins__': {}}
    try:
        v = eval(s, env)
        return float(v)
    except Exception:
        return None

def cands(r):
    return [r.get('correctAnswer'), r.get('answerLatex')]

def num_eq(a, b, tol=1e-4):
    if a is None or b is None: return False
    return abs(a-b) <= tol*max(1, abs(a), abs(b))

pids = sorted(key.keys())
N = len(pids)
aligned=[]; shifted=[]; ambiguous=[]
detail=[]
for pid in pids:
    n = int(pid)
    r = rowmap.get(pid)
    if not r:
        ambiguous.append(pid); detail.append((pid,'NO_RESULT','','',''));  continue
    cur = key.get(pid)
    nxt = key.get(str(n+1).zfill(3))
    dnums = [to_num(c) for c in cands(r) if c]
    dnums = [x for x in dnums if x is not None]
    cur_n = to_num(cur); nxt_n = to_num(nxt)
    m_cur = any(num_eq(d,cur_n) for d in dnums)
    m_nxt = any(num_eq(d,nxt_n) for d in dnums)
    if m_cur and not m_nxt: aligned.append(pid); tag='ALIGNED(N)'
    elif m_nxt and not m_cur: shifted.append(pid); tag='SHIFT(N+1)'
    elif m_cur and m_nxt: aligned.append(pid); tag='BOTH'
    else: ambiguous.append(pid); tag='AMBIG'
    detail.append((pid, tag, cur, nxt, '|'.join(str(c) for c in cands(r) if c)[:30]))

print(f'== {unit.split("_")[1]} (N={N}, results={len(rowmap)}) ==')
print(f'  ALIGNED(N): {len(aligned)}  SHIFT(N+1): {len(shifted)}  AMBIG: {len(ambiguous)}')
print('  ambiguous pids:', ','.join(ambiguous))
print('  --- sample detail (pid | tag | stored[N] | stored[N+1] | derived) ---')
for d in detail[:12]:
    print('   ', ' | '.join(str(x) for x in d))
# 저장
json.dump({'unit':unit,'aligned':aligned,'shifted':shifted,'ambiguous':ambiguous,'detail':detail},
          open(f'{ROOT}/scripts/verify_{unit.split("_")[1]}.json','w'), ensure_ascii=False, indent=1)
