import React, { useEffect, useRef, useState } from 'react';

export default function MathGraphBoard({ graphData }) {
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    // If Desmos script isn't loaded, don't do anything yet
    if (!window.Desmos || !containerRef.current) return;

    // Initialize Calculator only once
    if (!calculatorRef.current) {
      calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
        keypad: false,
        expressions: false,   // Hide the left panel for view-only focus mode
        settingsMenu: false,
        zoomButtons: true,
        border: false,
        lockViewport: false
      });
    }

    const calc = calculatorRef.current;

    // Apply viewport if provided
    if (graphData?.viewport) {
      calc.setMathBounds({
        left: graphData.viewport.xmin,
        right: graphData.viewport.xmax,
        bottom: graphData.viewport.ymin,
        top: graphData.viewport.ymax
      });
    } else {
      // Default bounds
      calc.setMathBounds({ left: -10, right: 10, bottom: -10, top: 10 });
    }

    // Clear previous expressions
    calc.setBlank();

    // Render new expressions
    if (graphData?.expressions && Array.isArray(graphData.expressions)) {
      graphData.expressions.forEach((expr, index) => {
        calc.setExpression({ id: `expr-${index}`, latex: expr, color: window.Desmos.Colors.BLUE });
      });
    }

    // Render highlights (points, etc)
    if (graphData?.highlights && Array.isArray(graphData.highlights)) {
      graphData.highlights.forEach((hl, index) => {
        if (hl.type === 'point') {
          calc.setExpression({
            id: `hl-${index}`,
            latex: `(${hl.x}, ${hl.y})`,
            color: window.Desmos.Colors.RED,
            label: hl.label || '',
            showLabel: !!hl.label
          });
        }
      });
    }

    // Cleanup when component unmounts
    return () => {
      // Desmos doesn't have a strict destroy, but we can clear things
      if (calculatorRef.current) {
        calculatorRef.current.setBlank();
      }
    };
  }, [graphData]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '400px', 
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }} 
    />
  );
}
