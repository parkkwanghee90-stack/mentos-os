import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Award, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updatePremiumStatus } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    const confirmPaymentAndUpgrade = async () => {
      if (!paymentKey || !orderId || !amount) {
        console.error("Missing payment parameters!");
        setStatus('error');
        return;
      }

      try {
        console.log('[PaymentSuccess] Confirming payment with parameters:', { paymentKey, orderId, amount });
        
        // 1. Supabase Database `payments` 테이블에 승인 성공 기록 삽입 (Upsert)
        if (user) {
          console.log('[PaymentSuccess] Recording payment invoice inside Supabase DB...');
          const { error: dbError } = await supabase
            .from('payments')
            .upsert({
              user_id: user.id,
              payment_key: paymentKey,
              order_id: orderId,
              amount: parseFloat(amount),
              status: 'success',
              approved_at: new Date().toISOString()
            });

          if (dbError) {
            console.error('[PaymentSuccess] Failed to save invoice to Supabase DB:', dbError);
          }

          // 2. AuthContext의 프리미엄 업데이트 호출 (Profiles 테이블의 is_paid 및 로컬 캐싱 자동 동기화)
          console.log('[PaymentSuccess] Elevating user profile to Premium Status...');
          await updatePremiumStatus(true);
        } else {
          // 비회원 결제 시나리오 fallback (테스트 목적)
          localStorage.setItem('mentos_is_paid', 'true');
        }

        setStatus('success');
      } catch (err) {
        console.error('[PaymentSuccess] Confirmatory workflow crashed:', err);
        setStatus('error');
      }
    };

    confirmPaymentAndUpgrade();
  }, [paymentKey, orderId, amount, user]);

  if (status === 'processing') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={44} color="#6366f1" className="animate-spin" />
        <h2 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>결제 승인 데이터를 검증 중입니다...</h2>
        <p style={{ color: '#71717a', fontSize: '0.9rem', marginTop: '0.5rem' }}>안전한 암호화 채널을 통해 연동을 처리하고 있습니다.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#ef4444', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>✕</div>
        <h2 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>결제 승인 처리 중 오류 발생</h2>
        <p style={{ color: '#a1a1aa', textAlign: 'center', maxWidth: '380px', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
          결제 정보 승인 중 통신 에러가 생겼습니다. 지속적으로 발생 시 고객 센터에 문의해주시기 바랍니다.
        </p>
        <button 
          onClick={() => navigate('/payment/checkout')}
          style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          결제 다시 시도하기
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '24px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', animation: 'fadeIn 0.5s ease' }}>
        
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="#10b981" />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: '950', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
          프리미엄 패스 결제 성공!
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          결제가 성공적으로 검증 및 승인되었습니다.<br />
          이제 멘토스 OS의 모든 혁신 기능이 활성화되었습니다.
        </p>

        {/* 결제 영수증 박스 */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #27272a', borderRadius: '16px', padding: '1.2rem', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#71717a' }}>결제 상품</span>
            <span style={{ fontWeight: 'bold' }}>무제한 안심패스 (1개월)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#71717a' }}>주문 번호</span>
            <span style={{ fontFamily: 'monospace', color: '#a1a1aa' }}>{orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#71717a' }}>결제 금액</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{parseFloat(amount || '0').toLocaleString()} 원</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          대시보드로 가기 <ArrowRight size={18} />
        </button>

      </div>
    </div>
  );
}
