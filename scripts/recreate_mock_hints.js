import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

function toBase64(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}

const pLimit = async (concurrency) => {
  const { default: pLimitModule } = await import('p-limit');
  return pLimitModule(concurrency);
};

async function generateMockHintFromImage(imagePath) {
  try {
    const base64Image = toBase64(imagePath);
    const prompt = `
Analyze this math problem solution image.
Create a step-by-step animation hint in JSON format.
The JSON MUST have a 'pcbs_model' array.
Each step should have:
- 'stage': "P" (Problem), "C" (Clue), "B" (Background), or "S" (Solve)
- 'description': "A short description of the stage"
- 'math_content': "The exact KaTeX string for the math in this step. Double escape backslashes, e.g. \\\\sqrt"
Return ONLY VALID JSON. Do not include markdown codeblocks. Example:
{
  "pcbs_model": [
    { "stage": "P", "description": "구하는 것 파악", "math_content": "\\\\lim_{n \\\\to \\\\infty} a_n" },
    { "stage": "C", "description": "조건 해석", "math_content": "a_n = 2n + 1" },
    { "stage": "S", "description": "계산 진행", "math_content": "\\\\text{정답: } 5" }
  ]
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/webp;base64,${base64Image}` }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    let content = data.choices[0].message.content.trim();
    if (content.startsWith("```json")) content = content.slice(7, -3).trim();
    else if (content.startsWith("```")) content = content.slice(3, -3).trim();
    
    return JSON.parse(content);
  } catch (e) {
    console.error("Error generating hint for", imagePath, e.message);
    return null;
  }
}

async function main() {
  const years = ['2025', '2024', '2023'];
  const subjects = ['미적분', '확통'];
  const targetIds = ['010', '011', '012', '013', '014', '015', '021', '022', '027', '028', '029', '030'];

  const limit = await pLimit(3); // 3 concurrent requests

  const tasks = [];

  for (const year of years) {
    for (const subject of subjects) {
      const hintDir = path.join(__dirname, `../public/math_hints/CSAT_${year}_6월_${subject}`);
      if (!fs.existsSync(hintDir)) {
        fs.mkdirSync(hintDir, { recursive: true });
      }

      const cropDir = path.join(__dirname, `../public/math_crops/고3수능및모의고사/월별모의고사/6월/${subject}_${year}_6월`);

      for (const numStr of targetIds) {
        const solutionImgPath = path.join(cropDir, `${numStr}a.webp`);
        const jsonPath = path.join(hintDir, `${numStr}.json`);

        if (fs.existsSync(solutionImgPath)) {
          tasks.push(limit(async () => {
            console.log(`Processing ${year} 6월 ${subject} ${numStr}...`);
            const hintData = await generateMockHintFromImage(solutionImgPath);
            
            if (hintData && hintData.pcbs_model) {
              const fullJson = {
                problem_id: numStr,
                unit: `CSAT_${year}_6월_${subject}`,
                title: `제 ${parseInt(numStr)}번 명품 해설`,
                problem_image: null,
                base_figure: { type: "none" },
                pcbs_model: hintData.pcbs_model,
                steps: [] // Empty steps because we don't want the fallback images
              };
              fs.writeFileSync(jsonPath, JSON.stringify(fullJson, null, 2), 'utf-8');
              console.log(`  Saved ${jsonPath}`);
            } else {
              console.log(`  Failed to parse or missing pcbs_model for ${numStr}`);
            }
          }));
        } else {
          console.log(`Missing image: ${solutionImgPath}`);
        }
      }
    }
  }

  await Promise.all(tasks);
  console.log("Mock Exam 6월 (1, 2, 3회차) 힌트 생성 완료!");
}

main();
