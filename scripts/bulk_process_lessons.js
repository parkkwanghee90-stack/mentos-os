import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');

// Read .env file
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

if (!apiKey) {
  console.error("No API key found");
  process.exit(1);
}

function toBase64(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}

async function extractMathFromImage(imagePath) {
  try {
    const base64Image = toBase64(imagePath);
    const prompt = `
Analyze this math problem image.
Extract the math problem text accurately.
Convert all math formulas into KaTeX format. Use $...$ for inline math and $$...$$ for block math.
Do NOT include the question number at the very beginning if it's just a number (like '1.', '2.').
If there are multiple choice options (①, ②, etc.), include them at the end.
Return ONLY VALID JSON with the following structure:
{
  "questionText": "Korean text mixed with $math$ and $$block math$$"
}
Do not include markdown codeblocks.
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
        max_tokens: 1000,
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
    console.error("Error processing", imagePath, e.message);
    return null;
  }
}

const pLimit = async (concurrency) => {
  const { default: pLimitModule } = await import('p-limit');
  return pLimitModule(concurrency);
};

async function processLessonFile(filePath) {
  console.log("Processing", filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!data.core || !data.core.problems) return;

  const limit = await pLimit(5); // 5 concurrent requests
  let modified = false;

  const tasks = data.core.problems.map((prob, i) => limit(async () => {
    // Check if it already has questionText
    if (prob.questionText && prob.questionText.trim() !== '') {
      return;
    }
    
    const imageRelPath = prob.questionImage || prob.image;
    if (!imageRelPath) return;

    // Decode URL encoding in case the path has %28 for (, etc.
    const decodedRelPath = decodeURIComponent(imageRelPath);
    const absPath = path.join(PUBLIC_DIR, decodedRelPath);
    
    if (fs.existsSync(absPath)) {
      console.log(`  Extracting text for problem ${prob.number || i+1}...`);
      const result = await extractMathFromImage(absPath);
      if (result && result.questionText) {
        prob.questionText = result.questionText;
        // Optionally remove the image if we completely migrate
        // delete prob.questionImage;
        // delete prob.image;
        modified = true;
      }
    } else {
      console.log(`  Image not found: ${absPath}`);
    }
  }));

  await Promise.all(tasks);

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved updates to ${filePath}`);
  } else {
    console.log(`No changes for ${filePath}`);
  }
}

async function main() {
  const lessonDirs = [
    'src/data/lessons/math/h_math1/week_1',
    'src/data/lessons/math/h_math2/week_1',
    'src/data/lessons/math/h_math3/week_1'
  ];

  for (const dirRel of lessonDirs) {
    const dirAbs = path.join(__dirname, '..', dirRel);
    if (!fs.existsSync(dirAbs)) continue;
    
    const files = fs.readdirSync(dirAbs).filter(f => f.endsWith('.json'));
    for (const f of files) {
      await processLessonFile(path.join(dirAbs, f));
    }
  }
}

main();
