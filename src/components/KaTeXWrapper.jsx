import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * React 19 호환 인라인 KaTeX 렌더러 컴포넌트
 */
export function InlineMath({ math, errorColor = '#ef4444', renderError }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: false,
          throwOnError: false,
          strict: 'ignore',
          trust: true,
        });
      } catch (err) {
        console.error("KaTeX Inline Error:", err, "Math string:", math);
        if (renderError) {
          try {
            containerRef.current.innerHTML = '';
            const errorElement = renderError(err);
            if (typeof errorElement === 'string') {
              containerRef.current.textContent = errorElement;
            } else {
              containerRef.current.textContent = math;
            }
          } catch (e) {
            containerRef.current.textContent = math;
          }
        } else {
          containerRef.current.textContent = math;
          containerRef.current.style.color = errorColor;
        }
      }
    }
  }, [math, errorColor, renderError]);

  return <span ref={containerRef} className="custom-inline-math" />;
}

/**
 * React 19 호환 블록 KaTeX 렌더러 컴포넌트
 */
export function BlockMath({ math, errorColor = '#ef4444', renderError }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: 'ignore',
          trust: true,
        });
      } catch (err) {
        console.error("KaTeX Block Error:", err, "Math string:", math);
        if (renderError) {
          try {
            containerRef.current.innerHTML = '';
            const errorElement = renderError(err);
            if (typeof errorElement === 'string') {
              containerRef.current.textContent = errorElement;
            } else {
              containerRef.current.textContent = math;
            }
          } catch (e) {
            containerRef.current.textContent = math;
          }
        } else {
          containerRef.current.textContent = math;
          containerRef.current.style.color = errorColor;
        }
      }
    }
  }, [math, errorColor, renderError]);

  return <div ref={containerRef} className="custom-block-math" style={{ overflowX: 'auto', maxWidth: '100%', margin: '0.4rem 0' }} />;
}
