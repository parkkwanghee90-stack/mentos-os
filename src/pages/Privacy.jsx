import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, ArrowLeft, Lock, FileText } from 'lucide-react';

export default function Privacy() {
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
      overflowY: 'auto'
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
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '24px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            marginBottom: '1rem'
          }}>
            <Eye size={40} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 0.5rem 0', background: 'linear-gradient(to right, #ffffff, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            개인정보처리방침
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>멘토스 AI 서비스의 개인정보 수집 목적, 보호 및 보관 규정을 투명하게 설명합니다</p>
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
          
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399', marginTop: 0, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} /> 회원 정보 보안 조치 완비
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#94a3b8' }}>
              주식회사 케이에스브레인텍은 정보통신망 이용촉진 및 정보보호 등에 관한 법률과 개인정보보호법에 의거하여, 회원의 개인정보를 강력하게 암호화하여 저장하며 동의 없이 제3자에게 임의 배포하지 않습니다.
            </p>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #34d399', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            1. 개인정보의 수집 항목 및 방법
          </h3>
          <p style={{ margin: '0 0 1rem 0' }}>
            회사는 서비스 가입 및 원활한 AI 튜터링 솔루션 제공을 위하여 다음과 같은 개인정보를 회원 등록 단계에서 수집합니다.
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>필수 수집 항목:</strong> 로그인 이메일 계정 아이디, 비밀번호(해시 암호화), 닉네임, 학년(고1/고2/고3), 현재 수학 등급 및 수준</li>
            <li><strong>결제 시 수집 항목:</strong> 결제수단 인증 정보, 구매 내역, 요금 청구 기록(PG사 처리용으로 회사는 결제 카드번호나 비밀번호를 수집 및 저장하지 않으며 PG사에 보안 이전됩니다)</li>
            <li><strong>자동 생성 수집 항목:</strong> 서비스 이용 기록, 오답 히스토리, 학습 정답률 통계치, 접속 IP 주소, 쿠키 및 접속 기기 종류</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #34d399', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            2. 수집한 개인정보의 이용 목적
          </h3>
          <p style={{ margin: '0 0 1rem 0' }}>
            회사는 수집한 정보를 오직 다음의 목적을 위해서만 사용합니다.
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>초개인화 튜터링 매칭:</strong> 학년 및 현재 등급에 최적화된 학습 코스 분류 및 AI 선생님 자동 추천 매칭</li>
            <li><strong>AI 분석 리포트 생성:</strong> 5문제마다 누적되는 오답률 히스토리에 기인한 학습 약점 진단 보고서 작성</li>
            <li><strong>유료 요금 결제 정산:</strong> 정기 유료 이용권 등록 승인, 카드 결제 대행 및 청구 내역 대조</li>
            <li><strong>공지사항 및 교육 피드백:</strong> 수업 일정 갱신 정보, 숙제 미완료 경고 사항 알림 및 학부모 리포트 카카오톡 알림 전송</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #34d399', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            3. 개인정보의 보유 및 파기 기간
          </h3>
          <p style={{ margin: '0 0 1rem 0' }}>
            원칙적으로, 회원의 개인정보는 회원 탈퇴 요청 즉시 복구 불가능한 기술적 방법으로 영구 파기됩니다.
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>다만 관계 법령(상법 및 전자상거래법 등)에 의거하여 보존 의무가 있는 청구 및 계약 해지 기록 등은 법정 의무 기간(결제 대금 및 환불 관련 기록: 5년) 동안 안전하게 별도 보존 후 파기합니다.</li>
          </ul>

          {/* Separation line */}
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '2.5rem 0' }} />

          {/* Operation Info Block (Critical for PG Approval) */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#34d399" /> 운영사 및 사업자 정보 (KS BrainTech)
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
