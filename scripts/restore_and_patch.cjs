const fs = require('fs');
const { execSync } = require('child_process');

// 1. Restore file
execSync('git checkout src/pages/MathClassroom_Mobile.jsx', { cwd: 'C:\\mentos_os_clean' });

const target = 'C:\\mentos_os_clean\\src\\pages\\MathClassroom_Mobile.jsx';
let code = fs.readFileSync(target, 'utf8');

// 2. Add debug variables
if (!code.includes('debugAvsFetchUrl')) {
  code = code.replace(
    'const [debugFetchStatus, setDebugFetchStatus] = useState(null);',
    'const [debugFetchStatus, setDebugFetchStatus] = useState(null);\n  const [debugAvsFetchUrl, setDebugAvsFetchUrl] = useState("");\n  const [debugPremiumUrl, setDebugPremiumUrl] = useState("");'
  );
}

code = code.replace(
  'const hintUrl = `${URL_PREFIX}/math_hints/${hintFolder}/${String(testProblemIdx).padStart(3, \'0\')}.json`;',
  'const hintUrl = `${URL_PREFIX}/math_hints/${hintFolder}/${String(testProblemIdx).padStart(3, \'0\')}.json?v=${Date.now()}`;\n      setDebugAvsFetchUrl(hintUrl);'
);

if (!code.includes('useEffect(() => { setDebugPremiumUrl')) {
  code = code.replace(
    'useEffect(() => {',
    `useEffect(() => {
    if (selectedUnit) {
      const clean = selectedUnit.replace(/\\s+/g, '').replace(/[234]단계/g, '').replace(/\\[.*?\\]/g, '');
      setDebugPremiumUrl('/premium_lectures/' + encodeURIComponent(clean) + '.json (Guess)');
    }
  }, [selectedUnit]);
  useEffect(() => {`
  );
}

// 3. Update the DIAG PANEL
const oldDiag = "<div>📌 imgURL: <span style={{color:'#888', wordBreak:'break-all'}}>{currentProblemImage ? currentProblemImage.split('/').slice(-2).join('/').split('?')[0] : 'NULL'}</span></div>";

const newDiag = `<div>📌 imgURL: <span style={{color:'#888', wordBreak:'break-all'}}>{currentProblemImage ? currentProblemImage.split('/').slice(-2).join('/').split('?')[0] : 'NULL'}</span></div>
          <div style={{marginTop: '4px', borderTop: '1px solid #444', paddingTop: '4px'}}>
            <div style={{color:'#0f0'}}>🔗 Data JSONs (cache bypassed):</div>
            <div>- math_problem_texts: <span style={{wordBreak:'break-all', fontSize:'10px'}}>{'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/data/math_problem_texts.json?v=Date.now'}</span></div>
            <div>- answers_master: <span style={{wordBreak:'break-all', fontSize:'10px'}}>{'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/data/answers_master.json?v=Date.now'}</span></div>
            <div>- avs_answers: <span style={{wordBreak:'break-all', fontSize:'10px'}}>{'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/data/avs_answers.json?v=Date.now'}</span></div>
          </div>
          <div>📌 avsFetchUrl: <span style={{color:'#ff0', wordBreak:'break-all', fontSize:'10px'}}>{debugAvsFetchUrl}</span></div>
          <div>📌 premiumUrl: <span style={{color:'#0ff', wordBreak:'break-all', fontSize:'10px'}}>{debugPremiumUrl}</span></div>`;

code = code.replace(oldDiag, () => newDiag);

// 4. Fix choices formatting
const oldChoicesRegex = /choices=\{currentProblemRawData\?\.choices\?\.map\([^}]+\}\s*\/>/;
const newChoicesStr = `choices={
  currentProblemRawData?.choices?.map((c) =>
    typeof c === 'string' &&
    !c.includes('$') &&
    /[\\\\{}^_]/.test(c)
      ? \`$\${c}\$\`
      : c
  )
}
/>`;

code = code.replace(oldChoicesRegex, () => newChoicesStr);

fs.writeFileSync(target, code, 'utf8');
console.log('Restored and patched perfectly.');
