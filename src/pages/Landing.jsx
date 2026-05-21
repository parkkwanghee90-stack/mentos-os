import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Users, BarChart3, ChevronRight } from 'lucide-react';
import '@/pages/Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge animate-fade-in">차세대 AI 튜터링 OS</div>
          <h1 className="hero-title animate-fade-in" style={{ animationDelay: '0.1s' }}>
            AI가 답만 주는 게 아니라<br/>
            <span className="gradient-text">선생님처럼 가르칩니다</span>
          </h1>
          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
            단순 문제풀이 앱을 넘어선 진짜 과외 시스템. <br/>진단부터 수업, 약점 관리까지 완벽하게 자동화된 Mentos OS를 경험하세요.
          </p>
          
          <div className="hero-actions animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button className="btn-primary" onClick={() => navigate('/')}>
              무료로 시작하기 <ChevronRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              학생으로 시작
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          
          <div className="glass-panel feature-card">
            <div className="feat-icon-wrapper purple"><Brain /></div>
            <h3>진단 후 맞춤 반으로 자동 분류</h3>
            <p>개념 이해도와 적용력을 평가하여 1~5등급 구간별 최적화된 학습 코스로 자동 배정됩니다.</p>
          </div>

          <div className="glass-panel feature-card">
            <div className="feat-icon-wrapper blue"><Users /></div>
            <h3>AI 선생님 선택형 과외 시스템</h3>
            <p>12명의 과목별 전담 AI 선생님 중 나와 가장 잘 맞는 스타일과 말투를 가진 선생님을 고르세요.</p>
          </div>

          <div className="glass-panel feature-card">
            <div className="feat-icon-wrapper teal"><Target /></div>
            <h3>생각을 묻고 교정하는 수업 엔진</h3>
            <p>"왜 그렇게 생각했어?" 정답과 오답의 이유를 분석하고 진짜 실력을 향상시킵니다.</p>
          </div>

          <div className="glass-panel feature-card">
            <div className="feat-icon-wrapper red"><BarChart3 /></div>
            <h3>학부모/학생 관리 리포트 제공</h3>
            <p>풀이 속도, 오답 패턴, 등급 향상 추이를 한눈에 확인하세요.</p>
            <button className="text-btn" onClick={() => navigate('/dashboard')}>리포트 샘플 보기 &rarr;</button>
          </div>

        </div>
      </section>
      
      {/* Top Naivgation Mock */}
      <nav className="top-nav glass-panel">
        <div className="nav-logo">Mentos AI</div>
        <div className="nav-links">
          <button className="nav-login-btn" onClick={() => navigate('/login')}>로그인</button>
        </div>
      </nav>
    </div>
  );
}
