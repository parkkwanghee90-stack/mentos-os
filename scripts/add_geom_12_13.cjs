const fs = require('fs');
const path = require('path');

const file12 = 'public/math_hints/CSAT_2024_6월_미적분/012.json';
const data12 = JSON.parse(fs.readFileSync(file12, 'utf-8'));

data12.type = "geometry";
data12.viewBox = { "x": [-2, 3], "y": [-2, 4] };
data12.base_figure = {
  "type": "polygon",
  "preset": "custom",
  "objects": [
    { "type": "function", "expr": "2^x", "color": "#3b82f6" },
    { "type": "function", "expr": "1 - 2^(-x)", "color": "#ef4444" },
    { "type": "point", "id": "A", "x": 1.585, "y": 0.667, "color": "#ef4444", "label": "A" },
    { "type": "point", "id": "B", "x": 1.585, "y": 3, "color": "#3b82f6", "label": "B" },
    { "type": "point", "id": "C", "x": -1, "y": 0.667, "color": "#3b82f6", "label": "C" },
    { "type": "point", "id": "D", "x": -1, "y": -1, "color": "#ef4444", "label": "D" },
    { "type": "segment", "from": [1.585, 0.667], "to": [1.585, 3], "color": "#cbd5e1", "style": "dashed" },
    { "type": "segment", "from": [1.585, 0.667], "to": [-1, 0.667], "color": "#cbd5e1", "style": "dashed" },
    { "type": "segment", "from": [-1, 0.667], "to": [-1, -1], "color": "#cbd5e1", "style": "dashed" },
    { "type": "latex_label", "x": 2.2, "y": 3.5, "text": "y=2^x", "color": "#3b82f6" },
    { "type": "latex_label", "x": 2.2, "y": 0.3, "text": "y=1-2^{-x}", "color": "#ef4444" }
  ]
};
fs.writeFileSync(file12, JSON.stringify(data12, null, 2));

const file13 = 'public/math_hints/CSAT_2024_6월_미적분/013.json';
const data13 = JSON.parse(fs.readFileSync(file13, 'utf-8'));

data13.type = "geometry";
data13.viewBox = { "x": [-1, 3], "y": [-1, 5] };
data13.base_figure = {
  "type": "polygon",
  "preset": "custom",
  "objects": [
    { "type": "function", "expr": "0.25*x^3 + 0.5*x", "color": "#3b82f6" },
    { "type": "function", "expr": "-(4/3)*x + 2", "color": "#ef4444" },
    { "type": "segment", "from": [2, 0], "to": [2, 3], "color": "#cbd5e1", "style": "dashed" },
    { "type": "latex_label", "x": 2, "y": -0.3, "text": "x=2", "color": "#cbd5e1" },
    { "type": "latex_label", "x": 2.5, "y": 4.5, "text": "y=\\frac{1}{4}x^3+\\frac{1}{2}x", "color": "#3b82f6" },
    { "type": "latex_label", "x": -0.5, "y": 2.5, "text": "y=mx+2", "color": "#ef4444" },
    { "type": "latex_label", "x": 0.5, "y": 1, "text": "A", "color": "#fcd34d" },
    { "type": "latex_label", "x": 1.5, "y": 1.5, "text": "B", "color": "#fcd34d" }
  ]
};
fs.writeFileSync(file13, JSON.stringify(data13, null, 2));

console.log("Added base_figure to 012 and 013");
