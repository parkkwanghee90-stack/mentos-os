import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../src/data/math_problem_texts.json');

if (!fs.existsSync(dataPath)) {
    console.log("File not found");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const keys = Object.keys(data);

const stage3 = keys.filter(k => k.startsWith('삼각함수그래프3단계'));
const stage4 = keys.filter(k => k.startsWith('삼각함수그래프4단계'));

console.log(`Stage 3 Count: ${stage3.length}`);
console.log(`Stage 4 Count: ${stage4.length}`);

if (stage3.length > 0) {
    console.log("First 3 Stage 3 keys:", stage3.slice(0, 3));
    console.log("Last 3 Stage 3 keys:", stage3.slice(-3));
}

if (stage4.length > 0) {
    console.log("First 3 Stage 4 keys:", stage4.slice(0, 3));
    console.log("Last 3 Stage 4 keys:", stage4.slice(-3));
}
