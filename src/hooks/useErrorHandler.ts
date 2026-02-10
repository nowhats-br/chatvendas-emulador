import React from 'react';
import { AppError, handleError, withRetry, RetryOptions } from '../utils/errorHandler';
import { useToast } from './useToast';

export function useErrorHandler() {
  const { error: showErrorToast } = useToast();

  const handleErrorWithToast = React.useCallback((
    error: unknown,
    context?: string,
    showToast = true
  ): AppError => {
    const appError = handleError(error, context);
    
    if (showToast) {
      showErrorToast(
        'Erro',
        appError.message
      );
    }

    return appError;
  }, [showErrorToast]);

  const executeWithRetry = React.useCallback(async <T>(
    fn: () => Promise<T>,
    options?: RetryOptions,
    context?: string
  ): Promise<T> => {
    try {
      return await withRetry(fn, options);
    } catch (error) {
      throw handleErrorWithToast(error, context);
    }
  }, [handleErrorWithToast]);

  return {
    handleError: handleErrorWithToast,
    executeWithRetry
  };
}

// Error Boundary Hook
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      handleError(error, 'ErrorBoundary');
    }
  }, [error]);

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null
  };
}