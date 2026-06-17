/**
 * 분석 포스터 배치 렌더러: data/*.json → 멘토스기출 폴더에 <학교명>.png 저장.
 * 설치된 Google Chrome 을 puppeteer-core 로 헤드리스 구동(크로미움 다운로드 불필요).
 * 사용: node 02_render.cjs            (data/ 전체)
 *       node 02_render.cjs go1__가락고.json   (특정 파일들)
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TEMPLATE = 'file://' + path.join(__dirname, 'poster_analysis.html');
const DATA_DIR = path.join(__dirname, 'data');
const SMB = '/Volumes/수학의 빛 사무폴더/멘토스기출';
const OUT = fs.existsSync(SMB) ? SMB : path.join(__dirname, 'out');   // SMB 없으면 로컬 out/

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const files = process.argv.length > 2
    ? process.argv.slice(2)
    : fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`렌더 대상 ${files.length}개 → ${OUT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  let ok = 0; const fail = [];
  for (const f of files) {
    const fp = f.includes('/') ? f : path.join(DATA_DIR, f);
    let school = f;
    try {
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      school = data.school;
      const page = await browser.newPage();
      await page.setViewport({ width: 900, height: 1400, deviceScaleFactor: 2 });
      await page.evaluateOnNewDocument(d => { window.POSTER_DATA = d; }, data);
      await page.goto(TEMPLATE, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.waitForFunction(() => document.title === 'READY', { timeout: 15000 });
      const el = await page.$('#poster');
      const fname = `${data.school}${data.grade === '고2' ? '(고2수1)' : ''}.png`;
      await el.screenshot({ path: path.join(OUT, fname) });
      await page.close();
      ok++; console.log(`✅ ${fname}`);
    } catch (e) { fail.push(`${school}: ${e.message}`); console.log(`❌ ${school}: ${e.message}`); }
  }
  await browser.close();
  console.log(`\n완료 ${ok}/${files.length}` + (fail.length ? `\n실패:\n  ${fail.join('\n  ')}` : ''));
})();
