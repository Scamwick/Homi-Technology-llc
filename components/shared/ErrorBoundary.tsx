'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { reportError } from '@/lib/error-reporting';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ErrorBoundary — Catches render errors in child trees
 *
 * Displays a friendly error card with a retry button.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback to render instead of the default error card */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, {
      source: 'ErrorBoundary',
      extra: { componentStack: info.componentStack },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center text-center py-16 px-4"
        >
          <div
            className="flex size-14 items-center justify-center rounded-2xl mb-4"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertTriangle size={28} style={{ color: 'var(--homi-crimson)' }} />
          </div>

          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Something went wrong
          </h3>
          <p
            className="text-sm max-w-xs mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            An unexpected error occurred. Please try again.
          </p>

          <Button
            variant="primary"
            size="sm"
            onClick={this.handleRetry}
            icon={<RefreshCw size={14} />}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
