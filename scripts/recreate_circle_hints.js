import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CROP_DIR = path.join(__dirname, '../public/math_crops/(2)수학(상)기말/원의방정식4단계');
const OUT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

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
You are a top-tier high school math teacher in Korea.
Analyze this solution image for a "Circle Equation (원의 방정식)" problem.
Create a step-by-step geometry animation hint in JSON format.
The JSON MUST have the following structure:
{
  "layer": "render",
  "id": "extracted_id",
  "title": "원의 방정식 심화",
  "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      { "type": "axes" }
      // ADD the main circle here, e.g. { "type": "circle", "x": 0, "y": 0, "r": 2, "color": "#3b82f6" }
      // ADD any lines, points, etc. mentioned in the problem.
    ]
  },
  "overlay_steps": [
    {
      "step": 1,
      "label_text": "Write the Korean explanation here (Make sure to write in perfect Korean, UTF-8 encoded).",
      "latex": "Write the KaTeX formula here. Escape backslashes carefully (e.g. \\\\sqrt, x^2 + y^2 = r^2)",
      "objects": [
        // Add highlighted geometry objects for this specific step (points, lines, tangents)
      ]
    }
  ],
  "viewBox": {
    "x": [-10, 10],
    "y": [-10, 10]
  }
}
Extract AT LEAST 4 to 6 steps from the solution, identifying the key geometric changes or equations in each step.
Return ONLY VALID JSON. Do not use Markdown codeblocks.
Ensure Korean text is properly encoded.
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
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let content = data.choices[0].message.content.trim();
    if (content.startsWith("```json")) content = content.slice(7, -3).trim();
    else if (content.startsWith("```")) content = content.slice(3, -3).trim();

    return JSON.parse(content);
  } catch (e) {
    console.error("Error generating hint:", e.message);
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(CROP_DIR).filter(f => f.endsWith('a.webp'));
  const limit = await pLimit(5);

  const tasks = files.map(file => limit(async () => {
    const idStr = file.replace('a.webp', '');
    const outPath = path.join(OUT_DIR, `${idStr}.json`);
    
    console.log(`Processing ${file}...`);
    const imgPath = path.join(CROP_DIR, file);
    
    const hintObj = await generateHintFromImage(imgPath);
    if (hintObj) {
      hintObj.id = idStr;
      fs.writeFileSync(outPath, JSON.stringify(hintObj, null, 2), 'utf-8');
      console.log(`Saved ${outPath}`);
    } else {
      console.log(`Failed for ${file}`);
    }
  }));

  await Promise.all(tasks);
  console.log("All done!");
}

main();
