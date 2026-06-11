import { lazy } from 'react';

// 새 배포가 나가면 옛 청크 해시 파일이 사라진다. 그때 캐시된 index.html 을 들고 있는
// 사용자가 lazy import 를 시도하면 "Failed to fetch dynamically imported module" 로 깨진다.
// → 청크 로드 실패를 감지하면 세션당 한 번만 새로고침해 최신 index.html/청크를 받아온다.
//   (무한 새로고침 방지를 위해 최근 10초 내 재시도한 경우엔 에러를 그대로 던져 ErrorBoundary 가 처리)
const RELOAD_AT_KEY = 'mentos_chunk_reloaded_at';

function isChunkLoadError(err) {
  const msg = (err && err.message) || '';
  return /failed to fetch dynamically imported module|error loading dynamically imported module|module script failed|importing a module script failed|loading chunk/i.test(msg);
}

export function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (!isChunkLoadError(err)) throw err;

      let last = 0;
      try { last = Number(sessionStorage.getItem(RELOAD_AT_KEY) || 0); } catch { /* sessionStorage 차단 환경 */ }
      const now = Date.now();
      if (now - last < 10000) throw err; // 직전에 이미 리로드했는데도 실패 → 루프 방지

      try { sessionStorage.setItem(RELOAD_AT_KEY, String(now)); } catch { /* noop */ }
      window.location.reload();
      // 리로드가 진행되는 동안 Suspense fallback 을 유지(영원히 pending)
      return new Promise(() => {});
    }
  });
}

export default lazyWithRetry;
