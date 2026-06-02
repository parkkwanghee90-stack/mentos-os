// Mirror of normalizeMathText in src/components/MathProblemRenderer.jsx (lines 14-43). Keep in sync.

/**
 * normalizeMathText — raw 문자열을 KaTeX 렌더 직전 전처리와 동일하게 정규화.
 * 렌더러가 이 변환을 적용한 뒤 KaTeX에 넘기므로,
 * 검출기·수정기는 이 함수로 정규화한 결과를 기준으로 작동해야 한다.
 *
 * @param {string|null|undefined} raw
 * @returns {string}
 */
export function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);

  // 1. 역슬래시+n 문자열을 실제 줄바꿈으로 변환하되, LaTeX 명령어(\neq, \nabla 등)는 보호
  //    이미 실제 줄바꿈 문자로 변환된 LaTeX 명령어들을 \n 형태로 복구
  txt = txt
    .replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');

  // 2. \[ ... \] 를 $$ ... $$ 로 변환
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$');

  // 3. \( ... \) 를 $ ... $ 로 변환
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 4. $$ ... $$ 내부에 줄바꿈(\\)이 있으면 \begin{aligned} 로 자동 감싸기
  txt = txt.replace(/\$\$([\s\S]+?)\$\$/g, (match, inner) => {
    if (
      inner.includes('\\begin{aligned}') ||
      inner.includes('\\begin{cases}') ||
      inner.includes('\\begin{array}')
    ) {
      return match;
    }
    if (inner.includes('\\\\')) {
      return `$$ \\begin{aligned} ${inner} \\end{aligned} $$`;
    }
    return match;
  });

  return txt;
}
