import React, { useState } from 'react';
import { MIDDLE_TEACHER_PROFILES } from '@/data/mTeacherProfiles';

const MIDDLE_SUBJECT_TABS = [
  { id: 'math', label: '수학' },
  { id: 'eng', label: '영어' },
  { id: 'science', label: '통합과학' }
];

// Vite glob to dynamically load images from public directory
const mTeacherAssetPaths = import.meta.glob('/public/mteachers/**/*.{png,jpg}', { query: '?url', import: 'default', eager: true });

// Convert glob paths to actual public URLs to check existence
const availableAssetUrls = Object.values(mTeacherAssetPaths).map(url => {
  // Vite replaces '/public/' with '/' in dev/build for public assets
  if (url.startsWith('/public/')) return url.replace('/public/', '/');
  return url;
});

export default function MiddleSubjectScreen({ onSelectTeacher }) {
  const [selectedSubject, setSelectedSubject] = useState('math');

  // Filter profiles based on actual existing files from the mteachers folder
  const teachers = Object.values(MIDDLE_TEACHER_PROFILES).filter(
    (t) => t.subject === selectedSubject && availableAssetUrls.some(assetUrl => assetUrl.includes(t.image))
  );

  // Pick some recommended teachers for the section (e.g. first math and first eng)
  const recommendedTeachers = Object.values(MIDDLE_TEACHER_PROFILES).filter(
    (t) => (t.id === 'm_math1' || t.id === 'm_eng1' || t.id === 'm_math2') && availableAssetUrls.some(url => url.includes(t.image))
  ).slice(0, 3);

  return (
    <div className="middle-subject-screen">
      {/* Hero Section for Middle School */}
      <div className="mega-hero" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' }}>
        <div className="mega-hero-content">
          <h1>중등 맞춤 1타 AI 과외</h1>
          <p>개념부터 내신까지, 지금 시작하세요</p>
        </div>
      </div>

      <div className="mega-main">
        {/* Recommended Section */}
        {recommendedTeachers.length > 0 && (
          <div className="mega-recommended-section" style={{ marginBottom: '40px' }}>
            <h2 className="section-title" style={{ fontSize: '1.5rem', color: '#1e40af' }}>중등 추천 선생님</h2>
            <div className="mega-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {recommendedTeachers.map(t => (
                <div key={`rec-${t.id}`} className="mega-card" style={{ border: '2px solid #bfdbfe' }}>
                  <div className="mega-card-image-wrapper" onClick={() => onSelectTeacher(t)}>
                    <img src={t.image} alt={t.name} className="mega-card-image" />
                    <div className="mega-target-badge" style={{ background: '#2563eb' }}>{t.targetRanks?.[0] || '추천'}</div>
                  </div>
                  <div className="mega-card-content" onClick={() => onSelectTeacher(t)}>
                    <div className="mega-card-subject">{MIDDLE_SUBJECT_TABS.find(x => x.id === t.subject)?.label} 베스트</div>
                    <h3 className="mega-card-name" style={{ marginBottom: '8px' }}>{t.name} 선생님</h3>
                    <div className="mega-route-info" style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '12px' }}>
                      <div style={{ color: '#1e3a8a', fontWeight: 'bold' }}>[ {t.routeTitle} ]</div>
                    </div>
                    <button className="mega-btn-primary" style={{ width: '100%' }}>루트 상세 보기</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="section-title">전체 선생님 라인업</h2>
        
        {/* Subject Tabs */}
        <div className="mega-tabs">
          {MIDDLE_SUBJECT_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`mega-tab-btn ${selectedSubject === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedSubject(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Teacher Grid */}
        <div className="mega-grid">
          {teachers.map((t) => (
            <div key={t.id} className="mega-card">
              <div 
                className="mega-card-image-wrapper" 
                onClick={() => onSelectTeacher(t)}
              >
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="mega-card-image" 
                  onError={(e) => { e.target.src = '/icons/default-avatar.webp'; e.target.style.background = '#e2e8f0'; }}
                />
                <div className="mega-target-badge">{t.targetGrades?.[0]}</div>
              </div>
              <div className="mega-card-content" onClick={() => onSelectTeacher(t)}>
                <div className="mega-card-subject">{MIDDLE_SUBJECT_TABS.find(x => x.id === t.subject)?.label} 전문</div>
                <h3 className="mega-card-name" style={{ marginBottom: '8px' }}>{t.name} 선생님</h3>
                
                <div className="mega-route-info" style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '12px' }}>
                  <div><strong>대상:</strong> {t.targetGrades?.join(', ')}</div>
                  <div><strong>추천 등급:</strong> {t.targetRanks?.join(', ')}</div>
                  <div style={{ marginTop: '4px', color: '#1e3a8a', fontWeight: 'bold' }}>
                    [ {t.routeTitle} ]
                  </div>
                </div>

                <div className="mega-card-actions" style={{ justifyContent: 'center' }}>
                  <button className="mega-btn-secondary" style={{ width: '100%' }}>
                    루트 상세 보기
                  </button>
                </div>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="mega-empty">해당 과목의 선생님이 준비 중입니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
