import React from "react";

// ✅ Classe ErrorBoundary pour capturer les erreurs React et globales
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // 🔹 State pour suivre si une erreur est survenue et stocker les infos
    this.state = { hasError: false, error: null, info: null };
  }

  // 🔹 Méthode statique appelée lors d'une erreur dans un enfant React
  static getDerivedStateFromError(error) {
    // Met à jour le state pour afficher le fallback UI
    return { hasError: true, error };
  }

  // 🔹 Méthode pour capturer les détails supplémentaires de l'erreur
  componentDidCatch(error, info) {
    // Stocke l'erreur et les infos dans le state
    this.setState({ error, info });
    // Log dans la console pour le dev
    console.error("Uncaught render error:", error, info);
  }

  componentDidMount() {
    // 🔹 Gestion des erreurs globales et des promesses non gérées
    this._onError = (msg, url, lineNo, colNo, error) => {
      // Met à jour le state pour afficher l'erreur dans l'UI
      this.setState({ 
        hasError: true, 
        error: error || msg, 
        info: { componentStack: `at ${url}:${lineNo}:${colNo}` } 
      });
      console.error('Window error', msg, url, lineNo, colNo, error);
    };

    this._onRejection = (e) => {
      // Erreurs de promesses non catchées
      const reason = e.reason || e;
      this.setState({ 
        hasError: true, 
        error: reason, 
        info: { componentStack: 'Unhandled Promise Rejection' } 
      });
      console.error('Unhandled rejection', reason);
    };

    // 🔹 Écoute globale pour erreurs et rejets
    window.addEventListener('error', this._onError);
    window.addEventListener('unhandledrejection', this._onRejection);
  }

  componentWillUnmount() {
    // 🔹 Nettoyage des écouteurs pour éviter les fuites mémoire
    window.removeEventListener('error', this._onError);
    window.removeEventListener('unhandledrejection', this._onRejection);
  }

  render() {
    // 🔹 Si pas d'erreur, afficher les enfants normalement
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;

    // 🔹 Fallback UI pour afficher l'erreur
    return (
      <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ color: '#b00020' }}>Une erreur est survenue</h2>
        <div style={{ background: '#fff0f2', padding: 12, borderRadius: 6 }}>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {String(error && (error.message || error))}
          </pre>

          {/* 🔹 Affichage optionnel de la stack complète */}
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
