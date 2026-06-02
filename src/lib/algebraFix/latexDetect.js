import katex from 'katex';

// $…$ 단위로 KaTeX 검증, + 정규식 패턴(P1,P3,P5) 검출. 각 finding에 안전등급 부여.
// P1: 줄 단위 $ 홀수(짝 불균형) — AUTO 후보(줄 끝 댕글링 보정 가능 시)
// P3: $ 밖 plaintext 수식 토큰(frac/sqrt/pi/^/_) — REVIEW(경계 모호)
// P5: $…$ 내부 KaTeX 파싱 실패 — REVIEW(의미 추론 필요)
const PLAINTEXT_MATH = /(?:\bfrac[0-9]|\bsqrt|\\?pi\b|[A-Za-z0-9]\^[0-9A-Za-z])/;

export function detectIssues(text) {
  if (!text || typeof text !== 'string') return [];
  const issues = [];

  // P1: 줄 단위 $ 개수 홀수
  text.split('\n').forEach((line, idx) => {
    const dollars = (line.match(/(?<!\\)\$/g) || []).length;
    if (dollars % 2 === 1) {
      issues.push({ code: 'P1', grade: 'AUTO', line: idx, snippet: line.trim() });
    }
  });

  // P3: $ 구간을 제거한 잔여 텍스트에서 plaintext 수식 토큰
  const outside = text.replace(/(?<!\\)\$[^$]*\$/g, ' ');
  if (PLAINTEXT_MATH.test(outside)) {
    issues.push({ code: 'P3', grade: 'REVIEW', snippet: outside.trim().slice(0, 120) });
  }

  // P5: $…$ 내부 KaTeX 검증
  const inline = /(?<!\\)\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  let m;
  while ((m = inline.exec(text)) !== null) {
    try {
      katex.renderToString(m[1], { throwOnError: true });
    } catch (e) {
      issues.push({ code: 'P5', grade: 'REVIEW', latex: m[1], error: e.message });
    }
  }
  return issues;
}
