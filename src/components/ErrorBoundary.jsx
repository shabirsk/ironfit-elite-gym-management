import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 48, textAlign: 'center', color: '#fff',
          background: '#0a0a0a', minHeight: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 16,
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#ef4444' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#888', fontSize: 14, maxWidth: 400, lineHeight: 1.6, margin: 0 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '10px 24px', background: '#ff6200', color: '#000',
              border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer',
              fontSize: 14, marginTop: 8,
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
