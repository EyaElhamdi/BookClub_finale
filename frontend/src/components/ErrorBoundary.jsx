import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // Also log to console for developer
    console.error("Uncaught render error:", error, info);
  }

  componentDidMount() {
    // listen for global errors and promise rejections to show them in UI
    this._onError = (msg, url, lineNo, colNo, error) => {
      this.setState({ hasError: true, error: error || msg, info: { componentStack: `at ${url}:${lineNo}:${colNo}` } });
      console.error('Window error', msg, url, lineNo, colNo, error);
    };

    this._onRejection = (e) => {
      const reason = e.reason || e;
      this.setState({ hasError: true, error: reason, info: { componentStack: 'Unhandled Promise Rejection' } });
      console.error('Unhandled rejection', reason);
    };

    window.addEventListener('error', this._onError);
    window.addEventListener('unhandledrejection', this._onRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this._onError);
    window.removeEventListener('unhandledrejection', this._onRejection);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;

    return (
      <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ color: '#b00020' }}>Une erreur est survenue</h2>
        <div style={{ background: '#fff0f2', padding: 12, borderRadius: 6 }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {String(error && (error.message || error))}
          </pre>
          {info?.componentStack && (
            <details style={{ marginTop: 8 }}>
              <summary>Stack complète</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{info.componentStack}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
