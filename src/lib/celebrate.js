// 🎉 축하 이벤트 버스 — 레벨업/정복/퀘스트 완료 순간 모달+효과음을 트리거.
// 비React 코드(rewards.award 등)에서도 호출 가능하도록 window CustomEvent 사용.

export function celebrate(detail) {
  try {
    window.dispatchEvent(new CustomEvent('mentos:celebrate', { detail }));
  } catch {
    /* SSR/비브라우저 무시 */
  }
}

export const celebrateLevelUp = (level) =>
  celebrate({ type: 'levelup', emoji: '⭐', title: `레벨 업!  Lv.${level}`, subtitle: '꾸준함이 실력이 됩니다' });

export const celebrateConquest = (unit) =>
  celebrate({ type: 'conquest', emoji: '🏆', title: `${unit} 정복!`, subtitle: '약점 하나를 완전히 정복했어요' });

export const celebrateQuest = (title, coins) =>
  celebrate({ type: 'quest', emoji: '🎁', title: '퀘스트 완료!', subtitle: `${title} · +${coins} 코인` });

// Web Audio로 짧은 상승 코드 차임(애셋 불필요). 사용자 액션 직후 호출되므로 자동재생 정책 OK.
export function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.start(t);
      o.stop(t + 0.3);
    });
    setTimeout(() => { try { ctx.close(); } catch { /* noop */ } }, 1400);
  } catch {
    /* 오디오 불가 환경 무시 */
  }
}
