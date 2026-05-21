const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.VITE_OPENAI_API_KEY;
const imgDir = 'public/math_crops/(5)수학1 중간/4단계/삼각함수활용 4단계(68)';
const outputDir = 'public/math_hints/삼각함수활용 4단계(68)';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function callGptVision(imgName) {
  const imgPath = path.join(imgDir, imgName);
  if (!fs.existsSync(imgPath)) return null;

  const base64Img = fs.readFileSync(imgPath, { encoding: 'base64' });

  const prompt = `You are a premium math curriculum designer for 1st-grade high school students.
Create a PCBSA-compliant JSON hint for the attached problem image.

[CRITICAL DESIGN RULES]
1. TEXT COLOR: Use "#ffffff" (White) for all text and default lines to ensure high contrast on dark mode.
2. GEOMETRY SCALE: The shape MUST be centered and occupy only 60% of the viewBox to prevent overflow.
3. POINT LABELS: EVERY vertex/point MUST have a LaTeX label (A, B, C, etc.).
4. LENGTH MARKINGS: If lengths are given (e.g., 2, 4, sqrt(6)), they MUST be displayed next to the segments.
5. NO MOJIBAKE: Ensure perfect Korean encoding. No "?" or broken characters.
6. STEPS: Provide high-fidelity pedagogical steps explaining the logic (Sine rule, Cosine rule, etc.).

[OUTPUT JSON FORMAT]
{
  "problem_id": "${imgName.split('.')[0]}",
  "problem_type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
       // Use type: "drawCircle", "drawSegment", "point", "latex_label"
       // Ensure all points have labels.
    ],
    "viewBox": { "x": [-10, 10], "y": [-8, 8] } // Adjust to make shapes smaller
  },
  "steps": [
    {
      "step": 1,
      "title": "주어진 조건 정리",
      "caption": "...",
      "visual_action": { "type": "highlight", "target": "...", "color": "#ffffff" }
    }
  ]
}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:image/webp;base64,${base64Img}` } }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      })
    });

    const data = await res.json();
    if (!data.choices || data.choices.length === 0) {
      console.error(`API Error for ${imgName}:`, JSON.stringify(data));
      return null;
    }
    return data.choices[0].message.content;
  } catch (e) {
    console.error("GPT Error for " + imgName, e);
    return null;
  }
}

async function start() {
  // 004 to 100
  for (let i = 4; i <= 100; i++) {
    const pId = String(i).padStart(3, '0');
    console.log(`Processing Problem ${pId}...`);
    const json = await callGptVision(`${pId}.webp`);
    if (json) {
      fs.writeFileSync(path.join(outputDir, `${pId}.json`), json, 'utf8');
      console.log(`Success: ${pId}.json restored.`);
    }
    // Rate limit delay
    await new Promise(r => setTimeout(r, 2000));
  }
}

start();
