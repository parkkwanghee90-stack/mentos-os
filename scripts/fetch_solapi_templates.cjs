#!/usr/bin/env node
/**
 * Solapi 카카오 알림톡 템플릿 목록 조회 → 멘토스 4개 템플릿의 ID·변수 추출.
 * 결과를 src/config/kakaoTemplates.json 에 (이벤트키 → {templateId, name, variables}) 로 저장.
 *
 * 사용법:
 *   SOLAPI_API_KEY=... SOLAPI_API_SECRET=... node scripts/fetch_solapi_templates.cjs
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch { /* optional */ }

const apiKey = process.env.SOLAPI_API_KEY;
const apiSecret = process.env.SOLAPI_API_SECRET;
if (!apiKey || !apiSecret) { console.error('❌ SOLAPI_API_KEY / SOLAPI_API_SECRET 필요'); process.exit(1); }

// 멘토스 푸시 이벤트 → 템플릿 이름 매핑 (이름은 부분일치로 탐색)
const EVENT_TO_NAME = {
  lessonEnd:   '수업종료리포트',   // finalizeSession (수업 종료)
  homework:    '숙제결과리포트',   // HomeworkMathBox (숙제 완료)
  weeklyTest:  '주간테스트결과',   // mathWeaknessReporter (주간/약점)
  monthlyTest: '월말평가리포트',   // monthlyTest (월말 평가)
};

function auth() {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const sig = crypto.createHmac('sha256', apiSecret).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${sig}`;
}

(async () => {
  const res = await fetch('https://api.solapi.com/kakao/v1/templates?limit=200', {
    headers: { Authorization: auth() },
  });
  const text = await res.text();
  if (!res.ok) { console.error('❌ 조회 실패 HTTP', res.status, text.slice(0, 400)); process.exit(2); }
  const data = JSON.parse(text);
  const list = data.templateList || data.list || data;
  console.log(`조회된 템플릿 ${Array.isArray(list) ? list.length : '?'}개\n`);

  const out = {};
  for (const [eventKey, wantName] of Object.entries(EVENT_TO_NAME)) {
    const t = (Array.isArray(list) ? list : []).find(x => (x.name || '').includes(wantName));
    if (!t) { console.log(`⚠️  '${wantName}' (${eventKey}) — 템플릿 못 찾음`); continue; }
    // 템플릿 본문에서 #{변수} 추출
    const vars = [...new Set((t.content || '').match(/#\{[^}]+\}/g) || [])];
    out[eventKey] = { templateId: t.templateId, name: t.name, pfId: t.channelId || t.pfId || null, variables: vars };
    console.log(`✅ ${eventKey}: ${t.name}\n   templateId=${t.templateId}\n   변수=${vars.join(', ') || '(없음)'}\n`);
  }

  const outPath = path.join(__dirname, '..', 'src', 'config', 'kakaoTemplates.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log('저장:', outPath);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
