import { describe, it, expect } from 'vitest';
import { adaptAnswersMaster } from '../answersMasterAdapter.js';

describe('adaptAnswersMaster', () => {
  it('레코드 배열/인덱스 객체를 단원→{문제:정답} 맵으로 그룹화한다', () => {
    const raw = {
      '0': { unit: '삼각함수활용3단계', stage: 3, problem: 1, answer: '4', type: 'objective' },
      '1': { unit: '삼각함수활용3단계', stage: 3, problem: 2, answer: '3', type: 'objective' },
      '2': { unit: '지수2단계', stage: 2, problem: 5, answer: '1', type: 'objective' },
    };
    const map = adaptAnswersMaster(raw);
    expect(Object.keys(map)).toEqual(expect.arrayContaining(['삼각함수활용3단계', '지수2단계']));
    expect(map['삼각함수활용3단계']).toEqual({ '1': '4', '2': '3' });
    expect(map['지수2단계']).toEqual({ '5': '1' });
  });

  it('unit 필드가 없는 레코드는 건너뛴다', () => {
    const map = adaptAnswersMaster({ '0': { problem: 1, answer: 'x' }, '1': null });
    expect(map).toEqual({});
  });

  it('입력을 변형하지 않는다(불변)', () => {
    const raw = { '0': { unit: '지수2단계', problem: 1, answer: '1' } };
    const snapshot = JSON.stringify(raw);
    adaptAnswersMaster(raw);
    expect(JSON.stringify(raw)).toBe(snapshot);
  });
});
