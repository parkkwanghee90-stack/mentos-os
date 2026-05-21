const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173'; // Dev server URL
const SUBJECTS = [
  { name: '수학상', teacherId: 'h_math1', units: ['고차방정식2단계', '일차부등식2단계', '이차부등식2단계'] },
  { name: '수1', teacherId: 'h_math4', units: ['지수2단계', '로그2단계', '지수함수2단계'] },
  { name: '수학2', teacherId: 'h_math6', units: ['함수의 극한 2단계', '함수의 연속 2단계', '미분계수 2단계'] },
  { name: '확통', teacherId: 'h_math8', units: ['1)순열', '2)중복조합', '3)이항정리'] },
  { name: '미적분', teacherId: 'h_math7', units: ['[2단계] 수열의극한', '[2단계] 급수', '[2단계] 지수로그함수의극한'] },
  { name: '모의고사', path: '/class/mock-exam', units: ['제 1회', '제 4회', '제 7회'] }
];

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile viewport (S26-ish)
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S942N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36'
  });

  const report = {
    timestamp: new Date().toISOString(),
    results: []
  };

  for (const sub of SUBJECTS) {
    const subResult = {
      subject: sub.name,
      status: 'Normal',
      problems: [],
      errors: []
    };

    const page = await context.newPage();
    
    // Catch console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        subResult.errors.push(`Console: ${msg.text()}`);
        subResult.status = 'Errored';
      }
    });

    // Monitor network
    const networkLog = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('localhost')) {
        networkLog.push({
          url,
          method: request.method(),
          type: request.resourceType()
        });
      }
    });

    try {
      if (sub.teacherId) {
        // Go to teacher classroom
        await page.goto(`${BASE_URL}/class/math/${sub.teacherId}`);
      } else {
        // Go to specific path
        await page.goto(`${BASE_URL}${sub.path}`);
      }

      await page.waitForTimeout(2000); // Wait for initial load

      for (let i = 0; i < sub.units.length; i++) {
        const unit = sub.units[i];
        const probResult = {
          unit,
          problemId: i + 1,
          rendered: false,
          type: 'Unknown',
          assetSource: 'Unknown',
          answerDataConnected: false,
          avsHintConnected: false
        };

        try {
          // Navigation in sidebar if needed
          const unitSelector = `text="${unit}"`;
          if (await page.isVisible(unitSelector)) {
            await page.click(unitSelector);
            await page.waitForTimeout(1000);
          }

          // 1. Problem rendering
          const imgSelector = 'img[src*="math_crops"], img[src*="math_indexed"]';
          const katexSelector = '.katex';
          
          const hasImage = await page.isVisible(imgSelector);
          const hasKatex = await page.isVisible(katexSelector);

          if (hasImage) {
            probResult.rendered = true;
            probResult.type = 'Image';
            const src = await page.getAttribute(imgSelector, 'src');
            probResult.assetSource = src.includes('supabase') ? 'Supabase' : 'Local';
          } else if (hasKatex) {
            probResult.rendered = true;
            probResult.type = 'KaTeX';
            probResult.assetSource = 'JSON (Data)';
          }

          // 2. Answer Data Connectivity
          const hasAnswers = await page.evaluate(() => {
            return (window.answersMasterData !== null || window.avsAnswersData !== null);
          });
          probResult.answerDataConnected = !!hasAnswers;

          // 3. AVS/Hint connectivity
          const hintBtnSelector = 'button:has-text("Ai Vision"), button:has-text("힌트")';
          if (await page.isVisible(hintBtnSelector)) {
            probResult.avsHintConnected = true;
          }

          subResult.problems.push(probResult);
        } catch (e) {
          subResult.errors.push(`Problem Audit Failed for ${unit}: ${e.message}`);
          subResult.status = 'Errored';
        }
      }
    } catch (e) {
      subResult.errors.push(`Page Navigation Failed: ${e.message}`);
      subResult.status = 'Errored';
    } finally {
      await page.close();
    }

    report.results.push(subResult);
  }

  await browser.close();

  // Save report
  const jsonReport = JSON.stringify(report, null, 2);
  fs.writeFileSync('math_runtime_audit.json', jsonReport);

  // Generate Markdown report
  let mdReport = `# Math Runtime Audit Report\n\n`;
  mdReport += `**Timestamp:** ${report.timestamp}\n\n`;
  mdReport += `| Subject | Status | Problems Checked | Rendering | Asset Source | Errors |\n`;
  mdReport += `| --- | --- | --- | --- | --- | --- |\n`;
  
  for (const res of report.results) {
    const errorCount = res.errors.length;
    const rendering = res.problems.map(p => p.type).join(', ') || 'N/A';
    const source = res.problems.map(p => p.assetSource).join(', ') || 'N/A';
    mdReport += `| ${res.subject} | ${res.status === 'Normal' ? '✅ Normal' : '❌ Errored'} | ${res.problems.length} | ${rendering} | ${source} | ${errorCount > 0 ? res.errors[0] : 'None'} |\n`;
  }

  fs.writeFileSync('math_runtime_audit.md', mdReport);
  console.log('Audit completed. Files generated: math_runtime_audit.json, math_runtime_audit.md');
}

runAudit().catch(console.error);
