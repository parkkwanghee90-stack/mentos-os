// src/hooks/useSession.js
// Session 훅 — sessionEngine SSOT 기반, UI 독립적 타이머 + Checkpoint 저장
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  resumeOrCreate, updateSession, saveCheckpoint, endSession,
  getElapsed, getRemaining, formatTime, isNearEnd, isExpired,
  getRecommendedPhase, SESSION_STATUS, END_REASON, TIME_PHASE_MAP
} from '@/engine/sessionEngine';

const TICK_MS            = 1000;
const CHECKPOINT_SAVE_MS = 30 * 1000; // 30초

export const useSession = ({
  subject, unit, grade, level, teacher, studyMode, isDirectLoad,
  studentState, messages,
  onPhaseRecommend, // (phase) — 권장 단계 변경 시 호출 (실제 전환은 앱이 결정)
  onNearEnd,
  onExpired,
}) => {
  const [session, setSession] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [resumedFromCheckpoint, setResumedFromCheckpoint] = useState(false);
  const [recommendedPhase, setRecommendedPhase] = useState(TIME_PHASE_MAP[0]);

  const nearEndFiredRef    = useRef(false);
  const expiredFiredRef    = useRef(false);
  const prevPhaseRef       = useRef(null);
  const tickRef            = useRef(null);
  const checkpointRef      = useRef(null);

  const sessionRef = useRef(null);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // ── 초기화 ────────────────────────────────────────
  useEffect(() => {
    const { session: s, resumed } = resumeOrCreate({
      subject, unit, grade, level, teacher, studyMode, isDirectLoad,
    });
    setSession(s);
    setRemaining(getRemaining(s));
    setResumedFromCheckpoint(resumed);

    // 1초 타이머 (startTime 기준으로 계산 → 새로고침 후에도 정확)
    tickRef.current = setInterval(() => {
      const cur = sessionRef.current;
      if (!cur || cur.status !== SESSION_STATUS.ACTIVE) return;

      const rem = getRemaining(cur);
      const el  = getElapsed(cur);

      setRemaining(rem);
      setElapsed(el);

      // 권장 단계 전환 알림 (실제 전환은 호출부가 판단)
      const rec = getRecommendedPhase(el);
      if (rec.phase !== prevPhaseRef.current) {
        prevPhaseRef.current = rec.phase;
        setRecommendedPhase(rec);
        onPhaseRecommend?.(rec.phase, rec);
      }

      // 10분 전 경고 (한 번만)
      if (isNearEnd(cur) && !nearEndFiredRef.current) {
        nearEndFiredRef.current = true;
        onNearEnd?.();
      }

      // 만료
      if (isExpired(cur) && !expiredFiredRef.current) {
        expiredFiredRef.current = true;
        clearInterval(tickRef.current);
        onExpired?.();
      }
    }, TICK_MS);

    // 30초마다 Checkpoint 저장
    checkpointRef.current = setInterval(() => {
      const cur = sessionRef.current;
      if (!cur) return;
      saveCheckpoint({
        session:          cur,
        lastQuestionId:   studentState?.currentQuestionId || null,
        lastQuestionType: studentState?.currentQuestionType || 'concept',
        currentUnit:      unit,
        currentLevel:     studentState?.currentLevel || level,
        studyMode,
        pendingTest:      !cur.testDone,
        summarySoFar:     messages?.map(m => m.role === 'user' ? '학생: ${m.content}' : '').filter(Boolean).slice(-3).join(' '),
        studentState,
      });
    }, CHECKPOINT_SAVE_MS);

    // 브라우저 종료/이탈 → USER_EXIT 저장
    const handleUnload = () => {
      const cur = sessionRef.current;
      if (!cur || cur.status !== SESSION_STATUS.ACTIVE) return;
      // sync save (beforeunload는 async 불가)
      const checkpoint = {
        sessionId:        cur.sessionId,
        lastQuestionId:   studentState?.currentQuestionId || null,
        lastQuestionType: studentState?.currentQuestionType || 'concept',
        currentUnit:      unit,
        currentLevel:     studentState?.currentLevel || level,
        studyMode,
        timeSpent:        Math.round(getElapsed(cur) / 1000),
        remainingTime:    getRemaining(cur),
        pendingTest:      !cur.testDone,
        summarySoFar:     '',
        studentState,
        savedAt:          Date.now(),
      };
      try { localStorage.setItem('mentos_checkpoint', JSON.stringify(checkpoint)); } catch {}
      // Mark interrupted
      try {
        const updated = { ...cur, status: SESSION_STATUS.INTERRUPTED, endReason: END_REASON.USER_EXIT };
        localStorage.setItem('mentos_session', JSON.stringify(updated));
      } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(tickRef.current);
      clearInterval(checkpointRef.current);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // ── 세션 종료 API ─────────────────────────────────
  const finishSession = useCallback((reason = END_REASON.COMPLETED, { testResults = [], answers = [], mistakes = [] } = {}) => {
    clearInterval(tickRef.current);
    clearInterval(checkpointRef.current);
    const ended = endSession({ reason, testResults, answers, mistakes });
    setSession(ended);
    return ended;
  }, []);

  // ── 세션 필드 업데이트 ────────────────────────────
  const patchSession = useCallback((partial) => {
    const updated = updateSession(partial);
    if (updated) setSession(updated);
    return updated;
  }, []);

  return {
    session,
    remaining,
    elapsed,
    recommendedPhase,
    resumedFromCheckpoint,
    formatTime,
    finishSession,
    patchSession,
  };
};
