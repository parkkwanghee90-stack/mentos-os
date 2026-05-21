const fs = require('fs');
const path = require('path');

const folders = fs.readdirSync('c:/mentos_os_clean/public/math_data/삼각함수활용2단계').filter(d => !isNaN(d) && parseInt(d) >= 24);

folders.forEach(dir => {
  const p = path.join('c:/mentos_os_clean/public/math_data/삼각함수활용2단계', dir);
  if (!fs.statSync(p).isDirectory()) return;

  const basePath = path.join(p, `${dir}.base.json`);
  const overPath = path.join(p, `${dir}.overlay.json`);
  const renderPath = path.join(p, `${dir}.render.json`);

  if (!fs.existsSync(basePath) || !fs.existsSync(overPath)) return;

  // Read base
  let baseObj = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  
  // Wipe out hallucinated coordinates, just put a generic triangle or generic coordinate grid
  // to prevent arbitrary skewed polygons from displaying
  baseObj.objects = [
    { type: "polygon", points: [[-2,-1], [3,-1], [0, 3]], color: "#64748b", fillOpacity: 0.05 },
    { type: "drawSegment", p1: [-2,-1], p2: [3,-1], color: "#94a3b8" },
    { type: "drawSegment", p1: [3,-1], p2: [0,3], color: "#94a3b8" },
    { type: "drawSegment", p1: [0,3], p2: [-2,-1], color: "#94a3b8" },
    { type: "label_text", tex: "A", at: [-2.2, -1.2], color: "#4ade80" },
    { type: "label_text", tex: "B", at: [3.2, -1.2], color: "#4ade80" },
    { type: "label_text", tex: "C", at: [0, 3.4], color: "#4ade80" },
    { type: "label_text", tex: "\\text{(해설 정밀 교정 중)}", at: [0.5, 1], color: "#94a3b8", size: 0.8 }
  ];

  fs.writeFileSync(basePath, JSON.stringify(baseObj, null, 2));

  // Sync render
  if (fs.existsSync(renderPath)) {
    let renderObj = JSON.parse(fs.readFileSync(renderPath, 'utf8'));
    renderObj.base_figure = { preset: "custom", objects: baseObj.objects };
    renderObj.viewBox = { x: [-4, 5], y: [-3, 5] };
    fs.writeFileSync(renderPath, JSON.stringify(renderObj, null, 2));
  }
});
console.log("Mass cleanup applied to 024-064!");
