import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/math_data/원의방정식4단계');
const CROP_DIR = path.join(__dirname, '../public/math_crops/(2)수학(상)기말/원의방정식4단계');

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

async function generateHintFromImage(imagePath) {
  try {
    const base64Image = toBase64(imagePath);
    const prompt = `
Analyze this math problem solution image.
Create a step-by-step animation hint in JSON format.
The JSON MUST have an 'overlay_steps' array.
Each step should have:
- 'step': number
- 'label_text': "Korean description of the step"
- 'latex': "The exact KaTeX string for the math in this step. Double escape backslashes, e.g. \\\\sqrt"
- 'objects': [] (empty array)
Return ONLY VALID JSON. Do not include markdown codeblocks. Example:
{
  "overlay_steps": [
    { "step": 1, "label_text": "원점과의 거리를 구합니다.", "latex": "d = \\\\sqrt{x^2 + y^2}", "objects": [] }
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
  if (!fs.existsSync(DATA_DIR)) return;
  const subdirs = fs.readdirSync(DATA_DIR);
  const limit = await pLimit(5); // 5 concurrent
  
  const tasks = subdirs.map(subdir => limit(async () => {
    const numStr = subdir; // e.g. '001'
    const renderJsonPath = path.join(DATA_DIR, subdir, `${numStr}.render.json`);
    const solutionImgPath = path.join(CROP_DIR, `${numStr}a.webp`);
    
    if (fs.existsSync(renderJsonPath) && fs.existsSync(solutionImgPath)) {
      console.log(`Processing hint for ${numStr}...`);
      
      // Check if it's already valid (if you want to skip already processed ones)
      try {
        const existingData = JSON.parse(fs.readFileSync(renderJsonPath, 'utf-8'));
        // If the first step's label_text has broken characters '?' like "?리가", it's broken.
        // We'll just overwrite them all since the user said "원의방정식 4단계만 수식이 다 깨어져있어서... 다시만든다"
        
        const newHint = await generateHintFromImage(solutionImgPath);
        if (newHint && newHint.overlay_steps) {
          existingData.overlay_steps = newHint.overlay_steps;
          fs.writeFileSync(renderJsonPath, JSON.stringify(existingData, null, 2), 'utf-8');
          console.log(`  Updated hint for ${numStr}`);
        }
      } catch (e) {
        // If file is corrupted JSON, we create it from scratch or try to fix it
        console.log(`  File ${numStr}.render.json is corrupted, regenerating...`);
        let existingData = { layer: "render", id: numStr, title: "", type: "geometry", overlay_steps: [] };
        const newHint = await generateHintFromImage(solutionImgPath);
        if (newHint && newHint.overlay_steps) {
          existingData.overlay_steps = newHint.overlay_steps;
          fs.writeFileSync(renderJsonPath, JSON.stringify(existingData, null, 2), 'utf-8');
          console.log(`  Regenerated hint for ${numStr}`);
        }
      }
    }
  }));

  await Promise.all(tasks);
  console.log("Finished regenerating 원의방정식 4단계 hints!");
}

main();
