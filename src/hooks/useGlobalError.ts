import { useState, useEffect } from 'react';

interface ErrorInfo {
  message: string;
  component?: string;
  timestamp: Date;
}

export const useGlobalError = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError({
        message: event.message,
        timestamp: new Date()
      });
      console.error('Global error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError({
        message: event.reason?.message || 'Unhandled promise rejection',
        timestamp: new Date()
      });
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const clearError = () => {
    setError(null);
  };

  return { error, clearError };
};