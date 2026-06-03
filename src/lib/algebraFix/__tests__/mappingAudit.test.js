import { describe, it, expect } from 'vitest';
import { auditMapping } from '../mappingAudit.js';

describe('auditMapping', () => {
  it('한 소스에만 있는 단원키를 KEY_PRESENCE 불일치로 검출한다', () => {
    const res = auditMapping({
      problemsIndex: { '삼각함수활용3단계': ['001', '002'] },
      avsAnswers: { '삼각함수성질3단계': {}, '삼각함수활용3단계': { '001': '4' } },
      answersMaster: { '삼각함수활용3단계': { '001': '4' } },
    });
    const issue = res.find((r) => r.type === 'KEY_PRESENCE' && r.key === '삼각함수성질3단계');
    expect(issue).toBeTruthy();
    expect(issue.presentIn).toEqual(['avsAnswers']);
    expect(issue.missingFrom).toContain('problemsIndex');
  });

  it('빈 껍데기 단원(값 0개)을 EMPTY_SHELL로 표시한다', () => {
    const res = auditMapping({
      problemsIndex: {},
      avsAnswers: { '삼각함수성질3단계': {} },
      answersMaster: {},
    });
    expect(res.some((r) => r.type === 'EMPTY_SHELL' && r.key === '삼각함수성질3단계')).toBe(true);
  });

  it('같은 루트인데 성질↔활용이 엇갈린 그룹을 ROOT_VARIANT로 묶는다', () => {
    const res = auditMapping({
      problemsIndex: { '삼각함수활용3단계': ['001'] },
      avsAnswers: { '삼각함수성질3단계': {} },
      answersMaster: {},
    });
    expect(res.some((r) => r.type === 'ROOT_VARIANT' && r.stage === '3')).toBe(true);
  });
});
