require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Re-using the robust un-escaping backslash normalizer to guarantee KaTeX syntax!
function normalizeBackslashes(rawText) {
  let fixed = rawText;
  const commands = [
    'times', 'text', 'therefore', 'triangle', 'theta', 'to', 'tan', 'sin', 'cos',
    'frac', 'forall', 'sqrt', 'pi', 'alpha', 'beta', 'gamma', 'delta', 'sigma',
    'begin', 'bigg', 'bf', 'bar', 'deg',
    'right', 'rho', 'rightarrow', 'rangle', 'left',
    'neq', 'nabla', 'nu', 'notin', 'nRightarrow',
    'cdots', 'vdots', 'ddots', 'v', 'quad', 'qquad'
  ];

  for (const cmd of commands) {
    const reg = new RegExp(`\\\\+${cmd}`, 'g');
    fixed = fixed.replace(reg, `\\\\${cmd}`);
  }

  fixed = fixed.replace(/\\+\{/g, '\\\\{').replace(/\\+\}/g, '\\\\}');
  return fixed;
}

async function processChunk(start, end) {
  const targetDir = path.join(__dirname, '..', 'public', 'math_hints', '삼각함수그래프3단계');
  const cropDir = path.join(__dirname, '..', 'public', 'math_crops', '(5)수학1 중간', '3단계', '삼각함수그래프3단계');
  const apiKey = process.env.VITE_OPENAI_API_KEY;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Use global fetch (Node 18+)
  // const fetch = (await import('node-fetch')).default || global.fetch;

  for (let i = start; i <= end; i++) {
    const numStr = i.toString().padStart(3, '0');
    const probImage = path.join(cropDir, `${numStr}.webp`);
    const ansImage = path.join(cropDir, `${numStr}a.webp`); 

    console.log(`Checking: ${probImage}`);
    console.log(`Checking: ${probImage}`);
    if (!fs.existsSync(probImage)) {
      console.log(`Skipping ${numStr} - problem image not found`);
      continue;
    }

  const systemPrompt = `You are an elite mathematics educator creating High School Math Animation Hints for Mentos Classroom.
CRITICAL MANDATES:
1. You MUST read the Problem image and the Solution image provided.
2. Structure the explanation strictly into exactly 5 keys in a JSON object: P, C, B, S, A.
3. Every step's text must be highly pedagogical, friendly, and logically clear in Korean. Use "~입니다", "~합니다".
4. Do NOT hallucinate. The steps MUST EXPLICITLY follow the provided Solution image exactly.
5. **VERY IMPORTANT**: The "S" section must be extremely detailed. Break down the solution into at least 10 logical steps. Do NOT omit any calculations. Show EVERY transition.
6. All math MUST be wrapped in $$...$$ for block math. Example: $$a_n = a r^{n-1}$$
7. Write out proper LaTeX macros when appropriate, such as \\times, \\frac, \\sin, \\cos, \\theta, etc.

JSON SCHEMA MUST MATCH EXACTLY:
{
  "P": "구하고자 하는 것은 무엇인가요? (예: 함수 $y = \\\\sin 2x$의 주기를 구하는 문제입니다.)",
  "C": "문제에서 주어진 단서는 무엇인가요? (예: 함수의 식과 $x$의 범위가 주어졌습니다.)",
  "B": "사용되는 주요 개념은 무엇인가요? (예: 사인함수의 주기 공식 $T = \\\\frac{2\\\\pi}{|b|}$를 활용합니다.)",
  "S": "상세한 풀이 과정 (10단계 이상으로 자세히, 수식 깨짐 없이 작성하세요. 단계별로 \\\\n\\\\n을 사용하여 구분하세요.)",
  "A": "최종 정답 (예: $$4\\\\pi$$)"
}`;

    try {
      const probBase64 = fs.readFileSync(probImage).toString('base64');
      const content = [
        { type: 'text', text: `Please reconstruct the high-fidelity PCBSA JSON for Trigonometry Graph Problem ${numStr}. Ensure 10+ detailed steps in "S".` },
        { type: 'image_url', image_url: { url: `data:image/webp;base64,${probBase64}` } }
      ];

      if (fs.existsSync(ansImage)) {
        const ansBase64 = fs.readFileSync(ansImage).toString('base64');
        content.push({ type: 'image_url', image_url: { url: `data:image/webp;base64,${ansBase64}` } });
        console.log(`  Found solution image for ${numStr}`);
      } else {
        console.log(`  No solution image for ${numStr}, solving from problem image.`);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: "json_object" },
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.1
        })
      });

      const resJson = await response.json();
      if (resJson.error) {
        console.error(`[API Error] ${numStr}:`, resJson.error.message);
        continue;
      }

      const contentObj = JSON.parse(resJson.choices[0].message.content);
      let rawString = JSON.stringify(contentObj, null, 2);
      
      // Fix KaTeX escapes!
      rawString = normalizeBackslashes(rawString);

      const outputFile = path.join(targetDir, `${numStr}.json`);
      fs.writeFileSync(outputFile, rawString, 'utf8');
      console.log(`[Trig Stage 3] ${numStr} reconstructed with 10+ steps.`);
    } catch (e) {
      console.error(`[Fatal] ${numStr}:`, e.message);
    }
  }
}

const start = parseInt(process.argv[2], 10);
const end = parseInt(process.argv[3], 10);
processChunk(start, end);
