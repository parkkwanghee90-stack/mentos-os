/**
 * math_geometry_engine.cjs
 * Semantic Instruction Engine (AI가 명령어를 내리면 Node.js가 수학 연산으로 좌표를 구축)
 */

function degToRad(d) { return (d * Math.PI) / 180; }
function lerp(a, b, t) { return a + (b - a) * t; }

class GeoEngine {
  constructor() {
    this.points = {};
    this.objects = [];
    this.viewBox = { x: [-2, 10], y: [-2, 10] };
  }

  // 내부 유틸: 라벨, 점, 선분 자동 생성
  addPointVisual(id, x, y, labelTex = id) {
    this.objects.push({ id: `point_${id}`, type: "point", x, y, color: "#cbd5e1" });
    if (labelTex) {
      this.objects.push({ id: `label_${id}`, type: "label_text", tex: labelTex, at: [x, y + 0.5], color: "#e2e8f0" });
    }
  }

  addSegmentVisual(id, p1Id, p2Id, labelTex = null) {
    const p1 = this.points[p1Id];
    const p2 = this.points[p2Id];
    if(!p1 || !p2) return;
    this.objects.push({ id, type: "drawSegment", p1, p2, color: "#94a3b8", style: "solid" });
    if (labelTex) {
      const mid = [lerp(p1[0], p2[0], 0.5), lerp(p1[1], p2[1], 0.5)];
      this.objects.push({ id: `seglabel_${id}`, type: "label_text", tex: labelTex, at: [mid[0], mid[1] + 0.4], color: "#fca5a5" });
    }
  }

  addAngleVisual(id, vId, tex) {
    const p = this.points[vId];
    if(!p) return;
    this.objects.push({ id: `angle_${id}`, type: "label_text", tex, at: [p[0] + 0.6, p[1] + 0.2], color: "#f59e0b" });
  }

  updateViewBox() {
    let minX = 999, maxX = -999, minY = 999, maxY = -999;
    for (const key in this.points) {
      const p = this.points[key];
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
    this.viewBox = { x: [minX - 2, maxX + 2], y: [minY - 2, maxY + 2] };
  }

  // 명령어 1: create_triangle
  cmd_create_triangle(args) {
    // args: { vertices: ["A","B","C"], angles: { A: 30, C: 105 }, labels: { AC: "6\\sqrt{2}" } }
    const v = args.vertices || ["A", "B", "C"];
    const ang = args.angles || {};
    
    let aA = ang[v[0]] || 60;
    let aC = ang[v[2]] || 60;
    let aB = 180 - aA - aC;

    // 변의 길이 (임의 10 기준이되, 주어진 길이가 있으면 비율 조정 필요하지만 일단 비율 무관하게 상대적 좌표 형성)
    const baseLen = 10;
    const aA_rad = degToRad(aA);
    const aB_rad = degToRad(aB);
    const aC_rad = degToRad(aC);

    const b = baseLen; // AC
    const a = b * Math.sin(aA_rad) / Math.sin(aB_rad); // BC
    const c = b * Math.sin(aC_rad) / Math.sin(aB_rad); // AB

    // B를 원점으로, C를 x축 (또는 A를 원점, C를 x축)
    const p1 = [0, 0]; // A
    const p3 = [b, 0]; // C
    const p2 = [c * Math.cos(aA_rad), c * Math.sin(aA_rad)]; // B

    this.points[v[0]] = p1;
    this.points[v[1]] = p2;
    this.points[v[2]] = p3;

    // 다각형
    this.objects.push({
      id: "base_polygon", type: "polygon", points: [p1, p2, p3], color: "#64748b", fillOpacity: 0.08
    });

    // 점 및 선분 렌더
    this.addPointVisual(v[0], p1[0], p1[1]);
    this.addPointVisual(v[1], p2[0], p2[1]);
    this.addPointVisual(v[2], p3[0], p3[1]);

    const seg_AB = v[0]+v[1]; this.addSegmentVisual(seg_AB, v[0], v[1], args.labels ? args.labels[seg_AB] : null);
    const seg_BC = v[1]+v[2]; this.addSegmentVisual(seg_BC, v[1], v[2], args.labels ? args.labels[seg_BC] : null);
    const seg_CA = v[0]+v[2]; this.addSegmentVisual(seg_CA, v[0], v[2], args.labels ? args.labels[seg_CA] || args.labels[v[2]+v[0]] : null);

    if (ang[v[0]]) this.addAngleVisual(v[0], v[0], `${ang[v[0]]}^\\circ`);
    if (ang[v[1]]) this.addAngleVisual(v[1], v[1], `${ang[v[1]]}^\\circ`);
    if (ang[v[2]]) this.addAngleVisual(v[2], v[2], `${ang[v[2]]}^\\circ`);

    this.updateViewBox();
  }

  // 명령어 2: add_point_on_segment
  cmd_add_point_on_segment(args) {
    // args: { point_id: "P", p1: "A", p2: "B", ratio: 0.5 }
    const pt1 = this.points[args.p1];
    const pt2 = this.points[args.p2];
    if (!pt1 || !pt2) return;
    
    const r = args.ratio || 0.5;
    const px = lerp(pt1[0], pt2[0], r);
    const py = lerp(pt1[1], pt2[1], r);
    
    this.points[args.point_id] = [px, py];
    this.addPointVisual(args.point_id, px, py);
  }

  // 명령어 3: add_segment
  cmd_add_segment(args) {
    // args: { id: "PC", p1: "P", p2: "C", label: "x" }
    this.addSegmentVisual(args.id, args.p1, args.p2, args.label);
  }

  cmd_create_circle(args) {
    let center = args.center || [0,0];
    if (typeof center === "string") {
      this.points[center] = [0,0];
      center = [0,0];
    } else {
      this.points["O"] = center;
    }
    const radius = args.radius || 5;
    this.objects.push({ id: args.id || "circle", type: "drawCircle", center, radius, color: "#64748b" });
    if (args.label) this.addPointVisual(typeof args.center === "string" ? args.center : "O", center[0], center[1], args.label);
    else this.addPointVisual(typeof args.center === "string" ? args.center : "O", center[0], center[1], typeof args.center === "string" ? args.center : "O");
    this.updateViewBox();
  }

  cmd_add_point_on_circle(args) {
    const center = typeof args.center === "string" ? this.points[args.center] : (args.center || [0,0]);
    if (!center) return;
    const r = args.radius || 5;
    const ang = degToRad(args.angle_deg || 0);
    const px = center[0] + r * Math.cos(ang);
    const py = center[1] + r * Math.sin(ang);
    this.points[args.point_id] = [px, py];
    this.addPointVisual(args.point_id, px, py, args.point_id);
  }

  cmd_add_point_free(args) {
    const px = args.x || 0;
    const py = args.y || 0;
    this.points[args.point_id] = [px, py];
    this.addPointVisual(args.point_id, px, py, args.point_id);
  }

  cmd_create_inscribed_quad(args) {
    const r = 5;
    const p1 = [-4, -3], p2 = [3, -4], p3 = [4, 3], p4 = [-3, 4]; // ABCD
    const v = args.vertices || ["A","B","C","D"];
    this.points[v[0]] = p1; this.points[v[1]] = p2; this.points[v[2]] = p3; this.points[v[3]] = p4;
    
    this.objects.push({ id: "circumcircle", type: "drawCircle", center: [0,0], radius: r, color: "#64748b" });
    this.objects.push({ id: "base_polygon", type: "polygon", points: [p1,p2,p3,p4], color: "#3b82f6", fillOpacity: 0.05 });
    
    this.addPointVisual(v[0], p1[0], p1[1]); this.addPointVisual(v[1], p2[0], p2[1]);
    this.addPointVisual(v[2], p3[0], p3[1]); this.addPointVisual(v[3], p4[0], p4[1]);
    
    this.addSegmentVisual(v[0]+v[1], v[0], v[1]);
    this.addSegmentVisual(v[1]+v[2], v[1], v[2]);
    this.addSegmentVisual(v[2]+v[3], v[2], v[3]);
    this.addSegmentVisual(v[3]+v[0], v[3], v[0]);
    this.addSegmentVisual(v[0]+v[2], v[0], v[2]); // AC Added
    this.addSegmentVisual(v[1]+v[3], v[1], v[3]); // BD Added
    this.updateViewBox();
  }

  processSequence(commands) {
    for (const cmd of commands) {
      if (cmd.cmd === "create_triangle") this.cmd_create_triangle(cmd);
      else if (cmd.cmd === "add_point_on_segment") this.cmd_add_point_on_segment(cmd);
      else if (cmd.cmd === "add_segment") this.cmd_add_segment(cmd);
      else if (cmd.cmd === "create_circle") this.cmd_create_circle(cmd);
      else if (cmd.cmd === "add_point_on_circle") this.cmd_add_point_on_circle(cmd);
      else if (cmd.cmd === "add_point_free") this.cmd_add_point_free(cmd);
      else if (cmd.cmd === "create_inscribed_quadrilateral") this.cmd_create_inscribed_quad(cmd);
    }
    return {
      preset: "custom",
      objects: this.objects,
      viewBox: this.viewBox
    };
  }
}

function processGeometryCommands(commands) {
  const engine = new GeoEngine();
  return engine.processSequence(commands);
}

module.exports = {
  processGeometryCommands
};
