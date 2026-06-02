// 회귀 테스트 — 수정/삭제가 실제 데이터에 반영되었는지 검증.
// 범위: 우리가 고친 항목만 단정(REVIEW로 남긴 항목은 제외).
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { detectIssues } from '../latexDetect.js';

const ROOT = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

describe('LaTeX 수정 회귀', () => {
  const texts = readJson('public/data/math_problem_texts.json');

  it('delimiter AUTO 수정 항목이 깨끗하다 (삼각함수활용2단계/009)', () => {
    expect(detectIssues(texts['삼각함수활용2단계/009.webp'])).toEqual([]);
  });

  it('auto-wrap 수정 항목이 깨끗하다 (지수함수2단계/023, 로그함수2단계/057)', () => {
    expect(detectIssues(texts['지수함수2단계/023.webp'])).toEqual([]);
    expect(detectIssues(texts['로그함수2단계/057.webp'])).toEqual([]);
  });
});

describe('매핑 삭제 회귀', () => {
  const pi = readJson('public/problems_index.json');
  const avs = readJson('public/data/avs_answers.json');

  it('빈 삼각함수성질3단계 키가 avs_answers에서 제거됐다', () => {
    expect('삼각함수성질3단계' in avs).toBe(false);
  });

  it('백업 잔재 키(_백업_완료/_완료백업)가 problems_index와 avs_answers에서 제거됐다', () => {
    const backupRe = /(_백업_완료|_완료백업)$/;
    expect(Object.keys(pi).filter((k) => backupRe.test(k))).toEqual([]);
    expect(Object.keys(avs).filter((k) => backupRe.test(k))).toEqual([]);
  });

  it('백업 삭제가 비접미 base 단원은 보존했다 (등차등비2단계/수학적귀납법3단계)', () => {
    expect('등차등비2단계' in pi).toBe(true);
    expect('수학적귀납법3단계' in pi).toBe(true);
  });
});
