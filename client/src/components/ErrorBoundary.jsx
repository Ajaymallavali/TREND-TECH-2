import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TREND-TECH ErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 p-6 text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm max-w-md w-full">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-ink-900">Something went wrong</h2>
            <p className="mt-2 text-xs text-ink-500 leading-relaxed">
              An unexpected error occurred while displaying this page. Your data is safe.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="btn-primary w-full sm:w-auto text-xs py-2 px-4 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-secondary w-full sm:w-auto text-xs py-2 px-4 flex items-center justify-center gap-1.5"
              >
                <Home className="h-3.5 w-3.5" /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
