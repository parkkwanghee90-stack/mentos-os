import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HelpCircle, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

export default function Refund() {
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
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            marginBottom: '1rem'
          }}>
            <RefreshCw size={40} className="animate-spin-slow" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 0.5rem 0', background: 'linear-gradient(to right, #ffffff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            환불 정책 (Refund Policy)
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>멘토스 AI 서비스의 환불 및 운영 관련 핵심 규정을 투명하게 안내합니다</p>
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
          
          {/* Highlight Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#c084fc', marginTop: 0, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> 결제 후 7일 이내 전액 환불 보장
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#94a3b8' }}>
              결제 완료 시점으로부터 <strong style={{ color: '#fff' }}>7일 이내</strong>에 학습 이력(이용 기록 및 콘텐츠 소비)이 없는 경우, 전액 환불 신청이 가능합니다. 
              학습 이력이 존재할 경우 사용 금액을 차감한 부분 환불이 이루어집니다.
            </p>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            1. 환불 신청 기준 및 금액 계산
          </h3>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>7일 이내 신청 시:</strong> 학습 이력이 없는 경우 전액 환불되며, 1강 이상 수업을 진행한 경우 전체 결제 금액에서 이용한 수업 차시(또는 사용량)에 비례한 금액을 일할 계산 및 차감 후 부분 환불됩니다.</li>
            <li><strong>7일 경과 후 신청 시:</strong> 디지털 콘텐츠 서비스 제공 원칙에 따라 위약금(잔여 금액의 10%) 및 이미 이용한 기간/사용량을 공제한 뒤 부분 환불 처리가 진행됩니다.</li>
            <li>결제 시 적용된 이벤트 및 할인 혜택은 환불 시 무효화되며, 정상 가격을 기준으로 사용 요금이 차감됩니다.</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            2. 디지털 콘텐츠 특성에 따른 일부 제한 사항
          </h3>
          <p style={{ margin: '0 0 1rem 0' }}>
            멘토스 AI는 초개인화 인공지능 선생님 모델링, AVS(AI Vision Solution) 콘텐츠가 즉시 개방되는 디지털 콘텐츠 서비스입니다. 
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>악의적인 복제, 캡처 또는 전체 콘텐츠 제공을 가로채기 위해 단시간 내 집중 다운로드 및 비정상적 사용 이력이 확인되는 계정은 디지털콘텐츠법에 의해 환불이 불가능하거나 민형사상 법적 제재를 받을 수 있습니다.</li>
            <li>발급된 맞춤형 학습 데이터베이스 및 모의고사 문제 패키지를 다운로드 하거나 시청을 완료한 상태에서는 해당 콘텐츠 가치가 소비된 것으로 간주되어 차감액이 발생합니다.</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', borderLeft: '4px solid #818cf8', paddingLeft: '12px', margin: '2rem 0 1rem 0' }}>
            3. 환불 프로세스 및 소요 기간
          </h3>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>신청 방법: 고객센터 이메일(<span style={{ color: '#60a5fa' }}>support@ksbraintech.com</span>) 혹은 카카오톡 멘토스 AI 채널로 [이름 / 이메일 주소 / 환불 사유]를 접수해 주시면 확인 후 신속히 처리해 드립니다.</li>
            <li>신용카드/간편결제(Toss, PayApp 등): 승인 취소 처리는 카드사 영업일 기준 3~5일 소요됩니다.</li>
            <li>가상계좌/계좌이체: 고객 명의의 환불 계좌가 필요하며 접수일 기준 영업일 2~3일 내 송금 처리됩니다.</li>
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
