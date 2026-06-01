import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AlgebraHintPlayer from '@/components/hints/AlgebraHintPlayer.jsx';

// HintPlayerRouter.processStep 가 산출하는 실제 스텝 형태
const data = {
  problem_id: '001',
  type: 'algebra',
  finalAnswer: '$x^2+4y^2+9z^2$',
  steps: [
    { label: 'P: 문제 확인', lines: [], latex: '주어진 식 $(x+2y+3z)^2$을 전개', objects: [] },
    { label: 'A: 최종 정답', lines: [], latex: '대입하면 $x^2+4y^2$', objects: [] },
  ],
};

describe('AlgebraHintPlayer (latex 해설 렌더)', () => {
  it('picture 없는 latex 데이터를 받으면 "불러오는 중"이 아니라 해설 내용을 렌더', () => {
    const html = renderToStaticMarkup(React.createElement(AlgebraHintPlayer, { data }));
    expect(html).not.toContain('해설 이미지를 불러오는 중');
    expect(html).toContain('P: 문제 확인');       // 단계 라벨
    expect(html).toContain('주어진 식');           // 해설 텍스트
    expect(html).toContain('단계별 해설 스크롤');  // 헤더(렌더 정상)
  });
});
