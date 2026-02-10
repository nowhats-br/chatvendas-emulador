// Serviços
export { FollowUpService } from './services/FollowUpService';
export { AutoFollowUpService } from './services/AutoFollowUpService';

// Hooks
export { useSaleDetection, useSaleIntegration, extractSaleData } from './hooks/useSaleDetection';

// Utilitários
export { SaleIntegration } from './utils/SaleIntegration';
export type { SaleData, TicketSaleData, KanbanSaleData } from './utils/SaleIntegration';

// Componentes
export { AutoFollowUpSettings } from './components/AutoFollowUpSettings';
export { AutoFollowUpDemo } from './components/AutoFollowUpDemo';
export { SaleDetectionProvider } from './components/SaleDetectionProvider';

// Tipos
export type { 
  FollowUpTask, 
  FollowUpStats, 
  FollowUpSequence, 
  FollowUpTrigger, 
  Priority,
  FollowUpType,
  FollowUpStatus
} from './types';

// Página principal
export { default as FollowUpPage } from './page';