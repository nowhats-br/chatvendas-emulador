import { useEffect, useCallback } from 'react';
import { AutoFollowUpService } from '../services/AutoFollowUpService';

interface SaleData {
  contactId: string;
  orderId: string;
  value: number;
  products: string[];
  saleDate: string;
}

interface TicketStatusChange {
  ticketId: string;
  contactId: string;
  oldStatus: string;
  newStatus: string;
  saleData?: SaleData;
}

export function useSaleDetection() {
  // Detectar mudanças de status de tickets que indicam venda
  const handleTicketStatusChange = useCallback((event: CustomEvent<TicketStatusChange>) => {
    const { newStatus, contactId, saleData } = event.detail;
    
    // Detectar quando ticket é fechado com venda
    if (newStatus === 'closed' && saleData) {
      console.log('🎯 Venda detectada via ticket:', saleData);
      AutoFollowUpService.triggerSale(
        saleData.contactId,
        saleData.orderId,
        saleData.value,
        saleData.products
      );
    }
    
    // Detectar quando ticket é movido para "financeiro" ou "vendido"
    if (['financial', 'sold', 'payment_confirmed'].includes(newStatus)) {
      // Buscar dados da venda no contexto do ticket
      fetchSaleDataFromTicket(contactId, event.detail.ticketId);
    }
  }, []);

  // Detectar eventos diretos de venda
  const handleSaleCompleted = useCallback((event: CustomEvent<SaleData>) => {
    console.log('💰 Venda direta detectada:', event.detail);
    AutoFollowUpService.triggerSale(
      event.detail.contactId,
      event.detail.orderId,
      event.detail.value,
      event.detail.products
    );
  }, []);

  // Detectar quando contato responde a mensagens de follow-up
  const handleMessageReceived = useCallback((event: CustomEvent) => {
    const { contactId, messageId, content, isResponseToFollowUp } = event.detail;
    
    if (isResponseToFollowUp) {
      console.log('💬 Resposta a follow-up detectada:', { contactId, content });
      
      // Importar dinamicamente para evitar dependência circular
      import('../services/AutoFollowUpService').then(({ AutoFollowUpService }) => {
        AutoFollowUpService.onNurturingResponse(contactId, messageId, content);
      });
    }
  }, []);
  // Detectar quando contato é movido para estágio "vendido" no Kanban
  const handleKanbanStageChange = useCallback((event: CustomEvent) => {
    const { contactId, oldStage, newStage, saleData } = event.detail;
    
    if (newStage === 'sold' || newStage === 'closed_won') {
      console.log('📊 Venda detectada via Kanban:', { contactId, newStage });
      
      if (saleData) {
        AutoFollowUpService.triggerSale(
          saleData.contactId,
          saleData.orderId,
          saleData.value,
          saleData.products
        );
      } else {
        // Buscar dados da venda baseado no contato
        fetchSaleDataFromContact(contactId);
      }
    }
  }, []);

  // Buscar dados de venda do ticket
  const fetchSaleDataFromTicket = async (contactId: string, ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/sale-data`);
      if (response.ok) {
        const saleData = await response.json();
        if (saleData && saleData.orderId) {
          AutoFollowUpService.triggerSale(
            contactId,
            saleData.orderId,
            saleData.value || 0,
            saleData.products || []
          );
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar dados de venda do ticket:', error);
    }
  };

  // Buscar dados de venda do contato
  const fetchSaleDataFromContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/latest-sale`);
      if (response.ok) {
        const saleData = await response.json();
        if (saleData && saleData.orderId) {
          AutoFollowUpService.triggerSale(
            contactId,
            saleData.orderId,
            saleData.value || 0,
            saleData.products || []
          );
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar dados de venda do contato:', error);
    }
  };

  // Monitorar mudanças no localStorage que podem indicar vendas
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === 'chatvendas_recent_sale' && event.newValue) {
      try {
        const saleData = JSON.parse(event.newValue);
        console.log('💾 Venda detectada via localStorage:', saleData);
        
        AutoFollowUpService.triggerSale(
          saleData.contactId,
          saleData.orderId,
          saleData.value,
          saleData.products
        );
        
        // Limpar o localStorage após processar
        localStorage.removeItem('chatvendas_recent_sale');
      } catch (error) {
        console.warn('Erro ao processar venda do localStorage:', error);
      }
    }
  }, []);

  // Configurar listeners
  useEffect(() => {
    // Event listeners para eventos customizados
    window.addEventListener('ticket_status_changed', handleTicketStatusChange as EventListener);
    window.addEventListener('sale_completed', handleSaleCompleted as EventListener);
    window.addEventListener('kanban_stage_changed', handleKanbanStageChange as EventListener);
    window.addEventListener('message_received', handleMessageReceived as EventListener);
    
    // Storage listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('ticket_status_changed', handleTicketStatusChange as EventListener);
      window.removeEventListener('sale_completed', handleSaleCompleted as EventListener);
      window.removeEventListener('kanban_stage_changed', handleKanbanStageChange as EventListener);
      window.removeEventListener('message_received', handleMessageReceived as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleTicketStatusChange, handleSaleCompleted, handleKanbanStageChange, handleMessageReceived, handleStorageChange]);

  // Métodos para disparar vendas manualmente (útil para integração)
  const triggerSaleManually = useCallback((saleData: SaleData) => {
    AutoFollowUpService.triggerSale(
      saleData.contactId,
      saleData.orderId,
      saleData.value,
      saleData.products
    );
  }, []);

  // Método para simular venda (para testes)
  const simulateSale = useCallback((contactId: string) => {
    const testSale: SaleData = {
      contactId,
      orderId: `TEST_${Date.now()}`,
      value: Math.floor(Math.random() * 500) + 100,
      products: ['Produto Teste', 'Acessório'],
      saleDate: new Date().toISOString()
    };

    triggerSaleManually(testSale);
  }, [triggerSaleManually]);

  return {
    triggerSaleManually,
    simulateSale
  };
}

// Hook para integração com sistemas externos
export function useSaleIntegration() {
  // Método para ser chamado quando uma venda é finalizada no sistema
  const notifySaleCompleted = useCallback((saleData: Partial<SaleData>) => {
    if (!saleData.contactId || !saleData.orderId) {
      console.warn('Dados de venda incompletos:', saleData);
      return;
    }

    const completeSaleData: SaleData = {
      contactId: saleData.contactId,
      orderId: saleData.orderId,
      value: saleData.value || 0,
      products: saleData.products || [],
      saleDate: saleData.saleDate || new Date().toISOString()
    };

    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('sale_completed', {
      detail: completeSaleData
    }));

    // Também salvar no localStorage como backup
    localStorage.setItem('chatvendas_recent_sale', JSON.stringify(completeSaleData));
  }, []);

  // Método para notificar mudança de status de ticket
  const notifyTicketStatusChange = useCallback((ticketData: TicketStatusChange) => {
    window.dispatchEvent(new CustomEvent('ticket_status_changed', {
      detail: ticketData
    }));
  }, []);

  // Método para notificar mudança de estágio no Kanban
  const notifyKanbanStageChange = useCallback((kanbanData: any) => {
    window.dispatchEvent(new CustomEvent('kanban_stage_changed', {
      detail: kanbanData
    }));
  }, []);

  return {
    notifySaleCompleted,
    notifyTicketStatusChange,
    notifyKanbanStageChange
  };
}

// Utilitário para extrair dados de venda de diferentes fontes
export function extractSaleData(source: any): SaleData | null {
  try {
    // Tentar extrair de ticket
    if (source.ticket && source.contact) {
      return {
        contactId: source.contact.id,
        orderId: source.ticket.id || `TICKET_${Date.now()}`,
        value: source.ticket.value || source.ticket.amount || 0,
        products: source.ticket.products || source.ticket.items || [],
        saleDate: source.ticket.closedAt || source.ticket.updatedAt || new Date().toISOString()
      };
    }

    // Tentar extrair de contato
    if (source.contact && source.contact.lastPurchase) {
      return {
        contactId: source.contact.id,
        orderId: source.contact.lastPurchase.orderId || `CONTACT_${Date.now()}`,
        value: source.contact.lastPurchase.value || 0,
        products: source.contact.lastPurchase.products || [],
        saleDate: source.contact.lastPurchase.date || new Date().toISOString()
      };
    }

    // Tentar extrair de dados diretos
    if (source.contactId && source.orderId) {
      return {
        contactId: source.contactId,
        orderId: source.orderId,
        value: source.value || 0,
        products: source.products || [],
        saleDate: source.saleDate || new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.warn('Erro ao extrair dados de venda:', error);
    return null;
  }
}