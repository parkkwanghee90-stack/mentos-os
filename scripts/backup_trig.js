import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    
    if (fs.existsSync(from)) {
        fs.readdirSync(from).forEach(element => {
            const fromPath = path.join(from, element);
            const toPath = path.join(to, element);
            if (fs.lstatSync(fromPath).isFile()) {
                fs.copyFileSync(fromPath, toPath);
            } else {
                copyFolderSync(fromPath, toPath);
            }
        });
    }
}

const backup3 = path.join(__dirname, '..', '20260405삼각함수그래프3단계');
const backup4 = path.join(__dirname, '..', '20260405삼각함수그래프4단계');

console.log('Starting custom trig backup...');

copyFolderSync(path.join(__dirname, '..', 'public', 'math_hints', '삼각함수그래프3단계'), backup3);
copyFolderSync(path.join(__dirname, '..', 'public', 'math_hints', '삼각함수그래프'), backup4);

console.log('Backup completed successfully!');
console.log('3단계 Backup:', backup3);
console.log('4단계 Backup:', backup4);
