// src/components/hints/avsNarration.js
// AVS 해설 나레이션 텍스트 빌더 (Gemini 런타임 TTS 입력용)
//
// 비유: 칠판 풀이를 보고 선생님이 말로 읽어줄 "대본"을 뽑아내는 도구.
//       화면에 그려지는 도형/수식(raw LaTeX)은 빼고, 사람이 말로 설명하는
//       산문(prose)만 모아 자연스러운 낭독 텍스트를 만든다.
//
// 입력을 절대 변형하지 않고(immutable) 새 문자열을 반환한다.

const pushIf = (arr, v) => {
  if (typeof v === 'string' && v.trim()) arr.push(v.trim());
};

// AVS 스텝 배열 → 낭독용 나레이션 텍스트
// (raw LaTeX(type:'latex' 라인, s.latex 필드)은 음성 낭독에 부적합하므로 제외)
export const buildAvsNarration = (steps) => {
  if (!Array.isArray(steps)) return '';
  const out = [];
  for (const s of steps) {
    if (!s || typeof s !== 'object') continue;
    pushIf(out, s.title);
    pushIf(out, s.caption);
    pushIf(out, s.content);
    pushIf(out, s.text);
    if (Array.isArray(s.lines)) {
      for (const l of s.lines) {
        if (l && typeof l === 'object') {
          if (l.type === 'latex') continue; // 음성에서 raw LaTeX 제외
          pushIf(out, l.content);
        } else {
          pushIf(out, l);
        }
      }
    }
  }
  return out.join('\n');
};

// 모의고사 문항 객체 → 낭독용 나레이션 텍스트 (문제문 + 힌트 단계)
// 이미지 전용 문항(텍스트 없음)은 빈 문자열을 반환하여 호출측이 폴백을 선택하게 한다.
export const buildProblemNarration = (q) => {
  if (!q || typeof q !== 'object') return '';
  const out = [];
  pushIf(out, q.text);
  if (q.hint && typeof q.hint === 'object') {
    pushIf(out, q.hint.clue);
    // bg1, bg2, ... bgN 을 숫자 순서대로 (bg5+ 가 추가돼도 누락되지 않게)
    Object.keys(q.hint)
      .filter(k => /^bg\d+$/.test(k))
      .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)))
      .forEach(k => pushIf(out, q.hint[k]));
  }
  return out.join('\n');
};
