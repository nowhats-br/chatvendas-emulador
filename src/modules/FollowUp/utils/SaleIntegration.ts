/**
 * Utilitário para integração do sistema automático de follow-up
 * Use este arquivo para disparar vendas de outros módulos do sistema
 */

interface SaleData {
  contactId: string;
  orderId: string;
  value: number;
  products: string[];
  saleDate?: string;
}

/**
 * Classe utilitária para integração com o sistema automático de follow-up
 */
export class SaleIntegration {
  /**
   * Notifica que uma venda foi completada
   * Use este método quando uma venda for finalizada no sistema
   */
  static notifySaleCompleted(saleData: SaleData) {
    try {
      const completeSaleData: SaleData = {
        ...saleData,
        saleDate: saleData.saleDate || new Date().toISOString()
      };

      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('sale_completed', {
        detail: completeSaleData
      }));

      // Backup no localStorage
      localStorage.setItem('chatvendas_recent_sale', JSON.stringify(completeSaleData));

      console.log('🎉 Venda notificada para follow-up automático:', completeSaleData);
    } catch (error) {
      console.error('Erro ao notificar venda:', error);
    }
  }

  /**
   * Notifica que um pedido foi entregue
   * Use este método quando um pedido for entregue
   */
  static notifyOrderDelivered(deliveryData: {
    contactId: string;
    orderId: string;
    deliveredAt?: string;
    trackingCode?: string;
  }) {
    try {
      const completeDeliveryData = {
        ...deliveryData,
        deliveredAt: deliveryData.deliveredAt || new Date().toISOString()
      };

      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('order_delivered', {
        detail: completeDeliveryData
      }));

      console.log('📦 Entrega notificada para follow-up automático:', completeDeliveryData);
    } catch (error) {
      console.error('Erro ao notificar entrega:', error);
    }
  }

  /**
   * Método de conveniência para mudança de status de pedido
   */
  static onOrderStatusChanged(orderId: string, contactId: string, newStatus: string, trackingCode?: string) {
    if (newStatus === 'delivered') {
      this.notifyOrderDelivered({
        contactId,
        orderId,
        deliveredAt: new Date().toISOString(),
        trackingCode
      });
    }
  }
  static onTicketClosed(ticketId: string, contactId: string, saleValue?: number, products?: string[]) {
    const saleData: SaleData = {
      contactId,
      orderId: ticketId,
      value: saleValue || 0,
      products: products || [],
      saleDate: new Date().toISOString()
    };

    this.notifySaleCompleted(saleData);
  }

  /**
   * Método de conveniência para quando contato é movido para "vendido" no Kanban
   */
  static onKanbanSold(contactId: string, orderValue?: number, products?: string[]) {
    const saleData: SaleData = {
      contactId,
      orderId: `KANBAN_${Date.now()}`,
      value: orderValue || 0,
      products: products || [],
      saleDate: new Date().toISOString()
    };

    this.notifySaleCompleted(saleData);
  }

  /**
   * Método para simular uma venda completa (venda + entrega)
   */
  static simulateCompleteSale(contactId: string, value: number = 299.90, products: string[] = ['Produto Teste']) {
    const orderId = `TEST_${Date.now()}`;
    
    // Simular venda
    const saleData: SaleData = {
      contactId,
      orderId,
      value,
      products,
      saleDate: new Date().toISOString()
    };

    this.notifySaleCompleted(saleData);
    
    // Simular entrega após 3 segundos (para demonstração)
    setTimeout(() => {
      this.notifyOrderDelivered({
        contactId,
        orderId,
        deliveredAt: new Date().toISOString(),
        trackingCode: `BR${Date.now()}`
      });
    }, 3000);

    return { saleData, orderId };
  }

  /**
   * Método para simular apenas uma venda (sem entrega)
   */
  static simulateSale(contactId: string, value: number = 299.90, products: string[] = ['Produto Teste']) {
    const saleData: SaleData = {
      contactId,
      orderId: `TEST_${Date.now()}`,
      value,
      products,
      saleDate: new Date().toISOString()
    };

    this.notifySaleCompleted(saleData);
    return saleData;
  }
}

// Exportar tipos para uso em outros módulos
export type { SaleData };

// Disponibilizar globalmente para debug e testes
if (typeof window !== 'undefined') {
  (window as any).SaleIntegration = SaleIntegration;
}

// Exemplo de uso:
/*
// Em um módulo de tickets:
import { SaleIntegration } from '../FollowUp/utils/SaleIntegration';

// Quando um ticket é fechado com venda:
SaleIntegration.onTicketClosed('ticket_123', 'contact_456', 299.90, ['Produto A', 'Produto B']);

// Em um módulo de Kanban:
// Quando contato é movido para "vendido":
SaleIntegration.onKanbanSold('contact_789', 599.90, ['Produto Premium']);

// Notificação direta de venda:
SaleIntegration.notifySaleCompleted({
  contactId: 'contact_123',
  orderId: 'ORDER_456',
  value: 199.90,
  products: ['Produto X', 'Produto Y']
});
*/