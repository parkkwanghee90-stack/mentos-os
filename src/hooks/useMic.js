// src/hooks/useMic.js
// [SSOT] STT 완전 수동(버튼) 모드
// - VAD 및 자동 Listening 기능 완벽히 제거
// - 오직 마이크 버튼(toggleMic) 클릭 시에만 whisper STT 호출

import { useState, useCallback, useRef, useEffect } from 'react';
import { recordAndTranscribe, stopRecording } from '@/services/micService';
import { stopSpeaking } from '@/services/ttsService';

export const MIC_STATE = {
  IDLE:          'idle',
  LISTENING:     'listening',   // 하위 호환성 위해 남겨둠 (실제 기능 안함)
  RECORDING:     'recording',   // 실제 Whisper 녹음 중
  TRANSCRIBING:  'transcribing',// OpenAI 통신 중
  READY:         'ready',       // 결과 반환 완료
};

export const useMic = ({ onTranscribed, onError, maxMs = 8000 } = {}) => {
  const [micState, setMicState] = useState(MIC_STATE.IDLE);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState(null);
  
  const abortRef = useRef(false);

  // [SSOT] 더 이상 VAD를 쓰지 않으므로 stub 처리
  const startListening = useCallback(() => {}, []);
  const stopListening = useCallback(() => {}, []);
  const detectSpeechStart = useCallback(() => {}, []);
  
  // 강제 중단 (컴포넌트 언마운트 등)
  const abortMic = useCallback(() => {
    abortRef.current = true;
    stopRecording();
    setMicState(MIC_STATE.IDLE);
  }, []);

  // 버튼용 수동 토글 (여기가 유일한 진입점)
  const toggleMic = useCallback(async () => {
    if (micState === MIC_STATE.RECORDING) {
      // 2차 클릭: 녹음 종료 및 STT 전송을 정상 처리하기 위해 abortRef 변경 없이 stopRecording만 호출
      stopRecording();
      return;
    }
    if (micState === MIC_STATE.TRANSCRIBING) {
      // 통신 중 강제 종료하고 싶을 때만 abort
      abortRef.current = true;
      setMicState(MIC_STATE.IDLE);
      return;
    }

    // 자동 시작 금지, 버튼 누를 때만 시작
    abortRef.current = false;
    stopSpeaking(); // 즉시 TTS 중지
    setMicState(MIC_STATE.RECORDING);
    setTranscript('');
    setMicError(null);

    console.log('MIC_START_BUTTON'); // 로그 최소화 요건

    try {
      const text = await recordAndTranscribe({
        maxMs,
        onStop: () => {
          if (!abortRef.current && micState !== MIC_STATE.IDLE) {
            setMicState(MIC_STATE.TRANSCRIBING);
          }
        },
        onError: (msg) => {
          if (!abortRef.current) {
            setMicError(msg);
            setMicState(MIC_STATE.IDLE);
            console.log('MIC_TRANSCRIBE_FAIL');
          }
        }
      });

      if (abortRef.current) return;

      if (text && text.trim().length > 0) {
        console.log('MIC_TRANSCRIBE_SUCCESS');
        setTranscript(text);
        setMicState(MIC_STATE.READY);
        if (onTranscribed) await onTranscribed(text);
        setMicState(MIC_STATE.IDLE);
      } else {
        console.log('MIC_TRANSCRIBE_FAIL');
        setMicState(MIC_STATE.IDLE);
      }
    } catch (e) {
      if (!abortRef.current) {
        setMicError(e.message || '음성 인식 실패');
        setMicState(MIC_STATE.IDLE);
        console.log('MIC_TRANSCRIBE_FAIL');
      }
    }
  }, [micState, maxMs, onTranscribed]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      stopRecording();
    };
  }, []);

  return {
    micState,
    transcript,
    micError,
    // listening 상태는 항상 false로 두어 자동 진입 금지 및 UI 파란불 안 들어오게 함
    isListening:    false, 
    isRecording:    micState === MIC_STATE.RECORDING,
    isTranscribing: micState === MIC_STATE.TRANSCRIBING,
    isReady:        micState === MIC_STATE.READY,
    startListening,
    stopListening,
    detectSpeechStart,
    toggleMic,
    abortMic
  };
};
