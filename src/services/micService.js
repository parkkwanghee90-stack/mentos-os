// src/services/micService.js
// Whisper 기반 음성 입력 서비스
// 마이크 녹음 → OpenAI Whisper → 텍스트 반환

const API_KEY  = () => import.meta.env.VITE_OPENAI_API_KEY;
const BASE_URL = () => import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';

// 녹음 최대 시간 (ms)
const MAX_RECORD_MS = 8000;

let mediaRecorder  = null;
let audioStream    = null;
let isRecording    = false;

// ── 메인: 녹음 시작 → Whisper → 텍스트 반환 ─────────────────
export const recordAndTranscribe = ({ onStart, onStop, onResult, onError, maxMs = MAX_RECORD_MS } = {}) => {
  return new Promise((resolve, reject) => {
    const runAsync = async () => {
      if (isRecording) {
        stopRecording();
        return;
      }

      try {
        // 마이크 스트림 획득
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isRecording = true;
        onStart?.();

        const chunks = [];

        // MediaRecorder MIME 타입 선택 (브라우저 호환)
        const mimeType = getSupportedMimeType();
        mediaRecorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {});

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          isRecording = false;
          stopStream();
          onStop?.();

          if (chunks.length === 0) {
            onError?.('녹음 데이터가 없습니다.');
            reject(new Error('no audio'));
            return;
          }

          try {
            const text = await transcribeChunks(chunks, mimeType);
            onResult?.(text);
            resolve(text);
          } catch (e) {
            onError?.(e.message);
            reject(e);
          }
        };

        mediaRecorder.start(100); // 100ms마다 chunk

        // 최대 시간 후 자동 종료
        setTimeout(() => {
          if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
          }
        }, maxMs);

      } catch (e) {
        isRecording = false;
        stopStream();
        const msg = e.name === 'NotAllowedError'
          ? '마이크 접근 권한이 필요합니다. 브라우저 설정에서 허용해주세요.'
          : `마이크 오류: ${e.message}`;
        onError?.(msg);
        reject(new Error(msg));
      }
    };
    runAsync().catch(reject);
  });
};

// ── 수동 중지 ─────────────────────────────────────────
export const stopRecording = () => {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
  }
};

export const getIsRecording = () => isRecording;

// ── Whisper API 호출 ──────────────────────────────────
const transcribeChunks = async (chunks, mimeType) => {
  const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });

  // 파일 확장자 결정
  const ext = mimeType?.includes('mp4') ? 'mp4'
    : mimeType?.includes('ogg')  ? 'ogg'
    : 'webm';

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.${ext}`);
  formData.append('model', 'whisper-1');
  formData.append('language', 'ko'); // 한국어 우선 (정확도 향상)
  formData.append('response_format', 'json');

  const res = await fetch(`${BASE_URL()}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Whisper API ${res.status}`);
  }

  const data = await res.json();
  const text = data.text?.trim();

  if (!text) throw new Error('음성 인식 결과가 비어있습니다.');
  return text;
};

// ── 유틸 ─────────────────────────────────────────────
const getSupportedMimeType = () => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
};

const stopStream = () => {
  audioStream?.getTracks().forEach(t => t.stop());
  audioStream = null;
};
