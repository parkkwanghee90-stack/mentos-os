import katex from 'katex';
import { normalizeMathText } from './normalize.js';

// 보기 문자 시작 패턴
const OPTION_START = /^[\s①②③④⑤]/;
const OPTION_CHARS_RE = /^[\s]*[①②③④⑤]/;

/**
 * 세그먼트가 보기줄인지 판별 (앞 공백 제거 후 ①~⑤ 로 시작)
 * @param {string} seg
 * @returns {boolean}
 */
function isOptionSegment(seg) {
  return OPTION_CHARS_RE.test(seg);
}

/**
 * 문자열 내 `{`와 `}` 의 개수가 균등한지 확인
 * @param {string} s
 * @returns {boolean}
 */
function hasBraceBalance(s) {
  let depth = 0;
  for (const ch of s) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/**
 * $ 개수 세기 (이스케이프된 \$ 제외)
 * @param {string} s
 * @returns {number}
 */
function countDollars(s) {
  return (s.match(/(?<!\\)\$/g) || []).length;
}

/**
 * normalize(fixed) 에서 변경된 세그먼트의 $…$ 인라인이 katex 를 통과하는지 확인
 * @param {string} normalizedLine  normalizeMathText 적용된 줄
 * @returns {boolean} katex 에러 없으면 true
 */
function katexLineOk(normalizedLine) {
  const inline = /(?<!\\)\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  let m;
  while ((m = inline.exec(normalizedLine)) !== null) {
    try {
      katex.renderToString(m[1], { throwOnError: true });
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * autoFix — RAW 문자열에 APPEND-CLOSE / REMOVE-STRAY 2가지 안전 규칙 적용.
 *
 * 분리자(literal `\n` = 역슬래시+n, 또는 실제 줄바꿈)를 보존하며
 * 보기줄 세그먼트만 수정한다.
 *
 * @param {string} raw
 * @returns {{ output: string, applied: string[], skipped: string[] }}
 */
export function autoFix(raw) {
  if (!raw || typeof raw !== 'string') {
    return { output: raw ?? '', applied: [], skipped: [] };
  }

  // 구분자를 캡처 그룹으로 분리 — 리터럴 \n (역슬래시+n) 과 실제 \n 모두 처리
  // 결과: [seg0, delim0, seg1, delim1, ...]
  const parts = raw.split(/(\\n|\n)/);

  const appliedSet = new Set();
  const skippedSet = new Set();

  const newParts = parts.map((part, idx) => {
    // 홀수 인덱스 = 구분자(\\n 또는 실제 \n) — 그대로 보존
    if (idx % 2 === 1) return part;

    // 보기줄이 아니면 건드리지 않음
    if (!isOptionSegment(part)) return part;

    const dollarCount = countDollars(part);

    // 0개 또는 2개 이상 — 변경 없음 (REVIEW 도메인)
    if (dollarCount !== 1) return part;

    const dollarPos = part.search(/(?<!\\)\$/);
    const afterDollar = part.slice(dollarPos + 1);
    const trailingTrimmed = part.trimEnd();
    const lastNonSpaceChar = trailingTrimmed[trailingTrimmed.length - 1];
    const isDollarLast = lastNonSpaceChar === '$';

    if (isDollarLast) {
      // REMOVE-STRAY: $ 가 줄 끝에 있고 앞에 수식 내용이 없는 경우
      // (달러 이후 공백만 있고, 달러 이전 내용이 비수식 텍스트)
      const beforeDollar = part.slice(0, dollarPos);
      // 달러 앞 텍스트에도 balanced braces check — 일단 단순하게 trailing $ 제거
      const candidate = beforeDollar.trimEnd();
      // katex 검증: normalize(candidate) 에서 inline $ 없으면 OK
      const normalizedCandidate = normalizeMathText(candidate);
      if (katexLineOk(normalizedCandidate)) {
        skippedSet.delete('REMOVE-STRAY');
        appliedSet.add('REMOVE-STRAY');
        return candidate;
      }
      skippedSet.add('REMOVE-STRAY');
      return part;
    } else {
      // APPEND-CLOSE: $ 가 마지막이 아님 → 닫는 $ 보강
      // afterDollar 의 중괄호가 균형 잡혀 있어야 함
      if (!hasBraceBalance(afterDollar)) {
        skippedSet.add('APPEND-CLOSE');
        return part;
      }
      const candidate = part + '$';
      // katex 검증
      const normalizedCandidate = normalizeMathText(candidate);
      if (katexLineOk(normalizedCandidate)) {
        appliedSet.add('APPEND-CLOSE');
        return candidate;
      }
      skippedSet.add('APPEND-CLOSE');
      return part;
    }
  });

  const output = newParts.join('');

  return {
    output,
    applied: Array.from(appliedSet),
    skipped: Array.from(skippedSet),
  };
}
