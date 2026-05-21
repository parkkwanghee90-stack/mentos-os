// src/pages/LessonTest.jsx
// 수업 종료 후 확인 테스트 화면
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronRight, BarChart2, Clock } from 'lucide-react';
import { getLevelConfig, buildTestQuestions } from '@/data/lessonTestData';
import { getExamTestConfig } from '@/services/examModeEngine';
import { saveResult } from '@/services/lessonResultStore';
import { useAppContext } from '@/context/AppContext';
import { HomeworkEngine } from '@/engine/homeworkEngine';
import '@/pages/LessonTest.css';

export default function LessonTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, subject, level, diagnosisResult, studyMode } = useAppContext();

  const grade = diagnosisResult?.grade || location.state?.grade || '중1';
  const unit = location.state?.unit || '여러 가지 힘';
  const selfReportedLevel = diagnosisResult?.level || level || '3등급';

  // EXAM MODE: use larger config + time limit
  const isExam = studyMode === 'EXAM';

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);   // { q, chosen, correct, tag }
  const [phase, setPhase] = useState('test');   // 'test' | 'result'
  const [startTime] = useState(() => Date.now());
  const [timeLeft, setTimeLeft] = useState(null);

  // Homework State
  const [hwFile, setHwFile] = useState(null);
  const [hwUploading, setHwUploading] = useState(false);
  const [hwResult, setHwResult] = useState(null);

  const handleHomeworkSubmit = async () => {
    if (!hwFile) return;
    setHwUploading(true);
    try {
      const result = await HomeworkEngine.run({
        teacherId: teacher?.id || 'unknown',
        studentId: 'student_001',
        subject: subject,
        grade: grade,
        rank: selfReportedLevel,
        homeworkType: 'image_upload',
        image: hwFile
      });
      setHwResult(result);
    } catch(e) {
      console.error(e);
    } finally {
      setHwUploading(false);
    }
  };

  useEffect(() => {
    const config = isExam
      ? getExamTestConfig(selfReportedLevel, grade)
      : getLevelConfig(selfReportedLevel); // Or you can also update getLevelConfig if normal mode supports it

    const qs = buildTestQuestions(unit, config);
    setQuestions(qs);
    // Start timer if exam mode
    if (isExam && config.timeLimit) {
      setTimeLeft(config.timeLimit * 60); // convert minutes to seconds
    }
  }, [unit, selfReportedLevel, isExam]);

  const finishTest = (finalAnswers) => {
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const wrongQuestions = finalAnswers.filter(a => !a.isCorrect);
    const mistakeTags = [...new Set(wrongQuestions.map(a => a.tag))];
    const solveTime = Math.round((Date.now() - startTime) / 1000);

    const nextFocus = mistakeTags.length > 0
      ? `다음 수업에서는 '${mistakeTags[0]}' 개념을 집중 교정 예정`
      : `다음 단원으로 진행해도 좋습니다!`;

    const result = {
      grade, subject, unit, teacher,
      inferredLevel: selfReportedLevel,
      totalQuestions: questions.length,
      correctCount,
      wrongQuestions: wrongQuestions.map(a => a.q),
      mistakeTags,
      solveTime,
      summary: `${questions.length}문제 중 ${correctCount}개 정답 (${Math.round(correctCount / questions.length * 100)}%)`,
      nextLessonFocus: nextFocus,
    };

    saveResult(result);
    setPhase('result');
    window.__lastLessonResult = result; // expose for Dashboard
  };

  // Countdown timer (EXAM MODE only)
  useEffect(() => {
    if (!isExam || timeLeft === null || phase !== 'test') return;
    if (timeLeft <= 0) { finishTest(answers); return; }
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isExam, phase, answers]);

  const handleSelect = (optIdx) => {
    if (selected !== null) return; // already answered
    setSelected(optIdx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const q = questions[currentIdx];
    const correct = selected === q.answer;
    const newAnswers = [...answers, { q: q.q, chosen: q.options[selected], isCorrect: correct, tag: q.tag }];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentIdx + 1 >= questions.length) {
      finishTest(newAnswers);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  if (questions.length === 0) {
    return <div className="full-center"><div className="glass-panel" style={{ padding: '2rem' }}>문제를 불러오는 중...</div></div>;
  }

  const accuracy = answers.length > 0 ? Math.round(answers.filter(a => a.isCorrect).length / questions.length * 100) : 0;

  return (
    <div className="full-center lesson-test-container">
      <div className="glass-panel lesson-test-card animate-fade-in">
        
        {phase === 'test' && questions[currentIdx] && (
          <>
            <div className="test-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="test-badge">📝 확인 테스트 · {subject} · {unit}</div>
              <button 
                onClick={() => {
                   alert("테스트 중에는 Ai Vision Solution을 사용할 수 없습니다. (실전 훈련 모드)");
                }}
                className="hover-scale"
                style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', border: 'none', padding: '0.4rem 1rem', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}
              >
                ✨ AI Vision
              </button>
              <div className="test-progress">
                {currentIdx + 1} / {questions.length}
              </div>
            </div>
            
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
            </div>

            <h2 className="test-question">{questions[currentIdx].q}</h2>

            <div className="test-options">
              {questions[currentIdx].options.map((opt, idx) => {
                let cls = 'test-option';
                if (selected !== null) {
                  if (idx === questions[currentIdx].answer) cls += ' correct';
                  else if (idx === selected) cls += ' wrong';
                  else cls += ' dimmed';
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                    <span className="opt-label">{['①','②','③','④'][idx]}</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className={`answer-feedback ${selected === questions[currentIdx].answer ? 'correct' : 'wrong'}`}>
                {selected === questions[currentIdx].answer
                  ? <><CheckCircle size={16} /> 정답입니다! 잘 했어요 🎉</>
                  : <><XCircle size={16} /> 오답. 정답은 {['①','②','③','④'][questions[currentIdx].answer]} {questions[currentIdx].options[questions[currentIdx].answer]}</>
                }
              </div>
            )}

            <button className="btn-primary test-next-btn" onClick={handleNext} disabled={selected === null}>
              {currentIdx + 1 >= questions.length ? '결과 보기' : '다음 문제'} <ChevronRight size={18} />
            </button>
          </>
        )}

        {phase === 'result' && (
          <div className="test-result animate-fade-in">
            <div className="result-header">
              <h1 className="gradient-text">수업 완료 🎓</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{unit} 단원 확인 테스트</p>
            </div>

            <div className="result-score-circle" style={{ background: accuracy >= 80 ? 'rgba(16, 185, 129, 0.15)' : accuracy >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.1)' }}>
              <span className="score-num" style={{ color: accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444' }}>
                {accuracy}%
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>정확도</span>
            </div>

            <div className="result-stats">
              <div className="stat-item"><span>총 문제</span><strong>{questions.length}개</strong></div>
              <div className="stat-item"><span>정답</span><strong style={{ color: '#10b981' }}>{answers.filter(a => a.isCorrect).length}개</strong></div>
              <div className="stat-item"><span>오답</span><strong style={{ color: '#ef4444' }}>{answers.filter(a => !a.isCorrect).length}개</strong></div>
            </div>

            {answers.filter(a => !a.isCorrect).length > 0 && (
              <div className="mistake-tags">
                <h4>📌 오답 개념 태그</h4>
                <div className="tags-row">
                  {[...new Set(answers.filter(a => !a.isCorrect).map(a => a.tag))].map(tag => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="next-focus-box">
              <strong>다음 수업 포커스:</strong>{' '}
              {answers.filter(a => !a.isCorrect).length > 0
                ? `'${[...new Set(answers.filter(a => !a.isCorrect).map(a => a.tag))][0]}' 개념 집중 교정`
                : '다음 단원으로 진행해도 좋습니다!'}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px dashed #10b981', textAlign: 'left' }}>
              <h4 style={{ color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> 숙제 검사
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                숙제를 사진으로 올리면 AI가 검사해드려요
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                  <div className="btn-primary" style={{ borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 'bold', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                    📸 사진 촬영 버튼
                  </div>
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => { if(e.target.files?.length) { setHwFile(e.target.files[0]); setHwResult(null); } }} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </label>

                <label style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                  <div className="btn-secondary" style={{ borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #52525b', cursor: 'pointer', fontSize: '0.85rem' }}>
                    🖼️ 앨범 업로드 버튼
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => { if(e.target.files?.length) { setHwFile(e.target.files[0]); setHwResult(null); } }} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </label>

                {hwFile && !hwUploading && (
                  <button className="btn-primary" onClick={handleHomeworkSubmit} style={{ borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 'bold', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                    숙제 올리기
                  </button>
                )}
                {hwUploading && <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>채점 중...</div>}
              </div>

              {hwResult && (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>✅ 최근 제출 목록</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div>• 검사 완료 여부: <strong style={{color: '#10b981'}}>완료됨</strong></div>
                    <div>• 점수: <strong style={{color: '#3b82f6'}}>{hwResult.totalScore}점</strong></div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                      <strong>피드백 보기 버튼 (내용):</strong> {hwResult.feedback}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="result-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                <BarChart2 size={16} /> 대시보드로 이동
              </button>
              <button className="btn-primary" onClick={() => navigate('/teacher')}>
                이어서 수업하기 <ChevronRight size={16} />
              </button>
            </div>
            {/* Timer (EXAM MODE) */}
            {isExam && timeLeft !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: timeLeft < 120 ? '#ef4444' : '#f59e0b', fontWeight: '700' }}>
                <Clock size={14} />{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
