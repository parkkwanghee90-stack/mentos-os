const fs = require('fs');
const path = require('path');

const apiKey = process.env.OPENAI_API_KEY || '';

const ans2025_common = [
    0, 4, 2, 1, 3, 2, 4, 3, 0, 0,
    4, 1, 2, 3, 0,
    "3", "15", "11", "7",
    "39", "25", "16"
];
const ans2025_calculus = [0, 2, 3, 1, 2, 3, "109", "25"];

function getPointStr(id) {
    if (id <= 2) return "2점";
    if (id <= 8) return "3점";
    if (id <= 15) return "4점";
    if (id <= 19) return "3점";
    if (id <= 22) return "4점";
    if (id === 23) return "2점";
    if (id <= 27) return "3점";
    return "4점";
}

async function transcribeImage(imagePath, id) {
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    const prompt = `You are an expert Math KaTeX transcriber. 
Extract the problem text and options from this Korean math problem image.
Format it EXACTLY as a JSON object:
{
  "id": ${id},
  "text": "...", // The problem text with KaTeX formulas enclosed in $...$ or $$...$$
  "options": ["...", "...", "...", "...", "..."] // The 5 options if it's multiple choice, otherwise empty array []
}
Ensure accurate KaTeX parsing. Do NOT include markdown backticks. Return ONLY valid JSON.`;

    const body = {
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:image/webp;base64,${base64Image}` } }
                ]
            }
        ],
        response_format: { type: "json_object" }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

async function main() {
    const baseDir = 'c:/mentos_os_clean/public/math_crops/고3수능및모의고사/월별모의고사/6월/미적분_2025_6월';
    const commonQuestions = [];
    const calculusQuestions = [];
    
    // Using Promise.all with chunks of 5 to speed things up
    for (let i = 1; i <= 30; i += 5) {
        const promises = [];
        for (let j = 0; j < 5 && i + j <= 30; j++) {
            const id = i + j;
            const paddedId = String(id).padStart(3, '0');
            const imagePath = path.join(baseDir, `${paddedId}.webp`);
            if (fs.existsSync(imagePath)) {
                console.log(`Queueing ${paddedId}...`);
                promises.push(transcribeImage(imagePath, id).catch(e => { console.error('Failed', id, e); return null; }));
            }
        }
        
        const chunkResults = await Promise.all(promises);
        for (const res of chunkResults) {
            if (res) {
                const isCommon = res.id <= 22;
                const ans = isCommon ? ans2025_common[res.id - 1] : ans2025_calculus[res.id - 23];
                const finalObj = {
                    id: res.id,
                    type: getPointStr(res.id),
                    text: res.text,
                    options: res.options || [],
                    answer: ans,
                    tag: isCommon ? "공통" : "미적분"
                };
                if (isCommon) {
                    commonQuestions.push(finalObj);
                } else {
                    calculusQuestions.push(finalObj);
                }
            }
        }
        console.log(`Finished chunk ${i} to ${i+4}`);
    }
    
    commonQuestions.sort((a,b) => a.id - b.id);
    calculusQuestions.sort((a,b) => a.id - b.id);
    
    const output = `export const commonQuestions = ${JSON.stringify(commonQuestions, null, 2)};\n\nexport const calculusQuestions = ${JSON.stringify(calculusQuestions, null, 2)};\n\nexport const statsQuestions = []; // TODO\n`;
    
    fs.writeFileSync('c:/mentos_os_clean/src/data/mockExams/CSAT_2025_6.js', output);
    console.log('Successfully wrote CSAT_2025_6.js!');
}

main();
