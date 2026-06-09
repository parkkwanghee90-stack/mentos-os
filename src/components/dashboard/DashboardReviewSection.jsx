import React, { useState, useEffect, useRef } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

// 대시보드 하단 리뷰 작성 섹션.
// 작성 즉시 reviews 테이블(approved 기본 true)에 저장되어 대문 후기 목록에 노출된다.
// 대문 "리뷰 작성하기"를 비로그인 클릭 → 로그인 후 이 섹션으로 자동 스크롤(sessionStorage 플래그).
export default function DashboardReviewSection() {
  const { user } = useAuth();
  const ref = useRef(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [role, setRole] = useState('학생');
  const [name, setName] = useState(user?.user_metadata?.name || user?.name || '');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [highlight, setHighlight] = useState(false);

  // 대문에서 넘어온 경우 자동 스크롤 + 강조
  useEffect(() => {
    if (sessionStorage.getItem('mentos_pending_review') === '1') {
      sessionStorage.removeItem('mentos_pending_review');
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2600);
      }, 400);
    }
  }, []);

  const submit = async () => {
    if (!user?.id) { alert('로그인 후 작성할 수 있습니다.'); return; }
    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    if (!trimmedName) { alert('이름/닉네임을 입력해 주세요.'); return; }
    if (trimmedContent.length < 5) { alert('후기를 5자 이상 작성해 주세요.'); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        name: trimmedName.slice(0, 40),
        role,
        rating: Number(rating),
        content: trimmedContent.slice(0, 1000),
        approved: true,
      });
      if (error) throw error;
      setDone(true);
      setContent('');
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      console.error('[REVIEW_INSERT_ERROR]', e);
      alert('후기 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem',
    borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc',
    color: '#0f172a', fontSize: '0.95rem', outline: 'none',
  };

  return (
    <div
      ref={ref}
      id="dashboard-review-section"
      className="glass-panel animate-fade-in"
      style={{
        marginTop: '1.5rem', padding: '1.6rem', borderRadius: '20px',
        transition: 'box-shadow 0.3s, transform 0.3s',
        boxShadow: highlight ? '0 0 0 3px #8b5cf6, 0 12px 30px rgba(139,92,246,0.25)' : undefined,
        transform: highlight ? 'scale(1.01)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
        <Star size={20} color="#f59e0b" fill="#f59e0b" />
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>후기 남기기</h3>
      </div>
      <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', color: '#64748b' }}>
        작성하신 후기는 곧바로 매쓰멘토스 첫 화면 후기 목록에 소개됩니다. ✍️
      </p>

      {done ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '1.4rem', borderRadius: '14px', background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.3)', color: '#0d9488', fontWeight: 800,
        }}>
          <CheckCircle2 size={20} /> 소중한 후기 감사합니다! 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* 별점 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n} type="button"
                onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 0 }}
                aria-label={`별점 ${n}점`}
              >
                <Star size={30} color={(hover || rating) >= n ? '#f59e0b' : '#cbd5e1'} fill={(hover || rating) >= n ? '#f59e0b' : 'none'} />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              style={{ ...inputStyle, flex: 2 }}
              placeholder="이름/닉네임 (예: 고2 김OO)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
            <select style={{ ...inputStyle, flex: 1 }} value={role} onChange={(e) => setRole(e.target.value)}>
              <option>학생</option>
              <option>학부모</option>
            </select>
          </div>

          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
            rows={4}
            placeholder="실제 학습 경험을 적어주시면 큰 도움이 됩니다. (최소 5자)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '0.95rem', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #9333ea)',
              color: '#fff', fontSize: '1rem', fontWeight: 800,
              cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
              boxShadow: '0 6px 18px rgba(124,58,237,0.3)',
            }}
          >
            <Send size={18} /> {submitting ? '등록 중...' : '후기 등록하기'}
          </button>
        </div>
      )}
    </div>
  );
}
