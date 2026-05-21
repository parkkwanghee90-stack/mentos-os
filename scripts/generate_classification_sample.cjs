const fs = require('fs');
const path = require('path');

const bDir = 'c:/mentos_os_clean/public/math_data/삼각함수활용2단계';
const targetUnit = '삼각함수활용2단계';
const limit = 20;

function classify(text) {
   let problem_type = 'generic_geometry_unknown';
   let geometry_subtype = 'generic_geometry_unknown';
   const req_obj = { circle: false, points: [], segments: [], angles: [], lengths: [] };
   const req_rel = [];

   const lower = text.toLowerCase().replace(/\s+/g, ' ');

   // 1. problem_type
   const mandatoryGeometryKeywords = /그림과 같이|삼각형|사각형|원|점 P|선분|각|내접|외접|접선|현|위의 점|선 위의 점/i;
   
   const hasGeo = mandatoryGeometryKeywords.test(lower) || /반지름|길이|둘레|직각|대각선/i.test(lower);
   const hasGraph = /그래프|축|좌표|함수|직선 y|포물선/i.test(lower);
   const hasAlg = /자연수|수열|비율|시그마|최댓값|최솟값/i.test(lower);

   if (hasGeo) problem_type = 'geometry'; // Strict override: If geo keyword exists, IT IS GEOMETRY
   else if (hasGraph) problem_type = 'graph';
   else if (hasAlg) problem_type = 'algebra_text';
   else problem_type = 'algebra_text';

   // 2. geometry_subtype
   if (problem_type === 'geometry' || problem_type === 'mixed_geometry_graph') {
       if (/사각형\s*[A-Z]{4}/i.test(lower) || (/내접/i.test(lower) && /사각형/i.test(lower))) {
           geometry_subtype = 'inscribed_quadrilateral';
       } else if (/원/i.test(lower) && /현/i.test(lower) && /원주각|중심각/.test(lower)) {
           geometry_subtype = 'circle_chord_angle';
       } else if (/접선|접소/i.test(lower)) {
           geometry_subtype = 'circle_tangent';
       } else if (/직각삼각형/i.test(lower)) {
           geometry_subtype = 'right_triangle_trig';
       } else if (/원/i.test(lower) && /내접|삼각형/i.test(lower)) {
           geometry_subtype = 'circle_triangle';
       } else if (/수선의 발|연장선|각의\s*이등분선/i.test(lower)) {
           geometry_subtype = 'triangle_with_auxiliary';
       } else if (/삼각형/i.test(lower)) {
           geometry_subtype = 'triangle_basic';
       }
   }

   // 3. Extraction Rule
   if (/원|반지름|r\s*=|외접원/i.test(lower)) req_obj.circle = true;

   const ptMatches = lower.match(/[점각]\s*([A-Z])/gi);
   if (ptMatches) {
       ptMatches.forEach(m => req_obj.points.push(m.replace(/[^A-Z]/g, '')));
   }
   if (lower.includes('a')) req_obj.points.push('A');
   if (lower.includes('b')) req_obj.points.push('B');
   if (lower.includes('c')) req_obj.points.push('C');
   req_obj.points = [...new Set(req_obj.points)];

   let m;
   const segRegex = /(?:선분|길이)\s*([A-Z]{2})/gi;
   while((m = segRegex.exec(lower))) req_obj.segments.push(m[1].toUpperCase());
   req_obj.segments = [...new Set(req_obj.segments)];

   const angleRegex = /∠\s*([A-Z]{1,3})/gi;
   while((m = angleRegex.exec(lower))) req_obj.angles.push(m[1].toUpperCase());
   req_obj.angles = [...new Set(req_obj.angles)];

   // Subtype mapping to templates
   const templateMap = {
     'triangle_basic': 'drawTriangleTemplate()',
     'circle_triangle': 'drawCircleTriangleTemplate()',
     'inscribed_quadrilateral': 'drawInscribedQuadrilateralTemplate()',
     'circle_chord_angle': 'drawChordAngleTemplate()',
     'circle_tangent': 'drawCircleTangentTemplate()',
     'right_triangle_trig': 'drawRightTriangleTrigTemplate()',
     'generic_geometry_unknown': 'manual_review_unknown()'
   };
   
   const selected_template = templateMap[geometry_subtype] || 'drawNoGeomTemplate()';

   return {
       problem_type,
       geometry_subtype,
       required_objects: req_obj,
       required_relations: req_rel,
       selected_template
   };
}

let count = 0;
let results = [];

const dirs = fs.readdirSync(bDir);
for (const d of dirs) {
   if (count >= limit) break;
   const p = path.join(bDir, d, d + '.overlay.json');
   if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const text = data.overlay_steps.map(s => s.text || s.latex || s.label_text).join(' ');
      
      const cl = classify(text);
      results.push({
         id: d,
         text_snippet: text.substring(0, 100).replace(/\n/g, ' ') + '...',
         classification: cl
      });
      count++;
   }
}

let md = `# 도형 자동 분류 엔진 20 샘플 테스트 결과\n\n`;
results.forEach(r => {
   md += `### 문항 ${r.id}\n`;
   md += `- **Text**: ${r.text_snippet}\n`;
   md += `- **Problem Type**: \`${r.classification.problem_type}\`\n`;
   md += `- **Geometry Subtype**: \`${r.classification.geometry_subtype}\`\n`;
   md += `- **Template**: \`${r.classification.selected_template}\`\n`;
   md += `- **Objects Detected**: ${JSON.stringify(r.classification.required_objects)}\n`;
   md += `---\n`;
});

fs.writeFileSync('c:/mentos_os_clean/scripts/classification_sample.md', md);
console.log('Sample generation complete: classification_sample.md');
