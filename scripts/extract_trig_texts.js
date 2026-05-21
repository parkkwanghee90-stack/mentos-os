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
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    let content = data.choices[0].message.content.trim();
    return JSON.parse(content).questionText;
  } catch (e) {
    console.error("Error processing", imagePath, e.message);
    return null;
  }
}

const pLimit = async (concurrency) => {
  const { default: pLimitModule } = await import('p-limit');
  return pLimitModule(concurrency);
};

async function main() {
  const targetFolders = [
    { base: '(5)수학1 중간/3단계', name: '삼각함수그래프3단계', alias: '삼각함수그래프3단계', start: 16 },
    { base: '(5)수학1 중간/4단계', name: '삼각함수그래프', alias: '삼각함수그래프4단계' }
  ];

  const outputDictPath = path.join(__dirname, '../src/data/math_problem_texts.json');
  
  let existingDict = {};
  if (fs.existsSync(outputDictPath)) {
    existingDict = JSON.parse(fs.readFileSync(outputDictPath, 'utf-8'));
  }

  const limit = await pLimit(10); // 10 concurrent requests
  let modified = false;

  for (const target of targetFolders) {
    const folderPath = path.join(PUBLIC_DIR, 'math_crops', target.base, target.name);
    const alias = target.alias || target.name;
    
    if (!fs.existsSync(folderPath)) {
        console.log(`Folder not found: ${folderPath}`);
        continue;
    }
    console.log(`Processing folder: ${target.name} (Alias: ${alias})`);
    
    const files = fs.readdirSync(folderPath).filter(f => {
        if (!f.endsWith('.webp')) return false;
        if (f.includes('a.webp')) return false; // skip solution images
        const num = parseInt(f.replace('.webp', ''));
        if (target.start && num < target.start) return false;
        return true;
    }).sort();
    
    console.log(`Found ${files.length} files to process in ${target.name}`);
    
    const tasks = files.map(file => limit(async () => {
      const key = `${alias}/${file}`;
      if (existingDict[key] && existingDict[key].trim() !== '') return;
      
      const absPath = path.join(folderPath, file);
      console.log(`  Extracting: ${key}`);
      const text = await extractMathFromImage(absPath);
      if (text) {
          existingDict[key] = text;
          modified = true;
          console.log(`  -> Done: ${key}`);
      }
    }));
    
    await Promise.all(tasks);
    
    // Save incrementally
    if (modified) {
        fs.writeFileSync(outputDictPath, JSON.stringify(existingDict, null, 2));
        modified = false;
    }
  }
  
  console.log("All extractions complete!");
}

main();
