import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, BookOpen, Send, ChevronRight, X, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import MathProblemRenderer from '@/components/MathProblemRenderer';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';
import { HOMEWORK_UNITS, getHomeworkRange, padProblemNum, getHomeworkProgress, saveHomeworkProgress, markSequenceComplete, WRONG_REVIEW_ID, getUnitById, buildSolutionSrc } from '@/data/homeworkSSOT';
import { addWrong, markResolved, getActiveUnresolvedWrongAnswers } from '@/services/wrongAnswerStore';
import { resolveAnswer } from '@/services/answerResolver';
import { recordCompletion, buildSummaryMessage } from '@/services/homeworkCompletion';
import { computeSolvedCounts } from '@/services/progressCounts';
import { queueParentPush } from '@/services/pushService';
import { mirrorProgress } from '@/services/syncService';
import avsAnswersData from '@/data/avs_answers.json';

export default function HomeworkMathBox() {
  const navigate = useNavigate();
  const { homeworkId } = useParams();
  const location = useLocation();
  
  // ── 상태 ──
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [gradingResult, setGradingResult] = useState(null); // null | 'correct' | 'incorrect' | 'avs_penalty'
  const [solvedStatus, setSolvedStatus] = useState({}); // { "001": { isCorrect, userAnswer, avsViewed } }
  const [showAVS, setShowAVS] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [toast, setToast] = useState(null);
  const [startTime] = useState(Date.now());
  const messagesEndRef = useRef(null);
  
  const [imageErrors, setImageErrors] = useState({});
  const [solErrors, setSolErrors] = useState({});

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. 로컬 스토리지에서 동적 배정된 숙제 정보 로드
  const dynamicDbEntry = useMemo(() => {
    if (!homeworkId) return null;
    const localHwDb = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
    return localHwDb.find(d => d.homeworkId === homeworkId);
  }, [homeworkId]);

  // ── 단원 정보 로드 (동적 숙제 우선, 없으면 SSOT) ──
  const hwUnit = useMemo(() => {
    if (homeworkId === WRONG_REVIEW_ID) {
      return { id: WRONG_REVIEW_ID, title: '오답 복습 노트', isWrongReview: true, isDynamic: true };
    }
    if (dynamicDbEntry) {
      const firstProb = dynamicDbEntry.problems?.[0];
      return {
        id: homeworkId,
        title: dynamicDbEntry.title,
        answerKey: firstProb?.unit || '수학상_09고차방정식_통합숙제',
        hintKey: firstProb?.unit || '수학상_09고차방정식_통합숙제',
        imagePath: '', 
        isDynamic: true
      };
    }
    return HOMEWORK_UNITS.find(u => u.id === homeworkId);
  }, [homeworkId, dynamicDbEntry]);

  const isWrongReview = homeworkId === WRONG_REVIEW_ID;

  const studentLevel = location.state?.studentLevel || localStorage.getItem('studentLevel') || '4~5등급';

  // 문제 범위 계산 (정적 숙제 전용)
  const problemRange = useMemo(() => {
    if (!hwUnit || hwUnit.isDynamic) return { start: 1, end: 1 };
    return getHomeworkRange(hwUnit, studentLevel);
  }, [hwUnit, studentLevel]);

  // 문제 목록 생성 (동적 숙제 대응)
  const problems = useMemo(() => {
    if (homeworkId === WRONG_REVIEW_ID) {
      const actives = getActiveUnresolvedWrongAnswers();
      return actives.map((e, idx) => {
        const unit = getUnitById(e.hwId);
        const keyStr = String(e.num).padStart(3, '0');
        const imgBase = unit ? unit.imagePath : '';
        return {
          problemId: `${e.hwId}_${keyStr}`,
          num: idx + 1,
          keyStr,
          imageSrc: `${imgBase}${keyStr}.webp`,
          solutionSrc: buildSolutionSrc(imgBase, e.num),
          isDynamic: true,
          _wr: e,
        };
      });
    }
    if (dynamicDbEntry) {
      return (dynamicDbEntry.problems || []).map((p, idx) => {
        const sourceIdx = p.sourceProblemId !== undefined ? p.sourceProblemId : (idx + 1);
        const keyStr = String(sourceIdx).padStart(3, '0');
        const imgDir = p.problemImage.replace(/[^/]+$/, ''); // 파일명 제거 → 폴더 경로

        return {
          problemId: p.problemId,
          num: idx + 1,
          keyStr: keyStr,
          imageSrc: p.problemImage,
          solutionSrc: buildSolutionSrc(imgDir, sourceIdx),
          isDynamic: true,
        };
      });
    }

    if (!hwUnit) return [];
    const list = [];
    for (let i = problemRange.start; i <= problemRange.end; i++) {
      const pid = padProblemNum(i);
      list.push({
        problemId: pid,
        num: i,
        keyStr: pid,
        imageSrc: `${hwUnit.imagePath}${pid}.webp`,
        solutionSrc: buildSolutionSrc(hwUnit.imagePath, i),
        isDynamic: false,
      });
    }
    return list;
  }, [hwUnit, problemRange, dynamicDbEntry]);

  // 정답 데이터 로드 (동적 숙제 대응)
  const answers = useMemo(() => {
    if (homeworkId === WRONG_REVIEW_ID) {
      const ansMap = {};
      const actives = getActiveUnresolvedWrongAnswers();
      actives.forEach((e) => {
        const keyStr = String(e.num).padStart(3, '0');
        const ans = resolveAnswer(e.answerKey, e.num);
        if (ans !== null) ansMap[`${e.hwId}_${keyStr}`] = ans;
      });
      return ansMap;
    }
    if (dynamicDbEntry) {
      const ansMap = {};
      (dynamicDbEntry.problems || []).forEach(p => {
        ansMap[p.problemId] = p.answer;
      });
      return ansMap;
    }
    if (!hwUnit) return {};
    return avsAnswersData[hwUnit.answerKey] || {};
  }, [hwUnit, dynamicDbEntry]);

  // 진행도 로드
  useEffect(() => {
    if (homeworkId) {
      const progress = getHomeworkProgress(homeworkId);
      setSolvedStatus(progress);
    }
  }, [homeworkId]);

  // SSOT에 없는 숙제면 에러
  if (!hwUnit) {
    return (
      <div style={{ background: '#09090b', color: 'white', height: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" />
        <h2 style={{ marginTop: '1rem' }}>숙제를 찾을 수 없습니다</h2>
        <p style={{ color: '#94a3b8' }}>ID: {homeworkId}</p>
        <button onClick={() => navigate('/homework')} style={{ marginTop: '1rem', padding: '0.8rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          숙제함으로 돌아가기
        </button>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIdx];
  const totalProblems = problems.length;
  const { answeredCount, correctCount, wrongCount, isAllSolved } = computeSolvedCounts(problems, solvedStatus);
  const currentSolved = currentProblem ? solvedStatus[currentProblem.problemId] : null;

  // ── 토스트 자동 숨김 ──
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── 정답 정규화 ──
  const normalizeAnswer = (str) => {
    if (!str) return '';
    let clean = String(str).replace(/\s+/g, '').trim();
    clean = clean.replace(/^[a-zA-Z]+[:=]/, '');
    if (!isNaN(clean) && clean.includes('.')) {
      const num = parseFloat(clean);
      if (Number.isInteger(num)) clean = String(num);
    }
    if (clean.startsWith('+') && !isNaN(clean.substring(1))) {
      clean = clean.substring(1);
    }
    const mapCircle = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
    if (mapCircle[clean]) clean = mapCircle[clean];
    return clean;
  };

  // ── AVS 보기 (정답 입력 전이면 오답 처리) ──
  const handleShowAVS = () => {
    if (!currentProblem) return;
    const pid = currentProblem.problemId;
    const alreadyAnswered = solvedStatus[pid]?.userAnswer !== undefined;

    if (!alreadyAnswered) {
      // ⚠️ 정답 입력 전에 AVS 조회 → 오답 처리
      const newStatus = {
        ...solvedStatus,
        [pid]: { isCorrect: false, userAnswer: '', avsViewed: true, avsBeforeAnswer: true }
      };
      setSolvedStatus(newStatus);
      saveHomeworkProgress(homeworkId, newStatus);
      setGradingResult('avs_penalty');
      setToast('⚠️ 정답 입력 전 힌트 조회 → 오답 처리');
      if (!isWrongReview && currentProblem && !currentProblem.isDynamic) {
        addWrong({ hwId: hwUnit.id, num: parseInt(currentProblem.keyStr, 10), unit: hwUnit.relatedUnit || hwUnit.title, answerKey: hwUnit.answerKey });
      }
    }

    setShowAVS(true);
  };

  // ── 채점 ──
  const handleGrade = () => {
    if (!currentProblem || !userAnswer.trim()) return;
    const pid = currentProblem.problemId;

    // 이미 AVS를 미리 본 경우 → 무조건 오답
    if (solvedStatus[pid]?.avsBeforeAnswer) {
      setGradingResult('avs_penalty');
      setToast('⚠️ AVS 조회 후 풀이 → 오답 처리');
      return;
    }

    const normUser = normalizeAnswer(userAnswer);
    const correctAnswer = answers[pid] || '';
    const normCorrect = normalizeAnswer(correctAnswer);

    // 정확 일치 비교 (includes 버그 수정)
    const isCorrect = normUser.length > 0 && normUser === normCorrect;

    const newStatus = {
      ...solvedStatus,
      [pid]: { isCorrect, userAnswer, avsViewed: solvedStatus[pid]?.avsViewed || false }
    };
    setSolvedStatus(newStatus);
    saveHomeworkProgress(homeworkId, newStatus);
    mirrorProgress({ homeworkId, problemId: pid, isCorrect, userAnswer, avsViewed: newStatus[pid]?.avsViewed || false });
    setGradingResult(isCorrect ? 'correct' : 'incorrect');

    // 오답노트 수집 (오답노트 자체 풀이 중에는 재수집 안 함)
    if (!isWrongReview && currentProblem && !currentProblem.isDynamic) {
      const numVal = parseInt(currentProblem.keyStr, 10);
      if (isCorrect) {
        markResolved(hwUnit.id, numVal);
      } else {
        addWrong({ hwId: hwUnit.id, num: numVal, unit: hwUnit.relatedUnit || hwUnit.title, answerKey: hwUnit.answerKey });
      }
    }

    // 오답이면 해설+AVS 자동 표시
    if (!isCorrect) {
      setShowSolution(true);
      setShowAVS(true);
    }
  };

  // ── 문제 이동 ──
  const goToProblem = (idx) => {
    setCurrentProblemIdx(idx);
    setGradingResult(null);
    setShowAVS(false);
    setShowSolution(false);
    const pid = problems[idx]?.problemId;
    setUserAnswer(solvedStatus[pid]?.userAnswer || '');
  };

  // ── 최종 완료 ──
  const handleFinish = () => {
    if (!hwUnit.isDynamic) {
      markSequenceComplete(hwUnit);
    } else {
      // 동적 숙제인 경우 status 완료로 업데이트
      const localHwList = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
      const updated = localHwList.map(h => {
        if (h.homeworkId === homeworkId) {
          return { ...h, status: 'completed' };
        }
        return h;
      });
      localStorage.setItem('mentosHomework', JSON.stringify(updated));
    }

    // 진행도 최종 저장
    saveHomeworkProgress(homeworkId, solvedStatus);

    // 완료 기록 + 학부모 푸시 (전 문항 완료 시 최초 1회)
    if (isAllSolved) {
      const accuracy = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0;
      const minutes = Math.round((Date.now() - startTime) / 60000);
      const summary = { title: hwUnit.title, accuracy, correct: correctCount, total: totalProblems, wrong: wrongCount, minutes };
      const completionKey = isWrongReview ? `${homeworkId}_${new Date().toISOString().slice(0, 10)}` : homeworkId;
      const { shouldPush } = recordCompletion(completionKey, summary);
      if (shouldPush) {
        const studentName = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}')?.name || '멘토스 학생';
        queueParentPush(buildSummaryMessage(studentName, summary), {
          templateKey: 'homework', // 숙제결과리포트
          variables: {
            '#{name}': studentName,
            '#{hwname}': summary.title || '수학 숙제',
            '#{submit}': `${summary.correct}/${summary.total}문제 제출`,
            '#{rate}': `${summary.accuracy}%`,
            '#{wrongnote}': `오답 ${summary.wrong}개`,
          },
        });
      }
    }

    const elapsed = Math.round((Date.now() - startTime) / 60000);
    alert(
      `🎉 숙제 완료!\n\n` +
      `📐 ${hwUnit.title}\n` +
      `📊 정답률: ${Math.round((correctCount / totalProblems) * 100)}% (${correctCount}/${totalProblems})\n` +
      `❌ 오답: ${wrongCount}문제\n` +
      `⏱️ 소요시간: ${elapsed}분`
    );
    navigate('/homework');
  };

  // ── 이미지 해석 (한글 경로 인코딩 방어) ──
  const resolveImage = (path) => {
    if (!path) return '';
    if (typeof window !== 'undefined' && window.resolveAsset) {
      return window.resolveAsset(path);
    }
    
    let cleanPath = path;
    try {
      cleanPath = decodeURIComponent(path);
    } catch (e) {}

    const segments = cleanPath.split('/');
    const encodedSegments = segments.map(seg => {
      if (!seg) return '';
      if (seg.endsWith(':')) return seg; 
      return encodeURIComponent(seg);
    });

    let result = encodedSegments.join('/');
    if (path.startsWith('/') && !result.startsWith('/')) {
      result = '/' + result;
    }
    return result;
  };

  // ── 문제 번호 그리드 렌더 ──
  const renderProblemGrid = (isCompact = false) => (
    <div style={{
      display: isCompact ? 'flex' : 'grid',
      gridTemplateColumns: isCompact ? undefined : 'repeat(5, 1fr)',
      gap: '6px',
      ...(isCompact ? { overflowX: 'auto', padding: '0.5rem 0.8rem', whiteSpace: 'nowrap' } : {}),
    }}>
      {problems.map((p, idx) => {
        const status = solvedStatus[p.problemId];
        const isCurrent = currentProblemIdx === idx;
        let bg = '#27272a';
        if (status) bg = status.isCorrect ? '#10b981' : '#ef4444';
        if (isCurrent) bg = '#3b82f6';
        
        return (
          <div
            key={p.problemId}
            onClick={() => goToProblem(idx)}
            style={{
              width: isCompact ? '34px' : '38px',
              height: isCompact ? '34px' : '38px',
              borderRadius: '8px',
              display: isCompact ? 'inline-flex' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
              flexShrink: 0, background: bg,
              border: isCurrent ? '2px solid white' : '1px solid #3f3f46',
              transition: 'all 0.15s',
            }}
          >
            {p.num}
          </div>
        );
      })}
    </div>
  );

  // ── 문제 표시 영역 ──
  const renderProblemArea = () => (
    <div style={{
      background: 'white', color: 'black', padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '14px', marginBottom: '1rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    }}>
      <h3 style={{
        margin: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: isMobile ? '0.9rem' : '1rem',
      }}>
        [{hwUnit.title}] 문제 {currentProblem.num}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
        {imageErrors[currentProblem.problemId] ? (
          <div style={{
            padding: '2.5rem 1rem', textAlign: 'center', background: '#f8fafc',
            border: '2px dashed #cbd5e1', borderRadius: '12px', width: '100%',
            color: '#64748b'
          }}>
            <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 0.4rem 0', color: '#334155' }}>
              숙제 문제를 불러올 수 없습니다
            </p>
            <p style={{ fontSize: '0.72rem', margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              경로: {currentProblem.imageSrc}
            </p>
          </div>
        ) : (
          <img
            src={resolveImage(currentProblem.imageSrc)}
            alt={`문제 ${currentProblem.num}`}
            style={{
              maxWidth: '100%', maxHeight: isMobile ? '300px' : '420px',
              objectFit: 'contain', borderRadius: '8px',
            }}
            onError={() => {
              setImageErrors(prev => ({ ...prev, [currentProblem.problemId]: true }));
            }}
          />
        )}
      </div>
    </div>
  );

  // ── 답안 입력 + 채점 결과 ──
  const renderAnswerArea = () => {
    const isAnswered = currentSolved?.userAnswer !== undefined;
    const isPenalized = currentSolved?.avsBeforeAnswer;
    const isLocked = isPenalized || (isAnswered && currentSolved?.isCorrect);

    return (
      <div style={{
        background: '#18181b', padding: isMobile ? '0.8rem' : '1.2rem',
        borderRadius: '12px', border: '1px solid #27272a', marginBottom: '1rem',
      }}>
        {/* AVS 선조회 패널티 경고 */}
        {isPenalized && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '0.8rem',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.8rem', color: '#fca5a5',
          }}>
            <AlertTriangle size={14} /> 정답 입력 전 AVS 조회 → 오답 처리됨
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder={isLocked ? (isPenalized ? "오답 처리됨" : "정답 완료") : "정답 입력"}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isLocked}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGrade(); }}
            style={{
              flex: 1, padding: isMobile ? '0.6rem' : '0.8rem',
              background: '#09090b', border: '1px solid #3f3f46',
              borderRadius: '8px', color: 'white', fontSize: isMobile ? '0.9rem' : '1rem',
              opacity: isLocked ? 0.5 : 1,
            }}
          />
          <button
            onClick={handleGrade}
            disabled={isLocked || !userAnswer.trim()}
            style={{
              padding: `0 ${isMobile ? '1rem' : '1.5rem'}`,
              background: isLocked ? '#3f3f46' : '#10b981',
              color: 'white', border: 'none', borderRadius: '8px',
              fontWeight: 'bold', cursor: isLocked ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
            }}
          >
            채점
          </button>
          <button
            onClick={handleShowAVS}
            style={{
              padding: `0 ${isMobile ? '0.8rem' : '1.2rem'}`,
              background: showAVS ? '#6d28d9' : '#8b5cf6',
              color: 'white', border: 'none', borderRadius: '8px',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            {showAVS ? <EyeOff size={14}/> : <Eye size={14}/>}
            AVS
          </button>
        </div>

        {/* 채점 결과 */}
        {gradingResult && (
          <div style={{
            marginTop: '0.8rem', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.85rem',
            color: gradingResult === 'correct' ? '#10b981' :
                   gradingResult === 'avs_penalty' ? '#f59e0b' : '#ef4444',
          }}>
            {gradingResult === 'correct' ? (
              <><CheckCircle size={16}/> 정답입니다! 🎉</>
            ) : gradingResult === 'avs_penalty' ? (
              <><AlertTriangle size={16}/> AVS 선조회 → 오답 처리</>
            ) : (
              <><X size={16}/> 오답입니다. (정답: {answers[currentProblem.problemId]})</>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── 해설 이미지 (오답 시 자동 표시) ──
  const renderSolution = () => {
    if (!showSolution && !currentSolved) return null;
    if (currentSolved?.isCorrect && !showSolution) return null;

    return (
      <div style={{
        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: '14px', padding: '1rem', marginBottom: '1rem',
      }}>
        <h4 style={{ margin: '0 0 0.8rem 0', color: '#fca5a5', fontSize: '0.9rem' }}>
          📝 정답 및 해설
        </h4>
        {solErrors[currentProblem.problemId] ? (
          <div style={{
            padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px',
            color: '#94a3b8', fontSize: '0.8rem'
          }}>
            <p style={{ margin: '0 0 0.2rem 0' }}>해설 이미지를 불러올 수 없습니다.</p>
            <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b', wordBreak: 'break-all' }}>
              경로: {currentProblem.solutionSrc}
            </p>
          </div>
        ) : (
          <img
            src={resolveImage(currentProblem.solutionSrc)}
            alt={`해설 ${currentProblem.num}`}
            style={{ maxWidth: '100%', borderRadius: '8px' }}
            onError={() => {
              setSolErrors(prev => ({ ...prev, [currentProblem.problemId]: true }));
            }}
          />
        )}
      </div>
    );
  };

  // ── AVS 힌트 ──
  const renderAVSHint = () => {
    if (!showAVS) return null;

    // hintKey가 null인 경우 → solutionHtmlPath 체크
    if (!hwUnit.hintKey) {
      // solutionHtmlPath가 있으면 HTML 해설 iframe 표시
      if (hwUnit.solutionHtmlPath) {
        // 학생 레벨에 따라 적절한 단계 해설 선택
        const is34 = studentLevel === '1~2등급' || studentLevel === '3등급';
        const stageKey = is34
          ? (hwUnit.solutionHtmlPath['3·4단계'] || hwUnit.solutionHtmlPath['3단계'] || hwUnit.solutionHtmlPath['4단계'] || Object.values(hwUnit.solutionHtmlPath)[Object.keys(hwUnit.solutionHtmlPath).length - 1])
          : (hwUnit.solutionHtmlPath['2단계'] || Object.values(hwUnit.solutionHtmlPath)[0]);

        if (stageKey) {
          // 한글 경로 인코딩
          const encodedPath = stageKey.split('/').map(s => encodeURIComponent(s)).join('/');
          return (
            <div style={{
              background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '14px', padding: '1rem', marginBottom: '1rem',
            }}>
              <h4 style={{ margin: '0 0 0.8rem 0', color: '#c4b5fd', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📝 정답 및 해설 {is34 ? '(3·4단계)' : '(2단계)'}
              </h4>
              <iframe
                src={encodedPath}
                title="정답 및 해설"
                style={{
                  width: '100%', minHeight: '500px', border: 'none',
                  borderRadius: '10px', background: 'white',
                }}
                sandbox="allow-same-origin"
              />
            </div>
          );
        }
      }

      // solutionHtmlPath도 없으면 안내 표시
      return (
        <div style={{
          background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center',
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#c4b5fd', fontSize: '0.9rem' }}>
            ✨ AI Vision Solution
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            이 단원의 AVS 힌트는 현재 준비 중입니다.<br/>
            해설 이미지를 참고해 주세요.
          </p>
        </div>
      );
    }

    // AVS 1:1 결속 렌더러
    // 동적 숙제는 문제의 keyStr를 통해 3자리 포맷(예: "001")을 problemId로 힌트 컴포넌트에 전달해야 함
    const hintProblemId = hwUnit.isDynamic ? currentProblem.keyStr : currentProblem.problemId;

    return (
      <div style={{
        background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '14px', padding: '1rem', marginBottom: '1rem',
      }}>
        <h4 style={{ margin: '0 0 0.8rem 0', color: '#c4b5fd', fontSize: '0.9rem' }}>
          ✨ AI Vision Solution
        </h4>
        <HintPlayerRouter
          unit={hwUnit.hintKey}
          problemId={hintProblemId}
          showQA={false}
        />
      </div>
    );
  };

  // ── 요약 바 ──
  const renderSummaryBar = () => (
    <div style={{
      display: 'flex', gap: '1rem', padding: '0.8rem 1rem',
      background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem',
      fontSize: '0.78rem', color: '#94a3b8',
      justifyContent: 'space-around',
    }}>
      <span>진행 <b style={{color:'#60a5fa'}}>{answeredCount}/{totalProblems}</b></span>
      <span>정답 <b style={{color:'#10b981'}}>{correctCount}</b></span>
      <span>오답 <b style={{color:'#ef4444'}}>{wrongCount}</b></span>
      <span>정답률 <b style={{color:'#fbbf24'}}>{totalProblems > 0 ? Math.round((correctCount/totalProblems)*100) : 0}%</b></span>
    </div>
  );

  // ════════════════════════════════════════
  // 모바일 레이아웃
  // ════════════════════════════════════════
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#09090b', color: 'white', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '0.7rem 1rem', background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => navigate('/homework')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} style={{ marginRight: '4px' }}/> 숙제함
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#10b981' }}>{hwUnit.title}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({currentProblemIdx + 1}/{totalProblems})</span>
        </div>

        {/* 문제 번호 스크롤 */}
        <div style={{ background: '#18181b', borderBottom: '1px solid #27272a', flexShrink: 0 }}>
          {renderProblemGrid(true)}
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem' }}>
          {renderSummaryBar()}
          {renderProblemArea()}
          {renderAnswerArea()}
          {renderSolution()}
          {renderAVSHint()}

          {isAllSolved && (
            <button onClick={handleFinish} style={{
              width: '100%', padding: '0.8rem', background: '#10b981', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: '0.95rem', marginBottom: '1rem',
            }}>
              🎉 숙제 완료 제출
            </button>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <div style={{ padding: '0.7rem 1rem', background: '#18181b', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <button
            disabled={currentProblemIdx === 0}
            onClick={() => goToProblem(currentProblemIdx - 1)}
            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', opacity: currentProblemIdx === 0 ? 0.3 : 1 }}
          >
            이전 문제
          </button>
          <button
            disabled={currentProblemIdx === totalProblems - 1}
            onClick={() => goToProblem(currentProblemIdx + 1)}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentProblemIdx === totalProblems - 1 ? 0.3 : 1 }}
          >
            다음 문제 <ChevronRight size={14}/>
          </button>
        </div>

        {/* 토스트 */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
            background: '#f59e0b', color: '#000', padding: '0.6rem 1.2rem',
            borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 9999,
            animation: 'fadeIn 0.3s ease',
          }}>
            {toast}
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        `}</style>
      </div>
    );
  }

  // ════════════════════════════════════════
  // 데스크탑 레이아웃
  // ════════════════════════════════════════
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: 'white' }}>
      {/* 사이드바 */}
      <div style={{ width: '280px', borderRight: '1px solid #27272a', padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => navigate('/homework')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} style={{ marginRight: '8px' }}/> 숙제함
        </button>

        <h2 style={{ color: '#10b981', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{hwUnit.title}</h2>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          {studentLevel} · {problemRange.end - problemRange.start + 1}문제
        </p>

        {renderSummaryBar()}

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {renderProblemGrid(false)}
        </div>

        <button
          onClick={handleFinish}
          disabled={!isAllSolved}
          style={{
            padding: '0.8rem', fontWeight: 'bold', cursor: isAllSolved ? 'pointer' : 'not-allowed',
            background: isAllSolved ? '#10b981' : '#3f3f46',
            color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem',
          }}
        >
          {isAllSolved ? '🎉 숙제 완료 제출' : `${totalProblems - answeredCount}문제 남음`}
        </button>
      </div>

      {/* 메인 영역 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            {renderProblemArea()}
            {renderAnswerArea()}
            {renderSolution()}
            {renderAVSHint()}
          </div>
        </div>

        {/* 하단 바 */}
        <div style={{ padding: '0.8rem 2rem', background: '#18181b', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            disabled={currentProblemIdx === 0}
            onClick={() => goToProblem(currentProblemIdx - 1)}
            style={{ padding: '0.6rem 1.2rem', background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', opacity: currentProblemIdx === 0 ? 0.3 : 1 }}
          >
            이전 문제
          </button>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>문제 {currentProblem.num} / {totalProblems}</span>
          <button
            disabled={currentProblemIdx === totalProblems - 1}
            onClick={() => goToProblem(currentProblemIdx + 1)}
            style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: currentProblemIdx === totalProblems - 1 ? 0.3 : 1 }}
          >
            다음 문제 <ChevronRight size={18} style={{ verticalAlign: 'middle' }}/>
          </button>
        </div>
      </div>

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: '#f59e0b', color: '#000', padding: '0.6rem 1.5rem',
          borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
