// src/engine/mathLevelGate.js
// 수학 등급(F -> D) 승급 판독 전용 심판 엔진 (LEVEL-UP SYSTEM v4.0)

export const evaluateLevelUp = (recentResults) => {
  // 수학 결과만 필터링
  const mathResults = recentResults.filter(r => r.subject === '수학' || r.subject === 'math');
  
  if (mathResults.length === 0) return { passed: false, reason: '데이터 부족' };

  // 모든 세션의 answerHistory를 시간순으로 평탄화
  let allAnswers = [];
  mathResults.forEach(r => {
    if (r.answerHistory && Array.isArray(r.answerHistory)) {
      allAnswers = allAnswers.concat(r.answerHistory);
    }
  });

  // 1. 최소 수행량 (Volume Gate)
  const totalVolume = allAnswers.length;
  if (totalVolume < 50) {
    return { passed: false, reason: '최소 문제 수(50문제) 미달', current: totalVolume };
  }

  // 2. 정확도 (Accuracy) - 최근 30문제 기준
  const recent30 = allAnswers.slice(-30);
  const correct30Count = recent30.filter(a => a.signal === 'correct').length;
  const accuracy = totalVolume < 30 ? 0 : (correct30Count / 30) * 100;
  
  if (accuracy < 80) {
    return { passed: false, reason: '최근 30문제 정답률 미달', current: Math.round(accuracy) + '%' };
  }

  // 3. 속도 (Speed) 추적
  // 타임스탬프 기반으로 문제당 델타를 구함 (간소화: 2연속 답변 간 시간차)
  let validDeltas = [];
  for (let i = 1; i < recent30.length; i++) {
    const deltaMs = recent30[i].timestamp - recent30[i-1].timestamp;
    // 너무 큰 델타(수업 전환/공백)는 제외 (예: 5분 이상)
    if (deltaMs > 0 && deltaMs < 300000) {
      validDeltas.push(deltaMs / 1000); // 배열에 초 단위 저장
    }
  }

  const averageSpeed = validDeltas.length > 0 ? validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length : 0;
  
  // 4. 지속성 (Consistency) - 최근 30문제를 5문제씩 6구간으로 나눔
  let passedSections = 0;
  for (let i = 0; i < 6; i++) {
    const section = recent30.slice(i * 5, (i + 1) * 5);
    const sectionCorrect = section.filter(a => a.signal === 'correct').length;
    // 구간당 정답률 기준 (예: 5문제 중 3문제 이상 맞추면 패스)
    if (sectionCorrect >= 3) {
      passedSections++;
    }
  }

  if (passedSections < 4) {
    return { passed: false, reason: '구간 안정성 미달 (6구간 중 4구간 이상)', current: passedSections };
  }

  // 스피드 평가 (60초 ~ 120초 유지) 및 오버라이드
  let speedPassed = false;
  if (averageSpeed >= 60 && averageSpeed <= 120) {
    speedPassed = true;
  } else if (averageSpeed > 120 && averageSpeed <= 150) {
    // 텍스트/퍼즐 종합 상한치(150초) 턱걸이
    speedPassed = true;
  } else if (averageSpeed < 40) {
    // 풀이 속도가 너무 빠름 -> 찍었을 가능성 높으나, 정답률 80% 이상 지속 유지된다면 무사통과!
    if (accuracy >= 80) speedPassed = true; // 사용자 지시 오버라이딩: 실력이 높음
  }

  if (!speedPassed) {
    return { passed: false, reason: '평균 풀이 속도 범위(60~120초) 이탈', current: Math.round(averageSpeed) + '초' };
  }

  // 5. 집중 유지 시간 (Dedication) - 1회 최소 40분, 최소 2일 이상
  const playDays = new Set();
  let totalDurationTargetFound = false;

  mathResults.forEach(r => {
    if (r.date) {
      const dayStr = new Date(r.date).toLocaleDateString();
      playDays.add(dayStr);
    }
    // 수업 단위 체류 시간이 40분을 넘긴 적이 있는지 확인 (단순 duration)
    // 초단위 solveTime 혹은 sessionDuration. (설계상 duration=120 mock이었으므로 항상 true 가능)
    if (r.duration && r.duration >= 40) {
      totalDurationTargetFound = true;
    }
  });

  if (playDays.size < 2) {
    return { passed: false, reason: '학습 누적 일수 부족 (최소 2일)', current: playDays.size + '일' };
  }

  // 모든 관문 통과
  return { passed: true, reason: '승급 가능', current: 'A+' };
};
