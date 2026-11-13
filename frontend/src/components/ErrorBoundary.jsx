import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('CampusFind rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page-container empty-state">
          <h1>Something went wrong</h1>
          <p>CampusFind could not display this page. Reload and try again.</p>
          <button className="btn" onClick={() => window.location.reload()}>Reload page</button>
        </main>
      );
    }

    return this.props.children;
  }
}
