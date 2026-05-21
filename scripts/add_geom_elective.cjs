const fs = require('fs');
const path = require('path');

const fileCalc26 = 'public/math_hints/CSAT_2024_6월_미적분/026.json';
const dataCalc26 = JSON.parse(fs.readFileSync(fileCalc26, 'utf-8'));

dataCalc26.type = "geometry";
dataCalc26.viewBox = { "x": [-1, 4], "y": [-1, 2] };
dataCalc26.base_figure = {
  "type": "polygon",
  "preset": "custom",
  "objects": [
    { "type": "function", "expr": "sqrt(x)*sin(x)", "color": "#3b82f6" },
    { "type": "segment", "from": [0, 0], "to": [3.1415, 0], "color": "#cbd5e1" },
    { "type": "latex_label", "x": 3.1415, "y": -0.2, "text": "\\pi", "color": "#cbd5e1" },
    { "type": "latex_label", "x": 1.5, "y": 1.5, "text": "y=\\sqrt{x}\\sin x", "color": "#3b82f6" }
  ]
};
fs.writeFileSync(fileCalc26, JSON.stringify(dataCalc26, null, 2));

const fileStats28 = 'public/math_hints/CSAT_2024_6월_확통/028.json';
const dataStats28 = JSON.parse(fs.readFileSync(fileStats28, 'utf-8'));

dataStats28.type = "geometry";
dataStats28.viewBox = { "x": [-1, 5], "y": [-0.5, 1] };
dataStats28.base_figure = {
  "type": "polygon",
  "preset": "custom",
  "objects": [
    { "type": "segment", "from": [0, 0], "to": [2, 0.5], "color": "#3b82f6" },
    { "type": "segment", "from": [2, 0.5], "to": [4, 0], "color": "#3b82f6" },
    { "type": "segment", "from": [0, 0], "to": [4, 0], "color": "#cbd5e1" },
    { "type": "segment", "from": [2, 0], "to": [2, 0.5], "color": "#ef4444", "style": "dashed" },
    { "type": "segment", "from": [1, 0], "to": [1, 0.25], "color": "#f59e0b", "style": "dashed" },
    { "type": "segment", "from": [3, 0], "to": [3, 0.25], "color": "#f59e0b", "style": "dashed" },
    { "type": "latex_label", "x": -0.2, "y": -0.1, "text": "0", "color": "#cbd5e1" },
    { "type": "latex_label", "x": 2, "y": -0.1, "text": "2", "color": "#cbd5e1" },
    { "type": "latex_label", "x": 4, "y": -0.1, "text": "4", "color": "#cbd5e1" },
    { "type": "latex_label", "x": 1, "y": -0.1, "text": "1", "color": "#f59e0b" },
    { "type": "latex_label", "x": 3, "y": -0.1, "text": "3", "color": "#f59e0b" },
    { "type": "latex_label", "x": -0.3, "y": 0.5, "text": "1/2", "color": "#ef4444" }
  ]
};
fs.writeFileSync(fileStats28, JSON.stringify(dataStats28, null, 2));

console.log("Added base_figure to Calc 26 and Stats 28");
