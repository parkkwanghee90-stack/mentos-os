import fs from 'fs';

const p = './public/premium_lectures/정규분포.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

// Apply the custom graph component to the relevant steps
d.steps[2].visuals = {
  title: "정규분포 곡선의 성질",
  component: "NormalDistributionGraph",
  props: { mode: "default" }
};

d.steps[3].visuals = {
  title: "분산이 커질 때의 변화",
  component: "NormalDistributionGraph",
  props: { mode: "wide" }
};

d.steps[4].visuals = {
  title: "분산이 작아질 때의 변화",
  component: "NormalDistributionGraph",
  props: { mode: "narrow" }
};

d.steps[6].visuals = {
  title: "68-95-99.7 법칙",
  component: "NormalDistributionGraph",
  props: { mode: "empirical" }
};

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Graph visuals applied to Normal Distribution lecture!');
