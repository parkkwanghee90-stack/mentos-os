import React from 'react';
import '@/components/TeacherAvatar.css';

// 상태별 배경색 및 이모지
const STATE_CONFIG = {
  idle:        { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', emoji: '💭', label: 'Listening' },
  speaking:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', emoji: '🗣️', label: 'Speaking'  },
  thinking:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', emoji: '🤔', label: 'Thinking'  },
  praise:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '🌟', label: 'Great!'    },
  serious:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  emoji: '📌', label: 'Focus'     },
  recording:   { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', emoji: '🎤', label: 'Student...' },
};

const SUBJECT_COLOR = {
  '과학': '#14b8a6', '수학': '#a855f7', '영어': '#3b82f6',
  '국어': '#f59e0b', '사회': '#ec4899', default: '#8b5cf6'
};

/**
 * TeacherAvatar — 실사풍 튜터 패널
 *
 * Props:
 *  teacher: { name, style, subject, quote, images?: { idle, speaking, thinking, praise, serious } }
 *  state: 'idle' | 'speaking' | 'thinking' | 'praise' | 'serious' | 'recording'
 *  mode:  '진단' | '수업' | '시험'
 *  unit:  string (현재 단원)
 *  intent: string (현재 AI 의도 — 표시용)
 */
export default function TeacherAvatar({ teacher, state = 'idle', mode, unit, intent }) {
  const cfg      = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const subjectC = SUBJECT_COLOR[teacher?.subject] || SUBJECT_COLOR.default;
  const rawImg   = teacher?.images?.[state] || teacher?.images?.idle || teacher?.image;
  const hasImg   = !!rawImg;
  let imgSrc     = rawImg;
  if (rawImg && !rawImg.startsWith('/')) {
    imgSrc = window.resolveAsset(`/hteachers/${teacher?.subject || `)eng`}/${rawImg}`;
  }

  return (
    <div className="teacher-card">

      {/* ── 상단 배지 바 ── */}
      <div className="teacher-card__badges">
        {mode && (
          <span className="tc-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>
            {mode === '시험' ? '⚠️ 시험대비' : mode === '진단' ? '🔍 진단' : '📚 수업'}
          </span>
        )}
        {teacher?.subject && (
          <span className="tc-badge" style={{ background: "${subjectC}15`, color: subjectC, borderColor: `${subjectC}30` }}>
            {teacher.subject}
          </span>
        )}
      </div>

      {/* ── 캐릭터 영역 ── */}
      <div className="teacher-card__visual" style={{ background: cfg.bg, borderColor: `${cfg.color}30` }}>
        {hasImg ? (
          <img
            src={imgSrc}
            alt={`${teacher?.name} ${state}`}
            className="teacher-card__real-img"
            style={{ filter: state === 'thinking' ? 'brightness(0.9)' : 'none' }}
          />
        ) : (
          // 이미지 없을 때 — 선생님 이니셜 + 상태 이모지 카드
          <div className="teacher-card__placeholder">
            <div className="tcp-avatar" style={{ background: "linear-gradient(135deg, ${cfg.color}, ${subjectC})` }}>
              <span className='tcp-initial">{(teacher?.name || 'A')[0]}</span>
            </div>
            <div className={`tcp-state-emoji ${state === `speaking' ? 'tcp-bounce' : state === 'thinking' ? 'tcp-pulse' : ''}'}>
              {cfg.emoji}
            </div>
          </div>
        )}

        {/* 하단 상태 바 */}
        <div className=`teacher-card__status-bar` style={{ background: `${cfg.color}20`, color: cfg.color }}>
          <span className={`tc-status-dot ${state !== `idle' ? 'tc-dot-pulse' : ''}'} style={{ background: cfg.color }} />
          {cfg.label}
        </div>
      </div>

      {/* ── 선생님 정보 ── */}
      <div className="teacher-card__info">
        <div className="tc-name">{teacher?.name || 'AI 튜터'}</div>
        {teacher?.style && <div className="tc-role">{teacher.style}</div>}
      </div>

      {/* ── 현재 단원 / 의도 ── */}
      {(unit || intent) && (
        <div className="teacher-card__context">
          {unit && (
            <div className="tc-context-row">
              <span className="tc-context-label">단원</span>
              <span className="tc-context-val">{unit}</span>
            </div>
          )}
          {intent && (
            <div className="tc-context-row">
              <span className="tc-context-label">지금</span>
              <span className="tc-context-val" style={{ color: cfg.color }}>{intent}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
