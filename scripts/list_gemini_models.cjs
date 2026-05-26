// scripts/list_gemini_models.cjs
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function main() {
  console.log('Querying available Gemini models...');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    if (!response.ok) {
      console.error('Failed to list models:', data);
      return;
    }
    console.log('=== Supported Models ===');
    for (const m of data.models || []) {
      console.log(`- ${m.name} (${m.displayName})`);
      console.log(`  Supported methods: ${m.supportedGenerationMethods.join(', ')}`);
      if (m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`  Input/Output modalities: ${m.inputTokenLimit} limit`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
