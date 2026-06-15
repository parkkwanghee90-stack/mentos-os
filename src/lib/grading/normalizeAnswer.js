// 숙제 채점용 순수 정규화·비교 모듈.
// SSOT(avs_answers.json) 정답 포맷은 보존하고, 비교 시점에만 정규화한다.

const CIRCLE = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };

// 전각 숫자/기호 → 반각
const toHalfWidth = (s) =>
  s
    .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xff10 + 0x30))
    .replace(/＝/g, '=')
    .replace(/，/g, ',')
    .replace(/＋/g, '+')
    .replace(/－/g, '-');

// LaTeX 수식을 학생이 칠 수 있는 평문으로 환원
const latexToPlain = (s) => {
  let out = s.replace(/\$+/g, ''); // $, $$ 구분자 제거
  out = out.replace(/\\sqrt\s*\{([^}]+)\}/g, '√$1'); // \sqrt{5} → √5
  out = out.replace(/\\sqrt\s*(\w+)/g, '√$1'); // \sqrt 5 → √5
  out = out.replace(/\\[dt]?frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1/$2'); // \frac{a}{b} → a/b
  out = out
    .replace(/\\log/g, 'log')
    .replace(/\\ln/g, 'ln')
    .replace(/\\pi/g, 'π')
    .replace(/\\times/g, '')
    .replace(/\\cdot/g, '')
    .replace(/\\left|\\right/g, '');
  out = out.replace(/\\[a-zA-Z]+/g, ''); // 남은 알 수 없는 명령 제거
  out = out.replace(/\\/g, ''); // 남은 백슬래시 제거
  out = out.replace(/[{}]/g, ''); // 중괄호 제거
  out = out.replace(/_/g, ''); // 아래첨자 표식 제거 (log_2 → log2)
  return out;
};

export function normalizeAnswer(str) {
  if (str === null || str === undefined) return '';
  let clean = String(str);
  clean = latexToPlain(clean);
  clean = clean.replace(/루트/g, '√').replace(/sqrt/gi, '√'); // 학생 입력 동의어
  clean = toHalfWidth(clean);
  clean = clean.replace(/\s+/g, '').trim(); // 모든 공백 제거
  clean = clean.replace(/^[a-zA-Z]+[:=]/, ''); // x= , f: 등 접두 제거
  clean = clean.replace(/^=/, ''); // 선행 = 제거
  if (!isNaN(clean) && clean.includes('.')) {
    const num = parseFloat(clean);
    if (Number.isInteger(num)) clean = String(num);
  }
  if (clean.startsWith('+') && !isNaN(clean.substring(1))) {
    clean = clean.substring(1);
  }
  if (CIRCLE[clean]) clean = CIRCLE[clean];
  return clean;
}

// ㄱㄴㄷ 보기형 여부 (정규화 후, 구분자 제외 전부 한글 자음)
const SEP = /[\s,、·]/g;
function isChoiceSet(normalized) {
  const stripped = normalized.replace(SEP, '');
  return stripped.length > 0 && /^[ㄱ-ㅎ]+$/.test(stripped);
}
function canonicalChoiceSet(normalized) {
  const chars = normalized.match(/[ㄱ-ㅎ]/g) || [];
  return chars.sort().join('');
}

export function gradeAnswer(userAnswer, correctAnswer) {
  // "또는" 복수정답: 어느 한쪽이라도 맞으면 정답
  const rawParts = String(correctAnswer ?? '').split('또는');
  if (rawParts.length > 1) {
    return rawParts.some((p) => gradeAnswer(userAnswer, p));
  }

  const nu = normalizeAnswer(userAnswer);
  const nc = normalizeAnswer(correctAnswer);
  if (nu.length === 0 || nc.length === 0) return false;

  // ㄱㄴㄷ 집합: 순서·콤마 무관 비교
  if (isChoiceSet(nc) && isChoiceSet(nu)) {
    return canonicalChoiceSet(nu) === canonicalChoiceSet(nc);
  }

  return nu === nc;
}
