import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Fail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get('code') || 'UNKNOWN_ERROR';
  const errorMessage = searchParams.get('message') || '결제 처리 중 예상치 못한 오류가 발생했습니다.';

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ maxWidth: '440px', width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '24px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', animation: 'fadeIn 0.5s ease' }}>
        
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <AlertCircle size={40} color="#ef4444" />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: '950', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
          결제에 실패하였습니다
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          결제 처리 중 오류가 발생했거나 결제창이 닫혔습니다.<br />
          아래의 오류 사유를 확인해 주시기 바랍니다.
        </p>

        {/* 오류 코드 메세지 */}
        <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.2rem', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>오류 코드</span>
            <span style={{ fontFamily: 'monospace', color: '#fca5a5' }}>{errorCode}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            <span style={{ color: '#71717a' }}>상세 사유</span>
            <span style={{ color: '#e4e4e7', lineHeight: '1.4', fontWeight: 'bold' }}>{errorMessage}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', background: '#27272a', border: '1px solid #3f3f46', color: '#ffffff', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> 대시보드
          </button>
          
          <button 
            onClick={() => navigate('/payment/checkout')}
            style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #3730a3)', color: '#ffffff', border: 'none', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
          >
            <RefreshCw size={16} /> 결제 재시도
          </button>
        </div>

      </div>
    </div>
  );
}
