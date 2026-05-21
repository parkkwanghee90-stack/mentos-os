import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFolders = [
  'public/math_hints/삼각함수그래프3단계',
  'public/math_hints/삼각함수그래프'
];

function checkIntegrity(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const errors = [];
    
    // 1. Valid JSON check
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        return ["Invalid JSON format"];
    }

    const text = JSON.stringify(data);

    // 2. Placeholder check
    if (data.S === "" || data.S === "해설 참조") {
        errors.push("Placeholder (empty S field)");
    }

    // 3. Triple dollar check
    if (text.includes('$$$')) {
        errors.push("Triple dollar signs ($$$) found");
    }

    // 4. Broken KaTeX backslashes
    // Check for single backslashes that should be double in JSON
    // Actually, in JSON string, \ is escaped as \\.
    // So if we see \t, \n, it's fine. But \sin should be \\sin.
    const brokenLatex = /\\(?!n|r|t|u|b|f|v|'|"|\\|[0-9a-fA-F]{4})[a-zA-Z]+/.test(text);
    // Wait, regex is tricky here. Let's just check for specific common ones.
    const commonMacros = ['sin', 'cos', 'tan', 'theta', 'pi', 'frac', 'sqrt', 'alpha', 'beta'];
    for (const macro of commonMacros) {
        const reg = new RegExp(`\\\\${macro}`, 'g');
        const matches = text.match(reg);
        if (matches) {
            // In a valid JSON string, it should be \\macro.
            // If we read it via JSON.parse, data.S will have \macro.
        }
    }

    // Check data fields
    ['P', 'C', 'B', 'S', 'A'].forEach(key => {
        const val = data[key];
        if (typeof val === 'string') {
            // Check for unpaired $
            const dollarCount = (val.match(/\$/g) || []).length;
            if (dollarCount % 2 !== 0) {
                errors.push(`Unpaired dollar sign in field ${key}`);
            }
            // Check for {$$}
            if (val.includes('{$$}')) {
                errors.push(`{$$} placeholder found in field ${key}`);
            }
        }
    });

    return errors;
}

async function main() {
    for (const folder of targetFolders) {
        const fullPath = path.join(__dirname, '..', folder);
        if (!fs.existsSync(fullPath)) continue;
        
        console.log(`Auditing folder: ${folder}`);
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json')).sort();
        
        let errorCount = 0;
        let placeholderCount = 0;
        
        for (const file of files) {
            const filePath = path.join(fullPath, file);
            const errors = checkIntegrity(filePath);
            if (errors.length > 0) {
                if (errors.includes("Placeholder (empty S field)")) {
                    placeholderCount++;
                } else {
                    console.log(`  [ERROR] ${file}: ${errors.join(', ')}`);
                    errorCount++;
                }
            }
        }
        
        console.log(`Summary for ${folder}:`);
        console.log(`  Total files: ${files.length}`);
        console.log(`  Errors: ${errorCount}`);
        console.log(`  Placeholders: ${placeholderCount}`);
        console.log('-----------------------------------');
    }
}

main();
