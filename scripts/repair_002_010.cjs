const fs = require('fs');
const path = require('path');

const bDir = 'c:/mentos_os_clean/public/math_data/삼각함수활용2단계';

const fixes = {
  // 002: Triangle A:B:C = 2:3:1
  '002': {
     type: "triangle_angles", angles: {A: 60, B: 90, C: 30}, side: {name: 'BC', value: 3.46}, labels: {vertices: true, sides: false, angles: true}
  },
  // 003: Triangle ABC, point D on BC, BD:DC = ...
  '003': [
     { type: "triangle_angles", angles: {A: 60, B: 50, C: 70}, side: {name: 'BC', value: 6}, labels: {vertices: true, angles: false} },
     { type: "drawSegment", p1: [0, 0], p2: [3, 0], style: "solid", label: "" },
     { type: "label_text", tex: "D", at: [3, -0.3], color: "#ef4444" },
     { type: "drawSegment", p1: [0,0], p2: [1.5, 4], style: 'dashed' }, // A to D roughly
  ],
  // 004: a=6, b=8, A=30
  '004': {
     type: "triangle_angles", angles: {A: 30, B: 41.8, C: 108.2}, side: {name: 'a', value: 6}, labels: {vertices: true, sides: true, angles: true}
  },
  // 005: AC=6sqrt2, A=30, C=105
  '005': {
     type: "triangle_angles", angles: {A: 30, B: 45, C: 105}, side: {name: 'b', value: 8.48}, labels: {vertices: true, sides: true, angles: true}
  },
  // 006: Quadrilateral ABCD, ABD=50, ADB=40, CBD=70, BD=2sqrt3 ... A=90
  '006': [
     { type: "drawCircle", center: [0,0], radius: 4 },
     { type: "drawInscribedQuadrilateral", center: [0,0], radius: 4, angles: [140, 230, 310, 50], labels: ["A", "B", "C", "D"] },
     { type: "drawSegment", p1: [-3.06, -2.57], p2: [2.57, 3.06] }, // BD diagonal
     { type: "drawSegment", p1: [-3.06, -2.57], p2: [2.57, -3.06] }, // AC roughly
     { type: "markAngle", vertex: [-3.06, -2.57], value: "50^{\\circ}", offset: [0.3, 0.8] },
     { type: "markAngle", vertex: [2.57, 3.06], value: "40^{\\circ}", offset: [-0.8, -0.5] },
     { type: "markLength", p1: [-3.06, -2.57], p2: [2.57, 3.06], value: "BD=2\\sqrt{3}", offset:-0.6}
  ],
  // 007: sinA+sinB+sinC=5/2, R=2
  '007': [
     { type: "drawCircle", center: [0,0], radius: 2, center_label: "O", color: "#64748b" },
     { type: "drawInscribedQuadrilateral", center: [0,0], radius: 2, angles: [30, 150, 270], labels: ["A", "B", "C"] }
  ],
  // 008: BC=8, 9sin(B+C)sinA=4
  '008': [
     { type: "drawCircle", center: [0,0], radius: 4, color: "#64748b" },
     { type: "drawInscribedQuadrilateral", center: [0,0], radius: 4, angles: [90, 210, 330], labels: ["A", "B", "C"] }
  ],
  // 009: R=9, sinA=1/6
  '009': [
     { type: "drawCircle", center: [0,0], radius: 4.5, color: "#64748b" },
     { type: "drawInscribedQuadrilateral", center: [0,0], radius: 4.5, angles: [90, 185, 355], labels: ["A", "B", "C"] }
  ],
  // 010: B=D=90, AC=4, A=theta
  '010': [
     { type: "drawCircle", center: [0,0], radius: 2, color: "#64748b" },
     { type: "drawInscribedQuadrilateral", center: [0,0], radius: 2, angles: [180, 270, 0, 90], labels: ["A", "B", "C", "D"] },
     { type: "drawSegment", p1: [-2,0], p2: [2,0] }, // AC diagonal
     { type: "markAngle", vertex: [-2,0], value: "\\theta", offset: [0.5, 0.2] }
  ]
};

for (const [id, presetObj] of Object.entries(fixes)) {
  const probPath = path.join(bDir, id);
  if(!fs.existsSync(probPath)) continue;
  
  const baseFile = path.join(probPath, id + '.base.json');
  const baseJson = {
    layer: 'base',
    preset: 'custom',
    objects: Array.isArray(presetObj) ? presetObj : [presetObj],
    readonly: true
  };
  fs.writeFileSync(baseFile, JSON.stringify(baseJson, null, 2));

  // Sync to render
  const renderFile = path.join(probPath, id + '.render.json');
  if(fs.existsSync(renderFile)) {
    const renderJson = JSON.parse(fs.readFileSync(renderFile, 'utf8'));
    renderJson.base_figure = { preset: 'custom', objects: baseJson.objects };
    renderJson.viewBox = { x: [-6, 6], y: [-6, 6] }; // Generic safe bounds
    fs.writeFileSync(renderFile, JSON.stringify(renderJson, null, 2));
  }
}
console.log('Manually crafted precise geometric scenes for 002-010!');
