import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT = path.join(__dirname, '../src/data/math_problem_texts.json');
const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));

// 직선4단계 - 실제로 있는 파일 목록 확인 후 처리
// 006.webp, 008.webp 없음 → 해당 키 스킵

// 직선3단계 021 수동 수정 (172자 긴 줄)
dict['직선의방정식3단계/021.webp'] = 
  '직선 $y=mx+3m+1$이 세 점 $A(2, 4)$, $B(3, -1)$, $C(5, 3)$를\n' +
  '꼭짓점으로 하는 삼각형 $ABC$와 만나지 않도록 하는\n' +
  '실수 $m$의 값의 범위가 $m<a$ 또는 $m>b$이다.\n' +
  '이때, $15(a+b)$의 값을 구하시오. (단, $a<b$)';

// 직선4단계 실제 파일 확인 - 6,8번 없으므로 dict에도 없어야 정상
// 실제로 있는 파일: 001,002,003,004,005,007,009,010
// 검수 기준도 그에 맞게 수정

// Check what keys actually exist for 직선4단계
const lin4Keys = Object.keys(dict).filter(k => k.startsWith('직선의방정식4단계/')).sort();
console.log('직선4단계 dict keys:', lin4Keys);

fs.writeFileSync(DICT, JSON.stringify(dict, null, 2), 'utf-8');
console.log('저장 완료');
console.log('직선3단계 021 수정 결과:');
console.log(dict['직선의방정식3단계/021.webp']);
const maxLine = Math.max(...dict['직선의방정식3단계/021.webp'].split('\n').map(l => l.length));
console.log('최대 줄 길이:', maxLine);
