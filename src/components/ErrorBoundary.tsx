import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-left bg-muted/10 p-4 rounded-lg overflow-auto max-h-40">
              {error.stack}
            </pre>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
          <Button onClick={resetErrorBoundary} className="bg-primary">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset any state here if needed
        localStorage.removeItem('error-key');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}