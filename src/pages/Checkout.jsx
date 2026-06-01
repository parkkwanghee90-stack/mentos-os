import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Zap, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parentPhone, setParentPhone] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}');
      return u.parentPhone || '';
    } catch { return ''; }
  });

  useEffect(() => {
    // 1. Toss Payments SDK 동적 주입
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!window.TossPayments) {
        alert("Toss 결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
        return;
      }

      // 토스페이먼츠 테스트 클라이언트 키
      const clientKey = 'test_ck_D5aZzN3E3Q19NL1al0W8g9YqrzOp';
      const tossPayments = window.TossPayments(clientKey);

      const orderId = `order_${Date.now()}`;
      const amount = 39000; // 프리미엄 멤버십 39,000원

      // 학부모 번호 저장 (결제 전)
      if (parentPhone.trim()) {
        try {
          const u = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}');
          u.parentPhone = parentPhone.trim();
          localStorage.setItem('mentos_mock_user', JSON.stringify(u));
          // pushService의 config에도 자동 등록
          const { getPushConfig, savePushConfig } = await import('@/services/pushService');
          const config = getPushConfig() || { sms: {}, kakao: {}, parentPhones: {} };
          config.parentPhones[u.name || '학생'] = parentPhone.trim();
          savePushConfig(config);
        } catch (e) { console.warn('[Checkout] parentPhone save error:', e); }
      }

      // 토스 결제 요청창 띄우기
      await tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: orderId,
        orderName: '멘토스 OS 프리미엄 무제한 안심패스 (1개월)',
        customerName: user?.email ? user.email.split('@')[0] : '멘토스회원',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error("Toss Payment request failed:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      {/* 뒤로가기 */}
      <button 
        onClick={() => navigate(-1)}
        style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#a1a1aa', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
      >
        <ArrowLeft size={18} /> 뒤로가기
      </button>

      <div style={{ maxWidth: '480px', width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
        
        {/* 상단 뱃지 */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Sparkles size={14} /> PREMIUM PASS
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 0.5rem 0' }}>
          멘토스 OS 프리미엄 구독
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 2rem 0' }}>
          실시간 AVS 오답 쌍둥이 엔진과 인공지능 취약점 리포트 등 모든 한계가 사라진 전 과목 안심 홈스쿨링을 시작하세요.
        </p>

        {/* 혜택 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Zap size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>무한 수학 쌍둥이 복제 엔진 개방</div>
              <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2px' }}>틀린 문제를 KaTeX로 2배수 무제한 자동 복사</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldCheck size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>학부모 실시간 알림 & 대시보드 개방</div>
              <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2px' }}>자녀의 약점 분석 및 AI 한 줄 코멘트 실시간 열람</div>
            </div>
          </div>
        </div>

        {/* 금액 */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '4px' }}>매월 자동 결제</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff' }}>
            39,000 <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#a1a1aa' }}>원</span>
          </div>
        </div>

        {/* 학부모 알림 전화번호 */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#6366f1" /> 학부모 알림 수신 번호
          </div>
          <input
            type="tel"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            placeholder="010-0000-0000"
            style={{ width: '100%', padding: '0.8rem 1rem', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '10px', color: '#f4f4f5', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '6px' }}>
            수업 종료 시 학부모님께 학습 결과가 자동 전송됩니다
          </div>
        </div>

        {/* 결제하기 버튼 */}
        <button 
          onClick={handlePayment}
          disabled={loading}
          style={{ width: '100%', padding: '1.1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #3730a3)', color: '#ffffff', border: 'none', fontSize: '1.05rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s, opacity 0.2s' }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <CreditCard size={20} />
          {loading ? '결제창 로딩 중...' : 'Toss Payments로 결제하기'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#71717a', marginTop: '1.2rem' }}>
          <ShieldCheck size={14} /> 안전한 토스페이먼츠 결제 시스템을 이용합니다.
        </div>

      </div>
    </div>
  );
}
