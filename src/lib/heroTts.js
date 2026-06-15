/**
 * heroTts.js — 랜딩 Hero AVS의 "음성 설명 듣기" 재생기.
 *
 * 현재: 이미 생성돼 있는(클로드 작성 PCBSA → Gemini TTS) 문제별 mp3를
 *       Supabase 공개 버킷 `math-tts`에서 그대로 재생한다. (문제 1개당 통짜 음성)
 *
 * 향후: 단계별 음성이 필요하면 playHeroTtsGemini(text)를 구현해
 *       아래 인터페이스(play/stop/isPlaying)만 그대로 두고 교체하면 된다.
 */
const TTS_BASE =
  (import.meta.env.VITE_SUPABASE_URL || '') + '/storage/v1/object/public/math-tts';

let current = null;

/** math-tts 버킷의 상대경로(예: 'circle_s4/015.mp3') 음성을 재생한다. */
export function playHeroTts(relPath, { onEnd } = {}) {
  stopHeroTts();
  const audio = new Audio(`${TTS_BASE}/${relPath}`);
  current = audio;
  const done = () => {
    if (current === audio) current = null;
    onEnd && onEnd();
  };
  audio.onended = done;
  audio.onerror = done;
  audio.play().catch(done); // 자동재생 차단 등 실패 시 조용히 종료
  return audio;
}

export function stopHeroTts() {
  if (current) {
    try { current.pause(); } catch { /* noop */ }
    current = null;
  }
}

export function isHeroTtsPlaying() {
  return !!current;
}

// 향후 단계별 합성용 자리:
// export async function playHeroTtsGemini(text, opts) { ... }
