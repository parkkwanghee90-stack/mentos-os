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

  // Gemini API Key 로드
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('VITE_GEMINI_API_KEY') : null);

  try {
    onStart?.();

    let blob = null;

    if (geminiApiKey) {
      console.log('[TTS] Attempting Gemini 3.1 Voice API...');
      try {
        // gemini-2.5-flash-preview-tts 사용 중지 → gemini-3.1-flash-tts-preview (200+오디오 정상)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "너는 수학 학습을 돕는 친절하고 활기찬 여자 대학생 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 자연스러운 한국어 구어로 낭독해줘. 절대로 인사말이나 해설, 추가 설명, 잡담을 덧붙이지 말고, 오직 주어진 텍스트 자체만 있는 그대로 읽어줘. 수식은 한국어 수학 읽기 표준에 맞춰 자연스럽게 읽어줘."
              }]
            },
            contents: [{
              parts: [{
                text: filteredText
              }]
            }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede"
                  }
                }
              }
            }
          })
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          throw new Error(errorJson?.error?.message || `Gemini API HTTP ${response.status}`);
        }

        const data = await response.json();
        const audioPart = data.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
          throw new Error("No audio data in Gemini response");
        }

        const base64Data = audioPart.inlineData.data;
        const mimeType = audioPart.inlineData.mimeType || 'audio/ogg; codecs=opus';

        // Base64 decoding
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
        console.log('[TTS] Gemini 2.5 Voice generated successfully');
      } catch (geminiError) {
        console.warn('[TTS] Gemini 2.5 Voice failed, falling back to OpenAI:', geminiError.message);
      }
    } else {
      console.log('[TTS] No Gemini API key found, skipping Gemini...');
    }

    // 정책: TTS는 Gemini 2.5 전용 (OpenAI 폴백 사용 안 함).
    // Gemini 실패/미설정 시 OpenAI를 호출하지 않고, 아래 catch에서 브라우저 음성으로만 폴백.
    if (!blob) {
      throw new Error('Gemini 2.5 TTS 실패/미설정 — OpenAI 미사용(정책), 브라우저 음성으로 폴백');
    }

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
      console.error('[TTS] Audio playback error:', e);
      currentAudio = null;
      isAudioPlaying = false;
      onEnd?.();
      onError?.(e);
    };

    await currentAudio.play();

  } catch (e) {
    // 정책: TTS는 Gemini 2.5 전용. 브라우저 음성(수식 오독·저품질) 폴백 절대 사용 안 함.
    console.error('[TTS] Gemini 2.5 TTS 실패 — 브라우저 폴백 미사용(무음 처리):', e.message);
    isAudioPlaying = false;
    onEnd?.();
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

// 브라우저 음성(수식 오독·저품질) 폴백은 정책상 사용하지 않음 — 무음 처리.
const _browserFallback = (_filteredText, onEnd) => { onEnd?.(); };
