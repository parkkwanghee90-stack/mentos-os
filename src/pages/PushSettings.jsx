import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Plus, Trash2, MessageSquare,
  Phone, Bell, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import {
  getPushConfig, savePushConfig, getPushHistory, queueParentPush
} from '@/services/pushService';

const INPUT_STYLE = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(0, 0, 0, 0.4)',
  color: '#e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#94a3b8',
  marginBottom: '0.4rem',
  letterSpacing: '0.02em',
};

const CARD_STYLE = {
  background: 'rgba(15, 23, 42, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '20px',
  padding: '1.8rem',
  marginBottom: '1.5rem',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

const BTN_PRIMARY = {
  padding: '0.7rem 1.4rem',
  borderRadius: '12px',
  border: 'none',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  transition: 'all 0.2s',
};

const STATUS_COLORS = {
  sent: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: '발송완료' },
  pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: '대기중' },
  failed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: '실패' },
};

export default function PushSettings() {
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────
  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsApiSecret, setSmsApiSecret] = useState('');
  const [smsSender, setSmsSender] = useState('');

  const [kakaoApiKey, setKakaoApiKey] = useState('');
  const [kakaoSenderKey, setKakaoSenderKey] = useState('');
  const [kakaoTemplateId, setKakaoTemplateId] = useState('');
  const [kakaoPfId, setKakaoPfId] = useState(''); // Solapi 카카오 채널 ID (필수)

  const [parentPhones, setParentPhones] = useState({});
  const [newStudentName, setNewStudentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  const [pushHistory, setPushHistory] = useState([]);
  const [saveStatus, setSaveStatus] = useState(''); // 'saved' | 'error'
  const [testStatus, setTestStatus] = useState(''); // 'sms-ok' | 'kakao-ok' | ''

  // ─── Load existing config ──────────────────────────────
  useEffect(() => {
    const config = getPushConfig();
    if (config) {
      setSmsApiKey(config.sms?.apiKey || '');
      setSmsApiSecret(config.sms?.apiSecret || '');
      setSmsSender(config.sms?.sender || '');
      setKakaoApiKey(config.kakao?.apiKey || '');
      setKakaoSenderKey(config.kakao?.senderKey || '');
      setKakaoTemplateId(config.kakao?.templateId || '');
      setKakaoPfId(config.kakao?.pfId || '');
      setParentPhones(config.parentPhones || {});
    }
    setPushHistory(getPushHistory(20));
  }, []);

  // ─── Save handler ──────────────────────────────────────
  const handleSave = () => {
    try {
      const config = {
        sms: { apiKey: smsApiKey, apiSecret: smsApiSecret, sender: smsSender },
        kakao: { apiKey: kakaoApiKey, templateId: kakaoTemplateId, senderKey: kakaoSenderKey, pfId: kakaoPfId },
        parentPhones,
      };
      savePushConfig(config);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  // ─── Test send handlers ─────────────────────────────────
  const handleTestSMS = () => {
    queueParentPush('[테스트] 멘토스 OS CoolSMS 테스트 발송입니다.');
    setTestStatus('sms-ok');
    setPushHistory(getPushHistory(20));
    setTimeout(() => setTestStatus(''), 3000);
  };

  const handleTestKakao = () => {
    queueParentPush('[테스트] 멘토스 OS 카카오 알림톡 테스트 발송입니다.');
    setTestStatus('kakao-ok');
    setPushHistory(getPushHistory(20));
    setTimeout(() => setTestStatus(''), 3000);
  };

  // ─── Parent phone CRUD ──────────────────────────────────
  const addParentPhone = () => {
    if (!newStudentName.trim() || !newParentPhone.trim()) return;
    setParentPhones(prev => ({ ...prev, [newStudentName.trim()]: newParentPhone.trim() }));
    setNewStudentName('');
    setNewParentPhone('');
  };

  const removeParentPhone = (name) => {
    setParentPhones(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  // ─── Format time ────────────────────────────────────────
  const formatTime = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleString('ko-KR', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
    }}>
      {/* ─── Header ─────────────────────────────────────── */}
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={18} /> 돌아가기
          </button>

          <button
            onClick={handleSave}
            style={{
              ...BTN_PRIMARY,
              background: saveStatus === 'saved'
                ? '#10b981'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
            }}
          >
            {saveStatus === 'saved' ? <CheckCircle size={16} /> : <Save size={16} />}
            {saveStatus === 'saved' ? '저장됨!' : '전체 저장'}
          </button>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bell size={26} color="#8b5cf6" />
          푸시 알림 설정
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          학부모 SMS, 카카오 알림톡, 브라우저 알림 채널을 설정합니다.
        </p>

        {/* ─── Section 1: CoolSMS ──────────────────────────── */}
        <div style={{ ...CARD_STYLE, borderColor: 'rgba(59, 130, 246, 0.15)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="#3b82f6" />
            CoolSMS 설정
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            CoolSMS REST API v4 인증 정보를 입력하세요. 미입력 시 SMS 발송이 skip됩니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={LABEL_STYLE}>API Key</label>
              <input
                style={INPUT_STYLE}
                type="text"
                placeholder="NCSXXXXXXXXXXXXXXXX"
                value={smsApiKey}
                onChange={e => setSmsApiKey(e.target.value)}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>API Secret</label>
              <input
                style={INPUT_STYLE}
                type="password"
                placeholder="API Secret을 입력하세요"
                value={smsApiSecret}
                onChange={e => setSmsApiSecret(e.target.value)}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>발신번호</label>
              <input
                style={INPUT_STYLE}
                type="tel"
                placeholder="010-0000-0000"
                value={smsSender}
                onChange={e => setSmsSender(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleTestSMS}
            style={{
              ...BTN_PRIMARY,
              marginTop: '1.2rem',
              background: testStatus === 'sms-ok' ? '#10b981' : 'rgba(59, 130, 246, 0.15)',
              color: testStatus === 'sms-ok' ? 'white' : '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <Send size={14} />
            {testStatus === 'sms-ok' ? '테스트 발송 완료!' : '테스트 SMS 발송'}
          </button>
        </div>

        {/* ─── Section 2: Kakao Alimtalk ───────────────────── */}
        <div style={{ ...CARD_STYLE, borderColor: 'rgba(250, 204, 21, 0.15)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>💬</span>
            카카오톡 알림톡 설정
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            카카오는 <b>Solapi(SMS와 동일 계정)</b>를 통해 발송됩니다. 위 SMS API Key/Secret이
            인증에 그대로 쓰이며, 아래 <b>채널 ID(pfId)</b>가 필수입니다. 템플릿 ID가 있으면
            알림톡, 없으면 친구톡(자유 텍스트)으로 전송됩니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={LABEL_STYLE}>카카오 채널 ID (pfId) — 필수</label>
              <input
                style={INPUT_STYLE}
                type="text"
                placeholder="Solapi 카카오 채널 ID (예: KA01PF...)"
                value={kakaoPfId}
                onChange={e => setKakaoPfId(e.target.value)}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>API Key (Bearer Token) — 레거시(미사용)</label>
              <input
                style={INPUT_STYLE}
                type="password"
                placeholder="카카오 REST API 키 또는 Bearer Token"
                value={kakaoApiKey}
                onChange={e => setKakaoApiKey(e.target.value)}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Sender Key</label>
              <input
                style={INPUT_STYLE}
                type="text"
                placeholder="플러스친구 발신 프로필 키"
                value={kakaoSenderKey}
                onChange={e => setKakaoSenderKey(e.target.value)}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Template ID</label>
              <input
                style={INPUT_STYLE}
                type="text"
                placeholder="알림톡 템플릿 ID (선택)"
                value={kakaoTemplateId}
                onChange={e => setKakaoTemplateId(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleTestKakao}
            style={{
              ...BTN_PRIMARY,
              marginTop: '1.2rem',
              background: testStatus === 'kakao-ok' ? '#10b981' : 'rgba(250, 204, 21, 0.1)',
              color: testStatus === 'kakao-ok' ? 'white' : '#facc15',
              border: '1px solid rgba(250, 204, 21, 0.25)',
            }}
          >
            <Send size={14} />
            {testStatus === 'kakao-ok' ? '테스트 발송 완료!' : '테스트 알림톡 발송'}
          </button>
        </div>

        {/* ─── Section 3: Parent Phones ────────────────────── */}
        <div style={{ ...CARD_STYLE, borderColor: 'rgba(16, 185, 129, 0.15)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={20} color="#10b981" />
            학부모 연락처 관리
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            학생별 학부모 전화번호를 등록하세요. SMS 및 알림톡 발송 대상으로 사용됩니다.
          </p>

          {/* Add form */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <input
              style={{ ...INPUT_STYLE, flex: '1', minWidth: '120px' }}
              type="text"
              placeholder="학생명"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
            />
            <input
              style={{ ...INPUT_STYLE, flex: '1.5', minWidth: '160px' }}
              type="tel"
              placeholder="학부모 전화번호 (010-xxxx-xxxx)"
              value={newParentPhone}
              onChange={e => setNewParentPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addParentPhone()}
            />
            <button
              onClick={addParentPhone}
              style={{
                ...BTN_PRIMARY,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.7rem 1rem',
              }}
            >
              <Plus size={16} /> 추가
            </button>
          </div>

          {/* Phones list */}
          {Object.keys(parentPhones).length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px dashed rgba(255,255,255,0.08)',
              color: '#64748b', fontSize: '0.88rem',
            }}>
              등록된 연락처가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(parentPhones).map(([name, phone]) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '0.95rem' }}>{name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{phone}</span>
                  </div>
                  <button
                    onClick={() => removeParentPhone(name)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      borderRadius: '8px',
                      padding: '0.4rem 0.6rem',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Section 4: Push History ─────────────────────── */}
        <div style={{ ...CARD_STYLE, borderColor: 'rgba(168, 85, 247, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#a855f7" />
              푸시 발송 이력
            </h2>
            <button
              onClick={() => setPushHistory(getPushHistory(20))}
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                color: '#a855f7',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '600',
              }}
            >
              새로고침
            </button>
          </div>

          {pushHistory.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px dashed rgba(255,255,255,0.08)',
              color: '#64748b', fontSize: '0.88rem',
            }}>
              푸시 발송 이력이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {pushHistory.map((item, idx) => {
                const st = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
                return (
                  <div key={idx} style={{
                    padding: '0.9rem 1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.status === 'sent' ? <CheckCircle size={14} color={st.color} /> :
                         item.status === 'failed' ? <XCircle size={14} color={st.color} /> :
                         <AlertCircle size={14} color={st.color} />}
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: st.bg,
                          color: st.color,
                          padding: '2px 8px',
                          borderRadius: '8px',
                        }}>
                          {st.label}
                        </span>
                        {item.channels && item.channels.length > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            [{item.channels.join(', ')}]
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p style={{
                      margin: 0, fontSize: '0.88rem', color: '#cbd5e1',
                      lineHeight: '1.5', wordBreak: 'break-all',
                    }}>
                      {item.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '3rem' }} />
      </div>
    </div>
  );
}
