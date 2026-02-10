import React from 'react';
import { useSaleDetection } from '../hooks/useSaleDetection';

interface SaleDetectionProviderProps {
  children: React.ReactNode;
}

export function SaleDetectionProvider({ children }: SaleDetectionProviderProps) {
  // Inicializar o hook de detecção de vendas
  useSaleDetection();

  // Este componente apenas inicializa os listeners
  // Não renderiza nada além dos children
  return <>{children}</>;
}

// Hook para usar as funções de integração em qualquer lugar da aplicação
export { useSaleIntegration, extractSaleData } from '../hooks/useSaleDetection';