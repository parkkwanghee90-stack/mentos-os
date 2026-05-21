// src/services/ttsService.js
// [SSOT] TTS 규정: TTS는 출력 순서 기반으로만 실행 (1번째, 6번째, 11번째 등)

const API_KEY  = () => import.meta.env.VITE_OPENAI_API_KEY;
const BASE_URL = () => import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';

const VOICE_MAP = {
  default:  'nova',
  female:   'shimmer',
  male:     'onyx',
  friendly: 'nova',
  strict:   'echo',
};

let currentAudio = null;
let currentObjectUrl = null;
let isMuted = false;
let isAudioPlaying = false;
let outputCount = 0;

export const filterTtsContent = (text) => {
  if (!text) return null;
  let processed = text
    .replace(/\[[^\]]+\]/g, '') // [LISTEN_PROMPT], [QUESTION] 등 괄호 태그 제거
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold 제거
    .replace(/'{1,3}[^']*'{1,3}/g, '') // code blocks 제거
    .replace(/#{1,6}\s/g, ''); // headings 제거

  return processed.trim().slice(0, 4096) || null;
};

//  음성 재생 함수
export const speakText = async (text, { voice, onStart, onEnd, onError, isReplay, phase } = {}) => {
  if (isMuted) {
    onEnd?.();
    return;
  }

  // 출력 횟수 기반 TTS 스킵 로직 (수동 다시듣기 제외, 히어링 단계 제외)
  const isSkipExempt = isReplay || phase === 'hearing';

  if (!isSkipExempt) {
    outputCount++;
    if ((outputCount - 1) % 5 !== 0) {
      console.log(`[TTS] SKIPPED - Turn ${outputCount} (Only plays on 1st, 6th, etc.)`);
      onEnd?.();
      return;
    }
  }

  const filteredText = filterTtsContent(text);
  
  if (!filteredText) {
    console.log('[TTS] SKIPPED - No text after filtering');
    onEnd?.();
    return;
  }

  if (isAudioPlaying) {
    console.log('[TTS] SKIPPED - already playing');
    // We shouldn't drop the queue silently or we should wait? But user usually wants onEnd?
    onEnd?.();
    return;
  }

  stopSpeaking();
  isAudioPlaying = true;
  console.log('[TTS] START (Turn: ' + outputCount + ')', filteredText.slice(0, 80) + '...');

  const selectedVoice = voice || VOICE_MAP.default;

  try {
    onStart?.();

    const res = await fetch(`${BASE_URL()}/audio/speech`, {
      method: `POST`,
      headers: {
        Authorization:  `Bearer ${API_KEY()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: selectedVoice,
        input: filteredText,
        // High quality setting if needed? Using mp3 format.
        response_format: 'mp3',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `TTS API ${res.status}`);
    }

    const blob = await res.blob();

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }

    currentObjectUrl = URL.createObjectURL(blob);
    currentAudio = new Audio(currentObjectUrl);

    currentAudio.onended = () => {
      currentAudio = null;
      isAudioPlaying = false;
      onEnd?.();
    };
    currentAudio.onerror = (e) => {
      console.error('[TTS] Audio error:', e);
      currentAudio = null;
      isAudioPlaying = false;
      onEnd?.();
      onError?.(e);
    };

    await currentAudio.play();

  } catch (e) {
    console.error('[TTS] speakText error:', e);
    isAudioPlaying = false;
    _browserFallback(filteredText, onEnd);
    onError?.(e);
  }
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  isAudioPlaying = false;
  window.speechSynthesis?.cancel();
};

export const replaySpeaking = (text, options = {}) => {
  stopSpeaking();
  return speakText(text, { ...options, isReplay: true });
};

export const isSpeaking = () => !!(currentAudio && !currentAudio.paused);

export const setMuted = (v) => {
  isMuted = !!v;
  if (isMuted) stopSpeaking();
};

export const getMuted = () => isMuted;

export const getVoiceForTeacher = (teacher) => {
  if (!teacher || !teacher.gender) {
    console.warn('[TTS WARN] teacher missing or gender not specified. Fallback dynamically based on name.');
    const name = teacher?.name || '';
    if (name.includes('도진') || name.includes('석진')) return VOICE_MAP.male;
    if (name.includes('윤아') || name.includes('유나')) return VOICE_MAP.female;
    return VOICE_MAP.female;
  }

  let voiceId = teacher.gender === 'male' ? VOICE_MAP.male : VOICE_MAP.female;

  console.log('[TTS VOICE]');
  console.log('teacher:', teacher.name);
  console.log('gender:', teacher.gender);
  console.log('voice:', voiceId);

  return voiceId;
};

const _browserFallback = (filteredText, onEnd) => {
  if (!window.speechSynthesis || !filteredText) { onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(filteredText);
  u.lang  = 'ko-KR'; 
  u.rate  = 1.0;
  u.onend = () => onEnd?.();
  window.speechSynthesis.speak(u);
};
