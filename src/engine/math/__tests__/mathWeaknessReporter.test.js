import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeMathWeakness } from '@/engine/math/mathWeaknessReporter';

beforeEach(() => { localStorage.clear(); });

function seedStore(entries) {
  const now = Date.now();
  localStorage.setItem('mentos_wrong_answers', JSON.stringify(
    entries.map(e => ({ resolved: false, resolvedAt: null, firstWrongAt: now, lastSeenAt: now, ...e }))
  ));
}

describe('analyzeMathWeakness 입력 C (오답스토어)', () => {
  it('모의고사 전용 오답(숙제 진도에 없음)이 취약단원에 반영된다', () => {
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w).toBeTruthy();
    expect(w.wrong).toBeGreaterThanOrEqual(1);
  });

  it('숙제와 겹치는 (hwId,num)은 1회만, 모의고사 전용은 추가로 계상한다', () => {
    localStorage.setItem('hw_progress_hw_01', JSON.stringify({ '005': { isCorrect: false } }));
    seedStore([
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' },
      { hwId: 'hw_01', num: 6, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' },
    ]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w.wrong).toBe(2);
  });

  it('resolved(극복) 오답은 취약단원에 포함하지 않는다', () => {
    const now = Date.now();
    localStorage.setItem('mentos_wrong_answers', JSON.stringify([
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제',
        resolved: true, resolvedAt: now, firstWrongAt: now, lastSeenAt: now },
    ]));
    const { allWeakness } = analyzeMathWeakness();
    expect(allWeakness.find(x => x.unit === '다항식의 연산')).toBeFalsy();
  });

  it('errorRate 분모가 정상이다 (오답 1건 = 시도 1건)', () => {
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w.errorRate).toBe(100);
    expect(w.total).toBeGreaterThanOrEqual(w.wrong);
  });
});

describe('analyzeMathWeakness 클라우드 SSOT + 학부모 쉬운설명', () => {
  it('cloud wrong_answers/homework_progress로 취약단원 + 학부모요약을 만든다', () => {
    const cloud = {
      homeworkProgress: [
        { homework_id: 'X', problem_id: '001', is_correct: true },
        { homework_id: 'X', problem_id: '002', is_correct: true },
      ],
      wrongAnswers: [
        { unit_folder: '행렬', problem_num: '5', problem_id: '005', resolved: false },
        { unit_folder: '행렬', problem_num: '6', problem_id: '006', resolved: false },
        { unit_folder: '확률', problem_num: '3', problem_id: '003', resolved: true },
      ],
    };
    const { allWeakness, top3, parentSummary } = analyzeMathWeakness(cloud);
    const m = allWeakness.find(w => w.unit === '행렬');
    expect(m.wrong).toBe(2);
    expect(m.errorRate).toBe(100);
    expect(allWeakness.find(w => w.unit === '확률')).toBeFalsy(); // resolved 제외
    expect(top3[0].unit).toBe('행렬');
    expect(top3[0].tagPlain).toBeTruthy();        // 학부모용 쉬운 설명
    expect(parentSummary).toContain('행렬');       // 학부모 한 문단 요약
  });
});

describe('analyzeMathWeakness — AVS 답지 의존 다신호', () => {
  it('AVS 시청(답지 의존)을 취약점수·학부모설명에 반영한다', () => {
    const cloud = {
      homeworkProgress: [
        { homework_id: 'M', problem_id: '001', is_correct: false, avs_viewed: true },
        { homework_id: 'M', problem_id: '002', is_correct: false, avs_viewed: true },
        { homework_id: 'M', problem_id: '003', is_correct: true, avs_viewed: true },
        { homework_id: 'M', problem_id: '004', is_correct: true, avs_viewed: false },
      ],
      wrongAnswers: [
        { unit_folder: 'M', problem_num: '1', problem_id: '001', resolved: false },
        { unit_folder: 'M', problem_num: '2', problem_id: '002', resolved: false },
      ],
    };
    const { allWeakness } = analyzeMathWeakness(cloud);
    const m = allWeakness.find(w => w.unit === 'M');
    expect(m.avsViewed).toBe(3);
    expect(m.avsDependent).toBe(true);
    expect(m.tagPlain).toContain('AVS');         // 학부모용 AVS 코멘트 포함
    expect(m.score).toBeGreaterThan(m.errorRate); // 다신호 가산
  });
});
