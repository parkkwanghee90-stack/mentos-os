import React from 'react';

/**
 * 렌더 중 예외를 잡아 빈 화면 대신 복구 UI + 에러 내용을 보여준다.
 * (빈 화면 = 디버깅 불가 → 실패를 관찰 가능하게 만든다)
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // 콘솔에도 남긴다
    console.error('[ErrorBoundary] render error:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { error, info } = this.state;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', background: 'linear-gradient(135deg,#f1f5f9 0%,#eff6ff 50%,#f5f3ff 100%)',
        color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%', maxWidth: 720, background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)', border: '1px solid rgba(15,23,42,0.08)',
          borderRadius: 20, padding: '2rem', boxShadow: '0 10px 30px rgba(99,102,241,0.12)',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            화면을 표시하는 중 문제가 발생했어요
          </h2>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>
            아래 오류 내용을 개발팀에 전달해 주세요.
          </p>
          <pre style={{
            marginTop: 16, padding: '1rem', background: '#0f172a', color: '#fca5a5',
            borderRadius: 12, overflow: 'auto', fontSize: '0.8rem', lineHeight: 1.5,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 320,
          }}>
            {String(error && (error.stack || error.message || error))}
            {info?.componentStack ? '\n\n--- Component stack ---' + info.componentStack : ''}
          </pre>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={this.handleReset} style={{
              padding: '0.7rem 1.4rem', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#10b981,#059669)',
            }}>
              다시 시도
            </button>
            <a href="/" style={{
              padding: '0.7rem 1.4rem', borderRadius: 12, textDecoration: 'none', fontWeight: 700,
              color: '#0f172a', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(15,23,42,0.1)',
            }}>
              홈으로
            </a>
          </div>
        </div>
      </div>
    );
  }
}
