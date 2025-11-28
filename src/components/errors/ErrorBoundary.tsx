/**
 * Error Boundary Component (P7-017)
 *
 * Catches JavaScript errors in child components and displays a fallback UI.
 */

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // biome-ignore lint/suspicious/noConsole: Error boundaries should log errors
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />

          <h2 className="mt-4 text-xl font-semibold text-foreground">
            Something went wrong
          </h2>

          <p className="mt-2 max-w-md text-center text-muted-foreground">
            An error occurred while rendering this component. Please try again.
          </p>

          <Button onClick={this.handleRetry} className="mt-6">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 w-full max-w-2xl text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-xs">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
