import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing | success | pending | error
  const [receipt, setReceipt] = useState(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    let tries = 0;
    const maxTries = 14; // 약 21초 (1.5초 간격)

    const poll = async () => {
      tries += 1;
      try {
        // 결제 기록은 Supabase edge function(feedbackurl)이 작성한다. 여기서는 조회만 한다.
        const { data } = await supabase
          .from('payments')
          .select('status, amount, order_id, mul_no')
          .eq('order_id', orderId)
          .maybeSingle();

        if (cancelled) return;

        if (data && data.status === 'success') {
          // 프리미엄 메타데이터가 edge function에서 갱신됐으므로 세션 갱신으로 반영
          await supabase.auth.refreshSession();
          setReceipt(data);
          setStatus('success');
          return;
        }
      } catch (err) {
        console.error('[PaymentSuccess] polling error:', err);
      }

      if (cancelled) return;
      if (tries >= maxTries) {
        setStatus('pending');
        return;
      }
      setTimeout(poll, 1500);
    };

    poll();
    return () => { cancelled = true; };
  }, [orderId]);

  if (status === 'processing') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={44} color="#6366f1" className="animate-spin" />
        <h2 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>결제 승인 데이터를 검증 중입니다...</h2>
        <p style={{ color: '#71717a', fontSize: '0.9rem', marginTop: '0.5rem' }}>안전한 암호화 채널을 통해 연동을 처리하고 있습니다.</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Loader size={44} color="#f59e0b" className="animate-spin" />
        <h2 style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>결제 확인 중입니다</h2>
        <p style={{ color: '#a1a1aa', textAlign: 'center', maxWidth: '380px', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
          결제 통보를 기다리고 있습니다. 잠시 후 대시보드에서 프리미엄 상태가 반영됩니다. (가상계좌는 입금 후 반영)
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          대시보드로 가기
        </button>
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
            <span style={{ fontFamily: 'monospace', color: '#a1a1aa' }}>{receipt?.order_id || orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#71717a' }}>결제 금액</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{(receipt?.amount ?? 0).toLocaleString()} 원</span>
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
