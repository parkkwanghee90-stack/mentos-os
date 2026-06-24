'use strict';

const { latexToSpeechCalc } = require('./latexToSpeechCalc.cjs');

// 힌트 JSON에서 P/C/B/S 낭독문을 뽑아 한국어로 전처리. A(정답)는 제외.
// 지원 스키마: (A) steps[].phase 'P/C/B/S', (B) steps[].label 'P:/P(', (D) top-level P/C/B/S.
function pickPCBS(data) {
  const steps = Array.isArray(data.overlay_steps) ? data.overlay_steps
    : Array.isArray(data.steps) ? data.steps : null;
  const by = {};
  if (steps) {
    for (const st of steps) {
      if (!st || typeof st !== 'object') continue;
      let ph = null;
      if (/^[PCBS]$/.test(st.phase || '')) ph = st.phase;
      else {
        const m = (st.label || '').trim().toUpperCase().match(/^([PCBS])\s*[(:]/);
        if (m) ph = m[1];
      }
      if (ph && !by[ph]) by[ph] = st.content || st.text || st.formula_raw || st.latex || '';
    }
  }
  // D) top-level
  for (const ph of ['P', 'C', 'B', 'S']) {
    if (!by[ph] && typeof data[ph] === 'string') by[ph] = data[ph];
  }
  return by;
}

function extractNarration(data) {
  if (!data || typeof data !== 'object') return '';
  const by = pickPCBS(data);
  const order = ['P', 'C', 'B', 'S'];
  const parts = order
    .map(ph => by[ph])
    .filter(Boolean)
    .map(t => latexToSpeechCalc(t))
    .filter(t => t && t.trim().length > 0);
  return parts.join('. ').replace(/\s+/g, ' ').trim();
}

module.exports = { extractNarration, pickPCBS };
