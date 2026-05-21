const fs = require('fs');
const path = require('path');

const file20 = 'public/math_hints/CSAT_2024_6월_미적분/020.json';
const data20 = JSON.parse(fs.readFileSync(file20, 'utf-8'));

data20.type = "geometry";
data20.viewBox = { "x": [-1, 7], "y": [-1, 5] };
data20.base_figure = {
  "type": "polygon",
  "preset": "custom",
  "objects": [
    { "type": "function", "expr": "2*sin(x) + 1", "color": "#3b82f6" },
    { "type": "function", "expr": "1", "color": "#cbd5e1", "style": "dashed" },
    { "type": "function", "expr": "3", "color": "#cbd5e1", "style": "dashed" },
    { "type": "segment", "from": [3.1415, -1], "to": [3.1415, 5], "color": "#ef4444", "style": "dashed" },
    { "type": "latex_label", "x": 3.1415, "y": -0.3, "text": "\\pi", "color": "#ef4444" },
    { "type": "latex_label", "x": 6.283, "y": -0.3, "text": "2\\pi", "color": "#cbd5e1" },
    { "type": "latex_label", "x": -0.5, "y": 1, "text": "y=1", "color": "#cbd5e1" },
    { "type": "latex_label", "x": -0.5, "y": 3, "text": "y=3", "color": "#cbd5e1" }
  ]
};
fs.writeFileSync(file20, JSON.stringify(data20, null, 2));

const file21 = 'public/math_hints/CSAT_2024_6월_미적분/021.json';
const data21 = JSON.parse(fs.readFileSync(file21, 'utf-8'));

data21.type = "geometry";
data21.viewBox = { "x": [-1, 4], "y": [-2, 6] };
data21.base_figure = {
  "type": "polygon",
  "preset": "custom",
  "objects": [
    { "type": "function", "expr": "(x-1)^2 * (x-2.5)^2 + 2.66", "color": "#3b82f6" },
    { "type": "function", "expr": "2.66", "color": "#ef4444", "style": "dashed" },
    { "type": "point", "id": "P", "x": 2.5, "y": 2.66, "color": "#ef4444" },
    { "type": "latex_label", "x": -0.5, "y": 2.66, "text": "y=8/3", "color": "#ef4444" },
    { "type": "latex_label", "x": 1, "y": 2.2, "text": "x=1", "color": "#3b82f6" },
    { "type": "latex_label", "x": 2.5, "y": 2.2, "text": "x=2.5", "color": "#3b82f6" }
  ]
};
fs.writeFileSync(file21, JSON.stringify(data21, null, 2));

console.log("Added base_figure to 020 and 021");
