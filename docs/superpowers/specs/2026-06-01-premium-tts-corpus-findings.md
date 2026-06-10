# Premium Lecture TTS — Corpus Findings (blocking data decisions)

- Date: 2026-06-01
- Context: During plan execution (Group D audit), the Supabase premium-lecture corpus
  was found to be inconsistent. `getSafePath()` produces empty/colliding paths for
  several baseIds, and the JSON corpus has mangled filenames, duplicates, and gaps.
  User approved Option A (explicit slug SSOT). This document records ground truth and
  the decisions needed before mass generation.

## getSafePath failures (verified)

| baseId | getSafePath | issue |
|---|---|---|
| 도함수의활용 / 확률의뜻 / 정규분포 / 통계적추정 (+확통_*) | `""` | empty → root collision |
| 도함수의활용1 | `1` | junk numeric folder |
| 시그마용법 & 수열의합 | both `sigma` | collide |
| 부정적분과정적분 | `def_integral_def_integral` | doubled (unique, ugly) |

Root orphans `step_1..15.mp3` and folders `1/2/3` are debris from these.

## Stored JSON corpus (53 files) → identified by content `id`

Clean source available (map modal lecture → source JSON file):

| Modal lecture | source JSON | steps | audio folder today |
|---|---|---|---|
| 고차방정식 | higher_order_eq.json | 6 | higher_order_eq ✅ |
| 일차부등식 | linear_ineq.json | 5 | — |
| 이차부등식 | quad_ineq.json (id 일이차부등식) | 4 | — |
| 경우의수 | prob_cases.json | 4 | prob_cases ✅ |
| 행렬 | matrix.json | 6 | — |
| 점과좌표 | points_coord.json | 6 | — |
| 직선의방정식 | line_eq.json | 6 | — |
| 원의방정식 | circle_eq.json | 10 | — |
| 도형의이동 | geom_transform.json | 7 | geom_transform ✅ |
| 지수 | exponent.json | 5 | — |
| 로그 | logarithm.json | 7 | — |
| 지수함수 | exponent_.json | 22 | — |
| 로그함수 | logarithm_.json | 22 | — |
| 등차등비 | arith_geom_seq.json (id 등차등비) | 11 | — |
| 시그마용법 | sigma.json (id 시그마용법) | 5 | — |
| 수학적귀납법 | math_induction.json | 7 | — |
| 함수의극한 | limit.json | 9 | — |
| 함수의연속 | `.json` (empty-name file!) | 6 | — |
| 정적분의활용 | def_integral_.json | 10 | — |
| 부정적분과정적분 | def_integral_def_integral.json (id 부정적분과정적분) | 8 | — |
| 미적분_수열의극한 | calculus_sequence_limit.json | 10 | — |
| 미적분_급수 | calculus_series.json | 10 | — |
| 미적분_도함수활용 | calculus_.json | 10 | — |
| 미적분_적분법 | various_integral_.json | 15 | — |
| 미적분_정적분활용 | calculus_def_integral_.json | 10 | — |
| 순열 | permutation.json | 4 | — |
| 조합 | combination.json | 8 | — |
| 이항정리 | binomial_thm.json | 12 | — |
| 조건부확률 | conditional_prob_.json | 9 | — |

Extra lectures present but NOT in modal index: 독립시행의 확률 (independent_trials_.json, 19;
audio independent_trials ✅), 미적분 4단계 (calculus_step4.json, 9), 미적분_지수로그극한
(calculus_exponentlogarithmlimit.json / exponentlogarithm_limit.json), 수열의극한
(sequence_limit.json), 수열의 합 (sequence_.json), 귀납적정의 (recursive_def.json; audio ✅),
등차수열 (sequence.json), 미적분_정적분 dup (def_integral.json), 미분계수 (derivative_coeff.json).

## DECISIONS NEEDED

### A. Missing source JSON — cannot generate audio (7 modal lectures)
삼각함수성질, 삼각함수그래프, 삼각함수의 활용, 미적분_미분법(여러가지미분법),
확률의 뜻, 정규분포, 통계적 추정.
→ Options: (a) author/upload JSON for these later (out of this scope), or
  (b) hide them from the modal until JSON exists, or (c) leave them showing the
  "음성 준비 중" state.

### B. Duplicate sources — pick canonical (content differs where noted)
1. 미적분_정적분: `def_integral.json` (15) vs `calculus_def_integral.json` (15) — likely identical.
2. 미적분_삼각함수공식: `calculus_trig_func_.json` (15) vs `trig_func_.json` (10) — **differ**.
3. 미적분_삼각함수극한: `calculus_trig_funclimit.json` (10) vs `trig_func_limit.json` (10).
4. 도함수의활용(1/2/3): `1.json/2.json/3.json` vs `derivative_app_1/2/3.json` — duplicates.
5. 미분계수: `derivative_coeff_.json` (미분계수와도함수, 15) vs `derivative_coeff.json`
   (미분계수, 9) vs `derivative_01.json` (10).

### C. toBaseId over-collapse (affects routing)
- `등차등비` → toBaseId → `등차수열` (would point at sequence.json, not arith_geom_seq.json).
- `시그마용법` → toBaseId → `수열의합`.
→ Resolution under the slug SSOT: key the slug table by the MODAL lecture id directly
  (not by toBaseId), so the 41 modal entries each map deterministically to a source
  JSON + clean slug. toBaseId remains a fallback for non-modal entry points.

## Proposed scheme (pending decisions A & B)
- New SSOT data file maps each modal lecture id → { slug, sourceJson }.
- Migration step: for each lecture, fetch sourceJson, re-upload to
  `premium_lectures/{slug}.json`, generate audio to `audio/premium_lectures/{slug}/`.
- Player/generator/audit all resolve via the slug SSOT (ASCII slugs pass through
  resolveAsset/getSafePath unchanged).
- Preserve already-correct slugs (higher_order_eq, prob_cases, geom_transform) by
  reusing them as the slug for those lectures.
- Cleanup of root orphans + `1/2/3` folders optional.
