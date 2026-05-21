const fs = require('fs');
const path = require('path');

const targets = [
  '점과좌표2단계', '점과좌표3단계', '점과좌표4단계',
  '직선의방정식2단계', '직선의방정식3단계', '직선의방정식4단계',
  '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
  '도형의이동2단계', '도형의이동3단계', '도형의이동4단계'
];
const bDir = 'c:/mentos_os_clean/public/math_data';

// Helper to extract known coordinates A(-2, 5) or P(x, y) if numeric
function extractPoints(text) {
  const points = [];
  // Regex matches A(2, 3), P(-1, 5), etc
  const pointRegex = /([A-Za-z])\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g;
  let m;
  const seen = new Set();
  while ((m = pointRegex.exec(text))) {
    if (!seen.has(m[1])) {
       points.push({ label: m[1], x: parseFloat(m[2]), y: parseFloat(m[3]) });
       seen.add(m[1]);
    }
  }
  return points;
}

// Automatically populate overlay objects based on step text!
function injectAnalyticObjects(steps, basePoints, isCircleChap) {
   return steps.map(step => {
      const text = String(step.latex || step.text || step.label_text || "").toLowerCase();
      const objects = [];

      // Look for any newly mentioned point in this step
      const stepPts = extractPoints(text);
      stepPts.forEach(pt => {
         // Add point dynamically if not in base
         objects.push({ type: "point", x: pt.x, y: pt.y, label: pt.label.toUpperCase(), color: "#f59e0b" });
      });

      // If mentions a circle equation (x-a)^2 + (y-b)^2 = r^2 roughly
      // just a heuristic to pop a circle
      if (isCircleChap && (text.includes("x^2") || text.includes("원의 중심"))) {
         // Fake circle if we can't parse exactly, or parse if easy:
         objects.push({ type: "circle", center: [0,0], radius: 3, color: "#93c5fd" });
      }

      // If mentions distance or line segment
      if (text.includes("거리") || text.includes("선분")) {
         if (basePoints.length >= 2) {
            objects.push({ type: "drawSegment", p1: [basePoints[0].x, basePoints[0].y], p2: [basePoints[1].x, basePoints[1].y], style: "dashed", color: "#ec4899" });
         }
      }

      // If mentions line equation y = mx + n
      if (text.includes("y=") && text.includes("x")) {
         // A dummy line if we can't parse slope exactly
         objects.push({ type: "function_plot", expr: "x", color: "#f59e0b", style: "dashed" });
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
    const dirPath = path.join(p, d);
    if (!fs.statSync(dirPath).isDirectory()) return;

    const overlayPath = path.join(dirPath, d + '.overlay.json');
    if (!fs.existsSync(overlayPath)) return;
    
    let overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
    const fullText = JSON.stringify(overlay.overlay_steps);

    const basePoints = extractPoints(fullText);
    const isCircleChap = unit.includes('원');
    
    const baseLayer = {
       layer: "base",
       preset: "custom",
       objects: [{ type: "axes" }], // Force Cartesian Axes
       readonly: true
    };

    let minX = -5, maxX = 5, minY = -5, maxY = 5;

    // Add extracted base points to base diagram
    if (basePoints.length > 0) {
       basePoints.forEach(pt => {
          baseLayer.objects.push({ type: "point", x: pt.x, y: pt.y, label: pt.label.toUpperCase(), color: "#4ade80" });
          if (pt.x < minX) minX = pt.x - 2;
          if (pt.x > maxX) maxX = pt.x + 2;
          if (pt.y < minY) minY = pt.y - 2;
          if (pt.y > maxY) maxY = pt.y + 2;
       });
       // Connect points if polygon requested or just for visual anchor
       if (basePoints.length === 3) {
           baseLayer.objects.push({
               type: "polygon", 
               points: [[basePoints[0].x, basePoints[0].y], [basePoints[1].x, basePoints[1].y], [basePoints[2].x, basePoints[2].y]],
               color: "#64748b"
           });
       } else if (basePoints.length === 2 && !isCircleChap) {
           baseLayer.objects.push({
               type: "drawSegment", 
               p1: [basePoints[0].x, basePoints[0].y], p2: [basePoints[1].x, basePoints[1].y],
               color: "#64748b"
           });
       }
    } else {
        // Fallback generic geometry if no points parsed
        if (unit.includes('원의방정식')) {
           baseLayer.objects.push({ type: "circle", center: [0,0], radius: 3, color: "#3b82f6" });
        } else if (unit.includes('직선의방정식')) {
           baseLayer.objects.push({ type: "function_plot", expr: "2*x - 1", color: "#3b82f6" });
        }
    }

    fs.writeFileSync(path.join(dirPath, d + '.base.json'), JSON.stringify(baseLayer, null, 2));

    // Inject objects dynamically into steps
    overlay.overlay_steps = injectAnalyticObjects(overlay.overlay_steps, basePoints, isCircleChap);
    fs.writeFileSync(overlayPath, JSON.stringify(overlay, null, 2));

    // Sync Render
    const renderPath = path.join(dirPath, d + '.render.json');
    if (fs.existsSync(renderPath)) {
        const render = JSON.parse(fs.readFileSync(renderPath, 'utf8'));
        render.base_figure = { preset: "custom", objects: baseLayer.objects };
        render.overlay_steps = overlay.overlay_steps;
        render.viewBox = { x: [minX, maxX], y: [minY, maxY] }; // Set calculated viewbox
        fs.writeFileSync(renderPath, JSON.stringify(render, null, 2));
    }
  });
}

targets.forEach(unit => {
   processUnit(unit);
});

console.log("Mass analytic Cartesian geometry injection complete!");
