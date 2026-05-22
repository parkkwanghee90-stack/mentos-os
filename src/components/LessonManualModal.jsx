import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Monitor, PlayCircle, Clock, CheckCircle, HelpCircle, BarChart2, Layout, Home, AlertTriangle, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ManualPage = ({ title, icon: Icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '1rem', borderRadius: '16px', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
        <Icon size={32} />
      </div>
      <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>{title}</h2>
    </div>
    <div style={{ flex: 1, fontSize: '1.2rem', lineHeight: '1.8', color: '#475569', whiteSpace: 'pre-wrap' }}>
      {children}
    </div>
  </div>
);

export default function LessonManualModal({ onClose, onStartLearning }) {
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const pages = [
    {
      title: "1. AVS (AI Vision Solution)란?",
      icon: PlayCircle,
      content: 'AVS = AI Vision Solution\n\n단순한 해설이 아닌, 풀이의 전 과정을 '시각화'하여 보여주는 시스템입니다. 칠판 위에 실시간으로 그려지는 도형과 수식의 흐름을 보며 직관적으로 원리를 이해할 수 있습니다.'
    },
    {
      title: "2. 프리미엄 AI 강의노트",
      icon: BookOpen,
      content: '본격적인 문제 풀이 전, '프리미엄 AI 강의노트'를 확인하세요.\n\n- 단원별 핵심 개념 정리\n- 반드시 암기해야 할 공식\n- 실전 문제에 바로 적용 가능한 접근법 확인'
    },
    {
      title: "3. 문제 풀이 방식",
      icon: Clock,
      content: '모든 실전 문제는 \'제한 시간\'이 적용됩니다.\n\n- 2단계: 4분 | 3단계: 5분 | 4단계: 6분\n- 시간 내에 집중해서 문제를 풀고 하단 정답 입력란에 정답을 입력하세요.'
    },
    {
      title: "4. 정답 후 학습 흐름",
      icon: CheckCircle,
      content: "정답을 맞췄다고 끝이 아닙니다!\n\n- 정답: AVS를 시청하며 AI의 효율적인 풀이와 내 과정을 비교합니다.\n- 오답: 즉시 AVS를 시청하여 어떤 논리적 오류가 있었는지 완벽히 이해합니다."
    },
    {
      title: "5. 질문 및 상호작용",
      icon: HelpCircle,
      content: "궁금한 점은 언제든 AI 선생님에게 질문하세요.\n\n- AVS 단계별로 모르는 부분을 구체적으로 질문할 수 있습니다.\n- 단, 기본 학습은 [정답 입력]과 [AVS 시청]을 중심으로 진행하는 것이 가장 효과적입니다."
    },
    {
      title: "6. 실시간 취약점 분석",
      icon: BarChart2,
      content: "멘토스 AI는 5문제마다 학습 데이터를 정밀 분석합니다.\n\n- 틀린 단원과 반복되는 오답 유형을 기록합니다.\n- 분석 결과는 실시간으로 반영되어 맞춤형 보충 문제 생성에 활용됩니다."
    },
    {
      title: "7. 학생 대시보드 활용",
      icon: Layout,
      content: "나의 학습 현황을 한눈에 파악하세요.\n\n- 오늘 푼 총 문제 수 및 정답률 확인\n- 취약 단원 시각화 그래프\n- 전체 교육 과정 중 현재 진행 상황 실시간 모니터링"
    },
    {
      title: "8. AI 지능형 숙제 시스템",
      icon: Home,
      content: '수업이 끝나면 오늘 배운 범위에서 '개인 맞춤형 숙제'가 자동 생성됩니다.\n\n- 정답률이 낮았던 유형은 더 확실하게!\n- 생성된 숙제는 다음 수업 시작 전까지 반드시 완료해야 합니다.'
    },
    {
      title: "9. 숙제 미이행 경고 시스템",
      icon: AlertTriangle,
      content: '숙제 관리는 성적 향상의 핵심입니다.\n\n- 숙제 미제출 또는 미완료가 4회 누적되면 '레드 경고'가 표시됩니다.\n- 이 기록은 부모님 리포트에 즉시 반영되어 집중 관리가 시작됩니다.'
    },
    {
      title: "10. 2주 단위 실력진단테스트",
      icon: Calendar,
      content: "2주마다 실전과 동일한 환경에서 진단테스트를 진행합니다.\n\n- 최근 배운 단원 + 데이터 분석으로 파악된 취약 단원 위주로 출제\n- 테스트 결과는 향후 커리큘럼 조정의 핵심 지표가 됩니다.'
    }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#ffffff', width: '90%', maxWidth: '800px', height: '600px', borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <img src="/logo_mentos.png" alt="logo" style={{ height: '30px' }} onError={e => e.target.style.display='none'} />
             <span style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.2rem' }}>멘토스 AI 수업 매뉴얼</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {currentPage + 1} / {pages.length}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative' }}>
           <ManualPage title={pages[currentPage].title} icon={pages[currentPage].icon}>
             {pages[currentPage].content}
           </ManualPage>
        </div>

        {/* Footer Navigation */}
        <div style={{ padding: '1.2rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage === 0 ? '#cbd5e1' : '#1e293b', cursor: currentPage === 0 ? 'default' : 'pointer', fontWeight: 'bold' }}
            >
              <ChevronLeft size={20} /> 이전
            </button>

            {currentPage === pages.length - 1 ? (
              <button 
                onClick={() => {
                  if (onStartLearning) {
                    onStartLearning();
                  } else {
                    onClose();
                  }
                }}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '1rem 3rem', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                수업 시작하기
              </button>
            ) : (
              <button 
                onClick={handleNext}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 2rem', borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                다음 <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* 마지막 페이지에서 시작 버튼 아래에 한 줄 가로 링크로 초소형 렌더링 */}
          {currentPage === pages.length - 1 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              color: '#64748b',
              marginTop: '4px'
            }}>
              <div>
                멘토스 AI는 <strong style={{ color: '#3b82f6' }}>KS BrainTech</strong>에서 투명하게 운영합니다.
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/terms" target="_blank" style={{ color: '#475569', textDecoration: 'none', fontWeight: 'bold' }}>이용약관</Link>
                <span>|</span>
                <Link to="/refund" target="_blank" style={{ color: '#475569', textDecoration: 'none', fontWeight: 'bold' }}>환불정책</Link>
                <span>|</span>
                <Link to="/privacy" target="_blank" style={{ color: '#475569', textDecoration: 'none', fontWeight: 'bold' }}>개인정보방침</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모달 최하단 초소형 인라인 푸터 (빠른 몰입 저해 방지용) */}
      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.75rem',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        opacity: 0.6,
        transition: 'opacity 0.2s',
        pointerEvents: 'auto',
        zIndex: 100001
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = 1}
      onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
      >
        <Link to="/terms" target="_blank" style={{ color: '#cbd5e1', textDecoration: 'none' }}>이용약관</Link>
        <span>|</span>
        <Link to="/privacy" target="_blank" style={{ color: '#cbd5e1', textDecoration: 'none' }}>개인정보처리방침</Link>
        <span>|</span>
        <Link to="/refund" target="_blank" style={{ color: '#cbd5e1', textDecoration: 'none' }}>환불정책</Link>
        <span>|</span>
        <span>운영사: KS BrainTech</span>
      </div>
    </div>
  );
}
