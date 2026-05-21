import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';
import MiddleSubjectScreen from '@/pages/MiddleSubjectScreen';
import '@/pages/TeacherSelect.css';

const HIGH_SUBJECT_TABS = [
  { id: 'math', label: '수학' },
  { id: 'eng', label: '영어' },
  { id: 'physics', label: '물리' },
  { id: 'chemistry', label: '화학' },
  { id: 'biology', label: '생명과학' },
  { id: 'earth', label: '지구과학' }
];


export default function TeacherSelect() {
  const navigate = useNavigate();
  const location = useLocation();

  const [schoolLevel, setSchoolLevel] = useState('high'); // 'middle' or 'high'
  const initialSubject = location.state?.subject || 'math';
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedDetailTeacher, setSelectedDetailTeacher] = useState(null);

  // 현재 선택된 학교와 탭의 강사진 필터링 (고등부 전용)
  const teachers = Object.values(HIGH_TEACHER_PROFILES).filter(
    (t) => t.subject === selectedSubject
  );

  // [이 루트로 시작] 클릭 핸들러
  const handleStartTutoring = (teacher) => {
    // 고등부 수학의 경우, 수업 시작 전 진단(단원/수준 배정) 단계로 이동합니다.
    if (schoolLevel === 'high' && teacher.subject === 'math') {
      navigate('/diagnosis', { state: { preSelectedTeacher: teacher } });
      return;
    }
    
    // 그 외 과목은 기존처럼 바로 교실로 이동
    const isScience = ['physics', 'chemistry', 'biology', 'earth'].includes(teacher.subject);
    const pathName = isScience ? '/class/science' : (teacher.subject === 'math' ? '/class/math/${teacher.id}' : '/class/english');
    navigate(pathName, { state: { teacher } });
  };

  return (
    <div className="megastudy-container">
      {/* MegaStudy Style Header Navigation */}
      <nav className="mega-nav">
        <div className="mega-nav-inner">
          <div className="mega-logo">Mentos <span>AI</span></div>
          <div className="mega-links">
            <span>수능·내신</span>
            <span>입시정보</span>
            <span>온라인서점</span>
            <span style={{ cursor: 'pointer', color: '#10b981', fontWeight: 'bold' }} onClick={() => navigate('/grade-select')}>AI 맞춤 학습 시작</span>
          </div>
        </div>
      </nav>

      <div className="mega-school-toggle" style={{ display: 'flex', gap: '16px', padding: '24px', justifyContent: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          className={`mega-btn-secondary ${schoolLevel === 'middle' ? 'active-school' : ''}`}
          onClick={() => { setSchoolLevel('middle'); setSelectedSubject('math'); setSelectedDetailTeacher(null); }}
          style={{ fontWeight: schoolLevel === 'middle' ? 'bold' : 'normal', background: schoolLevel === 'middle' ? '#1e3a8a' : '#fff', color: schoolLevel === 'middle' ? '#fff' : '#1e3a8a', padding: '12px 32px', borderRadius: '30px' }}
        >
          중등부 전용관
        </button>
        <button 
          className={`mega-btn-secondary ${schoolLevel === 'high' ? 'active-school' : ''}`}
          onClick={() => { setSchoolLevel('high'); setSelectedSubject('math'); setSelectedDetailTeacher(null); }}
          style={{ fontWeight: schoolLevel === 'high' ? 'bold' : 'normal', background: schoolLevel === 'high' ? '#1e3a8a' : '#fff', color: schoolLevel === 'high' ? '#fff' : '#1e3a8a', padding: '12px 32px', borderRadius: '30px' }}
        >
          고등부 전용관
        </button>
      </div>

      {/* Dynamic Content based on School Level */}
      {schoolLevel === 'middle' ? (
        <MiddleSubjectScreen onSelectTeacher={setSelectedDetailTeacher} />
      ) : (
        <>
          {/* Hero Section for High School */}
          <div className="mega-hero">
            <div className="mega-hero-content">
              <h1>맞춤형 1타 AI 과외</h1>
              <p>지금 당신에게 가장 잘 맞는 선생님을 선택하세요</p>
            </div>
          </div>

          <div className="mega-main">
            <h2 className="section-title">고등부 1타 라인업</h2>
            
            {/* 과목 탭 */}
            <div className="mega-tabs">
              {HIGH_SUBJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`mega-tab-btn ${selectedSubject === tab.id ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 선생님 리스트 그리드 */}
            {['physics', 'chemistry', 'biology', 'earth'].includes(selectedSubject) ? (
              <div className="physics-curriculum-container">
                {[
                  { grade: '고1', title: `고1 ${selectedSubject === 'physics' ? '물리' : selectedSubject === 'chemistry' ? '화학' : selectedSubject === 'biology' ? '생명과학' : '지구과학'}`, targetGrade: '고1' },
                  { grade: '고2', title: `고2 ${selectedSubject === 'physics' ? '물리' : selectedSubject === 'chemistry' ? '화학' : selectedSubject === 'biology' ? '생명과학' : '지구과학'}`, targetGrade: '고2' },
                  { grade: '고3', title: `고3 ${selectedSubject === 'physics' ? '물리' : selectedSubject === 'chemistry' ? '화학' : selectedSubject === 'biology' ? '생명과학' : '지구과학'}`, targetGrade: '고3' }
                ].map(section => {
                  const subTeachers = teachers.filter(t => t.subject === selectedSubject && t.targetGrades && t.targetGrades.includes(section.targetGrade));
                  if (subTeachers.length === 0) return null;
                  return (
                  <div key={section.grade} className="physics-grade-section" style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px' }}>{section.title}</h3>
                    <div className="mega-grid">
                      {subTeachers.map(t => (
                          <div key={t.id} className="mega-card">
                            <div className="mega-card-image-wrapper" onClick={() => setSelectedDetailTeacher(t)} style={{ cursor: 'pointer', position: 'relative' }}>
                              <img 
                                src={window.resolveAsset(`/hteachers/${selectedSubject}/${t.image}`)} 
                                alt={t.name} 
                                className="mega-card-image" 
                                onError={(e) => { e.target.src = '/icons/default-avatar.webp'; e.target.style.background = '#e2e8f0'; }}
                              />
                            </div>
                            <div className="mega-card-content" onClick={() => setSelectedDetailTeacher(t)} style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 12px' }}>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>{t.name} 선생님</h3>
                              
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ background: '#1e3a8a', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                  {t.targetGrades?.[0] || section.grade}
                                </span>
                                <span style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                  {t.targetRanks?.[0]} 대상
                                </span>
                              </div>

                              <div style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '16px', fontWeight: '500' }}>
                                {t.position}
                              </div>

                              <div className="mega-card-actions" style={{ justifyContent: 'center' }}>
                                <button className="mega-btn-secondary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); handleStartTutoring(t); }}>
                                  선택하기
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="mega-grid">
                {teachers.map((t) => (
                  <div key={t.id} className="mega-card">
                    <div 
                      className="mega-card-image-wrapper" 
                      onClick={() => setSelectedDetailTeacher(t)}
                    >
                      <img 
                        src={t.image} 
                        alt={t.name} 
                        className="mega-card-image" 
                        onError={(e) => { e.target.src = '/icons/default-avatar.webp'; e.target.style.background = '#e2e8f0'; }}
                      />
                      <div className="mega-target-badge">{t.target}</div>
                    </div>
                    <div className="mega-card-content" onClick={() => setSelectedDetailTeacher(t)}>
                      <div className="mega-card-subject">{HIGH_SUBJECT_TABS.find(x => x.id === t.subject)?.label} 전문</div>
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
            )}
          </div>
        </>
      )}

      {/* 선생님 상세 모달 (RouteIntroScreen) */}
      {selectedDetailTeacher && (
        <div className="mega-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedDetailTeacher(null); }}>
          <div className="mega-modal-content">
            <button className="mega-modal-close" onClick={() => setSelectedDetailTeacher(null)}>✕</button>
            <div className="mega-modal-body">
              <div className="mega-modal-left">
                <img 
                  src={selectedDetailTeacher.image} 
                  alt={selectedDetailTeacher.name} 
                  className="mega-modal-image"
                  onError={(e) => { e.target.src = '/icons/default-avatar.webp'; e.target.style.background = '#e2e8f0'; }}
                />
              </div>
              <div className="mega-modal-right">
                <div className="mega-modal-subject">{(schoolLevel === 'middle' ? [{id:'math', label:'수학'}, {id:'eng', label:'영어'}, {id:'science', label:'통합과학'}] : HIGH_SUBJECT_TABS).find(x => x.id === selectedDetailTeacher.subject)?.label} 전문</div>
                <h2 className="mega-modal-name">{selectedDetailTeacher.name} 선생님</h2>
                <div className="mega-modal-tagline" style={{ color: '#2563eb', fontWeight: 'bold', marginTop: '4px' }}>
                  {selectedDetailTeacher.routeTitle}
                </div>
                
                <p className="mega-modal-intro" style={{ marginTop: '12px' }}>
                  {selectedDetailTeacher.routeDescription}
                </p>
                
                <div className="mega-modal-target" style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '8px' }}><strong>대상: </strong> {selectedDetailTeacher.targetGrades?.join(', ')}</div>
                  <div><strong>추천 등급: </strong> {selectedDetailTeacher.targetRanks?.join(', ')}</div>
                </div>

                <div className="mega-modal-features" style={{ marginTop: '16px' }}>
                  <h3>[ 수업 방식 ]</h3>
                  <ul>
                    {selectedDetailTeacher.features.map((feat, idx) => (
                      <li key={idx}>✓ {feat}</li>
                    ))}
                  </ul>
                </div>

                <div className="mega-modal-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button className="mega-btn-primary large" style={{ flex: 1.5 }} onClick={() => handleStartTutoring(selectedDetailTeacher)}>
                    이 루트로 시작 &gt;
                  </button>
                  <button className="mega-btn-secondary large" style={{ flex: 1 }} onClick={() => setSelectedDetailTeacher(null)}>
                    다른 선생님 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
