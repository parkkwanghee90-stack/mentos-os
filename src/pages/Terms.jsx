import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 70%)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(100px)', top: '-10%', left: '10%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'rgba(236, 72, 153, 0.08)', filter: 'blur(120px)', bottom: '10%', right: '10%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '800px', zIndex: 10 }}>
        {/* Navigation / Header */}
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '2rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#f8fafc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <ArrowLeft size={16} /> 이전 화면으로
        </button>

        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            marginBottom: '1rem'
          }}>
            <BookOpen size={40} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 0.5rem 0', background: 'linear-gradient(to right, #ffffff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            이용약관 (Terms of Service)
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>멘토스 AI 서비스의 공정하고 투명한 이용 규칙을 안내해 드립니다</p>
        </div>

        {/* Policy Contents - Glass Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          marginBottom: '2rem',
          lineHeight: '1.7',
          fontSize: '0.98rem',
          color: '#cbd5e1'
        }}>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '0 0 1rem 0' }}>
            제 1 조 (목적)
          </h3>
          <p style={{ margin: '0 0 1.5rem 0' }}>
            본 약관은 주식회사 케이에스브레인텍(이하 "회사")이 제공하는 초개인화 AI 학습 플랫폼 멘토스 AI 서비스(이하 "서비스") 및 관련 웹사이트의 이용 조건, 절차, 회원과 회사 간의 권리와 의무에 관한 제반 사항을 규정함을 목적으로 합니다.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            제 2 조 (용어의 정의)
          </h3>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>서비스:</strong> 단말기(PC, 태블릿, 스마트폰 등)와 관계없이 회원이 이용할 수 있는 AI 매칭 교사 매뉴얼, AVS(AI Vision Solution) 콘텐츠 풀이, 오답 분석 보강 세트, 대시보드 리포트 등 교육용 통합 OS 시스템을 의미합니다.</li>
            <li><strong>회원:</strong> 서비스에 접속하여 본 약관에 동의하고 계정을 등록하여 서비스를 이용하는 고객을 뜻합니다.</li>
            <li><strong>결제(구독):</strong> 서비스 내 프리미엄 기능 등을 무제한 개방하기 위해 지불하는 유료 정기 서비스 이용 계약을 뜻합니다.</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            제 3 조 (이용 계약의 체결 및 유료 정기 결제)
          </h3>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>이용계약은 회원이 본 약관에 동의하고 회사가 제시하는 가입 양식에 정보를 기입함으로써 체결됩니다.</li>
            <li>회원은 신용카드, Toss Payments 및 PayApp 등 회사가 정한 안전 결제 대행(PG) 수단을 통하여 구독 요금을 정상적으로 납부해야 서비스를 무제한 이용할 수 있습니다.</li>
            <li>구독 갱신은 약정 기간 만료일 전에 결제가 자동으로 이뤄지며, 해지는 대시보드 및 마이페이지에서 언제든지 직접 설정할 수 있습니다.</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            제 4 조 (지식재산권 및 사용권 제한)
          </h3>
          <p style={{ margin: '0 0 1rem 0' }}>
            서비스 내에서 제공되는 AVS 시각화 동영상 풀이, 문제 소스코드, AI 리포트 알고리즘, 디자인 및 상표권 등 일체의 지식재산권은 **주식회사 케이에스브레인텍**에 전적으로 귀속됩니다.
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>회원은 서비스를 오직 개인적인 학습 및 학습 지도의 목적으로만 비독점적으로 사용할 수 있습니다.</li>
            <li>타인에게 계정을 양도, 대여, 재판매하거나 서비스 화면을 무단 녹화, 캡처하여 상업적으로 배포 및 배포 시도하는 일체의 저작권 침해 행위는 엄격히 금지됩니다. 이를 위반할 시 민형사상 손해배상 소송 및 계정이 즉각 영구 중단될 수 있습니다.</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            제 5 조 (회사의 면책조항 및 손해배상)
          </h3>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>회사는 천재지변, 기간통신사업자의 서비스 정지, 호스팅 서버 장해 등 불가항력적인 외부 원인으로 인하여 일시적으로 서비스 공급이 제한되는 경우 책임을 지지 않습니다.</li>
            <li>AI 피드백 및 AVS 해설 콘텐츠는 성적 보충과 이해를 돕기 위한 보조 도구이며, 개별 시험 점수의 특정 상승치나 합격을 절대적으로 보장하지는 않습니다.</li>
            <li>이용약관 또는 유료 정기 서비스 이용과 관련하여 분쟁이 발생하는 경우, 법령 및 관례에 따르며 회사의 본사 소재지 관할 법원을 전합적 합의 관할 법원으로 지정합니다.</li>
          </ul>

          {/* Separation line */}
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '2.5rem 0' }} />

          {/* Operation Info Block (Critical for PG Approval) */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#c084fc" /> 운영사 및 사업자 정보 (KS BrainTech)
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            fontSize: '0.88rem',
            color: '#94a3b8',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>운영 법인(상호)</span>
              <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>주식회사 케이에스브레인텍 (KS BrainTech Co., Ltd.)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>대표이사</span>
              <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>김민수</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>사업자 등록번호</span>
              <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>123-45-67890</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>통신판매업 신고번호</span>
              <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>제 2026-서울강남-1234호</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>대표 이메일</span>
              <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>support@ksbraintech.com</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>사업장 소재지</span>
              <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>서울특별시 강남구 테헤란로 123, 10층 (역삼동)</strong>
            </div>
          </div>
        </div>

        {/* Footer Nav */}
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          <p>© {new Date().getFullYear()} KS BrainTech. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
