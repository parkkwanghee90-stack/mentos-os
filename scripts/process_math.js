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

if (!apiKey) {
  console.error("No API key found");
  process.exit(1);
}

// Convert local file to base64
function toBase64(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}

// Call OpenAI Vision API
async function extractMathFromImage(imagePath, isHint = false) {
  const base64Image = toBase64(imagePath);
  
  const prompt = isHint ? `
Analyze this math problem solution image.
Create a step-by-step animation hint in JSON format.
The JSON should have an 'overlay_steps' array.
Each step should have:
- 'step': number
- 'label_text': "Korean description of the step"
- 'latex': "The exact KaTeX string for the math in this step. Double escape backslashes, e.g. \\\\sqrt"
- 'objects': [] (empty array)
Return ONLY VALID JSON. Do not include markdown codeblocks.
` : `
Analyze this math problem image.
Extract the math problem text accurately.
Convert all math formulas into KaTeX format. Use $...$ for inline math and $$...$$ for block math.
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
              image_url: {
                url: `data:image/webp;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.2
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error("API Error:", data.error);
    return null;
  }
  
  let content = data.choices[0].message.content.trim();
  if (content.startsWith("```json")) {
    content = content.slice(7, -3).trim();
  } else if (content.startsWith("```")) {
    content = content.slice(3, -3).trim();
  }
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse JSON:", content);
    return null;
  }
}

async function main() {
  const targetImage = process.argv[2];
  const mode = process.argv[3]; // 'problem' or 'hint'
  
  if (!targetImage) {
    console.log("Usage: node process_math.js <image_path> [problem|hint]");
    process.exit(1);
  }
  
  console.log(`Processing ${targetImage} in ${mode || 'problem'} mode...`);
  const result = await extractMathFromImage(targetImage, mode === 'hint');
  console.log(JSON.stringify(result, null, 2));
}

main();
