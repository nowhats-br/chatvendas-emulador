import React from 'react';

interface LoadingFallbackProps {
  error?: Error;
  retry?: () => void;
  message?: string;
}

export function LoadingFallback({ error, retry, message = "Carregando..." }: LoadingFallbackProps) {
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao Carregar
          </h2>
          
          <p className="text-gray-600 mb-4">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
          
          <div className="flex gap-3">
            {retry && (
              <button
                onClick={retry}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-1">
            {message}
          </p>
          <p className="text-sm text-gray-500">
            Por favor, aguarde...
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingFallback;