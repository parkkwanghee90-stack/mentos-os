import { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { initStudentProfile } from '@/engine/studentProfileEngine';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const Landing = lazy(() => import("@/pages/Landing"));
const Diagnosis = lazy(() => import("@/pages/Diagnosis"));
const PushSettings = lazy(() => import("@/pages/PushSettings"));
const TeacherSelect = lazy(() => import("@/pages/TeacherSelect"));
const GradeSelect = lazy(() => import("@/pages/GradeSelect"));
const EnglishClassroomScreen = lazy(() => import("@/pages/EnglishClassroom"));
const ScienceClassroomScreen = lazy(() => import("@/pages/ScienceClassroom"));
const MathClassroomScreen = lazy(() => import("@/pages/MathClassroom"));
const MathClassroom_h_math4 = lazy(() => import("@/pages/Math_h_math4"));
const MathClassroom_h_math6 = lazy(() => import("@/pages/Math_h_math6"));
const HomeworkList = lazy(() => import("@/pages/HomeworkList"));
const HomeworkDetail = lazy(() => import("@/pages/HomeworkDetail"));
const HomeworkMathBox = lazy(() => import("@/pages/HomeworkMathBox"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const LoginGate = lazy(() => import("@/components/auth/LoginGate"));
const MentosMockExam = lazy(() => import("@/pages/MentosMockExam"));
const LessonTest = lazy(() => import("@/pages/LessonTest"));
const Login = lazy(() => import("@/pages/Login"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Success = lazy(() => import("@/pages/Success"));
const Fail = lazy(() => import("@/pages/Fail"));

// 신규 법적 정책 페이지 추가
const Refund = lazy(() => import("@/pages/Refund"));
const LocalInspector = lazy(() => import("@/pages/LocalInspector"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const DesignCheck = lazy(() => import("@/pages/DesignCheck"));


// 진입 플로우: 매뉴얼 미확인 → /grade-select(매뉴얼) → /login → /dashboard
function RootRedirect() {
  const manualSeen = localStorage.getItem('mentos_manual_seen') === 'true';
  const isSuperPass = localStorage.getItem('mentos_super_pass') === 'true';

  if (!manualSeen) {
    // 1단계: 매뉴얼을 아직 안 봤으면 매뉴얼부터
    return <Navigate to="/grade-select" replace />;
  }

  // 2단계: 매뉴얼은 봤지만 로그인 안 됐으면 → 로그인으로
  // 3단계: 매뉴얼 봤고 로그인도 됐으면 → 대시보드로
  // (LoginGate가 /dashboard에서 로그인 여부를 체크하므로 /dashboard로 보내면 됨)
  if (isSuperPass) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { updatePremiumStatus, user } = useAuth();
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    initStudentProfile();

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      localStorage.setItem('mentos_is_paid', 'true');
      
      // Sync payment success to Supabase metadata
      if (user) {
        updatePremiumStatus(true);
      }
      
      // Auto register if no user registered yet
      if (!localStorage.getItem('mentos_mock_user')) {
        localStorage.setItem('mentos_mock_user', JSON.stringify({
          id: 'user_p_' + Date.now(),
          name: '프리미엄 학생',
          email: 'premium@mentos.ai',
          role: 'student'
        }));
      }

      setShowSuccessOverlay(true);
      // Clean query parameters from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('payment_fail') === 'true') {
      alert('결제가 실패했거나 취소되었습니다. 다시 시도해 주세요.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  return (
    <AppProvider>
      {showSuccessOverlay && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9, 9, 11, 0.9)',
          zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(16px)', padding: '1rem',
          color: 'white', fontFamily: 'system-ui, sans-serif'
        }}>
          {/* Glowing background */}
          <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.2)', filter: 'blur(100px)', top: '20%', pointerEvents: 'none' }} />
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            width: '100%', maxWidth: '460px',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
          }}>
            {/* Green Sparkles badge */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <span style={{ fontSize: '2.5rem' }}>✨</span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>
              결제 및 프리미엄 구독 완료!
            </h2>
            
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              축하드립니다! 멘토스 AI 프리미엄 이용권이 
              <br />
              성공적으로 활성화되었습니다.
              <br />
              <strong style={{ color: '#60a5fa' }}>주 2회 2시간</strong> 초밀착 맞춤형 AI 수업과 
              <br />
              전 과정 해설 솔루션이 지금 즉시 무제한 개방됩니다.
            </p>

            <button 
              onClick={() => {
                setShowSuccessOverlay(false);
                // Trigger storage event and reload to sync components
                window.dispatchEvent(new Event('storage'));
                window.location.reload();
              }}
              style={{
                width: '100%', padding: '1.1rem', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
              }}
            >
              학습 시작하기
            </button>
          </div>
        </div>
      )}

      <BrowserRouter>
        <Suspense fallback={<div style={{color:'white', padding:'2rem', background:'#09090b', height:'100vh'}}>Loading Mentos App...</div>}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/push-settings" element={<PushSettings />} />
            {/* <Route path="/teacher" element={<TeacherSelect />} /> */}
            <Route path="/grade-select" element={<GradeSelect />} />
            
            <Route path="/class/english" element={<EnglishClassroomScreen />} />
            <Route path="/class/science" element={<ScienceClassroomScreen />} />
            
            {/* 수학 교실: 반응형 단일 엔진 적용 (모든 강사 공통 최신 UI) */}
            <Route path="/class/math" element={<MathClassroomScreen />} />
            <Route path="/class/math/:teacherId" element={<MathClassroomScreen />} />
            
            <Route path="/test" element={<LessonTest />} />
            <Route path="/class/mock-exam" element={<MentosMockExam />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* 로그인 필수 라우트: LoginGate 적용 */}
            <Route path="/dashboard" element={<LoginGate required={true}><Dashboard /></LoginGate>} />
            <Route path="/parent/dashboard" element={<LoginGate required={true}><ParentDashboard /></LoginGate>} />
            <Route path="/homework" element={<LoginGate required={true}><HomeworkList /></LoginGate>} />
            
            <Route path="/homework/:hwId" element={<HomeworkDetail />} />
            <Route path="/homework/math/:homeworkId" element={<HomeworkMathBox />} />
            
            {/* Toss Payments 결제 통합 라우터 */}
            <Route path="/payment/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<Success />} />
            <Route path="/payment/fail" element={<Fail />} />

            {/* 신규 정책 페이지 라우터 */}
            <Route path="/refund" element={<Refund />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* 개발자 도구 및 힌트/보이스 검수용 라우트 */}
            <Route path="/inspector" element={<LocalInspector />} />
            <Route path="/design-check" element={<DesignCheck />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

