import React, { useState } from 'react';
import { BookOpen, Zap, Clock, Target, CheckCircle, AlertTriangle, BarChart3, ChevronRight, MessageSquare, PlayCircle, Sparkles, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const MANUAL_PAGES = [
  {
    title: "AVS: AI Vision Solution",
    icon: <PlayCircle size={48} color="#8b5cf6" />,
    content: [
      "멘토스 AI만의 독보적인 시각적 풀이 엔진입니다.",
      "문제가 막힐 때 'AVS 보기'를 클릭하세요.",
      "정답을 맞혔더라도 내 풀이와 AI의 풀이를 비교해보는 것이 중요합니다.",
      "단계별 질문을 통해 모르는 부분만 콕 집어 물어볼 수 있습니다."
    ]
  },
  {
    title: "학습 루프 및 정답 입력",
    icon: <Target size={48} color="#3b82f6" />,
    content: [
      "제시된 문제를 보고 제한 시간 안에 정답을 입력하세요.",
      "로컬 채점 시스템이 즉시 정답 여부를 판단합니다.",
      "오답이거나 모를 경우 AVS를 확인하여 원리를 파악합니다.",
      "질문하기 버튼은 AI 멘토와 직접 대화할 때만 사용하세요."
    ]
  },
  {
    title: "주 2회, 2시간 초밀착 관리 수업",
    icon: <Clock size={48} color="#10b981" />,
    content: [
      "멘토스 AI는 매주 2회, 각 2시간 동안 체계적으로 운영됩니다.",
      "120분의 유기적인 수업 흐름(진단 -> 개념프레임 -> 기출특훈 -> 취약분석 -> 맞춤보강)을 이수해야 합니다.",
      "오프라인과 온라인이 결합된 맞춤형 밀착 클리닉으로 성적 향상을 완벽히 이끕니다.",
      "정해진 2시간 동안 집중하여 당일 목표를 해결하는 훈련을 합니다."
    ]
  },
  {
    title: "취약 분석 및 맞춤 보강",
    icon: <BarChart3 size={48} color="#f59e0b" />,
    content: [
      "5문제마다 AI가 나의 학습 데이터를 정밀 분석합니다.",
      "오답률이 높거나 반복해서 틀리는 단원을 찾아냅니다.",
      "분석 결과에 따라 나만을 위한 '맞춤 보강 세트'가 자동 발급됩니다.",
      "약점을 메우지 않으면 다음 단계로 넘어갈 수 없습니다."
    ]
  },
  {
    title: "선착순 1000명 한정! 런칭 이벤트",
    icon: <Gift size={48} color="#ef4444" />,
    content: [
      "초개인화 AI 매칭 출시 기념 선착순 1,000명 한정 파격 혜택!",
      "이벤트가: 월 45,000원으로 전 과목 AI 매칭 서비스를 평생 소장하세요.",
      "3개월 한정 운영 후 정상 가격 월 99,000원으로 자동 인상됩니다.",
      "한정 수량 조기 소진 시 예고 없이 즉시 마감되므로 기회를 놓치지 마세요."
    ]
  },
  {
    title: "학생/학부모 대시보드",
    icon: <Zap size={48} color="#6366f1" />,
    content: [
      "오늘 푼 문제 수와 정답률을 실시간으로 확인하세요.",
      "취약 단원 TOP 3와 다음 추천 학습이 대시보드에 표시됩니다.",
      "수업 종료 시 학부모님께 학습 요약 리포트가 전송됩니다.",
      "숙제 미제출 4회 누적 시 경고 시스템이 작동합니다."
    ]
  },
  {
    title: "수업 준비 완료!",
    icon: <CheckCircle size={48} color="#ec4899" />,
    content: [
      "하루 최대 60문제까지 집중하여 학습할 수 있습니다.",
      "2주마다 실력진단테스트로 나의 등급 변화를 확인하세요.",
      "이제 나만의 AI 수학 선생님을 만나러 가볼까요?",
      "아래 [수업 시작하기] 버튼을 눌러 학년을 선택하세요."
    ]
  }
];

export default function LessonManual({ onComplete }) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < MANUAL_PAGES.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const page = MANUAL_PAGES[currentPage];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'linear-gradient(135deg, #09090b, #111827, #1e1b4b)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', padding: '1rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.03)',
        borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)',
        padding: '2.5rem', backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)',
        animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem' }}>
          {MANUAL_PAGES.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '5px', borderRadius: '3px',
              background: i <= currentPage ? 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.08)',
              transition: 'all 0.4s ease'
            }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {page.icon}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            {page.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {page.content.map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#cbd5e1', lineHeight: '1.6' }}>
                <CheckCircle size={18} color="#10b981" style={{ marginTop: '4px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.98rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 마지막 페이지용 정책 안내 글래스 카드 (버튼형) */}
        {currentPage === MANUAL_PAGES.length - 1 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '1.2rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              멘토스 AI는 <strong style={{ color: '#60a5fa' }}>KS BrainTech</strong>에서 운영합니다.
            </p>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#64748b' }}>
              아래 정책을 확인해주세요.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link to="/terms" target="_blank" style={{
                flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 'bold', textDecoration: 'none',
                transition: 'background 0.2s', textAlign: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
              >
                이용약관
              </Link>
              <Link to="/refund" target="_blank" style={{
                flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 'bold', textDecoration: 'none',
                transition: 'background 0.2s', textAlign: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
              >
                환불정책
              </Link>
              <Link to="/privacy" target="_blank" style={{
                flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 'bold', textDecoration: 'none',
                transition: 'background 0.2s', textAlign: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
              >
                개인정보방침
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '1.2rem', borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed, #db2777)',
            color: 'white', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 58, 237, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.4)';
          }}
        >
          {currentPage === MANUAL_PAGES.length - 1 ? '수업 시작하기' : '다음'}
          <ChevronRight size={20} />
        </button>

        {currentPage < MANUAL_PAGES.length - 1 && (
          <button
            onClick={onComplete}
            style={{
              width: '100%', marginTop: '1rem', background: 'transparent', border: 'none',
              color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600'
            }}
          >
            매뉴얼 건너뛰기
          </button>
        )}
      </div>

      {/* 매뉴얼 최하단 초소형 인라인 푸터 (빠른 몰입 저해 방지용) */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#475569',
        fontSize: '0.75rem',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        opacity: 0.6,
        transition: 'opacity 0.2s',
        pointerEvents: 'auto',
        zIndex: 10001
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = 1}
      onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        <Link to="/terms" target="_blank" style={{ color: '#64748b', textDecoration: 'none' }}>이용약관</Link>
        <span>|</span>
        <Link to="/privacy" target="_blank" style={{ color: '#64748b', textDecoration: 'none' }}>개인정보처리방침</Link>
        <span>|</span>
        <Link to="/refund" target="_blank" style={{ color: '#64748b', textDecoration: 'none' }}>환불정책</Link>
        <span>|</span>
        <span>운영사: KS BrainTech</span>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

