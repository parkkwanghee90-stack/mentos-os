// src/services/ttsService.js
// [SSOT] TTS 규정: TTS는 출력 순서 기반으로만 실행 (1번째, 6번째, 11번째 등)
// [SSOT] 모델/보이스/시스템인스트럭션은 @/config/ttsVoice.js 에서 가져온다.

import { TTS_MODEL, TTS_VOICE, SYSTEM_INSTRUCTION } from '@/config/ttsVoice.js';

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
    onEnd?.();
    return;
  }

  stopSpeaking();
  isAudioPlaying = true;
  console.log('[TTS] START (Turn: ' + outputCount + ')', filteredText.slice(0, 80) + '...');

  // Gemini API Key 로드
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('VITE_GEMINI_API_KEY') : null);

  try {
    onStart?.();

    let blob = null;

    if (geminiApiKey) {
      console.log('[TTS] Attempting Gemini ' + TTS_MODEL + ' Voice API...');
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
              },
              contents: [{
                parts: [{ text: filteredText }]
              }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: TTS_VOICE
                    }
                  }
                }
              }
            })
          }
        );

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
        console.log('[TTS] Gemini ' + TTS_MODEL + ' Voice generated successfully');
      } catch (geminiError) {
        console.warn('[TTS] Gemini 3.1 실패:', geminiError.message);
        throw geminiError; // 폴백 없음 — catch에서 무음 처리
      }
    } else {
      throw new Error('Gemini API key 없음 — 음성 생성 불가');
    }

    if (!blob) throw new Error('오디오 생성 실패');

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
    console.error('[TTS] speakText 실패(무음 처리):', e);
    isAudioPlaying = false;
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

// 보이스는 항상 SSOT(Aoede). 호환을 위해 export/시그니처만 유지한다.
export const getVoiceForTeacher = () => TTS_VOICE;
