const fs = require('fs');

let code = fs.readFileSync('c:/mentos_os_clean/src/pages/MentosMockExam.jsx', 'utf8');

// Inject the import
if (!code.includes('WeaknessAnalysisEngine')) {
  code = code.replace(/import \{ getMetadataForProblem \} from '\.\.\/data\/mockMetadata';/, 
    "import { getMetadataForProblem } from '../data/mockMetadata';\nimport { WeaknessAnalysisEngine } from '../engine/math/WeaknessAnalysisEngine';");
}

const submitStart = code.indexOf('const submitExam = () => {');
const submitEnd = code.indexOf('const resetExam = () => {');

const oldSubmit = code.substring(submitStart, submitEnd);

const newSubmit = `const submitExam = () => {
    let score = 0;
    const wrongIds = [];
    
    let examType = '';
    let year = '';

    if (currentVolume >= 0 && currentVolume <= 2) {
        examType = '6월';
        year = currentVolume === 0 ? '2025' : currentVolume === 1 ? '2024' : '2023';
    } else if (currentVolume >= 3 && currentVolume <= 5) {
        examType = '수능';
        year = currentVolume === 3 ? '2025' : currentVolume === 4 ? '2024' : '2023';
    } else if (currentVolume >= 6 && currentVolume <= 8) {
        examType = '9월';
        year = currentVolume === 6 ? '2025' : currentVolume === 7 ? '2024' : '2023';
    } else if (currentVolume >= 9 && currentVolume <= 11) {
        examType = '3월';
        year = currentVolume === 9 ? '2026' : currentVolume === 10 ? '2025' : '2024';
    }

    const subject = electiveMode === 'calculus' ? '미적분' : '확통';
    
    const questionsWithMeta = data.questions.filter(q => (q.text && q.text.trim() !== "") || q.picture).map(q => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected !== undefined && String(selected).trim() === String(q.answer).trim();
      
      if (isCorrect) {
        score += parseInt(q.type) || 0;
      } else {
        wrongIds.push(q.id);
      }
      
      let meta = {};
      try {
        meta = getMetadataForProblem(year, examType, subject, q.id) || {};
      } catch (e) {}
      
      return {
        id: q.id,
        unit: q.unit || meta.unit || '기타단원',
        level: q.level || meta.level || 3,
        problemType: q.problemType || meta.subunit || '일반유형',
        concept: q.concept || meta.concept || []
      };
    });

    const { report, drillSet } = WeaknessAnalysisEngine.analyzeAndGenerateDrill(questionsWithMeta, wrongIds);
    
    // Map to old report format for UI
    const topWeakUnitsForUI = report.topWeakUnits.map((wu, idx) => {
        const drill = drillSet.find(d => d.unit === wu.unit);
        const reviewProblems = drill ? drill.drillQuestions.map((dq, i) => ({
            id: dq.drillId,
            level: dq.level,
            title: \`[보강] \${dq.unit} 핵심유형 \${i+1}\`,
            tag: dq.tag,
            questionText: \`**\${dq.unit} 보강문제 \${i+1} (난이도 \${dq.level}단계)**\\n\\n이 문제는 오답 분석을 통해 특별히 배정된 맞춤형 문제입니다.\`
        })) : [];
        
        return {
            unit: wu.unit,
            subunit: wu.unit,
            wrongProblems: [wu.wrong + '개 틀림 (오답률 ' + Math.round(wu.errorRate*100) + '%)'],
            pcbs: { P: 0, C: 0, B: 0, S: 0 },
            reviewProblems
        };
    });

    setWeaknessReport({ 
        score, 
        wrong: data.questions.filter(q => wrongIds.includes(q.id)), 
        topWeakUnits: topWeakUnitsForUI, 
        weakPcbs: [\`\${report.topWeakType} (가장 취약한 유형)\`]
    });
    
    setShowAnalysis(true);
  };

  `;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('c:/mentos_os_clean/src/pages/MentosMockExam.jsx', code);
console.log('MentosMockExam updated successfully!');
