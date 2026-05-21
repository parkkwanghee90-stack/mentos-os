import fs from 'fs';

const path = './public/premium_lectures/삼각함수그래프.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.steps[0].visuals.component = "TrigonometricGraph";
data.steps[0].visuals.props = { mode: "sin-cos" };

data.steps[1].visuals.component = "TrigonometricGraph";
data.steps[1].visuals.props = { mode: "transformed", props: { a: 2, b: 0.5, c: 0 } };

data.steps[2].visuals.component = "TrigonometricGraph";
data.steps[2].visuals.props = { mode: "transformed", props: { a: 1, b: 1, c: 1 } };

data.steps[3].visuals.component = "TrigonometricGraph";
data.steps[3].visuals.props = { mode: "tan" };

data.steps[4].visuals.component = "TrigonometricGraph";
data.steps[4].visuals.props = { mode: "symmetry" };

data.steps[5].visuals.component = "TrigonometricGraph";
data.steps[5].visuals.props = { mode: "absolute" };

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated 삼각함수그래프.json with actual graph components!');
