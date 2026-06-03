import { describe, it, expect } from 'vitest';
import { isSuperPassMatch } from '../superPass';

describe('isSuperPassMatch — 슈퍼패스/관리자 인증번호 일치 판정', () => {
  it('시크릿과 입력이 일치하면 true', () => {
    expect(isSuperPassMatch('1234', '1234')).toBe(true);
  });

  it('시크릿과 입력이 다르면 false', () => {
    expect(isSuperPassMatch('1234', '0000')).toBe(false);
  });

  it('입력 앞뒤 공백은 무시하고 비교한다', () => {
    expect(isSuperPassMatch('1234', '  1234  ')).toBe(true);
  });

  // 보안 핵심: 환경변수 미설정 시 우회가 비활성화되어야 한다.
  it('시크릿이 undefined면 어떤 입력이든 false', () => {
    expect(isSuperPassMatch(undefined, '1234')).toBe(false);
    expect(isSuperPassMatch(undefined, '')).toBe(false);
  });

  it('시크릿이 빈 문자열이면 빈 입력으로도 통과하지 못한다', () => {
    expect(isSuperPassMatch('', '')).toBe(false);
    expect(isSuperPassMatch('', '   ')).toBe(false);
  });

  it('시크릿이 공백만 있으면 미설정으로 간주해 false', () => {
    expect(isSuperPassMatch('   ', '   ')).toBe(false);
  });

  it('입력이 문자열이 아니면 false (방어적)', () => {
    expect(isSuperPassMatch('1234', null)).toBe(false);
    expect(isSuperPassMatch('1234', undefined)).toBe(false);
    expect(isSuperPassMatch('1234', 1234)).toBe(false);
  });
});
