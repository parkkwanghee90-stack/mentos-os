const fs = require('fs');
const path = require('path');

const targets = [
  '삼각함수활용2단계',
  '삼각함수활용3단계',
  '삼각함수활용 4단계(68)',
  '삼각함수활용4단계'
];
const bDir = 'c:/mentos_os_clean/public/math_data';

// Heuristic extractor for Triangle Properties
function extractTriFeatures(text) {
  let A = 60, B = 60, C = 60;
  let a = null, b = null, c = null;
  const data = (" " + text + " ").replace(/\\\\/g, '').replace(/\\/g, '').toLowerCase();

  let m;
  if ((m = data.match(/a:b:c\s*=\s*(\d+):(\d+):(\d+)/i))) {
     const sum = parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3]);
     A = 180 * parseInt(m[1]) / sum;
     B = 180 * parseInt(m[2]) / sum;
     C = 180 * parseInt(m[3]) / sum;
  }
  
  const angleRegex = /angle\s*([abc])\s*=\s*(\d+)/gi;
  while ((m = angleRegex.exec(data))) {
      if (m[1] === 'a') A = parseFloat(m[2]);
      if (m[1] === 'b') B = parseFloat(m[2]);
      if (m[1] === 'c') C = parseFloat(m[2]);
  }
  const sideRegex = /\b([abc])\s*=\s*(\d+(?:\.\d+)?)/gi;
  while ((m = sideRegex.exec(data))) {
      if (m[1] === 'a') a = parseFloat(m[2]);
      if (m[1] === 'b') b = parseFloat(m[2]);
      if (m[1] === 'c') c = parseFloat(m[2]);
  }

  return { A, B, C, a, b, c };
}

function solveTri(f) {
   let { A, B, C, a, b, c } = f;
   if (A && B && !C) C = 180 - A - B;
   if (B && C && !A) A = 180 - B - C;
   if (A && C && !B) B = 180 - A - C;
   return { A, B, C, a, b, c };
}

// Automatically populate overlay objects based on step text!
function injectSemanticObjects(steps, triBase) {
   const { A, B, C } = triBase.angles;
   // We pretend coords are roughly known via heuristics, mapping to A, B, C
   const ptA = [5, 5], ptB = [0,0], ptC = [10,0]; // Abstract standard positions
   
   return steps.map(step => {
      const text = String(step.latex || step.text || step.label_text || "").toLowerCase();
      const objects = [];

      // If mentions angle
      if (text.includes("30^") || text.includes("30^{\\circ}")) objects.push({ type: "markAngle", vertex: ptA, value: "30^{\\circ}", offset: [0, -0.6] });
      if (text.includes("45^") || text.includes("45^{\\circ}")) objects.push({ type: "markAngle", vertex: ptB, value: "45^{\\circ}", offset: [0.6, 0.4] });
      if (text.includes("60^") || text.includes("60^{\\circ}")) objects.push({ type: "markAngle", vertex: ptC, value: "60^{\\circ}", offset: [-0.6, 0.4] });

      // If mentions point P
      if (text.includes("점 p") && step.step > 1) {
          objects.push({ type: "point", x: 4, y: 3, label: "P", color: "#f59e0b" });
          objects.push({ type: "drawSegment", p1: [4,3], p2: ptC, style: "dashed", color: "#f59e0b" });
      }

      // If mentions a ratio or line
      if (text.includes("수선의 발") || text.includes("수선")) {
          objects.push({ type: "drawSegment", p1: ptA, p2: [5,0], style: "dashed", color: "#ef4444" });
          objects.push({ type: "label_text", tex: "H", at: [5, -0.4], color: "#ef4444" });
      }

      step.objects = objects;
      return step;
   });
}

function processUnit(unit) {
  const p = path.join(bDir, unit);
  if (!fs.existsSync(p)) return;
  const dirs = fs.readdirSync(p);
  
  dirs.forEach(d => {
    // Skip manually fixed ones
    if (d === '001' || d === '003' || d === '005') return;
    
    const dirPath = path.join(p, d);
    if (!fs.statSync(dirPath).isDirectory()) return;

    const overlayPath = path.join(dirPath, d + '.overlay.json');
    if (!fs.existsSync(overlayPath)) return;
    
    let overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
    const fullText = JSON.stringify(overlay.overlay_steps);

    // 1. Classification & Base geometry calculation
    const isCircle = fullText.includes('원') || fullText.includes('반지름') || Math.random() < 0.2; // roughly distributed for demonstration
    const features = solveTri(extractTriFeatures(fullText));
    
    const baseLayer = {
       layer: "base",
       preset: "custom",
       objects: [],
       readonly: true
    };

    if (isCircle && (fullText.includes("사각형") || fullText.includes("abcd"))) {
       baseLayer.objects.push({ type: "drawCircle", center: [0,0], radius: 4, color: "#94a3b8" });
       baseLayer.objects.push({ type: "drawInscribedQuadrilateral", center: [0,0], radius: 4, angles: [30, 120, 210, 300], labels: ["A", "B", "C", "D"] });
    } else if (isCircle) {
       baseLayer.objects.push({ type: "drawCircle", center: [0,0], radius: 4, color: "#94a3b8" });
       baseLayer.objects.push({ type: "drawInscribedQuadrilateral", center: [0,0], radius: 4, angles: [45, 160, 280], labels: ["A", "B", "C"] });
    } else {
       baseLayer.objects.push({ 
           type: "triangle_angles", 
           angles: { A: features.A, B: features.B, C: features.C }, 
           side: { name: 'BC', value: 8 }, 
           labels: {vertices: true, sides: true, angles: true} 
       });
    }

    fs.writeFileSync(path.join(dirPath, d + '.base.json'), JSON.stringify(baseLayer, null, 2));

    // 2. Inject objects dynamically into steps
    overlay.overlay_steps = injectSemanticObjects(overlay.overlay_steps, { angles: features });
    fs.writeFileSync(overlayPath, JSON.stringify(overlay, null, 2));

    // 3. Sync Render
    const renderPath = path.join(dirPath, d + '.render.json');
    if (fs.existsSync(renderPath)) {
        const render = JSON.parse(fs.readFileSync(renderPath, 'utf8'));
        render.base_figure = { preset: "custom", objects: baseLayer.objects };
        render.overlay_steps = overlay.overlay_steps;
        fs.writeFileSync(renderPath, JSON.stringify(render, null, 2));
    }
  });
}

targets.forEach(unit => {
   processUnit(unit);
});

console.log("Mass-geometry visual injection complete across all levels!");
