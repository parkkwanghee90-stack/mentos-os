'use strict';

// 미적분/확통/수2 AVS 텍스트의 LaTeX 수식을 한국어 구어 낭독으로 변환(순수 함수).
// su1 latexToSpeech를 베이스로 미적분 빈출 기호(적분/극한/자연로그/도함수)를 보강.
function latexToSpeechCalc(text) {
  if (!text) return '';
  let s = String(text);

  // 0) 렌더 지시어/크기명령 제거 + 무한대
  s = s.replace(/\\infty/g, ' 무한대 ')
       .replace(/\\displaystyle/g, ' ')
       .replace(/\\(?:bigg?|Bigg?)[lr]?/g, ' ')   // \big \bigl \bigr \Big \bigg ...
       .replace(/\\left/g, ' ').replace(/\\right/g, ' ')
       .replace(/\\!|\\,|\\;|\\:/g, ' ');

  // 1) 정적분: \int_{a}^{b} → "인테그랄 a부터 b까지,", \int → "인테그랄"
  s = s.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, ' 인테그랄 $1 부터 $2 까지, ')
       .replace(/\\int_([^\s^]+)\^([^\s]+)/g, ' 인테그랄 $1 부터 $2 까지, ')
       .replace(/\\int/g, ' 인테그랄 ');
  // dx/dt 등 미분소
  s = s.replace(/\bd([a-zA-Z])\b/g, ' 디$1 ');

  // 2) 극한: \lim_{x \to a} → "x가 a로 갈 때 극한"
  s = s.replace(/\\lim_\{([^}]*?)\\to([^}]*)\}/g, ' $1 가 $2 로 갈 때 극한 ')
       .replace(/\\lim/g, ' 극한 ')
       .replace(/\\to/g, ' 로 ');

  // 2.5) 시그마(합): \sum_{k=1}^{n} → "시그마 k=1부터 n까지,"  (위끝은 지수 아님 — 여기서 소비)
  //   하한의 '='는 뒤(step10)에서 '는'으로 자연 변환됨(k=1 → 케이는 1).
  s = s.replace(/\\sum_\{([^{}]*)\}\^\{([^{}]*)\}/g, ' 시그마 $1 부터 $2 까지, ')
       .replace(/\\sum_([^\s^]+)\^([^\s{]+)/g, ' 시그마 $1 부터 $2 까지, ')
       .replace(/\\sum/g, ' 시그마 ')
       .replace(/\\prod_\{([^{}]*)\}\^\{([^{}]*)\}/g, ' $1 부터 $2 까지의 곱 ')
       .replace(/\\prod/g, ' 곱 ');

  // 7) 위첨자/아래첨자: x^{2} → "x 제곱"(2일 때) 또는 "x의 n승"
  // (분수보다 먼저 처리하여 분자/분모 안의 중첩 중괄호 x^{2}를 미리 풀어준다)
  // 주의: 제곱(2)도 중괄호형/비중괄호형을 분리해 매칭해야 한다. \{?...\}? 형태는
  // 닫는 중괄호 한쪽만 삼켜 분자/분모의 } 를 파괴할 수 있음(중첩 분수 버그).
  s = s.replace(/\^\{2\}/g, ' 제곱 ')
       .replace(/\^2/g, ' 제곱 ')
       .replace(/\^\{([^{}]*)\}/g, ' 의 $1 승 ')
       .replace(/\^([0-9a-zA-Z])/g, ' 의 $1 승 ')
       .replace(/_\{([^{}]*)\}/g, ' $1 ')
       .replace(/_([0-9a-zA-Z])/g, ' $1 ');

  // 3) 분수: 가장 안쪽 \frac부터 반복 치환(중첩 분수/위첨자 처리 후이므로 중괄호 단순)
  let prev;
  do { prev = s; s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $2 분의 $1 '); } while (s !== prev);

  // 4) 로그/함수
  s = s.replace(/\\ln/g, ' 자연로그 ')
       .replace(/\\log/g, ' 로그 ')
       .replace(/\\sin/g, ' 사인 ').replace(/\\cos/g, ' 코사인 ').replace(/\\tan/g, ' 탄젠트 ');

  // 5) 도함수 프라임: f''(x), f'(x)
  s = s.replace(/([a-zA-Z])''\s*\(/g, ' $1 이계도함수 (')
       .replace(/([a-zA-Z])'\s*\(/g, ' $1 프라임 (');

  // 6) 루트/지수/기타
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, ' 루트 $1 ')
       .replace(/\\pm/g, ' 플러스마이너스 ')
       .replace(/\\times/g, ' 곱하기 ').replace(/\\cdot/g, ' 곱하기 ').replace(/\\div/g, ' 나누기 ')
       .replace(/\\leq?\b/g, ' 이하 ').replace(/\\geq?\b/g, ' 이상 ').replace(/\\neq\b/g, ' 같지 않음 ')
       .replace(/\\pi/g, ' 파이 ').replace(/\\theta/g, ' 세타 ')
       .replace(/\\mathbf\{([^{}]*)\}/g, '$1').replace(/\\boxed\{([^{}]*)\}/g, '$1')
       .replace(/\\text\{([^{}]*)\}/g, '$1');

  // 8) 잔여 LaTeX 기호 제거(연산자 변환 전에 백슬래시/중괄호 정리)
  s = s.replace(/[\\${}]/g, ' ');

  // 9) 암시적 곱셈 → "곱하기" (괄호는 보존해 그룹을 살림. 도함수 프라임은 step5에서 처리됨)
  //    )( , 2( , )2 , )n , 2n 등 인접 항을 곱으로. 함수표기 f( 도 곱으로 읽음(수식 맥락상 대부분 곱).
  s = s.replace(/\)\s*\(/g, ') 곱하기 (')                // )( → ) 곱하기 (
       .replace(/(\d)\s*\(/g, '$1 곱하기 (')              // 2( → 2 곱하기 (
       .replace(/([a-zA-Z])\s*\(/g, '$1 곱하기 (')        // k( → k 곱하기 (
       .replace(/\)\s*(?=[0-9a-zA-Z])/g, ') 곱하기 ')      // )2,)n → ) 곱하기
       .replace(/(\d)([a-zA-Z])/g, '$1 곱하기 $2');        // 2n → 2 곱하기 n

  // 10) 연산자 → 한국어
  s = s.replace(/\s*=\s*/g, ' 는 ')
       .replace(/\s*\+\s*/g, ' 더하기 ')
       .replace(/(?<=[0-9a-zA-Z)\s])-(?=[0-9a-zA-Z(\s])/g, ' 빼기 ')
       .replace(/\s*<\s*/g, ' 보다 작다 ').replace(/\s*>\s*/g, ' 보다 크다 ');

  // 11) 단독 영문 변수 → 한국어 발음(ElevenLabs 영어읽기 방지). 수학 빈출 변수만.
  const VAR = { n:'엔', k:'케이', x:'엑스', y:'와이', t:'티', a:'에이', b:'비', c:'씨',
                f:'에프', g:'지', h:'에이치', m:'엠', i:'아이', j:'제이', r:'알', p:'피', q:'큐',
                S:'에스', T:'티', F:'에프', P:'피', C:'씨', A:'에이', B:'비', N:'엔', M:'엠', R:'알' };
  s = s.replace(/[A-Za-z]/g, (ch) => VAR[ch] || ch);

  // 12) 공백 정리(괄호는 남겨 둠 — TTS가 자연스러운 휴지로 그룹을 살림)
  s = s.replace(/\s+/g, ' ')
       .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
       .trim();
  return s;
}

module.exports = { latexToSpeechCalc };
