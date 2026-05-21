import React, { useRef, useEffect, useState } from 'react';

export default function TeacherMotion({ teacher, teacherState }) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  // subject별 기본 ID 매핑 (파일명 convention에 맞게)
  const DEFAULT_ID_BY_SUBJECT = {
    english:     'eng1',
    math:        'math1',
    physics:     'physics1',
    chemistry:   'chemistry1',
    biology:     'bio1',
    earthScience:'earth1',
  };

  const subject = teacher?.subject || 'english';
  const teacherId = teacher?.id || DEFAULT_ID_BY_SUBJECT[subject] || 'eng1';

  // ID 기반 경로. 최종 프로덕션에서는 .mp4를 사용합니다.
  const videoSrc = `/teachers/${subject}/${teacherId}.mp4`;
  // 현재 Veo 3 생성 결과물인 PNG 포맷 폴백
  const imageFallbackSrc = `/teachers/${subject}/${teacherId}.webp`;

  // 선생님 변경 시 에러 상태 초기화
  useEffect(() => {
    setHasVideoError(false);
    setIsVideoLoaded(false);
  }, [teacherId]);

  // TTS 상태(speaking vs idle)와 비디오 재생 동기화
  useEffect(() => {
    if (hasVideoError || !videoRef.current || !isVideoLoaded) return;
    
    if (teacherState === 'speaking') {
      videoRef.current.play().catch(e => console.log('Video auto-play blocked:', e));
    } else {
      videoRef.current.pause();
      // 가장 자연스러운 무표정/입 닫음 프레임(0초)으로 리셋
      videoRef.current.currentTime = 0; 
    }
  }, [teacherState, isVideoLoaded, hasVideoError]);

  return (
    <div className="teacher-motion" style={{
      width: '100%', 
      height: '180px', 
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      background: '#1a1a24',
      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '1rem'
    }}>
      {/* 우측 상단 상태 표시 UI */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(0,0,0,0.6)',
        padding: '4px 10px',
        borderRadius: '12px',
        zIndex: 10,
        backdropFilter: 'blur(4px)'
      }}>
        <span style={{
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          background: teacherState === 'speaking' ? '#3b82f6' : '#10b981',
          animation: 'pulse 1.5s infinite',
          boxShadow: `0 0 8px ${teacherState === `speaking' ? '#3b82f6' : '#10b981'}'
        }} />
        <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 'bold' }}>
          {teacherState === 'speaking' ? 'SPEAKING' : 'IDLE'}
        </span>
      </div>

      {hasVideoError ? (
        // [테스트 환경 Fallback] MP4 비디오가 없을 경우 고해상도 생성된 PNG + 미세 호흡(CSS) 표시
        <img
          src={imageFallbackSrc}
          alt={teacher?.name || 'Teacher'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            animation: 'idleBreathe 4s infinite alternate ease-in-out'
          }}
        />
      ) : (
        // [프로덕션 환경] 선생님별 단일 MP4 비디오
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={() => setHasVideoError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            animation: 'idleBreathe 4s infinite alternate ease-in-out'
          }}
        />
      )}
      
      <style>{`
        @keyframes idleBreathe {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.025); }
        }
      `}</style>
    </div>
  );
}
