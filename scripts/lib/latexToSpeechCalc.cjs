'use strict';

// 미적분/확통/수2 AVS 텍스트의 LaTeX 수식을 한국어 구어 낭독으로 변환(순수 함수).
// su1 latexToSpeech를 베이스로 미적분 빈출 기호(적분/극한/자연로그/도함수)를 보강.
function latexToSpeechCalc(text) {
  if (!text) return '';
  let s = String(text);

  // 0) 렌더 지시어 제거
  s = s.replace(/\\displaystyle/g, ' ')
       .replace(/\\left/g, ' ').replace(/\\right/g, ' ')
       .replace(/\\!|\\,|\\;|\\:/g, ' ');

  // 1) 정적분: \int_{a}^{b} → "a부터 b까지 적분", \int → "적분"
  s = s.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, ' $1 부터 $2 까지 적분 ')
       .replace(/\\int_([^\s^]+)\^([^\s]+)/g, ' $1 부터 $2 까지 적분 ')
       .replace(/\\int/g, ' 적분 ');
  // dx/dt 등 미분소
  s = s.replace(/\bd([a-zA-Z])\b/g, ' 디$1 ');

  // 2) 극한: \lim_{x \to a} → "x가 a로 갈 때 극한"
  s = s.replace(/\\lim_\{([^}]*?)\\to([^}]*)\}/g, ' $1 가 $2 로 갈 때 극한 ')
       .replace(/\\lim/g, ' 극한 ')
       .replace(/\\to/g, ' 로 ');

  // 3) 분수: \dfrac/\tfrac/\frac{a}{b} → "b 분의 a"
  s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $2 분의 $1 ');

  // 4) 로그/함수
  s = s.replace(/\\ln/g, ' 자연로그 ')
       .replace(/\\log/g, ' 로그 ')
       .replace(/\\sin/g, ' 사인 ').replace(/\\cos/g, ' 코사인 ').replace(/\\tan/g, ' 탄젠트 ')
       .replace(/\\sum/g, ' 시그마 ').replace(/\\prod/g, ' 곱 ');

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

  // 7) 위첨자/아래첨자: x^{2} → "x 제곱"(2일 때) 또는 "x의 n승"
  s = s.replace(/\^\{?2\}?/g, ' 제곱 ')
       .replace(/\^\{([^{}]*)\}/g, ' 의 $1 승 ')
       .replace(/\^([0-9a-zA-Z])/g, ' 의 $1 승 ')
       .replace(/_\{([^{}]*)\}/g, ' $1 ')
       .replace(/_([0-9a-zA-Z])/g, ' $1 ');

  // 8) 잔여 기호 정리
  s = s.replace(/[\\${}]/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();
  return s;
}

module.exports = { latexToSpeechCalc };
