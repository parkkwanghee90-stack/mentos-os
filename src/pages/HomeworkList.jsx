import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHomeworkByTeacher } from '@/engine/assistantReviewEngine.js';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

export default function HomeworkList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [homeworks, setHomeworks] = useState([]);
  
  const currentTeacher = location.state?.teacher;

  useEffect(() => {
    // Read generated homework metadata from localStorage
    const localHw = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
    
    // Always make sure the simulation math homework is available
    const hasSim = localHw.some(h => h.homeworkId === 'sim_hw_001');
    const displayHw = [...localHw];
    
    // Get DB to check actual review status of sim_hw_001
    const db = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
    const simEntry = db.find(d => d.homeworkId === 'sim_hw_001');
    const isSimReviewed = simEntry?.status === 'reviewed';

    if (!hasSim) {
      displayHw.push({
        homeworkId: 'sim_hw_001',
        title: '[오답 집중 보강] 고차방정식 2단계 유사 유형 드릴',
        assignedAt: new Date().toISOString(),
        status: isSimReviewed ? 'reviewed' : 'assigned',
        subject: 'math',
        teacherId: 'AI 튜터'
      });
    } else {
      // Sync status
      displayHw.forEach(h => {
        if (h.homeworkId === 'sim_hw_001') {
          h.status = isSimReviewed ? 'reviewed' : h.status || 'assigned';
        }
      });
    }

    if (currentTeacher) {
      // Filter by teacher
      const filtered = displayHw.filter(h => h.teacherId === currentTeacher.id || h.teacherId === currentTeacher.name);
      setHomeworks(filtered);
    } else {
      setHomeworks(displayHw);
    }
  }, [currentTeacher]);

  return (
    <div style={{ padding: '2rem', background: '#09090b', color: 'white', minHeight: '100vh', boxSizing: 'border-box' }}>
      <button className="btn-secondary" style={{ marginBottom: '2rem', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} style={{ marginRight: '8px' }}/> 대시보드로 돌아가기
      </button>
      
      <h1 style={{ marginBottom: '2rem', color: '#10b981' }}>{currentTeacher?.name || '전체'} 선생님 전용 숙제함</h1>

      {homeworks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#18181b', borderRadius: '12px' }}>
          <h3 style={{ color: '#a1a1aa' }}>현재 배정된 숙제가 없습니다.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '800px' }}>
          {homeworks.map(hw => {
            const date = new Date(hw.assignedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
            const teacherName = currentTeacher ? currentTeacher.name : hw.teacherId;
            const statusLabel = hw.status === 'assigned' ? '미제출' : hw.status === 'submitted' ? '검사중' : '검사 완료';
            const statusColor = hw.status === 'assigned' ? '#ef4444' : hw.status === 'submitted' ? '#f59e0b' : '#10b981';

            return (
              <div 
                key={hw.homeworkId || hw.id}
                onClick={() => {
                  const targetId = hw.homeworkId || hw.id;
                  if (hw.subject === 'math' || targetId.includes('sim_hw_001')) {
                    navigate(`/homework/math/${targetId}`);
                  } else {
                    navigate(`/homework/${targetId}`);
                  }
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: `1px solid ${hw.status === 'assigned' || hw.status === 'pending' ? 'rgba(239,68,68,0.4)' : hw.status === 'submitted' ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}`, 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    [{date} 수학 {teacherName}]
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>{hw.title || hw.items?.[0]?.title || '종합 복습 과제'} {hw.items?.length > 1 ? `외 ${hw.items.length - 1}건` : ''}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: statusColor, fontWeight: 'bold' }}>
                  {hw.status === 'reviewed' ? <CheckCircle size={18} /> : hw.status === 'submitted' ? <Clock size={18} /> : null}
                  {statusLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
