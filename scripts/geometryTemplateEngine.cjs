/**
 * geometryTemplateEngine.cjs
 * Base Figure 템플릿들을 생성하여 반환합니다.
 */

function makePoint(id, x, y, tex) {
  return [
    { id: `point_${id}`, type: "point", x, y, color: "#94a3b8" },
    { id: `label_${id}`, type: "label_text", tex, at: [x + 0.3, y + 0.3], color: "#e2e8f0" }
  ];
}

function makeSegment(id, p1, p2) {
  return { id, type: "drawSegment", p1, p2, color: "#94a3b8", style: "solid" };
}

function drawTriangleTemplate() {
  const A = [4, 6], B = [0, 0], C = [8, 0];
  return {
    preset: "custom",
    objects: [
      { id: "base_polygon", type: "polygon", points: [A, B, C], color: "#64748b", fillOpacity: 0.08 },
      makeSegment("AB", A, B),
      makeSegment("BC", B, C),
      makeSegment("CA", C, A),
      ...makePoint("A", A[0], A[1], "A"),
      ...makePoint("B", B[0], B[1], "B"),
      ...makePoint("C", C[0], C[1], "C"),
      { id: "angle_A", type: "label_text", tex: "A", at: [A[0], A[1]-0.8], color: "#f59e0b" },
      { id: "angle_B", type: "label_text", tex: "B", at: [B[0]+0.8, B[1]+0.3], color: "#f59e0b" },
      { id: "angle_C", type: "label_text", tex: "C", at: [C[0]-0.8, C[1]+0.3], color: "#f59e0b" }
    ]
  };
}

function drawRightTriangleTrigTemplate() {
  const A = [0, 6], B = [0, 0], C = [8, 0]; // B is right angle
  return {
    preset: "custom",
    objects: [
      { id: "base_polygon", type: "polygon", points: [A, B, C], color: "#64748b", fillOpacity: 0.08 },
      makeSegment("AB", A, B),
      makeSegment("BC", B, C),
      makeSegment("CA", C, A),
      ...makePoint("A", A[0], A[1], "A"),
      ...makePoint("B", B[0], B[1], "B"),
      ...makePoint("C", C[0], C[1], "C"),
      { id: "angle_B", type: "label_text", tex: "90^\\circ", at: [B[0]+0.5, B[1]+0.5], color: "#fca5a5" }
    ]
  };
}

function drawCircleTriangleTemplate() {
  const center = [0, 0];
  const r = 5;
  const A = [0, 5], B = [-4, -3], C = [4, -3];
  return {
    preset: "custom",
    objects: [
      { id: "circumcircle", type: "drawCircle", center, radius: r, color: "#64748b" },
      { id: "base_polygon", type: "polygon", points: [A, B, C], color: "#3b82f6", fillOpacity: 0.05 },
      makeSegment("AB", A, B),
      makeSegment("BC", B, C),
      makeSegment("CA", C, A),
      ...makePoint("A", A[0], A[1], "A"),
      ...makePoint("B", B[0], B[1], "B"),
      ...makePoint("C", C[0], C[1], "C"),
      ...makePoint("O", center[0], center[1], "O")
    ]
  };
}

function drawInscribedQuadrilateralTemplate() {
  const center = [0, 0], r = 5;
  const A = [-3, 4], B = [-4, -3], C = [3, -4], D = [4, 3];
  return {
    preset: "custom",
    objects: [
      { id: "circumcircle", type: "drawCircle", center, radius: r, color: "#64748b" },
      { id: "base_polygon", type: "polygon", points: [A, B, C, D], color: "#3b82f6", fillOpacity: 0.05 },
      makeSegment("AB", A, B), makeSegment("BC", B, C), makeSegment("CD", C, D), makeSegment("DA", D, A),
      makeSegment("AC", A, C), makeSegment("BD", B, D), // Diagonals
      ...makePoint("A", A[0], A[1], "A"), ...makePoint("B", B[0], B[1], "B"),
      ...makePoint("C", C[0], C[1], "C"), ...makePoint("D", D[0], D[1], "D")
    ]
  };
}

// Fallback empty template for Algebra / graphs
function drawAlgebraTemplate() {
  return { preset: "custom", objects: [] };
}

module.exports = {
  drawTriangleTemplate,
  drawRightTriangleTrigTemplate,
  drawCircleTriangleTemplate,
  drawInscribedQuadrilateralTemplate,
  drawAlgebraTemplate
};
