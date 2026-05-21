
  // if (!currentTeacher || !currentSubject) {
  //   return (
  //     <div className="classroom-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  //       <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px' }}>
  //         <h2>접근 오류</h2>
  //         <p>수업 진입 상태(state)가 누락되었습니다. 진단 화면에서 다시 시작해주세요.</p>
  //         <button className="btn-primary" onClick={() => navigate('/diagnosis')} style={{ marginTop: '1rem' }}>진단으로 돌아가기</button>
  //       </div>
  //     </div>
  //   );
  // }

  console.log(`[HEADER SYNC]
subject=${localizedSubject}
unitTitle=${unit}
phase=${currentPhase}
mode=${mode}
teacherSubject=${currentTeacher?.subject || currentSubject}`);

  return (
    <>
    {showUploadPrompt && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e1e2e', padding: '3rem', borderRadius: '20px', border: '2px solid #3b82f6', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 'bold' }}>숙제 검사 결과 업로드</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '2.5rem', lineHeight: '1.5', fontSize: '1.05rem' }}>
            오늘 수업에서 받은 숙제가 있으면 지금 업로드해 주세요.<br/>
            <strong style={{ color: '#60a5fa' }}>멘토스 학습 요약</strong>이 즉시 문서를 분석해서<br/>
            숙제를 기반으로 맞춤형 시험 준비를 자동 설계합니다.
          </p>
          
          {uploading ? (
            <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.2rem' }}>문서 분석 및 문제 생성 중...</div>
              <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => handleStartPrintMode('pdf')} style={{ background: '#3b82f6', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>PDF 파일 업로드</button>
              <button onClick={() => handleStartPrintMode('image')} style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>사진 촬영 / 이미지 업로드</button>
              <button onClick={handleSkipUpload} style={{ background: 'transparent', color: '#a1a1aa', padding: '1rem', borderRadius: '12px', border: '2px solid #52525b', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem', transition: 'all 0.2s' }}>없어요 (기본 커리큘럼으로 수업 시작)</button>
            </div>
          )}
        </div>
      </div>
    )}
    <div className="classroom-layout" style={{ gridTemplateColumns: (isMathSlideMode && !isWhiteFocusMode) ? '1fr' : '1fr 350px', marginTop: '10px' }}>
      {isWhiteFocusMode ? (
        <WhiteFocusMode subject={currentSubject} teacher={currentTeacher} onClose={() => setIsWhiteFocusMode(false)} />
      ) : isMathSlideMode ? (
        <div className="unified-math-panel glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '90vh', borderRadius: '20px', overflow: 'hidden' }}>
          
          {/* =========================================
              새로운 통합 Annotation Layout (Math Slide Mode)
             ========================================= */}
          
           {/* 상단: 화면 PNG + Annotation Layer (85% 영역) */}
          <div style={{ flex: '1 1 85%', minHeight: 0, background: 'rgba(10, 10, 15, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            
            <div style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img 
                src={`/math_images/polynomial/${currentSlideIndex.toString().padStart(2, `0')}.webp'} 
                alt={`Slide ${currentSlideIndex}`} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', borderRadius: '12px' }} 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<div style="color:red">이미지 로드 실패 (경로 오류)</div>'; }}
              />
              
              {/* === AI Annotation Layer === */}
              <div className="annotation-layer" style={{ display: isConceptMode ? 'none' : 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                {currentSlideIndex === 5 && [
                    { id: 1, type: "box", x: 38, y: 44, width: 14, height: 6, color: "rgba(239, 68, 68, 0.2)", stroke: "#ef4444" },
                    { id: 2, type: "text", x: 55, y: 38, text: "먼저 B를 3에 공급합니다", color: "#3b82f6", fontSize: "1.2rem" },
                    { id: 3, type: "arrow", startX: 54, startY: 40, endX: 47, endY: 44, color: "#3b82f6", length: "8%" },
                    { id: 4, type: "underline", x: 28, y: 41, width: 22, height: 0, color: "#10b981" }
                ].map(ann => {
                  if (ann.type === 'box') {
                     return <div key={ann.id} style={{ position: 'absolute', left: '${ann.x}%`, top: `${ann.y}%`, width: `${ann.width}%`, height: `${ann.height}%`, backgroundColor: ann.color, border: `2px solid ${ann.stroke}`, borderRadius: '4px' }} />;
                  } else if (ann.type === 'text') {
                     return <div key={ann.id} style={{ position: 'absolute', left: '${ann.x}%`, top: `${ann.y}%', color: ann.color, fontSize: ann.fontSize, fontWeight: '800', textShadow: '0px 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>{ann.text}</div>;
                  } else if (ann.type === 'arrow') {
                     const angle = Math.atan2(ann.endY - ann.startY, ann.endX - ann.startX) * 180 / Math.PI;
                     return (
                       <div key={ann.id} style={{ position: 'absolute', left: '${ann.startX}%`, top: `${ann.startY}%', width: ann.length, height: '3px', backgroundColor: ann.color, transformOrigin: '0 0', transform: 'rotate(${angle}deg)` }}>
                         <div style={{ position: 'absolute', right: '-2px', top: '-5px', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid ${ann.color}` }} />
                       </div>
                     );
                  } else if (ann.type === 'underline') {
                     return <div key={ann.id} style={{ position: 'absolute', left: '${ann.x}%`, top: `${ann.y}%`, width: `${ann.width}%`, height: '2px', backgroundColor: ann.color }} />;
                  }
                  return null;
                })}
              </div>
              {/* ===================== */}
              {/* === AI Full Solution Overlay Layer === */}
              {!isConceptMode && messages.filter(m => m.role === 'assistant').length > 0 && currentSlideIndex > 0 && (
                <div className="solution-shell" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(15, 15, 20, 0.85)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0
                }}>
                  <div className="solution-scroll" style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '2.5rem',
                    color: 'white',
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    borderRadius: '12px'
                  }}>
                    {messages.filter(m => m.role === 'assistant').map((msg, idx) => {
                      return (
                        <div key={idx} style={{ marginBottom: '2rem' }}>
                          <MathTextRenderer 
                             text={msg.content} 
                             onRead={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                             onExplain={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* ================================== */}

              {/* === CONCEPT MODE OVERLAY === */}
              {isConceptMode && (
                <div className="concept-panel" style={{
                  position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
                  backgroundColor: 'white',
                  zIndex: 9999,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                  paddingTop: '60px', paddingBottom: '40px', gap: '32px', color: '#1e293b'
                }}>
                  <button onClick={handleConceptModeExit} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X 닫기</button>
                  
                  {/* Top Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', minHeight: '120px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#3b82f6', fontWeight: 'bold' }}>구조화 학습 영역</h2>
                    <div style={{ opacity: conceptStep >= 1 ? 1 : 0, transition: 'opacity 1s', textAlign: 'center', fontSize: '1.8rem' }}>
                      <BlockMath math={conceptData?.target || ""} />
                    </div>
                  </div>

                  {/* Middle Zone */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '900px', flex: 1, justifyContent: 'center' }}>
                    {/* Step 2 */}
                    <div className="bracket-row" style={{ opacity: conceptStep >= 2 ? 1 : 0, transition: 'opacity 1s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', minHeight: '80px', color: '#8b5cf6', fontSize: '1.8rem' }}>
                      <BlockMath math={conceptData?.slot || "\\phantom{a}"} />
                    </div>

                    {/* Step 3 */}
                    <div className="case-row" style={{ opacity: conceptStep >= 3 ? 1 : 0, transition: 'opacity 1s', display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: '28px', minHeight: '140px', width: '100%', marginTop: '1rem' }}>
                      {conceptData?.combinations?.map(c => {
                        return (
                          <div key={c.id} style={{ background: `${c.color}11', padding: '1rem 2rem', borderRadius: '12px', border: '2px solid ${c.color}', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem', minWidth: '160px', textAlign: 'center' }}>
                             <BlockMath math={c.text} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Zone */}
                  <div className="result-row" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '140px', width: '100%', maxWidth: '800px' }}>
                    {/* Step 4 */}
                    <div style={{ opacity: conceptStep >= 4 ? 1 : 0, transition: 'opacity 1s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', fontSize: '1.6rem' }}>
                      {conceptData?.reductions?.map((r, idx) => {
                        return (
                          <React.Fragment key={r.id}>
                            {idx > 0 && r.text && !r.text.trim().startsWith('-') && (
                              <div style={{ color: '#64748b', fontSize: '2rem' }}>+</div>
                            )}
                            <div style={{ color: r.color, background: '#f8fafc', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                              <BlockMath math={r.text} />
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Step 5 */}
                    <div style={{ opacity: conceptStep >= 5 ? 1 : 0, transition: 'opacity 1s', textAlign: 'center', marginTop: '1.5rem', background: '#ecfeff', padding: '1.2rem 3rem', borderRadius: '16px', border: '3px solid #06b6d4', fontSize: '2rem' }}>
                      <BlockMath math={conceptData?.final || "\\phantom{a}"} />
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.8rem', borderRadius: '12px', zIndex: 10 }}>
              Page {currentSlideIndex.toString().padStart(2, '0')} / 52
            </div>
          </div>
          
           {/* 하단: 채팅 + 최소 액션 영역 (15%) */}
          <div className="input-area" style={{ flex: '0 0 15%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,30,0.95)' }}>
            
            {/* 최근 AI 응답 표시 (요약 또는 빈칸 처리) */}
            <div style={{ fontSize: '1rem', color: '#a855f7', fontWeight: '600', marginBottom: '0.8rem', minHeight: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
               {loading ? (
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>AI 선생님이 최적의 내용을 작성하고 있습니다...</span>
               ) : (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>이전 문제에서 상세 내용을 확인하세요. 계속 질문하거나 다음 버튼을 눌러주세요.</span>
               )}
            </div>

            <div className="input-wrapper" style={{ display: 'flex', gap: '0.8rem', position: 'relative' }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="궁금한 부분을 직접 입력 (예: 'B가 왜 이렇게 되나요?')" onKeyPress={(e) => e.key === 'Enter' && handleSend()} style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1rem' }} />
              
              <div style={{ position: 'relative' }}>
                <button className="action-btn next-btn" onClick={() => setIsWhiteFocusMode(true)} disabled={loading} style={{ background: '#ffffff', color: '#000000', border: '1px solid #ccc', padding: '0 1.5rem', height: '100%', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginRight: '0.5rem' }}>
                  집중 모드
                </button>
                {currentSlideIndex === 8 && (
                  <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.9rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>NEW!</span>
                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>잘 듣고 가보세요!</span>
                  </div>
                )}
                <button className="action-btn next-btn" onClick={handleConceptModeStart} disabled={loading} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0 1.5rem', height: '100%', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: currentSlideIndex === 8 ? '0 0 15px rgba(139, 92, 246, 0.6)' : 'none' }}>
                  개념 설명하기
                </button>
              </div>

              <button className="action-btn next-btn" onClick={() => { setInput('모르겠어요'); setTimeout(handleSend, 10); }} disabled={loading} style={{ background: '#4b5563', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                힌트 줘              </button>
              <button className="action-btn next-btn" onClick={() => { setInput('모르겠어요'); setTimeout(handleSend, 10); }} disabled={loading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                이해했어              </button>
              <button className="action-btn next-btn" onClick={handleNextSlide} disabled={loading} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                완료 (다음)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Area (Right/Left Column) */}
          <div className="chat-section glass-panel">
            {/* Top Sticky Study Bar */}
            <div style={{
              position: 'sticky', top: '0px', zIndex: 50,
              background: 'rgba(20, 20, 30, 0.85)', backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              padding: '0.8rem 1.2rem', marginBottom: '1rem', borderRadius: '10px 10px 0 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <button onClick={() => setIsWhiteFocusMode(true)} style={{ background: '#ffffff', color: '#000000', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                  吏묒쨷 紐⑤뱶
                </button>
                <div style={{ fontSize: '0.85rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(192,132,252,0.1)', borderRadius: '4px' }}>{phaseData?.label}</span>
                </div>
                {remaining !== null && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700',
                    color: remaining <= 10 * 60 * 1000 ? '#ef4444' : '#10b981'
                  }}>
                    <Clock size={16} />
                    남은 시간: {formatTime(remaining)}
                  </div>
                )}
              </div>
            </div>

            {/* 콘솔 디버그 로그 출력 (UI에서 숨김) */}

            {/* Phase progress bar */}
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {LESSON_PHASES.map((p, i) => {
                  const idx = LESSON_PHASES.findIndex(ph => ph.id === currentPhase);
                  const done = i < idx;
                  const active = p.id === currentPhase;
                  return (
                    <div key={p.id} title={p.label} style={{
                      flex: 1, height: '5px', borderRadius: '3px',
                      background: done ? '#10b981' : active ? p.color : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.4s'
                    }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: phaseData?.color, fontWeight: '700' }}>
                  {phaseData?.emoji} {phaseData?.label} ({phaseProgress.current}/{phaseProgress.total})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {studentState.phaseTurns}회 / 최소 {studentState.phaseMinTurns?.[currentPhase] ?? 2}회                </span>
              </div>
            </div>

            <div className="chat-messages">
              {currentPhase === 'hearing' && (
                <div style={{ padding: '2rem', background: '#f5f3ff', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', border: '2px solid #8b5cf6' }}>
                  <h3 style={{ color: '#6d28d9', marginBottom: '1rem' }}>🎧 Listening Practice</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => {
                        const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
                        if (lastAssistantMsg) {
                          speakText(lastAssistantMsg.content, { 
                            voice: getVoiceForTeacher(currentTeacher), 
                            isReplay: true,
                            phase: currentPhase
                          });
                        }
                      }}
                      style={{ padding: '0.8rem 2rem', background: '#8b5cf6', color: 'white', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ▶ Play Audio
                    </button>
                    <div style={{ width: '200px', height: '4px', background: '#ddd', borderRadius: '2px', position: 'relative' }}>
                      <div style={{ width: '30%', height: '100%', background: '#8b5cf6', position: 'absolute', left: 0, top: 0, transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>선생님의 질문에 잘 듣고 이해해주세요!</p>
                </div>
              )}
              {currentPhase === 'vocab' && (
                <div style={{ padding: '2rem', background: '#ecfdf5', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', border: '2px solid #10b981', overflow: 'hidden', position: 'relative' }}>
                  {['4','5','6','F'].some(grade => level.includes(grade)) ? (
                    // VeniceWordTest (4~6?깃툒)
                    <>
                      <h3 style={{ color: '#047857', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎮</span> 베네치아 단어 연습
                      </h3>
                      <div style={{ fontSize: '1.2rem', color: '#065f46', marginBottom: '1rem' }}>제시어: <strong>"포기하다, 버리다"</strong></div>
                      
                      <div style={{ height: '200px', background: 'rgba(16, 185, 129, 0.1)', position: 'relative', borderRadius: '8px', border: '1px solid #10b981', overflow: 'hidden' }}>
                        {/* FallDown animation would be implemented in CSS, here simulated via inline position */}
                        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                          abandon
                        </div>
                      </div>
                      
                      <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>단어가 떨어지기 전에 정답을 입력하세요!</p>
                    </>
                  ) : (
                    // ContextWordTest (1~3?깃툒)
                    <>
                      <h3 style={{ color: '#047857', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>📖</span> 맥락 문맥 추론 연습
                      </h3>
                      <div style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '1.5rem', lineHeight: '1.6', textAlign: 'left', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        "The government decided to <input type="text" placeholder="[빈칸]" style={{ width: '100px', borderBottom: '2px solid #10b981', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', textAlign: 'center', fontSize: '1.2rem', color: '#047857', fontWeight: 'bold' }} /> their controversial policy due to heavy public criticism."
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#6b7280', textAlign: 'left', paddingLeft: '1rem' }}>
                        힌트: 정책이나 계획 등을 <strong>"철회하다, 포기하다"</strong> 와 유사한 뜻이 필요로 합니다.
                      </div>
                      <button style={{ marginTop: '2rem', padding: '0.8rem 2.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)' }}>정답 제출</button>
                    </>
                  )}
                </div>
              )}
              {messages.map((msg) => {
                 const hasCorrectAction = msg.content?.includes('[CORRECT_ANSWER_ACTION]');
                 return (
                <div key={msg.id || Math.random()} className={`message-wrapper ${msg.role === `user' ? 'student' : 'teacher'}'}>
                  {msg.role === 'assistant' && <div className="avatar min-avatar'>{currentTeacher.name[0]}</div>}
                  <div className={`message ${msg.role === `user' ? 'student' : 'teacher'}'}>
                    <MathTextRenderer 
                        text={msg.content} 
                        onRead={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                        onExplain={(text) => speakText(text, { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })}
                    />
                    {hasCorrectAction && msg.role === 'assistant' && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleSend("왜 맞는지 설명해줘")} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>왜 맞는지 설명해줘</button>
                            <button onClick={() => speakText(msg.content.replace(/\[CORRECT_ANSWER_ACTION\]/g, ''), { voice: getVoiceForTeacher(currentTeacher), subject: currentSubject })} style={{ padding: '0.5rem 1rem', background: '#ecfdf5', color: '#047857', borderRadius: '8px', border: '1px solid #10b981', cursor: 'pointer', fontWeight: 'bold' }}>이 문장 다시 듣기</button>
                            <button onClick={() => handleSend("다음 문제 진행해줘")} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 'bold' }}>다음 문제 주세요</button>
                        </div>
                    )}
                  </div>
                </div>
              )})}
              {loading && (
                <div className="message-wrapper teacher">
                  <div className="avatar min-avatar">{currentTeacher.name[0]}</div>
                  <div className="message teacher typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              {error && (
                <div className="error-notice">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
              <div className="input-actions">
                {/* 마이크 버튼 (음성 입력) */}
                <button
                  id="btn-mic"
                  className={`icon-btn ${isRecording ? `active' : ''}'}
                  onClick={handleMic}
                  title={isRecording ? '녹음 중...' : (isListening ? '음성 인식 중...' : '마이크 켜기')}
                  style={{ color: isRecording ? '#ef4444' : (isListening ? '#10b981' : undefined), position: 'relative' }}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  {isRecording && (
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  )}
                </button>

                {/* TTS 켜기/끄기 토글 */}
                <button
                  id="btn-tts-toggle"
                  className="icon-btn"
                  onClick={() => {
                    const next = !ttsEnabled;
                    setTtsEnabled(next);
                    setMuted(!next);
                    if (!next) stopSpeaking();
                  }}
                  title={ttsEnabled ? '음성 켜기' : '음성 끄기'}
                >
                  {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {/* 전체 듣기 모드 토글 */}
                {ttsEnabled && (
                  <button
                    className="icon-btn"
                    onClick={() => setIsFullAudioMode(!isFullAudioMode)}
                    title={isFullAudioMode ? 'TTS: 전체 설명 듣기 (ON)' : 'TTS: 핵심 부분만 듣기 (기본)'}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: 'none', background: isFullAudioMode ? 'rgba(59,130,246,0.1)' : 'transparent', color: isFullAudioMode ? '#3b82f6' : 'var(--text-muted)' }}
                  >
                    {isFullAudioMode ? '듣기: 전체' : '듣기: 핵심'}
                  </button>
                )}

                {micError && (
                  <span style={{ fontSize: '0.72rem', color: '#ef4444', maxWidth: '140px', lineHeight: 1.2 }}>{micError}</span>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`${phaseData?.label} 단계 - 자유롭게 답해보세요`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-btn" onClick={handleSend} disabled={loading}><Send size={18} /></button>
              </div>
            </div>
          </div>
        </>
      )}



      {(!isMathSlideMode || isWhiteFocusMode) && (
        <>
          {/* Right Teacher Panel */}
          <div className="teacher-panel">
            <div className="teacher-visual glass-panel">
              <div className="teacher-video-container" style={{ 
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                width: '160px', height: '160px', borderRadius: '50%', 
                overflow: 'hidden', background: '#1a1a24', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 20 
              }}>
                <video 
                  src={`/teachers/${currentTeacher?.subject || (currentSubject === `physics' || currentSubject === '물리' ? 'physics' : 'english`)}/${selectedTeacherId}.mp4`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="teacher-video"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const fallbackMap = {
                      physics:     'physics1',
                      chemistry:   'chemistry1',
                      biology:     'bio1',
                      earthScience:'earth1',
                      math:        'math1',
                      english:     'eng1'
                    };
                    const subString = currentTeacher?.subject || 'english';
                    const fb = fallbackMap[subString] || 'eng1';
                    if (!e.currentTarget.src.endsWith(`${fb}.mp4`)) {
                      e.currentTarget.src = `/teachers/${subString}/${fb}.mp4`;
                    }
                  }}
                />
              </div>
              <div className="teacher-info text-center">
                <h3>{currentTeacher.name}</h3>
                <p className="teacher-role">{currentTeacher.style}</p>
              </div>
              <div className="live-status">
                <span className={`live-dot ${teacherState !== `idle' ? 'pulse' : ''}'}></span>
                {teacherState === 'thinking' ? 'Thinking...' : teacherState === 'speaking' ? 'Speaking...' : 'Listening...'}
              </div>
            </div>

            {/* SSOT Stats panel */}
            <div className="stats-panel glass-panel">
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>현재 학습 상태</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>개념 이해</span>
                    <span style={{ color: '#a855f7', fontWeight: '700' }}>{studentState.conceptScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "${studentState.conceptScore}%` }} /></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>적용 능력</span>
                    <span style={{ color: '#3b82f6', fontWeight: '700' }}>{studentState.applyScore}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "${studentState.applyScore}%', background: '#3b82f6' }} /></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>자신감</span>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{studentState.confidence}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: "${studentState.confidence}%', background: '#10b981' }} /></div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.78rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.3rem' }}>다음 질문 유형(SSOT)</div>
                <div style={{ color: '#c084fc', fontWeight: '700' }}>
                  {studentState.currentQuestionType === 'concept' ? '📌 개념 확인' :
                   studentState.currentQuestionType === 'apply' ? '📖 적용 문제' :
                   studentState.currentQuestionType === 'misconception' ? '⚠️ 오개념 체크' :
                   studentState.currentQuestionType === 'retry' ? '🔁 재시도' :
                   studentState.currentQuestionType === 'reallife' ? '🌍 실생활 연결' :
                   studentState.currentQuestionType === 'exam_drill' ? '📝 시험 드릴' :
                   studentState.currentQuestionType}
                </div>
                {studentState.recentMistakeTag && (
                  <div style={{ marginTop: '0.4rem', color: '#ef4444', fontSize: '0.75rem' }}>
                    집중 교정 필요: {studentState.recentMistakeTag}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <BarChart2 size={12} /> 관리                </button>
                <button onClick={() => navigate('/test', { state: { unit } })} style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <LogOut size={12} /> 종료 테스트
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

    </>
  );
}


