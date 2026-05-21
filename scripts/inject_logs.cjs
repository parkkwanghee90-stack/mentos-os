const fs = require('fs');
const file = 'c:/mentos_os_clean/src/pages/MathClassroom.jsx';
let content = fs.readFileSync(file, 'utf8');

let count = 0;
const newContent = content.replace(/useEffect\(\(\) => \{/g, () => {
    count++;
    return 'useEffect(() => { console.log("[EFFECT TRIGGERED] Loop ID: " + ' + count + ');';
});

fs.writeFileSync(file, newContent, 'utf8');
console.log('Injected', count, 'logs.');
